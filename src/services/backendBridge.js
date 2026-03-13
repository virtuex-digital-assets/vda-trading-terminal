/**
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

export default backendBridge;
