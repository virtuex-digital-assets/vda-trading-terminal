/**
 * Wallet controller.
 *
 * Handles deposit requests, withdrawal requests, and transaction history.
 * All financial mutations are recorded in the secure transaction ledger
 * (db.walletTransactions) and reflected in the trading account balance once
 * approved.
 *
 * In a production system, deposit / withdrawal approval would be handled by
 * a payment gateway webhook or a human back-office operator.  For the demo
 * environment the "approve" action is exposed via an admin endpoint and
 * deposit requests are auto-approved immediately.
 */

const db = require('../models');
const { broadcast } = require('../services/wsServer');

/**
 * POST /api/wallet/deposit
 * Body: { amount: number, currency?: string, reference?: string, note?: string }
 */
function requestDeposit(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(404).json({ error: 'No trading account found' });

  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (amount > 1_000_000) {
    return res.status(400).json({ error: 'Single deposit limit is $1,000,000' });
  }

  const currency  = req.body.currency || 'USD';
  const note      = String(req.body.note      || '').slice(0, 200);
  const reference = String(req.body.reference || '').slice(0, 100);

  const tx = db.createWalletTransaction(req.user.id, 'deposit', amount, currency, note, reference);

  // Demo environment: auto-approve deposits immediately
  tx.status      = 'completed';
  tx.processedAt = new Date().toISOString();

  // Credit the trading account
  account.balance    = parseFloat((account.balance + amount).toFixed(2));
  account.equity     = parseFloat((account.balance + (account.profit || 0)).toFixed(2));
  account.freeMargin = parseFloat((account.equity - account.margin).toFixed(2));

  // Notify connected clients
  broadcast({ type: 'account', ...account }, (client) => client._accountId === account.id);

  res.status(201).json({ transaction: tx, account: sanitiseAccount(account) });
}

/**
 * POST /api/wallet/withdraw
 * Body: { amount: number, currency?: string, reference?: string, note?: string }
 */
function requestWithdrawal(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(404).json({ error: 'No trading account found' });

  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (amount > account.balance) {
    return res.status(400).json({ error: 'Insufficient account balance' });
  }

  const currency  = req.body.currency || 'USD';
  const note      = String(req.body.note      || '').slice(0, 200);
  const reference = String(req.body.reference || '').slice(0, 100);

  const tx = db.createWalletTransaction(req.user.id, 'withdrawal', amount, currency, note, reference);

  // Withdrawals are placed in 'pending' state pending admin approval.
  // Deduct balance immediately to prevent double-withdrawal.
  account.balance    = parseFloat((account.balance - amount).toFixed(2));
  account.equity     = parseFloat((account.balance + (account.profit || 0)).toFixed(2));
  account.freeMargin = parseFloat((account.equity - account.margin).toFixed(2));

  broadcast({ type: 'account', ...account }, (client) => client._accountId === account.id);

  res.status(201).json({ transaction: tx, account: sanitiseAccount(account) });
}

/**
 * GET /api/wallet/transactions
 * Returns transaction history for the authenticated user.
 * Query: ?limit=50&type=deposit|withdrawal
 */
function getTransactions(req, res) {
  let txs = db.getWalletTransactionsByUserId(req.user.id);

  if (req.query.type) {
    txs = txs.filter((t) => t.type === req.query.type);
  }

  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
  res.json(txs.slice(0, limit));
}

/**
 * PATCH /api/wallet/transactions/:txId/status  (admin only)
 * Body: { status: 'approved' | 'rejected' | 'completed' }
 * Approves or rejects a pending withdrawal.
 */
function updateTransactionStatus(req, res) {
  const { txId } = req.params;
  const tx = db.walletTransactions.get(txId);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { status } = req.body;
  if (!['approved', 'rejected', 'completed'].includes(status)) {
    return res.status(400).json({ error: "status must be 'approved', 'rejected', or 'completed'" });
  }

  // If rejecting a withdrawal, refund the amount to the account
  if (status === 'rejected' && tx.type === 'withdrawal' && tx.status === 'pending') {
    const account = db.getAccountByUserId(tx.userId);
    if (account) {
      account.balance    = parseFloat((account.balance + tx.amount).toFixed(2));
      account.equity     = parseFloat((account.balance + (account.profit || 0)).toFixed(2));
      account.freeMargin = parseFloat((account.equity - account.margin).toFixed(2));
      broadcast({ type: 'account', ...account }, (client) => client._accountId === account.id);
    }
  }

  tx.status      = status;
  tx.processedAt = new Date().toISOString();

  res.json(tx);
}

/**
 * GET /api/wallet/transactions/all  (admin only)
 * Returns all wallet transactions across all users.
 */
function getAllTransactions(req, res) {
  const txs = [...db.walletTransactions.values()]
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
  res.json(txs.slice(0, limit));
}

function sanitiseAccount(a) {
  // eslint-disable-next-line no-unused-vars
  const { userId, ...rest } = a;
  return rest;
}

module.exports = { requestDeposit, requestWithdrawal, getTransactions, updateTransactionStatus, getAllTransactions };
