/**
 * Copy Trading service.
 *
 * Manages strategy providers (signal senders) and followers (copiers).
 *
 * When a provider opens / closes a trade, the service replicates it across
 * all active followers scaled by each follower's risk factor.
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const tradingEngine = require('./tradingEngine');

// ── Data stores ────────────────────────────────────────────────────────────

/**
 * Strategy providers.
 * id → {
 *   id, userId, accountId, name, description, performanceFee,  // % of profit
 *   minDeposit, maxFollowers, isPublic, status,
 *   stats: { totalTrades, winRate, totalPnL, followers, monthlyReturn }
 *   createdAt
 * }
 */
const strategies = new Map();

/**
 * Follower subscriptions.
 * id → {
 *   id, followerId (userId), followerAccountId,
 *   strategyId, riskFactor (0.1 – 5.0), maxLots, status,
 *   stats: { copiedTrades, totalPnL },
 *   createdAt
 * }
 */
const subscriptions = new Map();

/**
 * Copied trade references.
 * originalTicket → [{ followerTicket, followerId, strategyId }]
 */
const tradeRefs = new Map();

// ── Strategy management ────────────────────────────────────────────────────

function createStrategy({ userId, accountId, name, description = '', performanceFee = 20, minDeposit = 100, maxFollowers = 100, isPublic = true }) {
  const id = uuidv4();
  const strategy = {
    id,
    userId,
    accountId,
    name,
    description,
    performanceFee: Math.min(50, Math.max(0, performanceFee)),
    minDeposit,
    maxFollowers,
    isPublic,
    status: 'active',
    stats: { totalTrades: 0, winRate: 0, totalPnL: 0, followers: 0, monthlyReturn: 0 },
    createdAt: new Date().toISOString(),
  };
  strategies.set(id, strategy);
  return strategy;
}

function getStrategy(id) {
  return strategies.get(id) || null;
}

function listStrategies({ publicOnly = false } = {}) {
  return [...strategies.values()].filter((s) => !publicOnly || s.isPublic);
}

function updateStrategy(id, updates) {
  const s = strategies.get(id);
  if (!s) return null;
  const allowed = ['name', 'description', 'performanceFee', 'minDeposit', 'maxFollowers', 'isPublic', 'status'];
  for (const key of allowed) {
    if (updates[key] !== undefined) s[key] = updates[key];
  }
  return s;
}

// ── Subscription management ────────────────────────────────────────────────

function subscribe({ followerId, followerAccountId, strategyId, riskFactor = 1.0, maxLots = 10 }) {
  const strategy = strategies.get(strategyId);
  if (!strategy) return { ok: false, error: 'Strategy not found' };
  if (strategy.status !== 'active') return { ok: false, error: 'Strategy is not active' };

  // Check for existing subscription
  for (const sub of subscriptions.values()) {
    if (sub.followerId === followerId && sub.strategyId === strategyId && sub.status === 'active') {
      return { ok: false, error: 'Already subscribed to this strategy' };
    }
  }

  const followerCount = [...subscriptions.values()].filter((s) => s.strategyId === strategyId && s.status === 'active').length;
  if (followerCount >= strategy.maxFollowers) {
    return { ok: false, error: 'Strategy has reached maximum followers' };
  }

  const id = uuidv4();
  const sub = {
    id,
    followerId,
    followerAccountId,
    strategyId,
    riskFactor: Math.min(5, Math.max(0.1, riskFactor)),
    maxLots,
    status: 'active',
    stats: { copiedTrades: 0, totalPnL: 0 },
    createdAt: new Date().toISOString(),
  };
  subscriptions.set(id, sub);
  strategy.stats.followers += 1;
  return { ok: true, subscription: sub };
}

function unsubscribe(subscriptionId) {
  const sub = subscriptions.get(subscriptionId);
  if (!sub) return { ok: false, error: 'Subscription not found' };
  sub.status = 'cancelled';
  const strategy = strategies.get(sub.strategyId);
  if (strategy && strategy.stats.followers > 0) strategy.stats.followers -= 1;
  return { ok: true };
}

function getSubscriptionsByFollower(followerId) {
  return [...subscriptions.values()].filter((s) => s.followerId === followerId);
}

function getSubscriptionsByStrategy(strategyId) {
  return [...subscriptions.values()].filter((s) => s.strategyId === strategyId);
}

