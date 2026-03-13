/**
 * backendBridge.js
 *
 * Connects the React frontend to the VDA Node.js backend when
 * REACT_APP_API_URL is configured.
 *
 * Responsibilities:
 *  1. WebSocket connection for real-time market data, account & order updates.
 *  2. REST API helpers for order operations (place, close, modify).
 *  3. Dispatches Redux actions so components stay in sync transparently.
 *
 * When REACT_APP_API_URL is NOT set this module is a no-op; the simulator
 * (mt4Bridge) continues to drive all state.
 */

import store from '../store';
import {
  updateQuote,
  setCandles,
  addCandle,
  setConnectionStatus,
  addLog,
} from '../store/actions';
import {
  SET_ORDERS,
  ADD_HISTORY_ORDER,
  PLACE_ORDER,
  CLOSE_ORDER,
  MODIFY_ORDER,
  SET_LEVERAGE,
} from '../store/actions/actionTypes';

const API_BASE = process.env.REACT_APP_API_URL || '';
const WS_URL   = process.env.REACT_APP_MT4_BRIDGE_URL
  ? process.env.REACT_APP_MT4_BRIDGE_URL
  : API_BASE
      ? API_BASE.replace(/^http/, 'ws')
      : '';

const RECONNECT_DELAY_MS = 5000;

