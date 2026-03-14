/**
 * Tests for the new platform services:
 *  – Copy Trading
 *  – Risk Engine
 *  – Liquidity Provider
 *  – White Label / Broker management
 *  – MT4 Bridge
 */

const request = require('supertest');
const app     = require('../server');

// ─── Auth helpers ────────────────────────────────────────────────────────────

async function loginAs(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

// ─── Copy Trading ────────────────────────────────────────────────────────────

describe('Copy Trading API', () => {
  let traderToken;

  beforeAll(async () => {
    traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
  });

  it('GET /api/copy-trading/leaderboard returns leaderboard', async () => {
    const res = await request(app)
      .get('/api/copy-trading/leaderboard')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
    expect(res.body.leaderboard.length).toBeGreaterThan(0);
  });

  it('GET /api/copy-trading/strategies returns strategies', async () => {
    const res = await request(app)
      .get('/api/copy-trading/strategies')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.strategies)).toBe(true);
  });

  it('POST /api/copy-trading/strategies creates a strategy', async () => {
    const res = await request(app)
      .post('/api/copy-trading/strategies')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ name: 'Test Strategy', performanceFee: 15, isPublic: true });
    expect(res.status).toBe(201);
    expect(res.body.strategy.name).toBe('Test Strategy');
    expect(res.body.strategy.performanceFee).toBe(15);
  });

  it('POST /api/copy-trading/strategies rejects missing name', async () => {
    const res = await request(app)
      .post('/api/copy-trading/strategies')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ performanceFee: 15 });
    expect(res.status).toBe(400);
  });

  it('POST /api/copy-trading/subscriptions subscribes to a strategy', async () => {
    // Get first strategy id
    const list = await request(app)
      .get('/api/copy-trading/strategies')
      .set('Authorization', `Bearer ${traderToken}`);
    const strategyId = list.body.strategies[0].id;

    const res = await request(app)
      .post('/api/copy-trading/subscriptions')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ strategyId, riskFactor: 1.0 });
    expect([201, 400]).toContain(res.status); // 400 if already subscribed
  });

  it('GET /api/copy-trading/subscriptions returns subscriptions', async () => {
    const res = await request(app)
      .get('/api/copy-trading/subscriptions')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.subscriptions)).toBe(true);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/copy-trading/leaderboard');
    expect(res.status).toBe(401);
  });
});

// ─── Risk Engine ─────────────────────────────────────────────────────────────

describe('Risk Engine API', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAs('admin@vda.trade', 'Admin1234!');
  });

  it('GET /api/risk/report returns risk report', async () => {
    const res = await request(app)
      .get('/api/risk/report')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalNetExposureUsd');
    expect(res.body).toHaveProperty('exposure');
    expect(res.body).toHaveProperty('orderRouting');
  });

  it('GET /api/risk/exposure returns exposure list', async () => {
    const res = await request(app)
      .get('/api/risk/exposure')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.exposure)).toBe(true);
  });

  it('PATCH /api/risk/config updates routing mode', async () => {
    const res = await request(app)
      .patch('/api/risk/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ defaultRoutingMode: 'auto' });
    expect(res.status).toBe(200);
    expect(res.body.config.defaultRoutingMode).toBe('auto');
  });

  it('requires admin', async () => {
    const traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
    const res = await request(app)
      .get('/api/risk/report')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });
});

// ─── Liquidity Providers ──────────────────────────────────────────────────────

describe('Liquidity Provider API', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAs('admin@vda.trade', 'Admin1234!');
  });

  it('GET /api/liquidity returns LP list', async () => {
    const res = await request(app)
      .get('/api/liquidity')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.providers)).toBe(true);
    expect(res.body.providers.length).toBeGreaterThan(0);
  });

  it('GET /api/liquidity/:id returns single LP', async () => {
    const res = await request(app)
      .get('/api/liquidity/lp_prime')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.provider.id).toBe('lp_prime');
  });

  it('POST /api/liquidity adds a new LP', async () => {
    const res = await request(app)
      .post('/api/liquidity')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test LP', type: 'ecn', symbols: ['EURUSD'], spreadMarkup: 0.0002 });
    expect(res.status).toBe(201);
    expect(res.body.provider.name).toBe('Test LP');
  });

  it('PATCH /api/liquidity/:id updates LP', async () => {
    const res = await request(app)
      .patch('/api/liquidity/lp_prime')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });
    expect(res.status).toBe(200);
  });

  it('requires admin', async () => {
    const traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
    const res = await request(app)
      .get('/api/liquidity')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });
});

