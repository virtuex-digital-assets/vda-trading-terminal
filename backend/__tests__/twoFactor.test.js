/**
 * 2FA (TOTP) API tests.
 */

const request = require('supertest');
const app     = require('../server');
const { verifyTOTP } = require('../utils/totp');
const db      = require('../models');

let traderToken;

async function loginToken(email, password) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.token;
}

beforeAll(async () => {
  traderToken = await loginToken('demo@vda.trade', 'Demo1234!');
});

describe('2FA setup flow', () => {
  let pendingSecret;

  test('POST /api/auth/2fa/setup returns secret + otpauthUri', async () => {
    const res = await request(app)
      .post('/api/auth/2fa/setup')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.secret).toBeDefined();
    expect(res.body.otpauthUri).toMatch(/^otpauth:\/\/totp\//);
    pendingSecret = res.body.secret;
  });

  test('POST /api/auth/2fa/verify rejects invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/2fa/verify')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ token: '000000' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/2fa/verify accepts valid token and enables 2FA', async () => {
    if (!pendingSecret) return;
    // Generate valid token using the pending secret
    const token = require('../utils/totp').generateTOTP(pendingSecret);
    const res = await request(app)
      .post('/api/auth/2fa/verify')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ token });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/enabled/i);
  });

  test('GET /api/auth/me shows twoFactorEnabled: true', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.twoFactorEnabled).toBe(true);
  });

  test('POST /api/auth/login without totpToken returns twoFactorRequired', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade', password: 'Demo1234!' });
    expect(res.status).toBe(200);
    expect(res.body.twoFactorRequired).toBe(true);
    expect(res.body.token).toBeUndefined();
  });

  test('POST /api/auth/login with valid totpToken returns JWT', async () => {
    const userId = db.getUserByEmail('demo@vda.trade').id;
    const entry  = db.totpSecrets.get(userId);
    if (!entry || !entry.enabled) return;

    const token = require('../utils/totp').generateTOTP(entry.secret);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade', password: 'Demo1234!', totpToken: token });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/2fa/disable with valid token disables 2FA', async () => {
    const userId = db.getUserByEmail('demo@vda.trade').id;
    const entry  = db.totpSecrets.get(userId);
    if (!entry || !entry.enabled) return;

    // Need a fresh token to log in first (get a post-2FA token)
    const loginToken2 = require('../utils/totp').generateTOTP(entry.secret);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@vda.trade', password: 'Demo1234!', totpToken: loginToken2 });
    const freshToken = loginRes.body.token;

    const disableToken = require('../utils/totp').generateTOTP(entry.secret);
    const res = await request(app)
      .post('/api/auth/2fa/disable')
      .set('Authorization', `Bearer ${freshToken}`)
      .send({ token: disableToken });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/disabled/i);
  });
});

describe('TOTP utility unit tests', () => {
  test('generateTOTP produces 6-digit string', () => {
    const { generateSecret, generateTOTP } = require('../utils/totp');
    const secret = generateSecret();
    const token  = generateTOTP(secret);
    expect(token).toMatch(/^\d{6}$/);
  });

  test('verifyTOTP accepts current token', () => {
    const { generateSecret, generateTOTP } = require('../utils/totp');
    const secret = generateSecret();
    const token  = generateTOTP(secret);
    expect(verifyTOTP(secret, token)).toBe(true);
  });

  test('verifyTOTP rejects wrong token', () => {
    const { generateSecret } = require('../utils/totp');
    const secret = generateSecret();
    expect(verifyTOTP(secret, '000000')).toBe(false);
  });
});
