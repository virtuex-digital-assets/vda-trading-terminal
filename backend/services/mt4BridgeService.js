/**
 * MT4 Bridge Service (Backend)
 *
 * Provides order synchronisation between the platform and MT4 servers.
 * In production this connects via FIX API or the MT4 Manager API.
 * This implementation simulates MT4 connectivity for demo purposes,
 * allowing the platform to operate without a live MT4 installation.
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../models');

// ── MT4 Server configurations ───────────────────────────────────────────────

/**
 * id → {
 *   id, name, host, port, login, password, version,
 *   status, lastSync, pendingOrders, syncStats
 * }
 */
const mt4Servers = new Map([
  ['mt4_demo', {
    id:        'mt4_demo',
    name:      'VDA-Demo MT4',
    host:      'demo.vda.trade',
    port:      443,
    login:     '',
    password:  '',
    version:   '4.00 build 1340',
    status:    'disconnected',
    lastSync:  null,
    pendingOrders: [],
    syncStats: { synced: 0, failed: 0, lastError: null },
  }],
]);

// ── Connection management ───────────────────────────────────────────────────

/**
 * Simulate connecting to an MT4 server.
 * In production this would open a FIX or Manager API session.
 */
function connect(serverId) {
  const server = mt4Servers.get(serverId);
  if (!server) return { ok: false, error: 'Server not found' };
  if (!server.host) return { ok: false, error: 'Server host not configured' };

  // Simulate connection (always succeeds in demo mode)
  server.status = 'connected';
  server.lastSync = new Date().toISOString();
  return { ok: true, serverId, status: 'connected' };
}

function disconnect(serverId) {
  const server = mt4Servers.get(serverId);
  if (!server) return { ok: false, error: 'Server not found' };
  server.status = 'disconnected';
  return { ok: true };
}

function getServerStatus(serverId) {
  const server = mt4Servers.get(serverId);
  if (!server) return null;
  const { id, name, host, port, version, status, lastSync, syncStats } = server;
  return { id, name, host, port, version, status, lastSync, syncStats };
}

function listServers() {
  return [...mt4Servers.values()].map(({ id, name, host, port, version, status, lastSync, syncStats }) =>
    ({ id, name, host, port, version, status, lastSync, syncStats })
  );
}

function addServer({ name, host, port = 443, login = '', password = '' }) {
  const id = `mt4_${uuidv4().slice(0, 8)}`;
  const server = {
    id, name, host, port, login, password,
    version: '4.00 build 1340',
    status: 'disconnected',
    lastSync: null,
    pendingOrders: [],
    syncStats: { synced: 0, failed: 0, lastError: null },
  };
  mt4Servers.set(id, server);
  return { id, name, host, port, version: server.version, status: server.status };
}

function updateServer(id, updates) {
  const server = mt4Servers.get(id);
  if (!server) return null;
  const allowed = ['name', 'host', 'port', 'login', 'password'];
  for (const key of allowed) {
    if (updates[key] !== undefined) server[key] = updates[key];
  }
  return getServerStatus(id);
}

// ── Order synchronisation ───────────────────────────────────────────────────

/**
 * Push an order to the MT4 server.
 * In production: sends a FIX NewOrderSingle message or Manager API call.
 *
 * @param {string} serverId
 * @param {object} order
 * @returns {{ ok: boolean, mt4Ticket?: number, error?: string }}
 */
function pushOrder(serverId, order) {
  const server = mt4Servers.get(serverId);
  if (!server) return { ok: false, error: 'Server not found' };
  if (server.status !== 'connected') return { ok: false, error: 'Not connected to MT4 server' };

  // Simulate MT4 ticket assignment
  const mt4Ticket = 100000 + Math.floor(Math.random() * 900000);
  server.syncStats.synced += 1;
  server.lastSync = new Date().toISOString();

  return { ok: true, mt4Ticket, serverId };
}

/**
 * Close a position on the MT4 server.
 */
function closePosition(serverId, mt4Ticket) {
  const server = mt4Servers.get(serverId);
  if (!server) return { ok: false, error: 'Server not found' };
  if (server.status !== 'connected') return { ok: false, error: 'Not connected to MT4 server' };

  server.syncStats.synced += 1;
  return { ok: true, mt4Ticket, serverId };
}

/**
 * Sync account balance from MT4.
 * In production: reads balance from Manager API.
 */
function syncBalance(serverId, accountLogin) {
  const server = mt4Servers.get(serverId);
  if (!server) return { ok: false, error: 'Server not found' };
  if (server.status !== 'connected') return { ok: false, error: 'Not connected to MT4 server' };

  // Simulate balance response
  return {
    ok: true,
    accountLogin,
    balance:    10000 + Math.random() * 5000,
    equity:     10000 + Math.random() * 5000,
    margin:     Math.random() * 2000,
    freeMargin: 8000 + Math.random() * 2000,
    leverage:   100,
    currency:   'USD',
  };
}

/**
 * Get open positions from MT4.
 */
function getOpenPositions(serverId) {
  const server = mt4Servers.get(serverId);
  if (!server) return { ok: false, error: 'Server not found' };
  if (server.status !== 'connected') return { ok: false, error: 'Not connected to MT4 server' };

  // Return platform open orders as a proxy
  const positions = [...db.openOrders.values()].slice(0, 20).map((o) => ({
    ticket:    o.ticket,
    symbol:    o.symbol,
    type:      o.type,
    lots:      o.lots,
    openPrice: o.openPrice,
    sl:        o.sl,
    tp:        o.tp,
    profit:    o.profit || 0,
    comment:   o.comment || '',
    openTime:  o.openTime,
  }));

  return { ok: true, positions };
}

module.exports = {
  connect,
  disconnect,
  getServerStatus,
  listServers,
  addServer,
  updateServer,
  pushOrder,
  closePosition,
  syncBalance,
  getOpenPositions,
};
