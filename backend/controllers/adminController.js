const db            = require('../models');
const tradingEngine = require('../services/tradingEngine');

/**
 * GET /api/admin/risk
 * Returns broker-level risk metrics: symbol exposure + account summaries.
 * Requires admin role.
 */
function getRisk(req, res) {
  const risk = tradingEngine.getBrokerRisk();
  res.json(risk);
}

/**
 * GET /api/admin/accounts
 * Returns all trading accounts with their current status.
 */
function listAccounts(req, res) {
  const accounts = [...db.accounts.values()].map((a) => {
    // eslint-disable-next-line no-unused-vars
    const { userId, ...safe } = a;
    return safe;
  });
  res.json(accounts);
}

/**
 * GET /api/admin/orders
 * Returns all open orders across all accounts.
 */
function listAllOrders(req, res) {
  const open    = [...db.openOrders.values()];
  const pending = [...db.pendingOrders.values()];
  res.json({ open, pending });
}

/**
 * POST /api/admin/close/:ticket
 * Force-close any open order (admin override).
 */
function forceCloseOrder(req, res) {
  const ticket = parseInt(req.params.ticket, 10);
  const result = tradingEngine.closeOrder(ticket);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json(result.closedOrder);
}

module.exports = { getRisk, listAccounts, listAllOrders, forceCloseOrder };
