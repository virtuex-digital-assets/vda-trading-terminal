/**
 * MT4 Bridge Service
 *
 * Handles communication with a MetaTrader 4 bridge (e.g., a WebSocket or REST
 * endpoint exposed by an MT4 Expert Advisor or a third-party MT4 bridge server).
 *
 * When a real bridge URL is not configured the service falls back to a built-in
 * market-data simulator so the terminal can be demoed without a live MT4
 * installation.
 */

import store from '../store';
import {
  updateQuote,
  setCandles,
  addCandle,
  updateAccount,
  updateOrderProfit,
  closeOrder,
  placeOrder,
  modifyOrder,
  setOrders,
  addHistoryOrder,
  cancelPendingOrder,
  setConnectionStatus,
  addLog,
} from '../store/actions';

import { generateSimulatedCandles, simulateNextCandle } from '../utils/marketSimulator';
import { getSpread, calculateProfit, calculateMargin, getPricePrecision } from '../utils/constants';

const RECONNECT_DELAY_MS = 5000;
const CANDLE_HISTORY_COUNT = 200;

class MT4Bridge {
  constructor() {
    this._ws = null;
    this._simulationInterval = null;
    this._useSimulator = true;
    this._bridgeUrl = null;
    this._authToken = null;
  }

  /**
   * Connect to a live MT4 bridge WebSocket server.
   * @param {string} url  WebSocket URL, e.g. ws://localhost:5000
   * @param {string} [token]  Optional JWT to authenticate on the backend WS.
   */
  connect(url, token) {
    this._bridgeUrl = url;
    this._useSimulator = false;
    if (token) this._authToken = token;
    this._openSocket(url);
  }

