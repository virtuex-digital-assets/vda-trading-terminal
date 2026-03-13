const express = require('express');
const router  = express.Router();
const { getRisk, listAccounts, listAllOrders, forceCloseOrder } = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');

router.use(adminLimiter, authMiddleware, adminOnly);

router.get('/risk',                  getRisk);
router.get('/accounts',              listAccounts);
router.get('/orders',                listAllOrders);
router.post('/orders/:ticket/close', forceCloseOrder);

module.exports = router;
