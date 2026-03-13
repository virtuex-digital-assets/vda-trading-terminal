/**
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
  }
}

const backendBridge = new BackendBridge();
export default backendBridge;
