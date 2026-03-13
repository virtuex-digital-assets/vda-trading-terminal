const bcrypt     = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const db         = require('../models');

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
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = db.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
  res.json({
    user:    req.user,
    account: account ? sanitiseAccount(account) : null,
  });
}

function sanitiseAccount(a) {
  // eslint-disable-next-line no-unused-vars
  const { userId, ...rest } = a;
  return rest;
}

module.exports = { register, login, me };
