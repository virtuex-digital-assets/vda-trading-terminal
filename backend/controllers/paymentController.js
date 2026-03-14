/**
 * Payment Gateway controller.
 *
 * Provides endpoints for initiating and tracking payments through
 * multiple payment methods (crypto, bank wire, credit card, e-wallets).
 */

const paymentGateway = require('../services/paymentGateway');
const db             = require('../models');
const { broadcast }  = require('../services/wsServer');

// ── Method discovery ───────────────────────────────────────────────────────

/**
 * GET /api/payments/methods
 * Query: ?type=crypto|bank_transfer|credit_card|e_wallet
 * Returns available payment methods.
 */
function listMethods(req, res) {
  const methods = paymentGateway.listPaymentMethods({ type: req.query.type });
  res.json({ methods });
}

/**
 * GET /api/payments/methods/:id
 * Returns a single payment method.
 */
function getMethod(req, res) {
  const method = paymentGateway.getPaymentMethod(req.params.id);
  if (!method) return res.status(404).json({ error: 'Payment method not found' });
  res.json({ method });
}

// ── Initiate payment ───────────────────────────────────────────────────────

/**
 * POST /api/payments/deposit
 * Body: { methodId, amount }
 * Initiates a deposit via the specified payment method.
 */
function initiateDeposit(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(404).json({ error: 'No trading account found' });

  const { methodId, amount } = req.body;
  if (!methodId) return res.status(400).json({ error: 'methodId is required' });

  try {
    const payment = paymentGateway.initiatePayment({
      userId:    req.user.id,
      accountId: account.id,
      methodId,
      type:      'deposit',
      amount,
    });
    res.status(201).json({ payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * POST /api/payments/withdraw
 * Body: { methodId, amount }
 * Initiates a withdrawal via the specified payment method.
 */
function initiateWithdrawal(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(404).json({ error: 'No trading account found' });

  const { methodId, amount } = req.body;
  if (!methodId) return res.status(400).json({ error: 'methodId is required' });

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (numAmount > account.balance) {
    return res.status(400).json({ error: 'Insufficient account balance' });
  }

  try {
    const payment = paymentGateway.initiatePayment({
      userId:    req.user.id,
      accountId: account.id,
      methodId,
      type:      'withdrawal',
      amount,
    });
    res.status(201).json({ payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Payment history ────────────────────────────────────────────────────────

/**
 * GET /api/payments/history
 * Returns authenticated user's payment history.
 */
function getHistory(req, res) {
  const payments = paymentGateway.listPaymentsByUser(req.user.id);
  res.json({ payments, total: payments.length });
}

/**
 * GET /api/payments/:id
 * Returns a specific payment request.
 */
function getPayment(req, res) {
  const payment = paymentGateway.getPaymentRequest(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (req.user.role === 'trader' && payment.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({ payment });
}

// ── Admin endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/payments/admin/all
 * Query: ?status=pending&type=withdrawal&methodType=crypto
 * Lists all payment requests (admin only).
 */
function listAll(req, res) {
  const { status, type, methodType } = req.query;
  const payments = paymentGateway.listAllPayments({ status, type, methodType });
  res.json({ payments, total: payments.length });
}

/**
 * GET /api/payments/admin/summary
 * Returns payment statistics (admin only).
 */
function getSummary(req, res) {
  res.json(paymentGateway.getPaymentSummary());
}

/**
 * PATCH /api/payments/admin/:id/status
 * Body: { status: 'completed'|'failed'|'processing', gatewayRef? }
 * Processes a payment (admin only).
 */
function processPayment(req, res) {
  const { status, gatewayRef } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  const payment = paymentGateway.updatePaymentStatus(req.params.id, { status, gatewayRef });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  // If completed deposit, credit the account
  if (status === 'completed' && payment.type === 'deposit') {
    const account = db.getAccountByUserId(payment.userId);
    if (account) {
      account.balance    = parseFloat((account.balance + payment.amount).toFixed(2));
      account.equity     = parseFloat((account.balance + (account.profit || 0)).toFixed(2));
      account.freeMargin = parseFloat((account.equity - account.margin).toFixed(2));
      broadcast({ type: 'account', ...account }, (client) => client._accountId === account.id);
    }
  }

  res.json({ payment });
}

/**
 * PATCH /api/payments/admin/methods/:id
 * Body: { status, feePercent, minAmount, maxAmount }
 * Updates a payment method configuration (admin only).
 */
function updateMethod(req, res) {
  const method = paymentGateway.updatePaymentMethod(req.params.id, req.body);
  if (!method) return res.status(404).json({ error: 'Payment method not found' });
  res.json({ method });
}

module.exports = {
  listMethods,
  getMethod,
  initiateDeposit,
  initiateWithdrawal,
  getHistory,
  getPayment,
  listAll,
  getSummary,
  processPayment,
  updateMethod,
};