class BackendBridge {
  constructor() {
    this._token     = null;
    this._ws        = null;
    this._reconnect = true;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Returns true when REACT_APP_API_URL is configured. */
  isConfigured() {
    return Boolean(API_BASE);
  }

  /**
   * Store the JWT returned by the login endpoint.
   * Must be called before any other method that requires authentication.
   * @param {string} token  JWT access token
   */
  setToken(token) {
    this._token = token;
  }

  /**
   * Load the authenticated user's account data from the backend.
   * @returns {Promise<object>} Account data object
   */
  async loadAccount() {
    const res = await fetch(`${API_BASE}/api/account`, {
      headers: this._headers(),
    });
    if (!res.ok) throw new Error(`Account load failed: ${res.status}`);
    return res.json();
  }

  /**
   * Load open and pending orders from the backend.
   * @returns {Promise<{ open: object[], pending: object[] }>}
   */
  async loadOrders() {
    const res = await fetch(`${API_BASE}/api/orders`, {
      headers: this._headers(),
    });
    if (!res.ok) throw new Error(`Orders load failed: ${res.status}`);
    const data = await res.json();
    const open    = Array.isArray(data)          ? data.filter((o) => !o.closeTime) : (data.open    || []);
    const pending = Array.isArray(data)          ? []                               : (data.pending || []);
    store.dispatch({ type: SET_ORDERS, payload: { open, pending, history: [] } });
    return { open, pending };
  }

  /**
   * Load closed trade history from the backend.
   * @returns {Promise<object[]>}
   */
  async loadHistory() {
    const res = await fetch(`${API_BASE}/api/orders/history`, {
      headers: this._headers(),
    });
    if (!res.ok) throw new Error(`History load failed: ${res.status}`);
    const history = await res.json();
    store.dispatch({ type: SET_ORDERS, payload: { history } });
    return history;
  }

  /**
   * Place a new order via the backend REST API.
   * @param {object} order  Order details (symbol, type, lots, price, sl, tp)
   * @returns {Promise<object>} Created order from backend
   */
  async placeOrder(order) {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method:  'POST',
      headers: this._headers(),
      body:    JSON.stringify(order),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Place order failed: ${res.status}`);
    }
    const created = await res.json();
    store.dispatch({ type: PLACE_ORDER, payload: created });
    return created;
  }

  /**
   * Close an open order via the backend REST API.
   * @param {number} ticket  Order ticket number
   * @returns {Promise<object>} Closed order from backend
   */
  async closeOrder(ticket) {
    const res = await fetch(`${API_BASE}/api/orders/${ticket}`, {
      method:  'DELETE',
      headers: this._headers(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Close order failed: ${res.status}`);
    }
    const closed = await res.json();
    store.dispatch({ type: CLOSE_ORDER, payload: ticket });
    store.dispatch({ type: ADD_HISTORY_ORDER, payload: closed });
    return closed;
  }

  /**
   * Modify an existing order's stop loss / take profit.
   * @param {number} ticket  Order ticket number
   * @param {number|null} sl  Stop loss price (null to remove)
   * @param {number|null} tp  Take profit price (null to remove)
   * @returns {Promise<object>} Modified order from backend
   */
  async modifyOrder(ticket, sl, tp) {
    const res = await fetch(`${API_BASE}/api/orders/${ticket}`, {
      method:  'PATCH',
      headers: this._headers(),
      body:    JSON.stringify({ sl, tp }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Modify order failed: ${res.status}`);
    }
    const modified = await res.json();
    store.dispatch({ type: MODIFY_ORDER, payload: { ticket, sl: modified.sl, tp: modified.tp } });
    return modified;
  }

  /**
   * Cancel a pending order via the backend REST API.
   * @param {number} ticket  Order ticket number
   * @returns {Promise<void>}
   */
  async cancelOrder(ticket) {
    const res = await fetch(`${API_BASE}/api/orders/${ticket}`, {
      method:  'DELETE',
      headers: this._headers(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Cancel order failed: ${res.status}`);
    }
    return res.json();
  }

  /** Open a WebSocket connection to the backend for real-time updates. */
  connect() {
    if (!WS_URL || this._ws) return;
    this._reconnect = true;
    this._openWs();
  }

  /** Close the WebSocket connection and stop reconnecting. */
  disconnect() {
    this._reconnect = false;
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this._token) h['Authorization'] = `Bearer ${this._token}`;
    return h;
  }

  _openWs() {
    const url = this._token ? `${WS_URL}?token=${encodeURIComponent(this._token)}` : WS_URL;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      store.dispatch(addLog('error', `[WS] Cannot create connection: ${e.message}`));
      return;
    }
    this._ws = ws;

    ws.onopen = () => {
      store.dispatch(setConnectionStatus('connected'));
      store.dispatch(addLog('info', '[WS] Connected to backend'));
    };

    ws.onclose = () => {
      store.dispatch(setConnectionStatus('disconnected'));
      this._ws = null;
      if (this._reconnect) {
        store.dispatch(addLog('warn', `[WS] Disconnected — reconnecting in ${RECONNECT_DELAY_MS / 1000}s`));
        setTimeout(() => { if (this._reconnect) this._openWs(); }, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = () => {
      store.dispatch(addLog('error', '[WS] Connection error'));
    };

    ws.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }
      this._handleMessage(msg);
    };
  }

  _handleMessage(msg) {
    switch (msg.type) {
      case 'quote':
        store.dispatch(updateQuote(msg.symbol, msg.bid, msg.ask, msg.time));
        break;

      case 'candles':
        store.dispatch(setCandles(msg.symbol, msg.timeframe, msg.candles));
        break;

      case 'candle':
        store.dispatch(addCandle(msg.symbol, msg.timeframe, msg.candle));
        break;

      case 'account':
        store.dispatch({ type: 'UPDATE_ACCOUNT', payload: msg.account });
        if (msg.account.leverage) {
          store.dispatch({ type: SET_LEVERAGE, payload: msg.account.leverage });
        }
        break;

      case 'orders':
        store.dispatch({
          type:    SET_ORDERS,
          payload: {
            open:    msg.open    || [],
            pending: msg.pending || [],
            history: msg.history || [],
          },
        });
        break;

      case 'order': {
        if (msg.action === 'open') {
          store.dispatch({ type: PLACE_ORDER, payload: msg.order });
        } else if (msg.action === 'close') {
          store.dispatch({ type: CLOSE_ORDER, payload: msg.order.ticket });
          store.dispatch({ type: ADD_HISTORY_ORDER, payload: msg.order });
        } else if (msg.action === 'modify') {
          store.dispatch({
            type:    MODIFY_ORDER,
            payload: { ticket: msg.order.ticket, sl: msg.order.sl, tp: msg.order.tp },
          });
        }
        break;
      }

      case 'error':
        store.dispatch(addLog('warn', `[WS] Server error: ${msg.message}`));
        break;

      default:
        break;
    }
  }
}

const backendBridge = new BackendBridge();
export default backendBridge;
