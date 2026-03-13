/**
 * Backend Bridge Service
 *
 * Thin REST client for the VDA Trading Terminal backend API.
 *
 * Used when REACT_APP_API_URL is configured (live / staging deployment).
 * In pure demo mode this module is never called — the mt4Bridge simulator
 * handles everything locally.
 *
 * Endpoints used:
 *   GET    /api/account
 *   PATCH  /api/account/leverage
 *   GET    /api/orders
 *   GET    /api/orders/history
 *   POST   /api/orders
 *   DELETE /api/orders/:ticket
 *   PATCH  /api/orders/:ticket
 * Backend REST API bridge.
 *
 * Handles all communication with the VDA trading backend REST API.
 * Used when REACT_APP_API_URL is configured to connect to the live
 * backend instead of (or alongside) the built-in simulator.
 *
 * Usage:
 *   import backendBridge from './services/backendBridge';
 *
 *   if (backendBridge.isConfigured()) {
 *     await backendBridge.loadAccount();
 *     await backendBridge.loadOrders();
 *   }
 * Backend Bridge – REST API client for the VDA Trading Terminal backend.
 *
 * Provides methods for all backend API endpoints.
 * Use isConfigured() to check whether REACT_APP_API_URL is set before calling.
 *
 * After login, call setToken(token) so subsequent requests include the JWT.
 */

const API_URL = process.env.REACT_APP_API_URL || '';

class BackendBridge {
  constructor() {
    this._token = null;
  }

  /** Returns true when a backend URL is configured. */
  isConfigured() {
    return !!API_URL;
  }

  /** Store the JWT obtained after login. */
  setToken(token) {
    this._token = token;
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  async _request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this._token) headers['Authorization'] = `Bearer ${this._token}`;

    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  // ── Account ──────────────────────────────────────────────────────────────

  /** Fetch account summary. Returns account object. */
  async loadAccount() {
    return this._request('GET', '/api/account');
  }

  /**
   * Change account leverage.
   * @param {number} leverage  New leverage (1–1000).
   */
  async setLeverage(leverage) {
    return this._request('PATCH', '/api/account/leverage', { leverage });
  }

  // ── Orders ───────────────────────────────────────────────────────────────

  /**
   * Fetch open + pending orders.
   * Returns { open: Order[], pending: Order[] }
   */
  async loadOrders() {
    return this._request('GET', '/api/orders');
  }

  /**
   * Fetch closed order history.
   * Returns Order[]
   */
  async loadHistory() {
    return this._request('GET', '/api/orders/history');
  }

  /**
   * Place a new order.
   * @param {{ symbol, type, lots, price?, sl?, tp?, comment? }} order
   * Returns the created Order object.
   */
  async placeOrder(order) {
    return this._request('POST', '/api/orders', order);
  }

  /**
   * Close an open market order or cancel a pending order.
   * @param {number} ticket
   * Returns the closed / cancelled Order object.
   */
  async closeOrder(ticket) {
    return this._request('DELETE', `/api/orders/${ticket}`);
  }

  /**
   * Modify SL / TP of an existing order.
   * @param {number} ticket
   * @param {number|null} sl
   * @param {number|null} tp
   * Returns the modified Order object.
   */
  async modifyOrder(ticket, sl, tp) {
    return this._request('PATCH', `/api/orders/${ticket}`, { sl, tp });
    this._token = localStorage.getItem('vda_token') || null;
  }

  /** Returns true when a backend URL is configured. */
  isConfigured() { return Boolean(API_URL); }

