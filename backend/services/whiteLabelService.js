/**
 * White Label / Multi-Tenant broker management service.
 *
 * Each broker is a tenant with isolated traders, custom branding,
 * custom trading conditions, and separate revenue tracking.
 */

const { v4: uuidv4 } = require('uuid');

// ── Broker store ────────────────────────────────────────────────────────────

/**
 * id → {
 *   id, slug, name, ownerEmail, status,
 *   branding: { logoUrl, primaryColor, secondaryColor, favicon },
 *   domain, customDomain,
 *   tradingConditions: { defaultLeverage, maxLeverage, spreadMarkup, commissionPerLot, minDeposit },
 *   features: { copyTrading, cryptoPayments, mt4Bridge },
 *   revenue: { totalDeposits, totalWithdrawals, commissions },
 *   stats: { traders, openPositions, activeTrades },
 *   createdAt, updatedAt
 * }
 */
const brokers = new Map();

// ── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── CRUD ────────────────────────────────────────────────────────────────────

function createBroker({ name, ownerEmail, domain = '', customDomain = '' }) {
  const id = uuidv4();
  const slug = slugify(name);
  const broker = {
    id,
    slug,
    name,
    ownerEmail,
    status: 'active',
    branding: {
      logoUrl:        '',
      primaryColor:   '#1a73e8',
      secondaryColor: '#0d47a1',
      favicon:        '',
      companyName:    name,
      supportEmail:   ownerEmail,
    },
    domain: domain || `${slug}.platform.com`,
    customDomain,
    tradingConditions: {
      defaultLeverage: 100,
      maxLeverage:     500,
      spreadMarkup:    0.0001,
      commissionPerLot: 3,   // USD per lot round-turn
      minDeposit:      100,
      currency:        'USD',
    },
    features: {
      copyTrading:     true,
      cryptoPayments:  false,
      mt4Bridge:       false,
      ibSystem:        false,
    },
    revenue: {
      totalDeposits:     0,
      totalWithdrawals:  0,
      commissions:       0,
      spreadRevenue:     0,
    },
    stats: {
      traders:         0,
      openPositions:   0,
      activeTrades:    0,
    },
    mt4ServerConfig: {
      host:     '',
      port:     443,
      login:    '',
      password: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  brokers.set(id, broker);
  return broker;
}

function getBroker(id) {
  return brokers.get(id) || null;
}

function getBrokerBySlug(slug) {
  for (const b of brokers.values()) {
    if (b.slug === slug) return b;
  }
  return null;
}

function listBrokers() {
  return [...brokers.values()];
}

function updateBroker(id, updates) {
  const broker = brokers.get(id);
  if (!broker) return null;

  const allowed = ['name', 'ownerEmail', 'status', 'domain', 'customDomain'];
  for (const key of allowed) {
    if (updates[key] !== undefined) broker[key] = updates[key];
  }
  if (updates.branding)           Object.assign(broker.branding, updates.branding);
  if (updates.tradingConditions)  Object.assign(broker.tradingConditions, updates.tradingConditions);
  if (updates.features)           Object.assign(broker.features, updates.features);
  if (updates.mt4ServerConfig)    Object.assign(broker.mt4ServerConfig, updates.mt4ServerConfig);

  broker.updatedAt = new Date().toISOString();
  return broker;
}

function deleteBroker(id) {
  return brokers.delete(id);
}

// ── Revenue tracking ────────────────────────────────────────────────────────

function recordDeposit(brokerId, amount) {
  const b = brokers.get(brokerId);
  if (b) b.revenue.totalDeposits += amount;
}

function recordWithdrawal(brokerId, amount) {
  const b = brokers.get(brokerId);
  if (b) b.revenue.totalWithdrawals += amount;
}

function recordCommission(brokerId, lots) {
  const b = brokers.get(brokerId);
  if (b) {
    const commission = lots * b.tradingConditions.commissionPerLot;
    b.revenue.commissions += commission;
    return commission;
  }
  return 0;
}

// ── Platform summary ────────────────────────────────────────────────────────

function getPlatformSummary() {
  const all = listBrokers();
  return {
    totalBrokers:    all.length,
    activeBrokers:   all.filter((b) => b.status === 'active').length,
    totalRevenue:    all.reduce((s, b) => s + b.revenue.commissions + b.revenue.spreadRevenue, 0),
    totalDeposits:   all.reduce((s, b) => s + b.revenue.totalDeposits, 0),
    totalTraders:    all.reduce((s, b) => s + b.stats.traders, 0),
    brokers:         all.map(({ id, name, slug, status, stats, revenue }) => ({ id, name, slug, status, stats, revenue })),
  };
}

// ── Seed demo brokers ────────────────────────────────────────────────────────

(function seedDemoBrokers() {
  const b1 = createBroker({ name: 'VDA Prime Broker', ownerEmail: 'admin@vda.trade', domain: 'prime.vda.trade' });
  b1.status = 'active';
  b1.stats  = { traders: 1247, openPositions: 89, activeTrades: 234 };
  b1.revenue = { totalDeposits: 4_250_000, totalWithdrawals: 2_100_000, commissions: 128_400, spreadRevenue: 87_200 };
  b1.branding.primaryColor   = '#1a73e8';
  b1.branding.secondaryColor = '#0d47a1';

  const b2 = createBroker({ name: 'Alpha Capital Markets', ownerEmail: 'admin@alphacap.trade', domain: 'alpha.platform.com' });
  b2.status = 'active';
  b2.stats  = { traders: 543, openPositions: 34, activeTrades: 78 };
  b2.revenue = { totalDeposits: 1_800_000, totalWithdrawals: 890_000, commissions: 54_200, spreadRevenue: 31_100 };
  b2.branding.primaryColor   = '#e67e22';
  b2.branding.secondaryColor = '#d35400';

  const b3 = createBroker({ name: 'TestBroker Demo', ownerEmail: 'test@testbroker.com', domain: 'test.platform.com' });
  b3.status = 'suspended';
  b3.stats  = { traders: 12, openPositions: 0, activeTrades: 2 };
})();

module.exports = {
  createBroker,
  getBroker,
  getBrokerBySlug,
  listBrokers,
  updateBroker,
  deleteBroker,
  recordDeposit,
  recordWithdrawal,
  recordCommission,
  getPlatformSummary,
};
