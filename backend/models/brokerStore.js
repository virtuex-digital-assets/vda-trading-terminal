/**
 * In-memory broker data store.
 */

const { v4: uuidv4 } = require('uuid');

// ── Brokers ───────────────────────────────────────────────────────────────────

const brokers = new Map();

// ── Broker Admins ─────────────────────────────────────────────────────────────

const brokerAdmins = new Map();

// ── ID counter ────────────────────────────────────────────────────────────────

let brokerCounter = 1;

// ── Helpers ───────────────────────────────────────────────────────────────────

function createBroker(fields = {}) {
  const id = `broker-${Date.now()}-${brokerCounter++}`;
  const now = new Date().toISOString();
  const broker = {
    id,
    name: fields.name || '',
    email: fields.email || '',
    phone: fields.phone || '',
    country: fields.country || '',
    status: fields.status || 'active',
    createdAt: now,
    updatedAt: now,
  };
  brokers.set(id, broker);
  return broker;
}

function createBrokerAdmin(fields = {}) {
  const id = uuidv4();
  const brokerAdmin = {
    id,
    brokerId: fields.brokerId || null,
    userId: fields.userId || null,
    role: fields.role || 'admin',
    createdAt: new Date().toISOString(),
  };
  brokerAdmins.set(id, brokerAdmin);
  return brokerAdmin;
}

// ── Seed demo broker ──────────────────────────────────────────────────────────

(function seedBrokers() {
  const now = new Date().toISOString();
  brokers.set('broker-1', {
    id: 'broker-1',
    name: 'VDA Demo Broker',
    email: 'broker@vda.trade',
    phone: '',
    country: '',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
})();

module.exports = {
  brokers,
  brokerAdmins,
  createBroker,
  createBrokerAdmin,
};
