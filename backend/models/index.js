/**
 * In-memory data store.
 *
 * Provides a simple, session-scoped store for all platform data.
 * In a production deployment this would be replaced by a database
 * (PostgreSQL / MongoDB – see /database/schema.sql for the schema).
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

// ── Users ──────────────────────────────────────────────────────────────────

const users = new Map();

// ── Accounts ───────────────────────────────────────────────────────────────

const accounts = new Map();

// ── Orders ─────────────────────────────────────────────────────────────────

const openOrders = new Map();    // ticket → order
const pendingOrders = new Map(); // ticket → order
const closedOrders = new Map();  // ticket → order

let ticketCounter = 1000;
function nextTicket() {
  return ++ticketCounter;
}

// ── Price feed cache ───────────────────────────────────────────────────────

// symbol → { bid, ask, time, change, changePercent }
const quotes = new Map();

// symbol_timeframe → candle[]
const candles = new Map();

// ── Symbol registry ────────────────────────────────────────────────────────

/**
 * symbol → {
 *   symbol, description, spread, leverageCap, contractSize,
 *   pipSize, digits, currency, tradingHours, active
 * }
 */
const symbolRegistry = new Map([
  ['EURUSD', { symbol: 'EURUSD', description: 'Euro / US Dollar',       spread: 0.0001, leverageCap: 500, contractSize: 100000, pipSize: 0.0001, digits: 5, currency: 'USD', tradingHours: '00:00-24:00', active: true  }],
  ['GBPUSD', { symbol: 'GBPUSD', description: 'British Pound / US Dollar', spread: 0.0002, leverageCap: 500, contractSize: 100000, pipSize: 0.0001, digits: 5, currency: 'USD', tradingHours: '00:00-24:00', active: true  }],
  ['USDJPY', { symbol: 'USDJPY', description: 'US Dollar / Japanese Yen',  spread: 0.02,   leverageCap: 500, contractSize: 100000, pipSize: 0.01,   digits: 3, currency: 'JPY', tradingHours: '00:00-24:00', active: true  }],
  ['USDCHF', { symbol: 'USDCHF', description: 'US Dollar / Swiss Franc',   spread: 0.0002, leverageCap: 500, contractSize: 100000, pipSize: 0.0001, digits: 5, currency: 'CHF', tradingHours: '00:00-24:00', active: true  }],
  ['AUDUSD', { symbol: 'AUDUSD', description: 'Australian Dollar / US Dollar', spread: 0.0002, leverageCap: 500, contractSize: 100000, pipSize: 0.0001, digits: 5, currency: 'USD', tradingHours: '00:00-24:00', active: true  }],
  ['USDCAD', { symbol: 'USDCAD', description: 'US Dollar / Canadian Dollar',   spread: 0.0002, leverageCap: 500, contractSize: 100000, pipSize: 0.0001, digits: 5, currency: 'CAD', tradingHours: '00:00-24:00', active: true  }],
  ['NZDUSD', { symbol: 'NZDUSD', description: 'New Zealand Dollar / US Dollar', spread: 0.0003, leverageCap: 500, contractSize: 100000, pipSize: 0.0001, digits: 5, currency: 'USD', tradingHours: '00:00-24:00', active: true  }],
  ['XAUUSD', { symbol: 'XAUUSD', description: 'Gold / US Dollar',            spread: 0.3,    leverageCap: 100, contractSize: 100,    pipSize: 0.01,   digits: 2, currency: 'USD', tradingHours: '01:00-24:00', active: true  }],
  ['XAGUSD', { symbol: 'XAGUSD', description: 'Silver / US Dollar',          spread: 0.05,   leverageCap: 100, contractSize: 5000,   pipSize: 0.001,  digits: 3, currency: 'USD', tradingHours: '01:00-24:00', active: true  }],
  ['BTCUSD', { symbol: 'BTCUSD', description: 'Bitcoin / US Dollar',         spread: 5.0,    leverageCap: 10,  contractSize: 1,      pipSize: 1,      digits: 2, currency: 'USD', tradingHours: '00:00-24:00', active: false }],
  ['ETHUSD', { symbol: 'ETHUSD', description: 'Ethereum / US Dollar',        spread: 0.5,    leverageCap: 10,  contractSize: 1,      pipSize: 0.01,   digits: 2, currency: 'USD', tradingHours: '00:00-24:00', active: false }],
]);

// ── Audit log ──────────────────────────────────────────────────────────────

/** Array of audit log entries (capped at 1 000 by middleware). */
const auditLogs = [];

// ── Helpers ────────────────────────────────────────────────────────────────

function getUserByEmail(email) {
  for (const u of users.values()) {
    if (u.email === email) return u;
  }
  return null;
}

function getUserById(id) {
  return users.get(id) || null;
}

function getAccountByUserId(userId) {
  for (const a of accounts.values()) {
    if (a.userId === userId) return a;
  }
  return null;
}

function getAccountById(id) {
  return accounts.get(id) || null;
}

function createAccount(userId, overrides = {}) {
  const id = uuidv4();
  const loginNum = String(10000 + accounts.size + 1);
  const account = {
    id,
    userId,
    login: loginNum,
    server: 'VDA-Demo',
    balance: config.defaultBalance,
    equity: config.defaultBalance,
    margin: 0,
    freeMargin: config.defaultBalance,
    marginLevel: 0,
    profit: 0,
    leverage: config.defaultLeverage,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
  accounts.set(id, account);
  return account;
}

function createUser(email, password, name, role = 'trader') {
  const id = uuidv4();
  const user = {
    id,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    name,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  return user;
}

// ── Seed default accounts ──────────────────────────────────────────────────
// Runs after all helpers are defined.
(function seedUsers() {
  const adminUser     = createUser('admin@vda.trade',  'Admin1234!',  'VDA Admin',       'admin');
  const superUser     = createUser('super@vda.trade',  'Super1234!',  'VDA Super Admin', 'super_admin');
  const traderUser    = createUser('demo@vda.trade',   'Demo1234!',   'Demo Trader',     'trader');
  createAccount(traderUser.id);
  createAccount(adminUser.id, { balance: 0, equity: 0, freeMargin: 0 });
  // Suppress unused-variable warning – superUser is seeded for login only
  void superUser;
})();

module.exports = {
  users,
  accounts,
  openOrders,
  pendingOrders,
  closedOrders,
  quotes,
  candles,
  symbolRegistry,
  auditLogs,
  nextTicket,
  getUserByEmail,
  getUserById,
  getAccountByUserId,
  getAccountById,
  createAccount,
  createUser,
};
