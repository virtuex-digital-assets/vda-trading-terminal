const express = require('express');
const router  = express.Router();
const {
  getRisk, listAccounts, listAllOrders, forceCloseOrder,
  adjustBalance, listUsers, createUser, setUserStatus, getAuditLog,
} = require('../controllers/adminController');
const { authMiddleware, adminOnly, superAdminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

// All admin routes require rate limiting + authentication
router.use(adminLimiter, authMiddleware);

// ── Admin + super_admin routes ────────────────────────────────────────────
router.get('/risk',                            adminOnly, getRisk);
router.get('/accounts',                        adminOnly, listAccounts);
router.get('/orders',                          adminOnly, listAllOrders);
router.post('/orders/:ticket/close',           adminOnly, auditLog, forceCloseOrder);
router.post('/accounts/:accountId/adjust',     adminOnly, auditLog, adjustBalance);
router.get('/audit',                           adminOnly, getAuditLog);

// ── Super admin only routes ───────────────────────────────────────────────
router.get('/users',                           superAdminOnly, listUsers);
router.post('/users',                          superAdminOnly, auditLog, createUser);
router.patch('/users/:userId/status',          superAdminOnly, auditLog, setUserStatus);

module.exports = router;
