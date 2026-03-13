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
  }
}

const backendBridge = new BackendBridge();
export default backendBridge;