  /**
   * Update the JWT used to authenticate with the backend WebSocket.
   * Call this after a successful login when the bridge is already connected.
   * @param {string} token
   */
  setAuthToken(token) {
    this._authToken = token;
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: 'auth', token }));
    }
  }

  /** Start the built-in demo simulator (no real MT4 required). */
  startSimulator() {
    this._useSimulator = true;
    store.dispatch(setConnectionStatus({ status: 'connected', broker: 'VDA Demo (Simulator)' }));
    store.dispatch(addLog('info', 'Demo simulator started'));

    const state = store.getState();
    const symbols = state.market.symbols;
    const tf = state.market.timeframe;

    // Seed initial candle history for every symbol
    symbols.forEach((sym) => {
      const candles = generateSimulatedCandles(sym, tf, CANDLE_HISTORY_COUNT);
      store.dispatch(setCandles(sym, tf, candles));
      const last = candles[candles.length - 1];
      const spread = getSpread(sym);
      store.dispatch(updateQuote(sym, last.close, last.close + spread, last.time));
    });

    // Tick every 500 ms
    this._simulationInterval = setInterval(() => this._simulatorTick(), 500);
  }

  stopSimulator() {
    if (this._simulationInterval) {
      clearInterval(this._simulationInterval);
      this._simulationInterval = null;
    }
    store.dispatch(setConnectionStatus({ status: 'disconnected' }));
    store.dispatch(addLog('info', 'Demo simulator stopped'));
  }

  disconnect() {
    this.stopSimulator();
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  /**
   * Subscribe to candle history for a symbol/timeframe via WebSocket.
   * The backend will respond with a { type: 'candles', ... } message.
   */
  subscribeCandles(symbol, timeframe) {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: 'subscribe_candles', symbol, timeframe }));
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  _simulatorTick() {
    const state = store.getState();
    const symbols = state.market.symbols;
    const tf = state.market.timeframe;

    symbols.forEach((sym) => {
      const key = `${sym}_${tf}`;
      const candles = state.market.candles[key] || [];
      if (candles.length === 0) return;

      const { newCandle, quote } = simulateNextCandle(sym, tf, candles);
      store.dispatch(addCandle(sym, tf, newCandle));
      store.dispatch(updateQuote(sym, quote.bid, quote.ask, quote.time));
    });

    // ── Recalculate floating P&L for open orders ────────────────────────────
    const { openOrders } = store.getState().orders;
    const quotes = store.getState().market.quotes;
    openOrders.forEach((order) => {
      const q = quotes[order.symbol];
      if (!q) return;
      const closePrice = order.type === 'BUY' ? q.bid : q.ask;
      const profit = calculateProfit(order.symbol, order.type, order.openPrice, closePrice, order.lots);
      store.dispatch(updateOrderProfit(order.ticket, profit));
    });

    // ── SL / TP monitoring ──────────────────────────────────────────────────
    const freshOrders = store.getState().orders.openOrders;
    const freshQuotes = store.getState().market.quotes;
    freshOrders.forEach((order) => {
      const q = freshQuotes[order.symbol];
      if (!q) return;
      const currentPrice = order.type === 'BUY' ? q.bid : q.ask;

      // Stop loss hit?
      if (order.sl) {
        const slHit = order.type === 'BUY' ? currentPrice <= order.sl : currentPrice >= order.sl;
        if (slHit) {
          const profit = calculateProfit(order.symbol, order.type, order.openPrice, order.sl, order.lots);
          const bal = store.getState().account.balance;
          store.dispatch(closeOrder(order.ticket));
          store.dispatch(updateAccount({ balance: parseFloat((bal + profit).toFixed(2)) }));
          store.dispatch(addLog('warn', `SL hit: closed #${order.ticket} ${order.type} ${order.lots} ${order.symbol} @ ${order.sl}, P&L: ${profit >= 0 ? '+' : ''}${profit}`));
          return;
        }
      }

      // Take profit hit?
      if (order.tp) {
        const tpHit = order.type === 'BUY' ? currentPrice >= order.tp : currentPrice <= order.tp;
        if (tpHit) {
          const profit = calculateProfit(order.symbol, order.type, order.openPrice, order.tp, order.lots);
          const bal = store.getState().account.balance;
          store.dispatch(closeOrder(order.ticket));
          store.dispatch(updateAccount({ balance: parseFloat((bal + profit).toFixed(2)) }));
          store.dispatch(addLog('info', `TP hit: closed #${order.ticket} ${order.type} ${order.lots} ${order.symbol} @ ${order.tp}, P&L: ${profit >= 0 ? '+' : ''}${profit}`));
          return;
        }
      }
    });

    // ── Pending order execution ─────────────────────────────────────────────
    const pendingOrders = store.getState().orders.pendingOrders;
    pendingOrders.forEach((order) => {
      const q = freshQuotes[order.symbol];
      if (!q) return;

      let triggered = false;
      let execPrice = order.openPrice;

      switch (order.type) {
        case 'BUY LIMIT':
          triggered = q.ask <= order.openPrice;
          execPrice = q.ask;
          break;
        case 'BUY STOP':
          triggered = q.ask >= order.openPrice;
          execPrice = q.ask;
          break;
        case 'SELL LIMIT':
          triggered = q.bid >= order.openPrice;
          execPrice = q.bid;
          break;
        case 'SELL STOP':
          triggered = q.bid <= order.openPrice;
          execPrice = q.bid;
          break;
        default:
          break;
      }

      if (triggered) {
        // Remove pending, place as market order
        store.dispatch(cancelPendingOrder(order.ticket));
        const marketType = order.type.startsWith('BUY') ? 'BUY' : 'SELL';
        store.dispatch(placeOrder({
          ...order,
          type: marketType,
          openPrice: parseFloat(execPrice.toFixed(getPricePrecision(order.symbol))),
        }));
        store.dispatch(addLog('info', `Pending order #${order.ticket} triggered: ${order.type} → ${marketType} ${order.lots} ${order.symbol} @ ${execPrice.toFixed(5)}`));
      }
    });

    // ── Recalculate account metrics ─────────────────────────────────────────
    const remainingOrders = store.getState().orders.openOrders;
    const totalProfit = remainingOrders.reduce((sum, o) => sum + (o.profit || 0), 0);
    const { balance, leverage } = store.getState().account;
    const totalMargin = remainingOrders.reduce((sum, o) => {
      return sum + calculateMargin(o.symbol, o.lots, o.openPrice, leverage);
    }, 0);
    const equity = balance + totalProfit;
    const freeMargin = equity - totalMargin;
    const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : 0;
    store.dispatch(
      updateAccount({
        equity: parseFloat(equity.toFixed(2)),
        profit: parseFloat(totalProfit.toFixed(2)),
        margin: parseFloat(totalMargin.toFixed(2)),
        freeMargin: parseFloat(freeMargin.toFixed(2)),
        marginLevel: parseFloat(marginLevel.toFixed(2)),
      })
    );
  }

  _openSocket(url) {
    store.dispatch(setConnectionStatus({ status: 'connecting', broker: url }));
    store.dispatch(addLog('info', `Connecting to MT4 bridge at ${url}…`));

    try {
      this._ws = new WebSocket(url);
    } catch (e) {
      store.dispatch(setConnectionStatus({ status: 'error' }));
      store.dispatch(addLog('error', `Failed to create WebSocket: ${e.message}`));
      return;
    }

    this._ws.onopen = () => {
      store.dispatch(setConnectionStatus({ status: 'connected', broker: url }));
      store.dispatch(addLog('info', 'Connected to MT4 bridge'));
      const token = this._authToken || localStorage.getItem('vda_token');
      if (token) {
        this._ws.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    this._ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        this._handleBridgeMessage(msg);
      } catch (e) {
        store.dispatch(addLog('warn', `Malformed bridge message: ${evt.data}`));
      }
    };

    this._ws.onerror = () => {
      store.dispatch(setConnectionStatus({ status: 'error' }));
      store.dispatch(addLog('error', 'MT4 bridge connection error'));
    };

    this._ws.onclose = () => {
      store.dispatch(setConnectionStatus({ status: 'disconnected' }));
      store.dispatch(addLog('warn', `MT4 bridge disconnected. Reconnecting in ${RECONNECT_DELAY_MS / 1000}s…`));
      setTimeout(() => {
        if (!this._useSimulator && this._bridgeUrl) this._openSocket(this._bridgeUrl);
      }, RECONNECT_DELAY_MS);
    };
  }

  _handleBridgeMessage(msg) {
    switch (msg.type) {
      case 'welcome':
        store.dispatch(addLog('info', msg.message || 'WebSocket connected'));
        break;
      case 'auth_ok':
        store.dispatch(setConnectionStatus({ status: 'connected', broker: msg.name || 'VDA Backend' }));
        store.dispatch(addLog('info', `Authenticated as ${msg.role} — ${msg.name}`));
        if (this._ws && this._ws.readyState === WebSocket.OPEN) {
          this._ws.send(JSON.stringify({ type: 'get_orders' }));
        }
        break;
      case 'auth_error':
        store.dispatch(addLog('error', `Auth error: ${msg.message}`));
        break;
      case 'quote':
        store.dispatch(updateQuote(msg.symbol, msg.bid, msg.ask, msg.time));
        break;
      case 'candles':
        store.dispatch(setCandles(msg.symbol, msg.timeframe, msg.data));
        break;
      case 'candle':
        store.dispatch(addCandle(msg.symbol, msg.timeframe, msg.data || msg.candle));
        break;
      case 'account': {
        // eslint-disable-next-line no-unused-vars
        const { type: _t, ...accountData } = msg;
        store.dispatch(updateAccount(accountData));
        break;
      }
      case 'order':
        this._handleOrderMessage(msg);
        break;
      case 'orders':
        store.dispatch(setOrders(msg.open || [], msg.pending || [], msg.history || []));
        break;
      case 'risk':
        break;
      default:
        store.dispatch(addLog('debug', `Unknown bridge message type: ${msg.type}`));
    }
  }

  _handleOrderMessage(msg) {
    const { action, order } = msg;
    if (!order) return;
    switch (action) {
      case 'open':
        // Add to local store if not already present
        if (!store.getState().orders.openOrders.find((o) => o.ticket === order.ticket) &&
            !store.getState().orders.pendingOrders.find((o) => o.ticket === order.ticket)) {
          store.dispatch(placeOrder(order));
        }
        break;
      case 'close': {
        // Move from open to history
        const exists = store.getState().orders.openOrders.find((o) => o.ticket === order.ticket);
        if (exists) {
          store.dispatch(closeOrder(order.ticket));
          if (order.closeTime) {
            store.dispatch(addHistoryOrder({ ...order }));
          }
        } else {
          // May be a pending order cancellation
          store.dispatch(cancelPendingOrder(order.ticket));
        }
        if (order.balance != null) {
          store.dispatch(updateAccount({ balance: order.balance }));
        }
        break;
      }
      case 'modify':
        store.dispatch(modifyOrder(order.ticket, order.sl, order.tp));
        break;
      default:
        break;
    }
  }
}

const mt4Bridge = new MT4Bridge();
export default mt4Bridge;
