/**
 * Audit logging middleware.
 *
 * Intercepts write operations (POST, PATCH, PUT, DELETE) and appends a
 * structured record to the in-memory audit log store.
 *
 * The log is accessible via GET /api/admin/audit (admin/super_admin only).
 */

const db = require('../models');

/**
 * Express middleware that creates an audit log entry after a mutating request
 * completes.
 */
function auditLog(req, res, next) {
  const skip = ['GET', 'HEAD', 'OPTIONS'];
  if (skip.includes(req.method)) return next();

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const entry = {
      ts:       new Date().toISOString(),
      method:   req.method,
      path:     req.path,
      userId:   req.user ? req.user.id   : null,
      userEmail: req.user ? req.user.email : null,
      role:     req.user ? req.user.role  : null,
      status:   res.statusCode,
      body:     sanitise(req.body),
    };
    db.auditLogs.push(entry);
    // Keep last 1 000 entries only
    if (db.auditLogs.length > 1000) db.auditLogs.shift();
    return originalJson(body);
  };

  next();
}

/** Strip sensitive fields before storing (recursively). */
const SENSITIVE_KEYS = new Set(['password', 'passwordHash', 'token']);

function redactValue(value) {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key)) {
        continue;
      }
      result[key] = redactValue(val);
    }
    return result;
  }

  return value;
}

function sanitise(body) {
  if (!body || typeof body !== 'object') return body;
  return redactValue(body);
}

module.exports = { auditLog };
