/**
 * Finance controller.
 *
 * Manages deposits, withdrawals, and payment gateway configuration.
 */

const {
  deposits, withdrawals, paymentGateways,
  createDeposit, createWithdrawal, createGateway,
} = require('../models/financeStore');

// ── Deposits ──────────────────────────────────────────────────────────────────

function listDeposits(req, res) {
  try {
    let list = [...deposits.values()];
    if (req.user.role === 'trader') {
      list = list.filter((d) => d.userId === req.user.id);
    }
    list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createDepositHandler(req, res) {
  try {
    const { accountId, amount, currency, method } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    const deposit = createDeposit({
      userId: req.user.id,
      accountId,
      amount,
      currency: currency || 'USD',
      method: method || '',
      status: 'pending',
    });
    res.status(201).json(deposit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function approveDeposit(req, res) {
  try {
    const deposit = deposits.get(req.params.id);
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
    deposit.status = 'approved';
    deposit.updatedAt = new Date().toISOString();
    res.json(deposit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function rejectDeposit(req, res) {
  try {
    const deposit = deposits.get(req.params.id);
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
    deposit.status = 'rejected';
    deposit.updatedAt = new Date().toISOString();
    res.json(deposit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Withdrawals ───────────────────────────────────────────────────────────────

function listWithdrawals(req, res) {
  try {
    let list = [...withdrawals.values()];
    if (req.user.role === 'trader') {
      list = list.filter((w) => w.userId === req.user.id);
    }
    list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createWithdrawalHandler(req, res) {
  try {
    const { accountId, amount, currency, method } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    const withdrawal = createWithdrawal({
      userId: req.user.id,
      accountId,
      amount,
      currency: currency || 'USD',
      method: method || '',
      status: 'pending',
    });
    res.status(201).json(withdrawal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function approveWithdrawal(req, res) {
  try {
    const withdrawal = withdrawals.get(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    withdrawal.status = 'approved';
    withdrawal.updatedAt = new Date().toISOString();
    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function rejectWithdrawal(req, res) {
  try {
    const withdrawal = withdrawals.get(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    withdrawal.status = 'rejected';
    withdrawal.updatedAt = new Date().toISOString();
    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Gateways ──────────────────────────────────────────────────────────────────

function listGateways(req, res) {
  try {
    const list = [...paymentGateways.values()];
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createGatewayHandler(req, res) {
  try {
    const gateway = createGateway({ ...req.body });
    res.status(201).json(gateway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateGateway(req, res) {
  try {
    const gateway = paymentGateways.get(req.params.id);
    if (!gateway) return res.status(404).json({ error: 'Gateway not found' });
    const updatable = ['name', 'provider', 'apiKey', 'apiSecret', 'webhookUrl', 'mode', 'status', 'brokerId'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) gateway[key] = req.body[key];
    }
    gateway.updatedAt = new Date().toISOString();
    res.json(gateway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function toggleGateway(req, res) {
  try {
    const gateway = paymentGateways.get(req.params.id);
    if (!gateway) return res.status(404).json({ error: 'Gateway not found' });
    gateway.status = gateway.status === 'enabled' ? 'disabled' : 'enabled';
    gateway.updatedAt = new Date().toISOString();
    res.json(gateway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listDeposits,
  createDeposit: createDepositHandler,
  approveDeposit,
  rejectDeposit,
  listWithdrawals,
  createWithdrawal: createWithdrawalHandler,
  approveWithdrawal,
  rejectWithdrawal,
  listGateways,
  createGateway: createGatewayHandler,
  updateGateway,
  toggleGateway,
};
