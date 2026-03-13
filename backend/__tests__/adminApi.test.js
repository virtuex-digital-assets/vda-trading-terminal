/**
 * Tests for the admin API routes:
 *  – symbol CRUD (list, update, create, delete)
 *  – admin balance adjustment
 *  – audit log
 *  – user management (super_admin)
 */

const request = require('supertest');
const app     = require('../server');
const db      = require('../models');
const { signToken } = require('../utils/jwt');

let adminToken;
let superToken;
let traderToken;
let traderId;
let traderAccountId;

beforeAll(() => {
  // Tokens for seeded demo users
  const admin = db.getUserByEmail('admin@vda.trade');
  const superUser = db.getUserByEmail('super@vda.trade');
  const trader = db.getUserByEmail('demo@vda.trade');

  adminToken  = signToken({ id: admin.id,    role: admin.role    });
  superToken  = signToken({ id: superUser.id, role: superUser.role });
  traderToken = signToken({ id: trader.id,   role: trader.role   });
  traderId    = trader.id;

  const acct = db.getAccountByUserId(traderId);
  traderAccountId = acct ? acct.id : null;
});

// ── Symbol API ──────────────────────────────────────────────────────────────

describe('GET /api/symbols', () => {
  test('returns list of symbols (public)', async () => {
    const res = await request(app).get('/api/symbols');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const eurusd = res.body.find((s) => s.symbol === 'EURUSD');
    expect(eurusd).toBeDefined();
    expect(eurusd).toHaveProperty('spread');
    expect(eurusd).toHaveProperty('leverageCap');
    expect(eurusd).toHaveProperty('contractSize');
    expect(eurusd).toHaveProperty('tradingHours');
  });
});

describe('PATCH /api/symbols/:symbol', () => {
  test('updates spread (admin)', async () => {
    const res = await request(app)
      .patch('/api/symbols/EURUSD')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ spread: 0.00015 });
    expect(res.status).toBe(200);
    expect(res.body.spread).toBeCloseTo(0.00015, 5);
  });

  test('rejects update without auth', async () => {
    const res = await request(app).patch('/api/symbols/EURUSD').send({ spread: 0.0005 });
    expect(res.status).toBe(401);
  });

  test('rejects update from trader role', async () => {
    const res = await request(app)
      .patch('/api/symbols/EURUSD')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ spread: 0.0005 });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/symbols', () => {
  test('creates a custom symbol (admin)', async () => {
    const res = await request(app)
      .post('/api/symbols')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        symbol: 'TESTXY',
        description: 'Test Pair',
        spread: 0.0002,
        leverageCap: 200,
        contractSize: 100000,
        pipSize: 0.0001,
        digits: 5,
        currency: 'USD',
        tradingHours: '00:00-24:00',
        active: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.symbol).toBe('TESTXY');
  });

  test('rejects duplicate symbol', async () => {
    const res = await request(app)
      .post('/api/symbols')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ symbol: 'EURUSD' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/symbols/:symbol', () => {
  test('deletes a symbol with no open orders', async () => {
    const res = await request(app)
      .delete('/api/symbols/TESTXY')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('returns 404 for non-existent symbol', async () => {
    const res = await request(app)
      .delete('/api/symbols/NOSUCHSYM')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Admin balance adjustment ────────────────────────────────────────────────

describe('POST /api/admin/accounts/:id/adjust', () => {
  test('adjusts balance (admin)', async () => {
    if (!traderAccountId) return;
    const before = db.getAccountById(traderAccountId).balance;
    const res = await request(app)
      .post(`/api/admin/accounts/${traderAccountId}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 500, note: 'Test credit' });
    expect(res.status).toBe(200);
    expect(res.body.balance).toBeCloseTo(before + 500, 1);
  });

  test('rejects negative balance result', async () => {
    if (!traderAccountId) return;
    const res = await request(app)
      .post(`/api/admin/accounts/${traderAccountId}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -9999999 });
    expect(res.status).toBe(400);
  });

  test('rejects from trader role', async () => {
    if (!traderAccountId) return;
    const res = await request(app)
      .post(`/api/admin/accounts/${traderAccountId}/adjust`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ amount: 100 });
    expect(res.status).toBe(403);
  });
});

// ── Audit log ───────────────────────────────────────────────────────────────

describe('GET /api/admin/audit', () => {
  test('returns audit entries (admin)', async () => {
    const res = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('rejects from trader', async () => {
    const res = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });
});

// ── User management (super_admin only) ─────────────────────────────────────

describe('GET /api/admin/users', () => {
  test('returns users (super_admin)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('rejects from admin role', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/admin/users', () => {
  test('creates user (super_admin)', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ email: 'newuser@vda.trade', password: 'NewPass1!', name: 'New User', role: 'trader' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newuser@vda.trade');
  });

  test('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ email: 'demo@vda.trade', password: 'Demo1234!', name: 'Dup', role: 'trader' });
    expect(res.status).toBe(409);
  });
});

describe('PATCH /api/admin/users/:id/status', () => {
  test('suspends a user (super_admin)', async () => {
    const trader = db.getUserByEmail('demo@vda.trade');
    const res = await request(app)
      .patch(`/api/admin/users/${trader.id}/status`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ status: 'suspended' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('suspended');

    // Reinstate
    await request(app)
      .patch(`/api/admin/users/${trader.id}/status`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ status: 'active' });
  });

  test('rejects invalid status', async () => {
    const trader = db.getUserByEmail('demo@vda.trade');
    const res = await request(app)
      .patch(`/api/admin/users/${trader.id}/status`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ status: 'banned' });
    expect(res.status).toBe(400);
  });
});
