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
  setConnectionStatus,
  addLog,
} from '../store/actions';
import { generateSimulatedCandles, simulateNextCandle } from '../utils/marketSimulator';
import { getSpread } from '../utils/constants';

const RECONNECT_DELAY_MS = 5000;
const CANDLE_HISTORY_COUNT = 200;

class MT4Bridge {
  constructor() {
    this._ws = null;
    this._simulationInterval = null;
    this._useSimulator = true;
    this._bridgeUrl = null;
  }

  /**
   * Connect to a live MT4 bridge WebSocket server.
   * @param {string} url  WebSocket URL, e.g. ws://localhost:5000
   */
  connect(url) {
    this._bridgeUrl = url;
    this._useSimulator = false;
    this._openSocket(url);
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

    // Recalculate floating P&L for open orders
    const { openOrders } = store.getState().orders;
    const quotes = store.getState().market.quotes;
    openOrders.forEach((order) => {
      const q = quotes[order.symbol];
      if (!q) return;
      const closePrice = order.type === 'BUY' ? q.bid : q.ask;
      const direction = order.type === 'BUY' ? 1 : -1;
      const pipValue = order.symbol.includes('JPY') ? 0.01 : 0.0001;
      const profit = direction * ((closePrice - order.openPrice) / pipValue) * order.lots * 1;
      store.dispatch(updateOrderProfit(order.ticket, parseFloat(profit.toFixed(2))));
    });

    // Update account equity
    const freshOrders = store.getState().orders.openOrders;
    const totalProfit = freshOrders.reduce((sum, o) => sum + (o.profit || 0), 0);
    const { balance, margin } = store.getState().account;
    const equity = balance + totalProfit;
    const freeMargin = equity - margin;
    const marginLevel = margin > 0 ? (equity / margin) * 100 : 0;
    store.dispatch(
      updateAccount({
        equity: parseFloat(equity.toFixed(2)),
        profit: parseFloat(totalProfit.toFixed(2)),
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
      case 'quote':
        store.dispatch(updateQuote(msg.symbol, msg.bid, msg.ask, msg.time));
        break;
      case 'candles':
        store.dispatch(setCandles(msg.symbol, msg.timeframe, msg.data));
        break;
      case 'candle':
        store.dispatch(addCandle(msg.symbol, msg.timeframe, msg.data));
        break;
      case 'account':
        store.dispatch(updateAccount(msg.data));
        break;
      default:
        store.dispatch(addLog('debug', `Unknown bridge message type: ${msg.type}`));
    }
  }
}

const mt4Bridge = new MT4Bridge();
export default mt4Bridge;
