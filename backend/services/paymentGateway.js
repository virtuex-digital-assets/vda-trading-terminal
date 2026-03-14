/**
 * Payment Gateway Service.
 *
 * Provides a routing layer over multiple payment methods:
 *   - crypto          (BTC, ETH, USDT wallets)
 *   - bank_transfer   (IBAN / SWIFT / ACH)
 *   - credit_card     (Visa / Mastercard via PSP)
 *   - e_wallet        (Skrill, Neteller, etc.)
 *
 * In a production deployment each provider would be a real PSP integration.
 * This module provides the full interface and data model; actual money movement
 * is simulated for the demo environment.
 */

const { v4: uuidv4 } = require('uuid');

// ── Payment methods registry ───────────────────────────────────────────────

const paymentMethods = new Map([
  ['crypto_btc', {
    id:          'crypto_btc',
    name:        'Bitcoin (BTC)',
    type:        'crypto',
    currency:    'BTC',
    minAmount:   10,
    maxAmount:   500_000,
    feePercent:  0.5,
    feeFix:      0,
    processingMs: 3600_000, // 1 hour
    status:      'active',
    logoUrl:     '/assets/payments/btc.svg',
    instructions: 'Send BTC to the address shown. Confirmation requires 2 network confirmations.',
  }],
  ['crypto_eth', {
    id:          'crypto_eth',
    name:        'Ethereum (ETH)',
    type:        'crypto',
    currency:    'ETH',
    minAmount:   10,
    maxAmount:   500_000,
    feePercent:  0.5,
    feeFix:      0,
    processingMs: 1800_000, // 30 min
    status:      'active',
    logoUrl:     '/assets/payments/eth.svg',
    instructions: 'Send ETH to the address shown. Confirmation requires 12 network confirmations.',
  }],
  ['crypto_usdt', {
    id:          'crypto_usdt',
    name:        'Tether (USDT TRC20)',
    type:        'crypto',
    currency:    'USDT',
    minAmount:   10,
    maxAmount:   500_000,
    feePercent:  0.1,
    feeFix:      1,
    processingMs: 600_000, // 10 min
    status:      'active',
    logoUrl:     '/assets/payments/usdt.svg',
    instructions: 'Send USDT (TRC20) to the address shown.',
  }],
  ['bank_wire', {
    id:          'bank_wire',
    name:        'Bank Wire Transfer',
    type:        'bank_transfer',
    currency:    'USD',
    minAmount:   500,
    maxAmount:   10_000_000,
    feePercent:  0,
    feeFix:      25,
    processingMs: 259_200_000, // 3 business days
    status:      'active',
    logoUrl:     '/assets/payments/bank.svg',
    instructions: 'Please use your account number as the payment reference.',
  }],
  ['credit_card', {
    id:          'credit_card',
    name:        'Credit / Debit Card',
    type:        'credit_card',
    currency:    'USD',
    minAmount:   50,
    maxAmount:   50_000,
    feePercent:  2.5,
    feeFix:      0,
    processingMs: 0, // instant
    status:      'active',
    logoUrl:     '/assets/payments/card.svg',
    instructions: 'Secure 3D-verified card payment processed instantly.',
  }],
  ['skrill', {
    id:          'skrill',
    name:        'Skrill',
    type:        'e_wallet',
    currency:    'USD',
    minAmount:   10,
    maxAmount:   100_000,
    feePercent:  1.0,
    feeFix:      0,
    processingMs: 0,
    status:      'active',
    logoUrl:     '/assets/payments/skrill.svg',
    instructions: 'Login to your Skrill account to complete the payment.',
  }],
  ['neteller', {
    id:          'neteller',
    name:        'Neteller',
    type:        'e_wallet',
    currency:    'USD',
    minAmount:   10,
    maxAmount:   100_000,
    feePercent:  1.0,
    feeFix:      0,
    processingMs: 0,
    status:      'active',
    logoUrl:     '/assets/payments/neteller.svg',
    instructions: 'Login to your Neteller account to complete the payment.',
  }],
]);

// ── Payment requests ───────────────────────────────────────────────────────

/**
 * paymentRequests  id → {
 *   id, userId, accountId, methodId, type, amount, fee, netAmount,
 *   currency, status, reference, gatewayRef, paymentAddress, metadata,
 *   createdAt, expiresAt, completedAt
 * }
 */
const paymentRequests = new Map();

// ── Helpers ────────────────────────────────────────────────────────────────

function calculateFee(method, amount) {
  const percentFee = (method.feePercent / 100) * amount;
  return parseFloat((percentFee + method.feeFix).toFixed(2));
}

