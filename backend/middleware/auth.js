/**
 * JWT authentication middleware.
 *
 * Attaches the decoded user payload to `req.user` when a valid Bearer token
 * is present, or returns 401 when the token is missing / invalid.
 */
const { verifyToken } = require('../utils/jwt');
const { getUserById } = require('../models');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verifyToken(token);
    const user = getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Only allow users with role === 'admin' or 'super_admin'. */
function adminOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/** Only allow users with role === 'super_admin'. */
function superAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly, superAdminOnly };
