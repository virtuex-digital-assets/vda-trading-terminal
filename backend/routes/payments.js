/**
 * Payment Gateway routes.
 *
 * Public:
 *   GET    /api/payments/methods              – list payment methods
 *   GET    /api/payments/methods/:id          – get single method
 *
 * Authenticated:
 *   POST   /api/payments/deposit              – initiate deposit
 *   POST   /api/payments/withdraw             – initiate withdrawal
 *   GET    /api/payments/history              – payment history
 *   GET    /api/payments/:id                  – get payment detail
 *
 * Admin:
 *   GET    /api/payments/admin/all            – all payments
 *   GET    /api/payments/admin/summary        – statistics
 *   PATCH  /api/payments/admin/:id/status     – process payment
 *   PATCH  /api/payments/admin/methods/:id    – update method config
 */

const express      = require('express');
const router       = express.Router();
const payCtrl      = require('../controllers/paymentController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

// Public – payment method discovery
router.get('/methods',     apiLimiter, payCtrl.listMethods);
router.get('/methods/:id', apiLimiter, payCtrl.getMethod);

// Authenticated routes
router.use(apiLimiter, authMiddleware);

// ── Admin routes (before :id param routes) ───────────────────────────────
router.get('/admin/all',               adminLimiter, adminOnly, payCtrl.listAll);
router.get('/admin/summary',           adminLimiter, adminOnly, payCtrl.getSummary);
router.patch('/admin/methods/:id',     adminLimiter, adminOnly, auditLog, payCtrl.updateMethod);
router.patch('/admin/:id/status',      adminLimiter, adminOnly, auditLog, payCtrl.processPayment);

// ── Trader routes ─────────────────────────────────────────────────────────
router.post('/deposit',    auditLog, payCtrl.initiateDeposit);
router.post('/withdraw',   auditLog, payCtrl.initiateWithdrawal);
router.get('/history',     payCtrl.getHistory);
router.get('/:id',         payCtrl.getPayment);

module.exports = router;
