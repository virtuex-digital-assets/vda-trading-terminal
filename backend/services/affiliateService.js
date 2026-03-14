/**
 * Affiliate / IB (Introducing Broker) Partner Service.
 *
 * Manages referral tracking, commission calculations, and payout records
 * for IB partners who refer traders to the platform.
 *
 * Commission types:
 *   spread_rebate   – % of spread revenue from referred trader's trades
 *   per_lot         – fixed USD per lot traded by referred traders
 *   cpa             – one-time payment when a referred trader deposits
 *   revenue_share   – % of broker revenue from referred traders
 */

const { v4: uuidv4 } = require('uuid');

// ── Data stores ────────────────────────────────────────────────────────────

/**
 * Affiliates  id → {
 *   id, userId, name, email, referralCode, brokerId,
 *   commissionType, commissionRate, tier,
 *   stats: { referrals, activeTraders, totalVolumeLots, totalCommission, paidOut },
 *   status: 'active'|'suspended'|'pending',
 *   createdAt, updatedAt
 * }
 */
const affiliates = new Map();

/**
 * Referrals  id → { id, affiliateId, referredUserId, status, depositAmount, createdAt }
 */
const referrals = new Map();

/**
 * Commission ledger  id → {
 *   id, affiliateId, type, amount, reference, traderUserId, lots, createdAt
 * }
 */
const commissions = new Map();

/**
 * Payouts  id → { id, affiliateId, amount, method, reference, status, createdAt, processedAt }
 */
const payouts = new Map();

// ── Referral code generator ────────────────────────────────────────────────

function generateReferralCode(name) {
  const slug = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug}${rand}`;
}

// ── CRUD ───────────────────────────────────────────────────────────────────

function createAffiliate({ userId, name, email, brokerId = null, commissionType = 'per_lot', commissionRate = 3 }) {
  const VALID_TYPES = ['spread_rebate', 'per_lot', 'cpa', 'revenue_share'];
  if (!VALID_TYPES.includes(commissionType)) {
    throw new Error(`commissionType must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // Prevent duplicate affiliates for the same user
  for (const a of affiliates.values()) {
    if (a.userId === userId) {
      throw new Error('User is already registered as an affiliate');
    }
  }

  const id  = uuidv4();
  const now = new Date().toISOString();
  const affiliate = {
    id,
    userId,
    name:           String(name || '').slice(0, 100),
    email:          String(email || '').slice(0, 255),
    referralCode:   generateReferralCode(name),
    brokerId,
    commissionType,
    commissionRate: parseFloat(commissionRate) || 0,
    tier:           1,
    stats: {
      referrals:        0,
      activeTraders:    0,
      totalVolumeLots:  0,
      totalCommission:  0,
      pendingCommission: 0,
      paidOut:          0,
    },
    status:    'active',
    createdAt: now,
    updatedAt: now,
  };
  affiliates.set(id, affiliate);
  return affiliate;
}

function getAffiliate(id) {
  return affiliates.get(id) || null;
}

function getAffiliateByUserId(userId) {
  for (const a of affiliates.values()) {
    if (a.userId === userId) return a;
  }
  return null;
}

function getAffiliateByCode(code) {
  for (const a of affiliates.values()) {
    if (a.referralCode === code) return a;
  }
  return null;
}

function listAffiliates({ brokerId, status } = {}) {
  let all = [...affiliates.values()];
  if (brokerId) all = all.filter((a) => a.brokerId === brokerId);
  if (status)   all = all.filter((a) => a.status === status);
  return all.sort((a, b) => (b.stats.totalCommission - a.stats.totalCommission));
}

function updateAffiliate(id, updates) {
  const a = affiliates.get(id);
  if (!a) return null;
  const allowed = ['name', 'email', 'commissionType', 'commissionRate', 'tier', 'status'];
  for (const key of allowed) {
    if (updates[key] !== undefined) a[key] = updates[key];
  }
  a.updatedAt = new Date().toISOString();
  return a;
}

// ── Referral tracking ──────────────────────────────────────────────────────

function registerReferral(affiliateCode, referredUserId) {
  const affiliate = getAffiliateByCode(affiliateCode);
  if (!affiliate) return null;
  if (affiliate.status !== 'active') return null;

  const id = uuidv4();
  const referral = {
    id,
    affiliateId:    affiliate.id,
    referredUserId,
    status:         'registered', // registered | deposited | active
    depositAmount:  0,
    createdAt:      new Date().toISOString(),
  };
  referrals.set(id, referral);
  affiliate.stats.referrals += 1;

  return referral;
}

function getReferralsByAffiliate(affiliateId) {
  return [...referrals.values()].filter((r) => r.affiliateId === affiliateId);
}

