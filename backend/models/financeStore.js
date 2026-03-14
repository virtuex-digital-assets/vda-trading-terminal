/**
 * In-memory finance data store.
 */

const { v4: uuidv4 } = require('uuid');

// ── Deposits ─────────────────────────────────────────────────────────────────

const deposits = new Map();

// ── Withdrawals ──────────────────────────────────────────────────────────────

const withdrawals = new Map();

// ── Payment Gateways ─────────────────────────────────────────────────────────

const paymentGateways = new Map();

// ── Helpers ──────────────────────────────────────────────────────────────────

function createDeposit(fields = {}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const deposit = {
    id,
    userId: fields.userId || null,
    accountId: fields.accountId || null,
    amount: parseFloat(fields.amount) || 0,
    currency: fields.currency || 'USD',
    method: fields.method || '',
    status: fields.status || 'pending',
    reference: fields.reference || '',
    note: fields.note || '',
    createdAt: now,
    updatedAt: now,
  };
  deposits.set(id, deposit);
  return deposit;
}

function createWithdrawal(fields = {}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const withdrawal = {
    id,
    userId: fields.userId || null,
    accountId: fields.accountId || null,
    amount: parseFloat(fields.amount) || 0,
    currency: fields.currency || 'USD',
    method: fields.method || '',
    status: fields.status || 'pending',
    reference: fields.reference || '',
    note: fields.note || '',
    createdAt: now,
    updatedAt: now,
  };
  withdrawals.set(id, withdrawal);
  return withdrawal;
}

function createGateway(fields = {}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const gateway = {
    id,
    name: fields.name || '',
    provider: fields.provider || '',
    apiKey: fields.apiKey || '',
    apiSecret: fields.apiSecret || '',
    webhookUrl: fields.webhookUrl || '',
    mode: fields.mode || 'sandbox',
    status: fields.status || 'disabled',
    brokerId: fields.brokerId || null,
    createdAt: now,
    updatedAt: now,
  };
  paymentGateways.set(id, gateway);
  return gateway;
}

// ── Seed demo gateways ────────────────────────────────────────────────────────

(function seedGateways() {
  const stripeId = uuidv4();
  const now = new Date().toISOString();
  paymentGateways.set(stripeId, {
    id: stripeId,
    name: 'Stripe',
    provider: 'stripe',
    apiKey: 'pk_test_demo',
    apiSecret: 'sk_test_demo',
    webhookUrl: '',
    mode: 'sandbox',
    status: 'disabled',
    brokerId: null,
    createdAt: now,
    updatedAt: now,
  });

  const bankId = uuidv4();
  paymentGateways.set(bankId, {
    id: bankId,
    name: 'Bank Transfer',
    provider: 'bank_transfer',
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    mode: 'live',
    status: 'enabled',
    brokerId: null,
    createdAt: now,
    updatedAt: now,
  });
})();

module.exports = {
  deposits,
  withdrawals,
  paymentGateways,
  createDeposit,
  createWithdrawal,
  createGateway,
};
