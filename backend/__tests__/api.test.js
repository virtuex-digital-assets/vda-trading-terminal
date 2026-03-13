/**
 * HTTP endpoint integration tests.
 *
 * Exercises the full Express + trading-engine stack via supertest,
 * covering authentication, account, orders, and trade history routes.
 */

const request  = require('supertest');
const app      = require('../server');
const db       = require('../models');

// ── Helpers ────────────────────────────────────────────────────────────────

let traderToken;
let adminToken;

async function login(email, password) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.token;
}

// ── Setup ──────────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Seed quotes needed by the trading engine
  db.quotes.set('EURUSD', { bid: 1.08500, ask: 1.08510, time: new Date().toISOString() });
  db.quotes.set('GBPUSD', { bid: 1.26500, ask: 1.26520, time: new Date().toISOString() });

  traderToken = await login('demo@vda.trade',  'Demo1234!');
  adminToken  = await login('admin@vda.trade', 'Admin1234!');
});

// ── Auth ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('returns 200 and JWT for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade', password: 'Demo1234!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('trader');
  });

  test('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  test('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/register', () => {
  test('registers a new user and returns token + account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@vda.trade', password: 'NewPass1!', name: 'New User' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.account.balance).toBeDefined();
  });

  test('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'demo@vda.trade', password: 'Demo1234!', name: 'Dup' });
    expect(res.status).toBe(409);
  });

  test('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@vda.trade', password: 'abc', name: 'Short' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  test('returns authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('demo@vda.trade');
    expect(res.body.account).toBeDefined();
    // userId must not be leaked
    expect(res.body.account.userId).toBeUndefined();
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ── Account ────────────────────────────────────────────────────────────────

describe('GET /api/account', () => {
  test('returns account without exposing userId', async () => {
    const res = await request(app)
      .get('/api/account')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.balance).toBeDefined();
    expect(res.body.equity).toBeDefined();
    expect(res.body.userId).toBeUndefined();
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/account');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/account/leverage', () => {
  test('changes leverage when no open orders exist', async () => {
    const res = await request(app)
      .patch('/api/account/leverage')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ leverage: 200 });
    expect(res.status).toBe(200);
    expect(res.body.leverage).toBe(200);
  });

  test('rejects leverage outside 1–1000 range', async () => {
    const res = await request(app)
      .patch('/api/account/leverage')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ leverage: 5000 });
    expect(res.status).toBe(400);
  });
});

// ── Orders ─────────────────────────────────────────────────────────────────

describe('POST /api/orders', () => {
  test('places a BUY market order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'BUY', lots: 0.1 });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('BUY');
    expect(res.body.ticket).toBeDefined();
    expect(res.body.openPrice).toBeGreaterThan(0);
  });

  test('places a SELL market order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'SELL', lots: 0.05 });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('SELL');
  });

  test('places a pending BUY LIMIT order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'BUY LIMIT', lots: 0.1, price: 1.08000 });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('BUY LIMIT');
  });

  test('rejects order with 0 lots', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'BUY', lots: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('rejects order for unknown symbol', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'FAKEPAIR', type: 'BUY', lots: 0.1 });
    expect(res.status).toBe(400);
  });

  test('requires authentication', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ symbol: 'EURUSD', type: 'BUY', lots: 0.1 });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders', () => {
  test('returns open and pending orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.open)).toBe(true);
    expect(Array.isArray(res.body.pending)).toBe(true);
  });
});