// ─── White Label Brokers ──────────────────────────────────────────────────────

describe('White Label Broker API', () => {
  let superToken;
  let adminToken;
  let createdBrokerId;

  beforeAll(async () => {
    superToken = await loginAs('super@vda.trade', 'Super1234!');
    adminToken = await loginAs('admin@vda.trade', 'Admin1234!');
  });

  it('GET /api/brokers/summary returns platform summary', async () => {
    const res = await request(app)
      .get('/api/brokers/summary')
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalBrokers');
    expect(res.body).toHaveProperty('activeBrokers');
    expect(res.body.totalBrokers).toBeGreaterThan(0);
  });

  it('GET /api/brokers lists brokers', async () => {
    const res = await request(app)
      .get('/api/brokers')
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.brokers)).toBe(true);
  });

  it('POST /api/brokers creates a broker', async () => {
    const res = await request(app)
      .post('/api/brokers')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ name: 'Test Broker WL', ownerEmail: 'wl@test.com' });
    expect(res.status).toBe(201);
    expect(res.body.broker.name).toBe('Test Broker WL');
    createdBrokerId = res.body.broker.id;
  });

  it('GET /api/brokers/:id returns broker', async () => {
    const res = await request(app)
      .get(`/api/brokers/${createdBrokerId}`)
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body.broker.id).toBe(createdBrokerId);
  });

  it('PATCH /api/brokers/:id/branding updates branding', async () => {
    const res = await request(app)
      .patch(`/api/brokers/${createdBrokerId}/branding`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ primaryColor: '#ff0000' });
    expect(res.status).toBe(200);
    expect(res.body.broker.branding.primaryColor).toBe('#ff0000');
  });

  it('PATCH /api/brokers/:id/trading-conditions updates conditions', async () => {
    const res = await request(app)
      .patch(`/api/brokers/${createdBrokerId}/trading-conditions`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ maxLeverage: 200, commissionPerLot: 5 });
    expect(res.status).toBe(200);
    expect(res.body.broker.tradingConditions.maxLeverage).toBe(200);
  });

  it('DELETE /api/brokers/:id removes broker', async () => {
    const res = await request(app)
      .delete(`/api/brokers/${createdBrokerId}`)
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
  });

  it('requires super_admin for list', async () => {
    const res = await request(app)
      .get('/api/brokers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/brokers/summary');
    expect(res.status).toBe(401);
  });
});

// ─── MT4 Bridge ──────────────────────────────────────────────────────────────

describe('MT4 Bridge API', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAs('admin@vda.trade', 'Admin1234!');
  });

  it('GET /api/mt4/servers lists servers', async () => {
    const res = await request(app)
      .get('/api/mt4/servers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.servers)).toBe(true);
  });

  it('POST /api/mt4/servers adds a server', async () => {
    const res = await request(app)
      .post('/api/mt4/servers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test MT4', host: 'mt4.test.com', port: 443 });
    expect(res.status).toBe(201);
    expect(res.body.server.name).toBe('Test MT4');
  });

  it('POST /api/mt4/servers/:id/connect simulates connection', async () => {
    // First set a host on the demo server so connect works
    await request(app)
      .patch('/api/mt4/servers/mt4_demo')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ host: 'demo.vda.trade' });

    const res = await request(app)
      .post('/api/mt4/servers/mt4_demo/connect')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('connected');
  });

  it('GET /api/mt4/servers/:id/positions returns positions', async () => {
    const res = await request(app)
      .get('/api/mt4/servers/mt4_demo/positions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.positions)).toBe(true);
  });

  it('requires admin', async () => {
    const traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
    const res = await request(app)
      .get('/api/mt4/servers')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });
});