// ── Commission recording ───────────────────────────────────────────────────

/**
 * Records a commission earned by an affiliate.
 * Called by the trading engine / wallet service when a referred trader trades.
 */
function recordCommission({ affiliateId, type, amount, reference = '', traderUserId = null, lots = 0 }) {
  const affiliate = affiliates.get(affiliateId);
  if (!affiliate || affiliate.status !== 'active') return null;

  const id = uuidv4();
  const entry = {
    id,
    affiliateId,
    type,       // 'trade_rebate' | 'cpa' | 'deposit_bonus'
    amount:     parseFloat(amount.toFixed(2)),
    reference,
    traderUserId,
    lots:       parseFloat(lots.toFixed(2)),
    createdAt:  new Date().toISOString(),
  };
  commissions.set(id, entry);

  // Update stats
  affiliate.stats.totalCommission   += entry.amount;
  affiliate.stats.pendingCommission += entry.amount;
  affiliate.stats.totalVolumeLots   += entry.lots;

  return entry;
}

function listCommissions(affiliateId) {
  return [...commissions.values()]
    .filter((c) => c.affiliateId === affiliateId)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

// ── Payout requests ────────────────────────────────────────────────────────

function requestPayout({ affiliateId, amount, method = 'bank_transfer', reference = '' }) {
  const affiliate = affiliates.get(affiliateId);
  if (!affiliate) throw new Error('Affiliate not found');

  if (amount > affiliate.stats.pendingCommission) {
    throw new Error('Requested amount exceeds pending commission balance');
  }
  if (amount <= 0) throw new Error('amount must be greater than 0');

  const id = uuidv4();
  const payout = {
    id,
    affiliateId,
    amount:      parseFloat(amount.toFixed(2)),
    method,
    reference,
    status:      'pending', // pending | approved | paid | rejected
    createdAt:   new Date().toISOString(),
    processedAt: null,
  };
  payouts.set(id, payout);

  // Reserve amount
  affiliate.stats.pendingCommission -= payout.amount;

  return payout;
}

function updatePayoutStatus(payoutId, status) {
  const payout = payouts.get(payoutId);
  if (!payout) return null;

  const affiliate = affiliates.get(payout.affiliateId);
  if (status === 'paid' && affiliate) {
    affiliate.stats.paidOut += payout.amount;
  }
  if (status === 'rejected' && affiliate) {
    // Refund reserved amount back to pending
    affiliate.stats.pendingCommission += payout.amount;
  }

  payout.status      = status;
  payout.processedAt = new Date().toISOString();
  return payout;
}

function listPayouts(affiliateId) {
  return [...payouts.values()]
    .filter((p) => p.affiliateId === affiliateId)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

function listAllPayouts({ status } = {}) {
  let all = [...payouts.values()];
  if (status) all = all.filter((p) => p.status === status);
  return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

// ── Platform summary ───────────────────────────────────────────────────────

function getAffiliateSummary() {
  const all = listAffiliates();
  return {
    totalAffiliates:  all.length,
    activeAffiliates: all.filter((a) => a.status === 'active').length,
    totalReferrals:   all.reduce((s, a) => s + a.stats.referrals, 0),
    totalCommissions: all.reduce((s, a) => s + a.stats.totalCommission, 0),
    totalPaidOut:     all.reduce((s, a) => s + a.stats.paidOut, 0),
  };
}

// ── Seed demo affiliates ───────────────────────────────────────────────────

(function seedDemoAffiliates() {
  const a1 = createAffiliate({
    userId:         'ib-user-001',
    name:           'John Smith IB',
    email:          'john.ib@vda.trade',
    commissionType: 'per_lot',
    commissionRate: 3,
  });
  a1.stats = { referrals: 45, activeTraders: 32, totalVolumeLots: 1284, totalCommission: 3852, pendingCommission: 1200, paidOut: 2652 };

  const a2 = createAffiliate({
    userId:         'ib-user-002',
    name:           'Maria Garcia IB',
    email:          'maria.ib@cap.trade',
    commissionType: 'spread_rebate',
    commissionRate: 20,
  });
  a2.stats = { referrals: 23, activeTraders: 18, totalVolumeLots: 876, totalCommission: 2280, pendingCommission: 800, paidOut: 1480 };
})();

module.exports = {
  createAffiliate,
  getAffiliate,
  getAffiliateByUserId,
  getAffiliateByCode,
  listAffiliates,
  updateAffiliate,
  registerReferral,
  getReferralsByAffiliate,
  recordCommission,
  listCommissions,
  requestPayout,
  updatePayoutStatus,
  listPayouts,
  listAllPayouts,
  getAffiliateSummary,
};