describe('DELETE /api/orders/:ticket (close / cancel)', () => {
  test('closes an open order and returns the closed order with profit', async () => {
    // Place an order first
    const placeRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'BUY', lots: 0.1 });
    expect(placeRes.status).toBe(201);
    const { ticket } = placeRes.body;

    const closeRes = await request(app)
      .delete(`/api/orders/${ticket}`)
      .set('Authorization', `Bearer ${traderToken}`);
    expect(closeRes.status).toBe(200);
    expect(closeRes.body.ticket).toBe(ticket);
    expect(closeRes.body.closePrice).toBeGreaterThan(0);
    expect(closeRes.body.closeTime).toBeDefined();
    expect(typeof closeRes.body.profit).toBe('number');
  });

  test('cancels a pending order', async () => {
    const placeRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'BUY LIMIT', lots: 0.1, price: 1.05000 });
    expect(placeRes.status).toBe(201);
    const { ticket } = placeRes.body;

    const cancelRes = await request(app)
      .delete(`/api/orders/${ticket}`)
      .set('Authorization', `Bearer ${traderToken}`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe('cancelled');
  });

  test('returns 404 for non-existent ticket', async () => {
    const res = await request(app)
      .delete('/api/orders/99999')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/orders/:ticket (modify)', () => {
  test('modifies SL/TP on an open order', async () => {
    const placeRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'BUY', lots: 0.1 });
    expect(placeRes.status).toBe(201);
    const { ticket } = placeRes.body;

    const modRes = await request(app)
      .patch(`/api/orders/${ticket}`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ sl: 1.08000, tp: 1.09000 });
    expect(modRes.status).toBe(200);
    expect(modRes.body.sl).toBe(1.08000);
    expect(modRes.body.tp).toBe(1.09000);
  });
});

describe('GET /api/orders/history', () => {
  test('returns closed order history', async () => {
    // Ensure at least one closed order exists by closing a fresh one
    const placeRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'BUY', lots: 0.1 });
    await request(app)
      .delete(`/api/orders/${placeRes.body.ticket}`)
      .set('Authorization', `Bearer ${traderToken}`);

    const res = await request(app)
      .get('/api/orders/history')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    // Most recent first
    if (res.body.length > 1) {
      expect(new Date(res.body[0].closeTime).getTime()).toBeGreaterThanOrEqual(
        new Date(res.body[1].closeTime).getTime()
      );
    }
  });
});

// ── Account balance updated after close ────────────────────────────────────

describe('Account balance after trade', () => {
  test('closing a trade updates account balance', async () => {
    // Get initial balance
    const accountBefore = (
      await request(app).get('/api/account').set('Authorization', `Bearer ${traderToken}`)
    ).body;

    // Place and immediately close
    const placeRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ symbol: 'EURUSD', type: 'BUY', lots: 0.1 });
    const { ticket } = placeRes.body;
    const closeRes = await request(app)
      .delete(`/api/orders/${ticket}`)
      .set('Authorization', `Bearer ${traderToken}`);
    const { profit } = closeRes.body;

    const accountAfter = (
      await request(app).get('/api/account').set('Authorization', `Bearer ${traderToken}`)
    ).body;

    expect(accountAfter.balance).toBeCloseTo(accountBefore.balance + profit, 1);
  });
});

// ── Symbols ────────────────────────────────────────────────────────────────

describe('GET /api/symbols', () => {
  test('returns list of symbols with quotes', async () => {
    const res = await request(app)
      .get('/api/symbols')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    const eurusd = res.body.find((s) => s.symbol === 'EURUSD');
    expect(eurusd).toBeDefined();
    expect(eurusd.bid).toBeGreaterThan(0);
    expect(eurusd.ask).toBeGreaterThan(0);
  });
});

// ── Admin ──────────────────────────────────────────────────────────────────

describe('GET /api/admin/risk', () => {
  test('returns broker risk data to admin', async () => {
    const res = await request(app)
      .get('/api/admin/risk')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.symbolExposure).toBeDefined();
    expect(Array.isArray(res.body.accountSummary)).toBe(true);
  });

  test('returns 403 for non-admin user', async () => {
    const res = await request(app)
      .get('/api/admin/risk')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/accounts', () => {
  test('lists all trading accounts without userId', async () => {
    const res = await request(app)
      .get('/api/admin/accounts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((a) => {
      expect(a.userId).toBeUndefined();
      expect(a.balance).toBeDefined();
    });
  });
});

// ── Health ─────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  test('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
