/**
 * Copy Trading controller.
 */
const copyService = require('../services/copyTradingService');
const db = require('../models');

function listStrategies(req, res) {
  const strategies = copyService.listStrategies({ publicOnly: false });
  res.json({ strategies });
}

function createStrategy(req, res) {
  const { name, description, performanceFee, minDeposit, maxFollowers, isPublic } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(400).json({ error: 'No trading account found' });

  const strategy = copyService.createStrategy({
    userId:    req.user.id,
    accountId: account.id,
    name:      name.trim(),
    description,
    performanceFee,
    minDeposit,
    maxFollowers,
    isPublic,
  });
  res.status(201).json({ strategy });
}

function getStrategy(req, res) {
  const strategy = copyService.getStrategy(req.params.id);
  if (!strategy) return res.status(404).json({ error: 'Strategy not found' });
  res.json({ strategy });
}

function updateStrategy(req, res) {
  const strategy = copyService.getStrategy(req.params.id);
  if (!strategy) return res.status(404).json({ error: 'Strategy not found' });

  // Only strategy owner or admin can update
  if (strategy.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Not authorised' });
  }

  const updated = copyService.updateStrategy(req.params.id, req.body);
  res.json({ strategy: updated });
}

function getLeaderboard(req, res) {
  const leaderboard = copyService.getLeaderboard();
  res.json({ leaderboard });
}

function getMySubscriptions(req, res) {
  const subscriptions = copyService.getSubscriptionsByFollower(req.user.id);
  res.json({ subscriptions });
}

function subscribe(req, res) {
  const { strategyId, riskFactor, maxLots } = req.body;
  if (!strategyId) return res.status(400).json({ error: 'strategyId is required' });

  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(400).json({ error: 'No trading account found' });

  const result = copyService.subscribe({
    followerId:         req.user.id,
    followerAccountId:  account.id,
    strategyId,
    riskFactor,
    maxLots,
  });

  if (!result.ok) return res.status(400).json({ error: result.error });
  res.status(201).json({ subscription: result.subscription });
}

function unsubscribe(req, res) {
  const result = copyService.unsubscribe(req.params.id);
  if (!result.ok) return res.status(404).json({ error: result.error });
  res.json({ ok: true });
}

function adminListStrategies(req, res) {
  const strategies = copyService.listStrategies();
  res.json({ strategies });
}

module.exports = {
  listStrategies,
  createStrategy,
  getStrategy,
  updateStrategy,
  getLeaderboard,
  getMySubscriptions,
  subscribe,
  unsubscribe,
  adminListStrategies,
};
