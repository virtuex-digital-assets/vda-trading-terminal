/**
 * Affiliate / IB Partner routes.
 *
 * Affiliate self-service:
 *   GET    /api/affiliates/me          – own affiliate profile + stats
 *   POST   /api/affiliates/register    – register as an affiliate
 *   POST   /api/affiliates/payout      – request commission payout
 *
 * Admin routes:
 *   GET    /api/affiliates/admin/summary        – platform-wide summary
 *   GET    /api/affiliates/admin/list           – list all affiliates
 *   PATCH  /api/affiliates/admin/:id            – update affiliate
 *   GET    /api/affiliates/admin/payouts        – list payout requests
 *   PATCH  /api/affiliates/admin/payouts/:id    – process payout
 */

const express       = require('express');
const router        = express.Router();
const affiliateCtrl = require('../controllers/affiliateController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(apiLimiter, authMiddleware);

// ── Admin routes (before :id param routes) ───────────────────────────────
router.get('/admin/summary',           adminLimiter, adminOnly, affiliateCtrl.getSummary);
router.get('/admin/list',              adminLimiter, adminOnly, affiliateCtrl.listAll);
router.get('/admin/payouts',           adminLimiter, adminOnly, affiliateCtrl.listPayouts);
router.patch('/admin/payouts/:id',     adminLimiter, adminOnly, auditLog, affiliateCtrl.processPayoutRequest);
router.patch('/admin/:id',             adminLimiter, adminOnly, auditLog, affiliateCtrl.updateAffiliate);

// ── Self-service routes ──────────────────────────────────────────────────
router.get('/me',      affiliateCtrl.getMyProfile);
router.post('/register', auditLog, affiliateCtrl.register);
router.post('/payout',   auditLog, affiliateCtrl.requestPayout);

module.exports = router;
