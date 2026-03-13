const bcrypt     = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const db         = require('../models');
const { generateSecret, verifyTOTP, buildOtpauthUri } = require('../utils/totp');

const ISSUER = 'VDA Trading';

/**
 * POST /api/auth/register
 * Body: { email, password, name }
 */
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, and name are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (db.getUserByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user    = db.createUser(email, password, name, 'trader');
    const account = db.createAccount(user.id);
    const token   = signToken({ id: user.id, role: user.role });
    res.status(201).json({
      token,
      user:    { id: user.id, email: user.email, name: user.name, role: user.role },
      account: sanitiseAccount(account),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password, totpToken? }
 *
 * When 2FA is enabled for the user, the client must supply `totpToken`.
 * If the password is correct but 2FA is required and the token is absent
 * the server returns 200 with `{ twoFactorRequired: true }` so the client
 * can prompt for the TOTP code and resubmit.
 */
async function login(req, res, next) {
  try {
    const { email, password, totpToken } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = db.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Please contact support.' });
    }

    // 2FA check
    const twoFa = db.totpSecrets.get(user.id);
    if (twoFa && twoFa.enabled) {
      if (!totpToken) {
        // Password correct, but 2FA code still needed — do NOT issue a token yet
        return res.json({ twoFactorRequired: true });
      }
      if (!verifyTOTP(twoFa.secret, totpToken)) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }

    const token   = signToken({ id: user.id, role: user.role });
    const account = db.getAccountByUserId(user.id);
    res.json({
      token,
      user:    { id: user.id, email: user.email, name: user.name, role: user.role },
      account: account ? sanitiseAccount(account) : null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
function me(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  const twoFa   = db.totpSecrets.get(req.user.id);
  res.json({
    user:    { ...req.user, twoFactorEnabled: !!(twoFa && twoFa.enabled) },
    account: account ? sanitiseAccount(account) : null,
  });
}

/**
 * POST /api/auth/2fa/setup
 * Initiates 2FA enrollment: generates a new TOTP secret and returns the
 * otpauth URI for QR-code display.  The secret is NOT yet active — the
 * client must confirm with /2fa/verify before it is enabled.
 */
function setup2FA(req, res) {
  const secret = generateSecret();
  // Store as pending until confirmed
  db.totpSecrets.set(req.user.id, {
    secret: null,
    enabled: false,
    pendingSecret: secret,
  });
  const uri = buildOtpauthUri(secret, ISSUER, req.user.email);
  res.json({ secret, otpauthUri: uri });
}

/**
 * POST /api/auth/2fa/verify
 * Body: { token: '123456' }
 * Confirms the pending 2FA setup by verifying the first TOTP code.
 * On success, the secret is activated.
 */
function verify2FA(req, res) {
  const entry = db.totpSecrets.get(req.user.id);
  if (!entry || !entry.pendingSecret) {
    return res.status(400).json({ error: '2FA setup not initiated. Call /2fa/setup first.' });
  }
  const { token } = req.body;
  if (!verifyTOTP(entry.pendingSecret, token)) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }
  // Activate
  db.totpSecrets.set(req.user.id, { secret: entry.pendingSecret, enabled: true, pendingSecret: null });
  res.json({ message: '2FA enabled successfully' });
}

/**
 * POST /api/auth/2fa/disable
 * Body: { token: '123456' }
 * Disables 2FA after verifying the current TOTP code.
 */
function disable2FA(req, res) {
  const entry = db.totpSecrets.get(req.user.id);
  if (!entry || !entry.enabled) {
    return res.status(400).json({ error: '2FA is not enabled for this account' });
  }
  const { token } = req.body;
  if (!verifyTOTP(entry.secret, token)) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }
  db.totpSecrets.set(req.user.id, { secret: null, enabled: false, pendingSecret: null });
  res.json({ message: '2FA disabled' });
}

function sanitiseAccount(a) {
  // eslint-disable-next-line no-unused-vars
  const { userId, ...rest } = a;
  return rest;
}

module.exports = { register, login, me, setup2FA, verify2FA, disable2FA };

