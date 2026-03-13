/**
 * Rate limiters for sensitive routes.
 *
 * – authLimiter:   strict limit on login/register to prevent brute-force attacks
 * – apiLimiter:    general limit on authenticated API endpoints
 * – adminLimiter:  tighter limit on admin endpoints
 */
const rateLimit = require('express-rate-limit');

/** Strict limiter for authentication endpoints (login / register). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/** General limiter for authenticated API calls. */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/** Tighter limiter for admin endpoints. */
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

module.exports = { authLimiter, apiLimiter, adminLimiter };