// ── Trade copying ──────────────────────────────────────────────────────────

/**
 * Called when a provider opens a trade.
 * Replicates the trade on all active followers.
 *
 * @param {string} strategyId
 * @param {object} providerOrder  Original order object from trading engine
 */
function onProviderOpenTrade(strategyId, providerOrder) {
  const subs = getSubscriptionsByStrategy(strategyId).filter((s) => s.status === 'active');
  const refs = [];

  for (const sub of subs) {
    const scaledLots = Math.min(
      sub.maxLots,
      Math.max(0.01, parseFloat((providerOrder.lots * sub.riskFactor).toFixed(2)))
    );

    const result = tradingEngine.placeOrder({
      accountId: sub.followerAccountId,
      symbol:    providerOrder.symbol,
      type:      providerOrder.type,
      lots:      scaledLots,
      sl:        providerOrder.sl,
      tp:        providerOrder.tp,
      comment:   `Copy:${strategyId.slice(0, 8)}`,
    });

    if (result.ok) {
      sub.stats.copiedTrades += 1;
      refs.push({ followerTicket: result.order.ticket, followerId: sub.followerId, subscriptionId: sub.id });
    }
  }

  if (refs.length > 0) {
    tradeRefs.set(String(providerOrder.ticket), refs);
  }

  // Update strategy stats
  const strategy = strategies.get(strategyId);
  if (strategy) strategy.stats.totalTrades += 1;
}

/**
 * Called when a provider closes a trade.
 * Closes all follower copies.
 *
 * @param {string} strategyId
 * @param {number} providerTicket  Ticket of the closed provider order
 */
function onProviderCloseTrade(strategyId, providerTicket) {
  const refs = tradeRefs.get(String(providerTicket)) || [];

  for (const ref of refs) {
    const result = tradingEngine.closeOrder(ref.followerTicket);
    if (result.ok) {
      const sub = subscriptions.get(ref.subscriptionId);
      if (sub) sub.stats.totalPnL += result.order ? (result.order.profit || 0) : 0;
    }
  }

  tradeRefs.delete(String(providerTicket));
}

// ── Leaderboard ────────────────────────────────────────────────────────────

function getLeaderboard() {
  return [...strategies.values()]
    .filter((s) => s.isPublic && s.status === 'active')
    .sort((a, b) => b.stats.totalPnL - a.stats.totalPnL)
    .map((s) => ({
      id:             s.id,
      name:           s.name,
      totalPnL:       s.stats.totalPnL,
      winRate:        s.stats.winRate,
      followers:      s.stats.followers,
      monthlyReturn:  s.stats.monthlyReturn,
      performanceFee: s.performanceFee,
    }));
}

// ── Seed demo strategies ───────────────────────────────────────────────────

(function seedDemoStrategies() {
  const s1 = createStrategy({
    userId:      'demo-user-1',
    accountId:   'demo-account-1',
    name:        'FX Alpha',
    description: 'Trend-following strategy on major pairs.',
    performanceFee: 20,
    minDeposit:  500,
    isPublic:    true,
  });
  s1.stats = { totalTrades: 312, winRate: 0.63, totalPnL: 18420, followers: 47, monthlyReturn: 4.2 };

  const s2 = createStrategy({
    userId:      'demo-user-2',
    accountId:   'demo-account-2',
    name:        'Gold Scalper',
    description: 'High-frequency scalping on XAUUSD.',
    performanceFee: 30,
    minDeposit:  1000,
    isPublic:    true,
  });
  s2.stats = { totalTrades: 891, winRate: 0.71, totalPnL: 34200, followers: 89, monthlyReturn: 6.8 };

  const s3 = createStrategy({
    userId:      'demo-user-3',
    accountId:   'demo-account-3',
    name:        'Crypto Momentum',
    description: 'Momentum trading on BTC and ETH.',
    performanceFee: 25,
    minDeposit:  2000,
    isPublic:    true,
  });
  s3.stats = { totalTrades: 156, winRate: 0.55, totalPnL: 9800, followers: 23, monthlyReturn: 2.1 };
})();

module.exports = {
  createStrategy,
  getStrategy,
  listStrategies,
  updateStrategy,
  subscribe,
  unsubscribe,
  getSubscriptionsByFollower,
  getSubscriptionsByStrategy,
  onProviderOpenTrade,
  onProviderCloseTrade,
  getLeaderboard,
};