function generateCryptoAddress(currency) {
  // Demo: generate a plausible-looking address
  const prefixes = { BTC: '1', ETH: '0x', USDT: 'T' };
  const prefix = prefixes[currency] || '';
  const chars = '0123456789abcdefABCDEF';
  let addr = prefix;
  for (let i = 0; i < 32; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

// ── CRUD ───────────────────────────────────────────────────────────────────

function listPaymentMethods({ type } = {}) {
  let all = [...paymentMethods.values()].filter((m) => m.status === 'active');
  if (type) all = all.filter((m) => m.type === type);
  return all;
}

function getPaymentMethod(id) {
  return paymentMethods.get(id) || null;
}

function initiatePayment({ userId, accountId, methodId, type, amount }) {
  const method = paymentMethods.get(methodId);
  if (!method) throw new Error('Payment method not found');
  if (method.status !== 'active') throw new Error('Payment method is currently unavailable');

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) throw new Error('amount must be a positive number');
  if (numAmount < method.minAmount) throw new Error(`Minimum ${type} is ${method.currency} ${method.minAmount}`);
  if (numAmount > method.maxAmount) throw new Error(`Maximum ${type} is ${method.currency} ${method.maxAmount}`);

  const fee       = calculateFee(method, numAmount);
  const netAmount = type === 'deposit' ? numAmount - fee : numAmount + fee;
  const now       = new Date();
  const expiresAt = new Date(now.getTime() + 3_600_000); // 1 hour to complete
  const estimatedCompletionAt = method.processingMs > 0
    ? new Date(now.getTime() + method.processingMs).toISOString()
    : now.toISOString(); // instant

  // Generate payment destination for crypto
  let paymentAddress = null;
  if (method.type === 'crypto') {
    paymentAddress = generateCryptoAddress(method.currency);
  }

  const id      = uuidv4();
  const request = {
    id,
    userId,
    accountId,
    methodId,
    methodName:     method.name,
    methodType:     method.type,
    type,           // 'deposit' | 'withdrawal'
    amount:         numAmount,
    fee,
    netAmount:      parseFloat(netAmount.toFixed(2)),
    currency:       method.currency,
    status:         'pending', // pending | processing | completed | failed | cancelled
    reference:      `PAY-${id.slice(0, 8).toUpperCase()}`,
    gatewayRef:     null,
    paymentAddress,
    metadata:       {},
    instructions:   method.instructions,
    estimatedCompletionAt,
    createdAt:      now.toISOString(),
    expiresAt:      expiresAt.toISOString(),
    completedAt:    null,
  };

  paymentRequests.set(id, request);
  return request;
}

function getPaymentRequest(id) {
  return paymentRequests.get(id) || null;
}

function listPaymentsByUser(userId) {
  return [...paymentRequests.values()]
    .filter((p) => p.userId === userId)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

function listAllPayments({ status, type, methodType } = {}) {
  let all = [...paymentRequests.values()];
  if (status)     all = all.filter((p) => p.status === status);
  if (type)       all = all.filter((p) => p.type === type);
  if (methodType) all = all.filter((p) => p.methodType === methodType);
  return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

function updatePaymentStatus(id, { status, gatewayRef }) {
  const req = paymentRequests.get(id);
  if (!req) return null;

  req.status   = status;
  if (gatewayRef) req.gatewayRef = gatewayRef;
  if (status === 'completed' || status === 'failed') {
    req.completedAt = new Date().toISOString();
  }
  return req;
}

// ── Payment method admin ───────────────────────────────────────────────────

function updatePaymentMethod(id, updates) {
  const method = paymentMethods.get(id);
  if (!method) return null;
  const allowed = ['status', 'feePercent', 'feeFix', 'minAmount', 'maxAmount'];
  for (const key of allowed) {
    if (updates[key] !== undefined) method[key] = updates[key];
  }
  return method;
}

// ── Summary ────────────────────────────────────────────────────────────────

function getPaymentSummary() {
  const all = [...paymentRequests.values()];
  const completed = all.filter((p) => p.status === 'completed');
  return {
    totalDeposits:    completed.filter((p) => p.type === 'deposit').reduce((s, p) => s + p.amount, 0),
    totalWithdrawals: completed.filter((p) => p.type === 'withdrawal').reduce((s, p) => s + p.amount, 0),
    pendingCount:     all.filter((p) => p.status === 'pending').length,
    byMethod:         Object.fromEntries(
      [...paymentMethods.keys()].map((id) => [
        id,
        completed.filter((p) => p.methodId === id).reduce((s, p) => s + p.amount, 0),
      ])
    ),
  };
}

module.exports = {
  listPaymentMethods,
  getPaymentMethod,
  initiatePayment,
  getPaymentRequest,
  listPaymentsByUser,
  listAllPayments,
  updatePaymentStatus,
  updatePaymentMethod,
  getPaymentSummary,
};
