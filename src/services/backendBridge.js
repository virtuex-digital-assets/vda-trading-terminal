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
  updateAccount,
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
   * Load the authenticated user's account data + open orders + history from
   * the backend, then open the WebSocket for real-time updates.
   * Call this once after a successful login.
   */
  async initialize() {
    if (!this.isConfigured() || !this._token) return;
    try {
      await Promise.all([
        this._loadAccount(),
        this._loadOrders(),
        this._loadHistory(),
      ]);
      this._connectWs();
    } catch (err) {
      store.dispatch(addLog('error', `Backend init failed: ${err.message}`));
    }
  }

  /**
   * Close the WebSocket connection and clear the stored token.
   * Call this on logout.
   */
  disconnect() {
    this._reconnect = false;
    this._token     = null;
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
    store.dispatch(setConnectionStatus({ status: 'disconnected' }));
  }

  // ── Order operations ──────────────────────────────────────────────────────

  /**
   * Place a new order.
   * @param {{ symbol, type, lots, price?, sl?, tp?, comment? }} order
   * @returns {Promise<object>}  The created order from the server
   */
  async placeOrder(order) {
    const data = await this._request('POST', '/api/orders', order);
    store.dispatch({
      type:    PLACE_ORDER,
      payload: data,
    });
    store.dispatch(addLog('info',
      `[API] Order #${data.ticket} placed: ${data.type} ${data.lots} ${data.symbol}`));
    return data;
  }

  /**
   * Close an open order (or cancel a pending order).
   * @param {number} ticket  Order ticket number
   * @returns {Promise<object>}  The closed order
   */
  async closeOrder(ticket) {
    const data = await this._request('DELETE', `/api/orders/${ticket}`);
    store.dispatch({ type: CLOSE_ORDER, payload: ticket });
    store.dispatch({
      type:    ADD_HISTORY_ORDER,
      payload: data,
    });
    store.dispatch(addLog('info', `[API] Order #${ticket} closed`));
    return data;
  }

  /**
   * Modify the SL/TP of an existing order.
   * @param {number}      ticket
   * @param {number|null} sl
   * @param {number|null} tp
   * @returns {Promise<object>}  The updated order
   */
  async modifyOrder(ticket, sl, tp) {
    const data = await this._request('PATCH', `/api/orders/${ticket}`, { sl, tp });
    store.dispatch({ type: MODIFY_ORDER, payload: { ticket, sl, tp } });
    store.dispatch(addLog('info',
      `[API] Order #${ticket} modified: SL=${sl || '—'} TP=${tp || '—'}`));
    return data;
  }

  /**
   * Change the account leverage.
   * @param {number} leverage
   * @returns {Promise<{ leverage: number }>}
   */
  async setLeverage(leverage) {
    const data = await this._request('PATCH', '/api/account/leverage', { leverage });
    store.dispatch({ type: SET_LEVERAGE, payload: data.leverage });
    return data;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /** Fetch and dispatch account data. */
  async _loadAccount() {
    const account = await this._request('GET', '/api/account');
    store.dispatch(updateAccount(account));
  }

  /** Fetch open + pending orders and replace the Redux store. */
  async _loadOrders() {
    const { open, pending } = await this._request('GET', '/api/orders');
    store.dispatch({ type: SET_ORDERS, payload: { open, pending } });
  }

  /** Fetch trade history and replace the history slice in Redux. */
  async _loadHistory() {
    const { history } = await this._request('GET', '/api/orders/history');
    store.dispatch({ type: SET_ORDERS, payload: { history } });
  }

  /**
   * Generic fetch wrapper.
   * @param {'GET'|'POST'|'PATCH'|'DELETE'} method
   * @param {string}  path     API path starting with /
   * @param {object}  [body]   Request body (for POST / PATCH)
   * @returns {Promise<any>}   Parsed JSON response
   */
  async _request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this._token) headers['Authorization'] = `Bearer ${this._token}`;

    const opts = { method, headers };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `${method} ${path} failed (${res.status})`);
    }
    return data;
  }

  // ── WebSocket ─────────────────────────────────────────────────────────────

  _connectWs() {
    if (!WS_URL) return;

    this._reconnect = true;
    store.dispatch(setConnectionStatus({ status: 'connecting', broker: API_BASE }));
    store.dispatch(addLog('info', `[WS] Connecting to ${WS_URL}…`));

    try {
      this._ws = new WebSocket(WS_URL);
    } catch (err) {
      store.dispatch(setConnectionStatus({ status: 'error' }));
      store.dispatch(addLog('error', `[WS] Could not open socket: ${err.message}`));
      return;
    }

    this._ws.onopen = () => {
      store.dispatch(addLog('info', '[WS] Connected – authenticating…'));
      if (this._token) {
        this._ws.send(JSON.stringify({ type: 'auth', token: this._token }));
      }

      const state = store.getState();
      const { activeSymbol, timeframe } = state.market;
      this._ws.send(JSON.stringify({
        type:      'subscribe_candles',
        symbol:    activeSymbol,
        timeframe,
      }));
    };

    this._ws.onmessage = (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch {
        return;
      }
      this._handleWsMessage(msg);
    };

    this._ws.onerror = () => {
      store.dispatch(setConnectionStatus({ status: 'error' }));
      store.dispatch(addLog('error', '[WS] Connection error'));
    };

    this._ws.onclose = () => {
      store.dispatch(setConnectionStatus({ status: 'disconnected' }));
      if (this._reconnect) {
        store.dispatch(addLog('warn',
          `[WS] Disconnected. Reconnecting in ${RECONNECT_DELAY_MS / 1000}s…`));
        setTimeout(() => {
          if (this._reconnect) this._connectWs();
        }, RECONNECT_DELAY_MS);
      }
    };
  }

  _handleWsMessage(msg) {
    switch (msg.type) {
      case 'welcome':
        break;

      case 'auth_ok':
        store.dispatch(setConnectionStatus({ status: 'connected', broker: API_BASE }));
        store.dispatch(addLog('info', `[WS] Authenticated as ${msg.role}: ${msg.name}`));
        break;

      case 'auth_error':
        store.dispatch(addLog('error', `[WS] Auth error: ${msg.message}`));
        break;

      case 'quote':
        store.dispatch(updateQuote(msg.symbol, msg.bid, msg.ask, msg.time));
        break;

      case 'candles':
        store.dispatch(setCandles(msg.symbol, msg.timeframe, msg.data));
        break;

      case 'candle':
        store.dispatch(addCandle(msg.symbol, msg.timeframe, msg.candle));
        break;

      case 'account': {
        const { type: _t, accountId: _a, ...accountData } = msg;
        store.dispatch(updateAccount(accountData));
        break;
      }

      case 'order':
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
