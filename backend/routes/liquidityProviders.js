/**
 * Liquidity Provider routes.
 */
const express = require('express');
const router  = express.Router();
const lpCtrl = require('../controllers/liquidityController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(adminLimiter, authMiddleware, adminOnly);

router.get('/',          lpCtrl.listProviders);
router.post('/',         auditLog, lpCtrl.addProvider);
router.get('/:id',       lpCtrl.getProvider);
router.patch('/:id',     auditLog, lpCtrl.updateProvider);

module.exports = router;
