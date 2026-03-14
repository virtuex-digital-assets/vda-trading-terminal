/**
 * White Label broker management routes.
 */
const express = require('express');
const router  = express.Router();
const brokerCtrl = require('../controllers/brokerController');
const { authMiddleware, adminOnly, superAdminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(adminLimiter, authMiddleware);

// Platform summary (super admin only)
router.get('/summary',         superAdminOnly, brokerCtrl.getPlatformSummary);

// Broker CRUD (super admin only)
router.get('/',                superAdminOnly, brokerCtrl.listBrokers);
router.post('/',               superAdminOnly, auditLog, brokerCtrl.createBroker);
router.get('/:id',             adminOnly,      brokerCtrl.getBroker);
router.patch('/:id',           adminOnly,      auditLog, brokerCtrl.updateBroker);
router.delete('/:id',          superAdminOnly, auditLog, brokerCtrl.deleteBroker);

// Branding & config (admin of that broker)
router.patch('/:id/branding',             adminOnly, auditLog, brokerCtrl.updateBranding);
router.patch('/:id/trading-conditions',   adminOnly, auditLog, brokerCtrl.updateTradingConditions);
router.patch('/:id/mt4',                  adminOnly, auditLog, brokerCtrl.updateMt4Config);

module.exports = router;
