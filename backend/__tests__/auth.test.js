/**
 * Integration tests for the authentication system.
 *
 * Covers:
 *  - POST /api/auth/register
 *  - POST /api/auth/login
 *  - GET  /api/auth/me  (requires valid JWT)
 *  - Auth middleware (401 on protected routes without token)
 *  - Admin-only middleware (403 for non-admin role)
 */

const request = require('supertest');
const app     = require('../server');

afterAll((done) => {
  if (app.httpServer && app.httpServer.listening) {
    app.httpServer.close(done);
  } else {
    done();
  }
});


const UNIQUE = Date.now(); // keeps parallel runs from colliding

function regPayload(suffix = '') {
  return {
    name:     `Test User${suffix}`,
    email:    `testuser${UNIQUE}${suffix}@example.com`,
    password: 'TestPass1!',
  };
}

// ── Registration ───────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('registers a new user and returns token + user + account', async () => {
    const payload = regPayload('_reg');
    const res = await request(app)
      .post('/api/auth/register')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(payload.email);
    expect(res.body.user.name).toBe(payload.name);
    expect(res.body.user.role).toBe('trader');
    expect(res.body.user.passwordHash).toBeUndefined(); // never expose hash
    expect(res.body.account).toBeTruthy();
    expect(typeof res.body.account.balance).toBe('number');
  });

  test('rejects duplicate email with 409', async () => {
    const payload = regPayload('_dup');
    await request(app).post('/api/auth/register').send(payload).expect(201);
    const res = await request(app).post('/api/auth/register').send(payload).expect(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  test('rejects short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...regPayload('_short'), password: 'abc' })
      .expect(400);
    expect(res.body.error).toMatch(/8 characters/i);
  });

  test('rejects missing fields with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@example.com' })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });
});

// ── Login ──────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('logs in with seeded demo credentials and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade', password: 'Demo1234!' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('demo@vda.trade');
    expect(res.body.user.role).toBe('trader');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.account).toBeTruthy();
  });

  test('logs in as admin and returns admin role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vda.trade', password: 'Admin1234!' })
      .expect(200);

    expect(res.body.user.role).toBe('admin');
  });

  test('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade', password: 'WrongPass!' })
      .expect(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  test('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Whatever1!' })
      .expect(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  test('rejects missing password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade' })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });
});

// ── /me endpoint ───────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade', password: 'Demo1234!' });
    token = res.body.token;
  });

  test('returns user profile for authenticated request', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.user.email).toBe('demo@vda.trade');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me').expect(401);
    expect(res.body.error).toBeTruthy();
  });

  test('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.valid.token')
      .expect(401);
    expect(res.body.error).toBeTruthy();
  });
});

// ── Protected routes require authentication ────────────────────────────────

describe('Auth middleware – protected routes return 401 without token', () => {
  test('GET /api/account returns 401 without token', async () => {
    const res = await request(app).get('/api/account').expect(401);
    expect(res.body.error).toBeTruthy();
  });

  test('GET /api/orders returns 401 without token', async () => {
    const res = await request(app).get('/api/orders').expect(401);
    expect(res.body.error).toBeTruthy();
  });
});

// ── Admin-only middleware ──────────────────────────────────────────────────

describe('Admin-only middleware', () => {
  let traderToken;
  let adminToken;

  beforeAll(async () => {
    const [traderRes, adminRes] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: 'demo@vda.trade',  password: 'Demo1234!'  }),
      request(app).post('/api/auth/login').send({ email: 'admin@vda.trade', password: 'Admin1234!' }),
    ]);
    traderToken = traderRes.body.token;
    adminToken  = adminRes.body.token;
  });

  test('GET /api/admin/accounts returns 403 for trader role', async () => {
    const res = await request(app)
      .get('/api/admin/accounts')
      .set('Authorization', `Bearer ${traderToken}`)
      .expect(403);
    expect(res.body.error).toMatch(/admin/i);
  });

  test('GET /api/admin/accounts returns 200 for admin role', async () => {
    const res = await request(app)
      .get('/api/admin/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
