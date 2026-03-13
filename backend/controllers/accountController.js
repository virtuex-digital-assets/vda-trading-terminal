const db = require('../models');

/**
 * GET /api/account
 * Returns the authenticated user's trading account.
 */
function getAccount(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(404).json({ error: 'No trading account found' });
  // eslint-disable-next-line no-unused-vars
  const { userId, ...safe } = account;
  res.json(safe);
}

/**
 * PATCH /api/account/leverage
 * Body: { leverage: number }
 * Only allowed when no open orders exist.
 */
function setLeverage(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(404).json({ error: 'No trading account found' });

  const leverage = parseInt(req.body.leverage, 10);
  if (!leverage || leverage < 1 || leverage > 1000) {
    return res.status(400).json({ error: 'Leverage must be between 1 and 1000' });
  }

  const openCount = [...db.openOrders.values()].filter((o) => o.accountId === account.id).length;
  if (openCount > 0) {
    return res.status(400).json({ error: 'Cannot change leverage while orders are open' });
  }

  account.leverage = leverage;
  res.json({ leverage });
}

module.exports = { getAccount, setLeverage };
