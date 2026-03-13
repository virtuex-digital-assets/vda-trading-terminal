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
  updateAccount,
  placeOrder,
  closeOrder,
  modifyOrder,
  cancelPendingOrder,
  setOrders,
  addHistoryOrder,
  setConnectionStatus,
  addLog,
} from '../store/actions';

const API_URL = process.env.REACT_APP_API_URL || '';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('vda_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── WebSocket state ───────────────────────────────────────────────────────────

let socket = null;
let reconnectTimer = null;
let intentionalDisconnect = false;

function handleMessage(msg) {
  switch (msg.type) {
    case 'auth_ok':
      store.dispatch(setConnectionStatus('connected'));
      store.dispatch(addLog('info', `Connected to VDA backend as ${msg.role}`));
      // Fetch current orders now that we're authenticated
      backendBridge.syncOrders();
      break;

    case 'auth_error':
      store.dispatch(setConnectionStatus('error'));
      store.dispatch(addLog('error', `Backend auth failed: ${msg.message}`));
      break;

    case 'quote':
      store.dispatch(updateQuote(msg.symbol, msg.bid, msg.ask, msg.time));
      break;

    case 'candle':
      store.dispatch(addCandle(msg.symbol, msg.timeframe, msg.candle));
      break;

    case 'candles':
      store.dispatch(setCandles(msg.symbol, msg.timeframe, msg.data));
      break;

    case 'account':
      // Omit internal fields before dispatching to Redux
      // eslint-disable-next-line no-case-declarations
      const { id: _id, userId: _uid, createdAt: _ca, ...accountFields } = msg;
      store.dispatch(updateAccount(accountFields));
      break;

    case 'order':
      if (msg.action === 'open') {
        // Only add if not already in the store (avoid duplicates from optimistic dispatch)
        const state = store.getState().orders;
        const exists =
          state.openOrders.some((o) => o.ticket === msg.order.ticket) ||
          state.pendingOrders.some((o) => o.ticket === msg.order.ticket);
        if (!exists) store.dispatch(placeOrder(msg.order));
      } else if (msg.action === 'close') {
        const ticket = msg.order.ticket;
        const state = store.getState().orders;
        if (state.openOrders.some((o) => o.ticket === ticket)) {
          store.dispatch(closeOrder(ticket));
          store.dispatch(addHistoryOrder(msg.order));
        }
      } else if (msg.action === 'modify') {
        store.dispatch(modifyOrder(msg.order.ticket, msg.order.sl, msg.order.tp));
      }
      break;

    default:
      break;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

const backendBridge = {
  /** Returns true when a backend URL has been configured. */
  isConfigured() {
    return Boolean(API_URL);
  },

  /**
   * Open the WebSocket connection and authenticate with the stored JWT.
   * Safe to call even before the user logs in; it will connect as a guest
   * and receive public market data.
   */
  connect() {
    if (!API_URL) return;
    intentionalDisconnect = false;

    // Convert http(s) → ws(s) for the WebSocket URL
    const wsUrl = API_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');

    store.dispatch(setConnectionStatus('connecting'));
    try {
      socket = new WebSocket(wsUrl);
    } catch (err) {
      store.dispatch(setConnectionStatus('error'));
      store.dispatch(addLog('error', `WS connect failed: ${err.message}`));
      return;
    }

    socket.onopen = () => {
      const token = getToken();
      if (token) {
        socket.send(JSON.stringify({ type: 'auth', token }));
      } else {
        store.dispatch(setConnectionStatus('connected'));
      }
    };

    socket.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      handleMessage(msg);
    };

    socket.onclose = () => {
      if (intentionalDisconnect) return;
      store.dispatch(setConnectionStatus('disconnected'));
      store.dispatch(addLog('warn', 'Backend disconnected – reconnecting in 3 s…'));
      reconnectTimer = setTimeout(() => backendBridge.connect(), 3000);
    };

    socket.onerror = () => {
      store.dispatch(setConnectionStatus('error'));
      store.dispatch(addLog('error', 'Backend WebSocket error'));
    };
  },

  /** Re-authenticate after login (sends new JWT over existing socket). */
  authenticate() {
    const token = getToken();
    if (!token || !socket || socket.readyState !== WebSocket.OPEN) {
      backendBridge.connect();
      return;
    }
    socket.send(JSON.stringify({ type: 'auth', token }));
  },

  /** Gracefully close the WebSocket. */
  disconnect() {
    intentionalDisconnect = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (socket) {
      socket.close();
      socket = null;
    }
  },

  // ── REST helpers ────────────────────────────────────────────────────────

  /** Fetch account state from backend and push it into Redux. */
  async getAccount() {
    try {
      const data = await request('GET', '/api/account');
      store.dispatch(updateAccount(data));
      return data;
    } catch (err) {
      store.dispatch(addLog('error', `Failed to load account: ${err.message}`));
      throw err;
    }
  },

  /**
   * Fetch open, pending, and closed orders from the backend and replace
   * the entire Redux orders state.
   */
  async syncOrders() {
    try {
      const [{ open, pending }, history] = await Promise.all([
        request('GET', '/api/orders'),
        request('GET', '/api/orders/history'),
      ]);
      store.dispatch(setOrders(open, pending, history));
    } catch (err) {
      store.dispatch(addLog('error', `Failed to sync orders: ${err.message}`));
    }
  },

  /**
   * Place a new order via the backend REST API.
   * @param {object} order - { symbol, type, lots, price?, sl?, tp?, comment? }
   * @returns {object} The confirmed order object (with backend ticket).
   */
  async placeOrder(order) {
    const data = await request('POST', '/api/orders', order);
    return data;
  },

  /**
   * Close an open market order (or cancel a pending order) via backend.
   * @param {number} ticket
   * @returns {object} The closed/cancelled order.
   */
  async closeOrder(ticket) {
    const data = await request('DELETE', `/api/orders/${ticket}`);
    return data;
  },

  /**
   * Modify SL/TP of an existing order via backend.
   * @param {number} ticket
   * @param {number|null} sl
   * @param {number|null} tp
   * @returns {object} The modified order.
   */
  async modifyOrder(ticket, sl, tp) {
    const data = await request('PATCH', `/api/orders/${ticket}`, { sl, tp });
    return data;
  },

  /** Fetch candle history for a symbol/timeframe. */
  async getCandles(symbol, timeframe = 'H1', count = 200) {
    return request('GET', `/api/symbols/${symbol}/candles?timeframe=${timeframe}&count=${count}`);
  },

  // ── Admin REST helpers ──────────────────────────────────────────────────

  /** GET /api/admin/risk */
  async getRisk() {
    return request('GET', '/api/admin/risk');
  },

  /** GET /api/admin/accounts */
  async listAccounts() {
    return request('GET', '/api/admin/accounts');
  },

  /** GET /api/admin/orders */
  async listAllOrders() {
    return request('GET', '/api/admin/orders');
  },

  /** POST /api/admin/orders/:ticket/close */
  async forceCloseOrder(ticket) {
    return request('POST', `/api/admin/orders/${ticket}/close`);
  },

  /** Subscribe to candle history for a symbol/timeframe over WS. */
  subscribeCandles(symbol, timeframe) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'subscribe_candles', symbol, timeframe }));
  },
};

export default backendBridge;
