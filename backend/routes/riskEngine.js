/**
 * Risk Engine routes.
 */
const express = require('express');
const router  = express.Router();
const riskCtrl = require('../controllers/riskController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(adminLimiter, authMiddleware, adminOnly);

router.get('/report',                riskCtrl.getReport);
router.get('/exposure',              riskCtrl.getExposure);
router.get('/orders/:ticket/book',   riskCtrl.getOrderBookMapping);
router.patch('/config',              auditLog, riskCtrl.updateConfig);

module.exports = router;
