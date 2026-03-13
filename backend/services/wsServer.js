/**
 * WebSocket broadcast server.
 *
 * Clients connect and receive a stream of real-time events:
 *   { type: 'quote',    symbol, bid, ask, time }
 *   { type: 'candle',   symbol, timeframe, candle }
 *   { type: 'account',  accountId, ...accountFields }
 *   { type: 'order',    action: 'open'|'close'|'modify', order }
 *   { type: 'risk',     ...brokerRisk }
 *
 * Clients may optionally authenticate by sending:
 *   { type: 'auth', token: '<jwt>' }
 *
 * After authentication, position and account updates are scoped to the
 * authenticated account.
 */

const WebSocket = require('ws');
const config    = require('../config/config');
const { verifyToken } = require('../utils/jwt');
const { getUserById, getAccountByUserId } = require('../models');
const { recalculateAccount, getBrokerRisk } = require('./tradingEngine');
const {
  DEFAULT_SYMBOLS,
  generateSimulatedCandles,
  simulateNextCandle,
  getSpread,
  getDecimals,
} = require('./marketSimulator');
const db = require('../models');

let wss = null;

/**
 * Broadcast a JSON message to all connected clients (or a subset).
 * @param {object} payload
 * @param {(ws: WebSocket) => boolean} [filter]
 */
function broadcast(payload, filter) {
  if (!wss) return;
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (!filter || filter(client)) {
        client.send(msg);
      }
    }
  });
}

/** Send a message to a single client. */
function send(ws, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

/** Seed candle history for all symbols on startup. */
function seedCandles() {
  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
  DEFAULT_SYMBOLS.forEach((sym) => {
    timeframes.forEach((tf) => {
      const key = `${sym}_${tf}`;
      if (!db.candles.has(key)) {
        const candles = generateSimulatedCandles(sym, tf, config.candleHistoryCount);
        db.candles.set(key, candles);
      }
    });
    // Seed initial quotes from H1 candles
    const h1 = db.candles.get(`${sym}_H1`) || [];
    if (h1.length > 0) {
      const last   = h1[h1.length - 1];
      const dec    = getDecimals(sym);
      const bid    = parseFloat(last.close.toFixed(dec));
      const ask    = parseFloat((bid + getSpread(sym)).toFixed(dec));
      db.quotes.set(sym, { bid, ask, time: new Date().toISOString(), change: 0, changePercent: 0 });
    }
  });
}

/** Run every tick (500 ms): update prices, recalculate accounts, broadcast. */
function tick() {
  const timeframe = 'M1'; // default tick timeframe

  DEFAULT_SYMBOLS.forEach((sym) => {
    const key      = `${sym}_${timeframe}`;
    const candles  = db.candles.get(key) || [];
    if (candles.length === 0) return;

    const { newCandle, quote } = simulateNextCandle(sym, timeframe, candles);

    // Update candle store
    const updated =
      candles[candles.length - 1] && candles[candles.length - 1].time === newCandle.time
        ? [...candles.slice(0, -1), newCandle]
        : [...candles, newCandle];
    db.candles.set(key, updated.slice(-config.candleHistoryCount));

    // Update quote store
    const prev           = db.quotes.get(sym) || {};
    const change         = quote.bid - (prev.bid || quote.bid);
    const changePercent  = prev.bid ? (change / prev.bid) * 100 : 0;
    db.quotes.set(sym, { ...quote, change, changePercent });

    // Broadcast quote
    broadcast({ type: 'quote', symbol: sym, ...quote, change, changePercent });
    broadcast({ type: 'candle', symbol: sym, timeframe, candle: newCandle });
  });

  // Recalculate every account
  db.accounts.forEach((account) => {
    recalculateAccount(account.id);
    // eslint-disable-next-line no-unused-vars
    const { userId, ...safeAccount } = account;
    broadcast(
      { type: 'account', ...safeAccount },
      (client) => client._accountId === account.id
    );
  });

  // Broadcast broker risk to admin clients every 5 ticks
  tick._count = ((tick._count || 0) + 1);
  if (tick._count % 10 === 0) {
    const risk = getBrokerRisk();
    broadcast({ type: 'risk', ...risk }, (client) => client._role === 'admin');
  }
}

/**
 * Start the WebSocket server.
 * @param {import('http').Server} httpServer  Attach to existing HTTP server (same port).
 */
function startWsServer(httpServer) {
  wss = new WebSocket.Server({ server: httpServer });

  seedCandles();

  wss.on('connection', (ws) => {
    ws._role      = 'guest';
    ws._accountId = null;

    send(ws, { type: 'welcome', message: 'VDA Trading Terminal WebSocket v1.0' });

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(ws, { type: 'error', message: 'Invalid JSON' });
        return;
      }

      if (msg.type === 'auth' && msg.token) {
        try {
          const decoded = verifyToken(msg.token);
          const user    = getUserById(decoded.id);
          if (!user) {
            send(ws, { type: 'auth_error', message: 'User not found' });
            return;
          }
          ws._role = user.role;
          const account = getAccountByUserId(user.id);
          if (account) {
            ws._accountId = account.id;
            // eslint-disable-next-line no-unused-vars
            const { userId, ...safeAccount } = account;
            // Send current state to the newly authenticated client
            send(ws, { type: 'account', ...safeAccount });
          }
          send(ws, { type: 'auth_ok', role: user.role, name: user.name });

          // Send current quotes
          db.quotes.forEach((q, sym) => {
            send(ws, { type: 'quote', symbol: sym, ...q });
          });
        } catch {
          send(ws, { type: 'auth_error', message: 'Invalid or expired token' });
        }
      }

      // Subscribe to candle history for a symbol/timeframe
      if (msg.type === 'subscribe_candles' && msg.symbol && msg.timeframe) {
        const key     = `${msg.symbol}_${msg.timeframe}`;
        const history = db.candles.get(key) || [];
        send(ws, { type: 'candles', symbol: msg.symbol, timeframe: msg.timeframe, data: history });
      }
    });

    ws.on('error', (err) => {
      console.error('[WS] client error:', err.message);
    });
  });

  // Start price simulation tick
  setInterval(tick, config.tickIntervalMs);

  console.log('[WS] WebSocket server attached to HTTP server');
}

module.exports = { startWsServer, broadcast };
