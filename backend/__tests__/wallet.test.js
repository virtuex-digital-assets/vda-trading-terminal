/**
 * Wallet API integration tests.
 */

const request = require('supertest');
const app     = require('../server');
const db      = require('../models');

let traderToken;
let adminToken;

async function login(email, password) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.token;
}

beforeAll(async () => {
  traderToken = await login('demo@vda.trade',  'Demo1234!');
  adminToken  = await login('admin@vda.trade', 'Admin1234!');
});

// ── Deposits ────────────────────────────────────────────────────────────────

describe('POST /api/wallet/deposit', () => {
  test('credits account and returns completed transaction', async () => {
    const account = db.getAccountByUserId(
      db.getUserByEmail('demo@vda.trade').id
    );
    const prevBalance = account.balance;

    const res = await request(app)
      .post('/api/wallet/deposit')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ amount: 500, note: 'Test deposit' });

    expect(res.status).toBe(201);
    expect(res.body.transaction.type).toBe('deposit');
    expect(res.body.transaction.amount).toBe(500);
    expect(res.body.transaction.status).toBe('completed');
    expect(res.body.account.balance).toBeCloseTo(prevBalance + 500, 2);
  });

  test('rejects invalid amount', async () => {
    const res = await request(app)
      .post('/api/wallet/deposit')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ amount: -100 });
    expect(res.status).toBe(400);
  });

  test('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/wallet/deposit')
      .send({ amount: 100 });
    expect(res.status).toBe(401);
  });
});

// ── Withdrawals ─────────────────────────────────────────────────────────────

describe('POST /api/wallet/withdraw', () => {
  test('debits account and returns pending transaction', async () => {
    const account = db.getAccountByUserId(
      db.getUserByEmail('demo@vda.trade').id
    );
    const prevBalance = account.balance;

    const res = await request(app)
      .post('/api/wallet/withdraw')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ amount: 200, note: 'Test withdrawal' });

    expect(res.status).toBe(201);
    expect(res.body.transaction.type).toBe('withdrawal');
    expect(res.body.transaction.amount).toBe(200);
    expect(res.body.transaction.status).toBe('pending');
    expect(res.body.account.balance).toBeCloseTo(prevBalance - 200, 2);
  });

  test('rejects withdrawal exceeding balance', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ amount: 9_999_999 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/insufficient/i);
  });
});

// ── Transaction history ──────────────────────────────────────────────────────

describe('GET /api/wallet/transactions', () => {
  test('returns array of transactions for the logged-in user', async () => {
    const res = await request(app)
      .get('/api/wallet/transactions')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Should include the deposit and withdrawal placed above
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  test('supports ?type=deposit filter', async () => {
    const res = await request(app)
      .get('/api/wallet/transactions?type=deposit')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    res.body.forEach((tx) => expect(tx.type).toBe('deposit'));
  });
});

// ── Admin: all transactions ──────────────────────────────────────────────────

describe('GET /api/wallet/transactions/all (admin)', () => {
  test('admin can list all wallet transactions', async () => {
    const res = await request(app)
      .get('/api/wallet/transactions/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('trader cannot access all-transactions endpoint', async () => {
    const res = await request(app)
      .get('/api/wallet/transactions/all')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });
});

// ── Admin: approve/reject transaction ─────────────────────────────────────

describe('PATCH /api/wallet/transactions/:txId/status (admin)', () => {
  test('admin can approve a pending withdrawal', async () => {
    // Find a pending withdrawal
    const pending = [...db.walletTransactions.values()].find(
      (t) => t.type === 'withdrawal' && t.status === 'pending'
    );
    if (!pending) {
      // Create one if none exists
      const userId = db.getUserByEmail('demo@vda.trade').id;
      const account = db.getAccountByUserId(userId);
      if (account.balance >= 50) {
        await request(app)
          .post('/api/wallet/withdraw')
          .set('Authorization', `Bearer ${traderToken}`)
          .send({ amount: 50 });
      }
    }

    const tx = [...db.walletTransactions.values()].find(
      (t) => t.type === 'withdrawal' && t.status === 'pending'
    );
    if (!tx) return; // skip if no pending tx (balance was too low)

    const res = await request(app)
      .patch(`/api/wallet/transactions/${tx.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });
});
