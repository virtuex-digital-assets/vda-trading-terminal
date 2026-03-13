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
  const adminUser  = createUser('admin@vda.trade', 'Admin1234!', 'VDA Admin',    'admin');
  const traderUser = createUser('demo@vda.trade',  'Demo1234!',  'Demo Trader',  'trader');
  createAccount(traderUser.id);
  // Suppress unused-variable warning – adminUser is seeded for login only
  void adminUser;
})();

module.exports = {
  users,
  accounts,
  openOrders,
  pendingOrders,
  closedOrders,
  quotes,
  candles,
  nextTicket,
  getUserByEmail,
  getUserById,
  getAccountByUserId,
  getAccountById,
  createAccount,
  createUser,
};
