/**
 * Tests for the new platform services:
 *  – KYC System
 *  – Support Tickets
 *  – Affiliates / IB Partners
 *  – Notifications
 *  – Payment Gateway
 */

const request = require('supertest');
const app     = require('../server');

// ─── Auth helpers ────────────────────────────────────────────────────────────

async function loginAs(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

// ═══════════════════════════════════════════════════════════════════════════
// KYC System
// ═══════════════════════════════════════════════════════════════════════════

describe('KYC API', () => {
  let traderToken;
  let adminToken;

  beforeAll(async () => {
    traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
    adminToken  = await loginAs('admin@vda.trade', 'Admin1234!');
  });

  it('GET /api/kyc/profile returns profile and documents', async () => {
    const res = await request(app)
      .get('/api/kyc/profile')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('profile');
    expect(res.body).toHaveProperty('documents');
    expect(res.body.profile.level).toBe(0);
    expect(res.body.profile.status).toBe('not_submitted');
  });

  it('POST /api/kyc/documents submits a document', async () => {
    const res = await request(app)
      .post('/api/kyc/documents')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ type: 'passport', fileName: 'passport.jpg', mimeType: 'image/jpeg', fileSize: 102400 });
    expect(res.status).toBe(201);
    expect(res.body.document.type).toBe('passport');
    expect(res.body.document.status).toBe('pending');
  });

  it('POST /api/kyc/documents rejects invalid doc type', async () => {
    const res = await request(app)
      .post('/api/kyc/documents')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ type: 'selfie_invalid', fileName: 'test.jpg' });
    expect(res.status).toBe(400);
  });

  it('POST /api/kyc/documents requires type', async () => {
    const res = await request(app)
      .post('/api/kyc/documents')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ fileName: 'test.jpg' });
    expect(res.status).toBe(400);
  });

  it('GET /api/kyc/documents returns submitted documents', async () => {
    const res = await request(app)
      .get('/api/kyc/documents')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.documents.length).toBeGreaterThan(0);
  });

  it('GET /api/kyc/profile shows pending status after doc submit', async () => {
    const res = await request(app)
      .get('/api/kyc/profile')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.profile.status).toBe('pending');
  });

  it('GET /api/kyc/admin/profiles requires admin', async () => {
    const res = await request(app)
      .get('/api/kyc/admin/profiles')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/kyc/admin/profiles returns all profiles (admin)', async () => {
    const res = await request(app)
      .get('/api/kyc/admin/profiles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.profiles)).toBe(true);
  });

  it('GET /api/kyc/admin/profiles?status=pending filters by status', async () => {
    const res = await request(app)
      .get('/api/kyc/admin/profiles?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.profiles.every((p) => p.status === 'pending')).toBe(true);
  });

  it('PATCH /api/kyc/admin/documents/:id approves a document', async () => {
    // Get the submitted document id
    const docsRes = await request(app)
      .get('/api/kyc/documents')
      .set('Authorization', `Bearer ${traderToken}`);
    const docId = docsRes.body.documents[0].id;

    const res = await request(app)
      .patch(`/api/kyc/admin/documents/${docId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.document.status).toBe('approved');
  });

  it('PATCH /api/kyc/admin/documents/:id rejects with reason', async () => {
    // Submit a new doc to reject
    const submitRes = await request(app)
      .post('/api/kyc/documents')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ type: 'utility_bill', fileName: 'bill.pdf' });
    const docId = submitRes.body.document.id;

    const res = await request(app)
      .patch(`/api/kyc/admin/documents/${docId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'rejected', rejectionReason: 'Document is blurry' });
    expect(res.status).toBe(200);
    expect(res.body.document.status).toBe('rejected');
    expect(res.body.document.rejectionReason).toBe('Document is blurry');
  });

  it('PATCH /api/kyc/admin/profiles/:userId overrides profile (admin)', async () => {
    // Get trader's user id
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${traderToken}`);
    const userId = meRes.body.user.id;

    const res = await request(app)
      .patch(`/api/kyc/admin/profiles/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved', level: 2 });
    expect(res.status).toBe(200);
    expect(res.body.profile.status).toBe('approved');
    expect(res.body.profile.level).toBe(2);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/kyc/profile');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Support Tickets
// ═══════════════════════════════════════════════════════════════════════════

describe('Tickets API', () => {
  let traderToken;
  let adminToken;
  let ticketId;

  beforeAll(async () => {
    traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
    adminToken  = await loginAs('admin@vda.trade', 'Admin1234!');
  });

  it('GET /api/tickets returns empty list for new user', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tickets)).toBe(true);
  });

  it('POST /api/tickets creates a ticket', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ subject: 'Cannot withdraw', category: 'withdrawal', priority: 'high', body: 'My withdrawal is pending for 3 days' });
    expect(res.status).toBe(201);
    expect(res.body.ticket.subject).toBe('Cannot withdraw');
    expect(res.body.ticket.status).toBe('open');
    ticketId = res.body.ticket.id;
  });

  it('POST /api/tickets rejects missing subject', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ body: 'help' });
    expect(res.status).toBe(400);
  });

  it('POST /api/tickets rejects missing body', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ subject: 'test' });
    expect(res.status).toBe(400);
  });

  it('GET /api/tickets/:id returns the ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ticket.id).toBe(ticketId);
  });

  it('GET /api/tickets/:id returns 404 for unknown ticket', async () => {
    const res = await request(app)
      .get('/api/tickets/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(404);
  });

  it('POST /api/tickets/:id/messages adds a reply', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/messages`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ body: 'Please help ASAP' });
    expect(res.status).toBe(201);
    expect(res.body.message.body).toBe('Please help ASAP');
  });

  it('POST /api/tickets/:id/messages adds admin reply', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ body: 'We are processing your request', isInternal: false });
    expect(res.status).toBe(201);
    expect(res.body.message.authorRole).toBe('admin');
    expect(res.body.ticket.status).toBe('in_progress');
  });

  it('GET /api/tickets/admin/all returns all tickets (admin)', async () => {
    const res = await request(app)
      .get('/api/tickets/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tickets)).toBe(true);
    expect(res.body.tickets.length).toBeGreaterThan(0);
  });

  it('GET /api/tickets/admin/stats returns statistics', async () => {
    const res = await request(app)
      .get('/api/tickets/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('byStatus');
  });

  it('PATCH /api/tickets/admin/:id/status updates ticket status', async () => {
    const res = await request(app)
      .patch(`/api/tickets/admin/${ticketId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved' });
    expect(res.status).toBe(200);
    expect(res.body.ticket.status).toBe('resolved');
  });

  it('GET /api/tickets/admin/all filters by status', async () => {
    const res = await request(app)
      .get('/api/tickets/admin/all?status=resolved')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.tickets.every((t) => t.status === 'resolved')).toBe(true);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });

  it('requires admin for admin routes', async () => {
    const res = await request(app)
      .get('/api/tickets/admin/all')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Affiliates / IB Partners
// ═══════════════════════════════════════════════════════════════════════════

describe('Affiliates API', () => {
  let traderToken;
  let adminToken;

  beforeAll(async () => {
    traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
    adminToken  = await loginAs('admin@vda.trade', 'Admin1234!');
  });

  it('GET /api/affiliates/me returns 404 before registration', async () => {
    const res = await request(app)
      .get('/api/affiliates/me')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(404);
  });

  it('POST /api/affiliates/register registers as affiliate', async () => {
    const res = await request(app)
      .post('/api/affiliates/register')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ name: 'Demo IB Partner', email: 'ib@demo.trade' });
    expect(res.status).toBe(201);
    expect(res.body.affiliate.name).toBe('Demo IB Partner');
    expect(res.body.affiliate).toHaveProperty('referralCode');
  });

  it('POST /api/affiliates/register rejects duplicate registration', async () => {
    const res = await request(app)
      .post('/api/affiliates/register')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ name: 'Demo IB Partner 2', email: 'ib2@demo.trade' });
    expect(res.status).toBe(400);
  });

  it('GET /api/affiliates/me returns profile after registration', async () => {
    const res = await request(app)
      .get('/api/affiliates/me')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.affiliate.name).toBe('Demo IB Partner');
    expect(Array.isArray(res.body.referrals)).toBe(true);
    expect(Array.isArray(res.body.commissions)).toBe(true);
    expect(Array.isArray(res.body.payouts)).toBe(true);
  });

  it('POST /api/affiliates/payout rejects with insufficient balance', async () => {
    const res = await request(app)
      .post('/api/affiliates/payout')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ amount: 99999 });
    expect(res.status).toBe(400);
  });

  it('GET /api/affiliates/admin/summary returns summary (admin)', async () => {
    const res = await request(app)
      .get('/api/affiliates/admin/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalAffiliates');
    expect(res.body).toHaveProperty('activeAffiliates');
    expect(res.body.totalAffiliates).toBeGreaterThan(0);
  });

  it('GET /api/affiliates/admin/list returns all affiliates (admin)', async () => {
    const res = await request(app)
      .get('/api/affiliates/admin/list')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.affiliates)).toBe(true);
    expect(res.body.affiliates.length).toBeGreaterThan(0);
  });

  it('PATCH /api/affiliates/admin/:id updates affiliate (admin)', async () => {
    // Get the affiliate id
    const listRes = await request(app)
      .get('/api/affiliates/admin/list')
      .set('Authorization', `Bearer ${adminToken}`);
    const affiliate = listRes.body.affiliates.find((a) => a.name === 'Demo IB Partner');

    const res = await request(app)
      .patch(`/api/affiliates/admin/${affiliate.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tier: 2, commissionRate: 5 });
    expect(res.status).toBe(200);
    expect(res.body.affiliate.tier).toBe(2);
    expect(res.body.affiliate.commissionRate).toBe(5);
  });

  it('GET /api/affiliates/admin/payouts returns payout list (admin)', async () => {
    const res = await request(app)
      .get('/api/affiliates/admin/payouts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.payouts)).toBe(true);
  });

  it('requires admin for admin routes', async () => {
    const res = await request(app)
      .get('/api/affiliates/admin/summary')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/affiliates/me');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════════════════════════════════════

describe('Notifications API', () => {
  let traderToken;

  beforeAll(async () => {
    traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
    // Manually seed a notification for the demo user
    const notifService = require('../services/notificationService');
    const db = require('../models');
    const user = db.getUserByEmail('demo@vda.trade');
    if (user) {
      notifService.createNotification({
        userId: user.id,
        type:   'system',
        title:  'Welcome',
        body:   'Welcome to VDA Trading Terminal!',
      });
    }
  });

  it('GET /api/notifications returns list', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it('GET /api/notifications/count returns unread count', async () => {
    const res = await request(app)
      .get('/api/notifications/count')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.unread).toBe('number');
  });

  it('PATCH /api/notifications/read-all marks all read', async () => {
    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.marked).toBe('number');
  });

  it('GET /api/notifications/count is 0 after mark-all-read', async () => {
    const res = await request(app)
      .get('/api/notifications/count')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.unread).toBe(0);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Payment Gateway
// ═══════════════════════════════════════════════════════════════════════════

describe('Payment Gateway API', () => {
  let traderToken;
  let adminToken;
  let paymentId;

  beforeAll(async () => {
    traderToken = await loginAs('demo@vda.trade', 'Demo1234!');
    adminToken  = await loginAs('admin@vda.trade', 'Admin1234!');
  });

  it('GET /api/payments/methods returns payment methods (public)', async () => {
    const res = await request(app).get('/api/payments/methods');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.methods)).toBe(true);
    expect(res.body.methods.length).toBeGreaterThan(0);
  });

  it('GET /api/payments/methods?type=crypto returns crypto methods', async () => {
    const res = await request(app).get('/api/payments/methods?type=crypto');
    expect(res.status).toBe(200);
    expect(res.body.methods.every((m) => m.type === 'crypto')).toBe(true);
    expect(res.body.methods.length).toBeGreaterThan(0);
  });

  it('GET /api/payments/methods/:id returns single method', async () => {
    const res = await request(app).get('/api/payments/methods/crypto_btc');
    expect(res.status).toBe(200);
    expect(res.body.method.id).toBe('crypto_btc');
    expect(res.body.method.type).toBe('crypto');
  });

  it('GET /api/payments/methods/:id returns 404 for unknown method', async () => {
    const res = await request(app).get('/api/payments/methods/unknown_method');
    expect(res.status).toBe(404);
  });

  it('POST /api/payments/deposit initiates a deposit', async () => {
    const res = await request(app)
      .post('/api/payments/deposit')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ methodId: 'credit_card', amount: 500 });
    expect(res.status).toBe(201);
    expect(res.body.payment.type).toBe('deposit');
    expect(res.body.payment.amount).toBe(500);
    expect(res.body.payment.status).toBe('pending');
    paymentId = res.body.payment.id;
  });

  it('POST /api/payments/deposit rejects below minimum', async () => {
    const res = await request(app)
      .post('/api/payments/deposit')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ methodId: 'bank_wire', amount: 10 }); // min is 500
    expect(res.status).toBe(400);
  });

  it('POST /api/payments/deposit rejects missing methodId', async () => {
    const res = await request(app)
      .post('/api/payments/deposit')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ amount: 100 });
    expect(res.status).toBe(400);
  });

  it('POST /api/payments/withdraw initiates a withdrawal', async () => {
    // First deposit to ensure sufficient balance (demo auto-approves deposits)
    await request(app)
      .post('/api/wallet/deposit')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ amount: 2000 });

    const res = await request(app)
      .post('/api/payments/withdraw')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ methodId: 'bank_wire', amount: 500 });
    expect(res.status).toBe(201);
    expect(res.body.payment.type).toBe('withdrawal');
    expect(res.body.payment.amount).toBe(500);
  });

  it('GET /api/payments/history returns payment history', async () => {
    const res = await request(app)
      .get('/api/payments/history')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.payments)).toBe(true);
    expect(res.body.payments.length).toBeGreaterThan(0);
  });

  it('GET /api/payments/:id returns payment details', async () => {
    const res = await request(app)
      .get(`/api/payments/${paymentId}`)
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.payment.id).toBe(paymentId);
  });

  it('GET /api/payments/admin/all returns all payments (admin)', async () => {
    const res = await request(app)
      .get('/api/payments/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.payments)).toBe(true);
  });

  it('GET /api/payments/admin/summary returns statistics (admin)', async () => {
    const res = await request(app)
      .get('/api/payments/admin/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalDeposits');
    expect(res.body).toHaveProperty('totalWithdrawals');
    expect(res.body).toHaveProperty('pendingCount');
  });

  it('PATCH /api/payments/admin/:id/status processes payment (admin)', async () => {
    const res = await request(app)
      .patch(`/api/payments/admin/${paymentId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed', gatewayRef: 'GW-REF-001' });
    expect(res.status).toBe(200);
    expect(res.body.payment.status).toBe('completed');
    expect(res.body.payment.gatewayRef).toBe('GW-REF-001');
  });

  it('PATCH /api/payments/admin/methods/:id updates method config', async () => {
    const res = await request(app)
      .patch('/api/payments/admin/methods/credit_card')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ feePercent: 3.0 });
    expect(res.status).toBe(200);
    expect(res.body.method.feePercent).toBe(3.0);
  });

  it('requires admin for admin endpoints', async () => {
    const res = await request(app)
      .get('/api/payments/admin/all')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(403);
  });

  it('requires auth for payment endpoints', async () => {
    const res = await request(app).get('/api/payments/history');
    expect(res.status).toBe(401);
  });
});