  setToken(token) {
    this._token = token;
    if (token) localStorage.setItem('vda_token', token);
    else localStorage.removeItem('vda_token');
  }

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this._token) h['Authorization'] = `Bearer ${this._token}`;
    return h;
  }

  async _request(method, path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: this._headers(),
      body:    body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    let data = null;
    if (text && contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        // If JSON parsing fails, fall back to treating the body as plain text.
        data = null;
      }
    }

    if (!res.ok) {
      const message =
        (data && (data.error || data.message)) ||
        text ||
        `HTTP ${res.status}`;
      const error = new Error(message);
      error.status = res.status;
      error.responseText = text;
      throw error;
    }

    // On success, return parsed JSON when available; otherwise, return
    // raw text (if any) or undefined for empty bodies (e.g. 204).
    if (data !== null) return data;
    if (text) return text;
    return undefined;
  }

  // ── Auth ────────────────────────────────────────────────────────────────
  login(email, password)    { return this._request('POST', '/api/auth/login',    { email, password }); }
  register(email, password, name) { return this._request('POST', '/api/auth/register', { email, password, name }); }
  me()                      { return this._request('GET',  '/api/auth/me'); }

  // ── Orders ───────────────────────────────────────────────────────────────
  getOrders()               { return this._request('GET',  '/api/orders'); }
  placeOrder(order)         { return this._request('POST', '/api/orders', order); }
  closeOrder(ticket)        { return this._request('DELETE', `/api/orders/${ticket}`); }
  modifyOrder(ticket, data) { return this._request('PATCH',  `/api/orders/${ticket}`, data); }
  getHistory()              { return this._request('GET',  '/api/orders/history'); }

  // ── Account ───────────────────────────────────────────────────────────────
  getAccount()              { return this._request('GET',   '/api/account'); }
  setLeverage(leverage)     { return this._request('PATCH', '/api/account/leverage', { leverage }); }

  // ── Symbols ───────────────────────────────────────────────────────────────
  getSymbols()              { return this._request('GET',   '/api/symbols'); }
  getCandles(symbol, timeframe, count) {
    return this._request('GET', `/api/symbols/${symbol}/candles?timeframe=${timeframe}&count=${count || 200}`);
  }
  createSymbol(data)        { return this._request('POST',   '/api/symbols', data); }
  updateSymbol(symbol, data) { return this._request('PATCH', `/api/symbols/${symbol}`, data); }
  deleteSymbol(symbol)       { return this._request('DELETE', `/api/symbols/${symbol}`); }

  // ── Admin ─────────────────────────────────────────────────────────────────
  getRisk()                 { return this._request('GET',  '/api/admin/risk'); }
  getAdminAccounts()        { return this._request('GET',  '/api/admin/accounts'); }
  getAdminOrders()          { return this._request('GET',  '/api/admin/orders'); }
  forceCloseOrder(ticket)   { return this._request('POST', `/api/admin/orders/${ticket}/close`); }
  adjustBalance(accountId, amount, note) {
    return this._request('POST', `/api/admin/accounts/${accountId}/adjust`, { amount, note });
  }
  getAuditLog(limit)        { return this._request('GET', `/api/admin/audit?limit=${limit || 100}`); }

  // ── Super Admin ──────────────────────────────────────────────────────────
  getUsers()                { return this._request('GET',  '/api/admin/users'); }
  createUser(data)          { return this._request('POST', '/api/admin/users', data); }
  setUserStatus(userId, status) {
    return this._request('PATCH', `/api/admin/users/${userId}/status`, { status });
 * Backend Bridge Service
 *
 * Provides a unified interface for all backend REST API calls and real-time
 * WebSocket communication with the VDA Trading Terminal backend server.
 *
 * When REACT_APP_API_URL is set the bridge:
 *   - Authenticates with the REST API and stores the JWT
 *   - Loads account data and orders on login
 *   - Routes order placement / modification / closing through REST endpoints
 *   - Opens a WebSocket for real-time price quotes, candle updates, and
 *     per-account position / balance updates
 *
 * When REACT_APP_API_URL is NOT set the bridge is a no-op and the built-in
 * mt4Bridge simulator takes over.
 *
 * Usage:
 *   import backendBridge from './backendBridge';
 *
 *   // Check whether the backend is configured
 *   backendBridge.isConfigured();           // boolean
 *
 *   // After a successful login:
 *   backendBridge.setToken(token);
 *   await backendBridge.initialize();       // loads account + orders, opens WS
 *
 *   // Order operations (return the response data or throw on error):
 *   const order = await backendBridge.placeOrder({ symbol, type, lots, ... });
 *   const closed = await backendBridge.closeOrder(ticket);
 *   const modified = await backendBridge.modifyOrder(ticket, sl, tp);
 *
 *   // On logout:
 *   backendBridge.disconnect();
 */

import store from '../store';
import {
  updateAccount,
  setOrders,
  addHistoryOrder,
  placeOrder as placeOrderAction,
  closeOrder as closeOrderAction,
  modifyOrder as modifyOrderAction,
  addLog,
} from '../store/actions';

const API_URL = process.env.REACT_APP_API_URL || '';

/** Returns true when a backend URL has been configured. */
function isConfigured() {
  return Boolean(API_URL);
}

/** Returns the JWT stored after login, or null. */
function getToken() {
  return localStorage.getItem('vda_token') || null;
}

/** Build headers for authenticated requests. */
function getHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Perform an API fetch and parse JSON.
 * Throws an Error with the server's error message on non-2xx responses.
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  // Always attempt to parse JSON; fall back to a status-based message if the
  // body is not valid JSON (e.g. 5xx HTML error pages from a proxy).
  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    throw new Error('Unexpected non-JSON response');
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/**
 * Load the authenticated user's trading account and sync to Redux.
 * @returns {Promise<object|null>}
 */
async function loadAccount() {
  try {
    const account = await apiFetch('/api/account');
    store.dispatch(updateAccount(account));
    return account;
  } catch (err) {
    store.dispatch(addLog('error', `Failed to load account: ${err.message}`));
    return null;
  }
}

/**
 * Load open orders, pending orders and trade history, then sync to Redux.
 * @returns {Promise<{open: object[], pending: object[], history: object[]}|null>}
 */
async function loadOrders() {
  try {
    const [ordersData, history] = await Promise.all([
      apiFetch('/api/orders'),
      apiFetch('/api/orders/history'),
    ]);
    const { open = [], pending = [] } = ordersData;
    store.dispatch(setOrders({ open, pending, history }));
    return { open, pending, history };
  } catch (err) {
    store.dispatch(addLog('error', `Failed to load orders: ${err.message}`));
    return null;
  }
}

/**
 * Place a new order via the REST API and update Redux state.
 *
 * @param {{ symbol: string, type: string, lots: number, price?: number, sl?: number, tp?: number, comment?: string }} params
 * @returns {Promise<object|null>} The server order object, or null on failure.
 */
async function placeOrder(params) {
  try {
    const order = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    store.dispatch(placeOrderAction(order));
    store.dispatch(
      addLog('info', `Order placed: ${order.type} ${order.lots} ${order.symbol} @ ${order.openPrice} #${order.ticket}`)
    );
    return order;
  } catch (err) {
    store.dispatch(addLog('error', `Failed to place order: ${err.message}`));
    return null;
  }
}

/**
 * Close an open market order (or cancel a pending order) via the REST API.
 *
 * The account balance/equity update is delivered via the WebSocket
 * account broadcast that the backend emits after closure.
 *
 * @param {number} ticket
 * @returns {Promise<object|null>} The closed order object, or null on failure.
 */
async function closeOrder(ticket) {
  try {
    const closed = await apiFetch(`/api/orders/${ticket}`, { method: 'DELETE' });
    // Remove from open positions and move to history
    store.dispatch(closeOrderAction(ticket));
    store.dispatch(addHistoryOrder(closed));
    store.dispatch(addLog('info', `Order #${ticket} closed, P&L: ${closed.profit >= 0 ? '+' : ''}${closed.profit}`));
    // Refresh account to get updated balance/equity from the server
    await loadAccount();
    return closed;
  } catch (err) {
    store.dispatch(addLog('error', `Failed to close order #${ticket}: ${err.message}`));
    return null;
  }
}

/**
 * Modify stop-loss and/or take-profit of an existing order via the REST API.
 *
 * @param {number} ticket
 * @param {number|null} sl
 * @param {number|null} tp
 * @returns {Promise<object|null>} The updated order, or null on failure.
 */
async function modifyOrder(ticket, sl, tp) {
  try {
    const order = await apiFetch(`/api/orders/${ticket}`, {
      method: 'PATCH',
      body: JSON.stringify({ sl, tp }),
    });
    store.dispatch(modifyOrderAction(ticket, sl, tp));
    store.dispatch(addLog('info', `Order #${ticket} modified: SL=${sl != null ? sl : '—'} TP=${tp != null ? tp : '—'}`));
    return order;
  } catch (err) {
    store.dispatch(addLog('error', `Failed to modify order #${ticket}: ${err.message}`));
    return null;
  }
}

const backendBridge = {
  isConfigured,
  getToken,
  loadAccount,
  loadOrders,
  placeOrder,
  closeOrder,
  modifyOrder,
};

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
    // Merge the server-assigned ticket into the Redux store
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
    store.dispatch(addLog('info',
      `[API] Order #${ticket} closed`));
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
      // Authenticate the WS connection so the server scopes updates to this account
      if (this._token) {
        this._ws.send(JSON.stringify({ type: 'auth', token: this._token }));
      }

      // Request candle history for the active symbol
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
        // Real-time order updates pushed by the server (SL/TP triggered, etc.)
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
