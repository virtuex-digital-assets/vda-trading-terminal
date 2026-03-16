const express = require('express');
const router  = express.Router();
const {
  getSummary, listBrokers, getBroker, createBroker,
  updateBroker, updateBranding, updateTradingConditions,
  toggleBroker, deleteBroker,
} = require('../controllers/brokerController');
const { authMiddleware, superAdminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(adminLimiter, authMiddleware);

router.get('/summary',                       superAdminOnly, getSummary);
router.get('/',                              superAdminOnly, listBrokers);
router.get('/:id',                           superAdminOnly, getBroker);
router.post('/',                             superAdminOnly, auditLog, createBroker);
router.patch('/:id',                         superAdminOnly, auditLog, updateBroker);
router.patch('/:id/branding',                superAdminOnly, auditLog, updateBranding);
router.patch('/:id/trading-conditions',      superAdminOnly, auditLog, updateTradingConditions);
router.patch('/:id/status',                  superAdminOnly, auditLog, toggleBroker);
router.delete('/:id',                        superAdminOnly, auditLog, deleteBroker);

module.exports = router;
