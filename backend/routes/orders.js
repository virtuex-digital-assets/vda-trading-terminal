const express = require('express');
const router  = express.Router();
const { listOrders, placeOrder, closeOrder, modifyOrder, getHistory } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(apiLimiter, authMiddleware);

router.get('/',           listOrders);
router.post('/',          auditLog, placeOrder);
router.get('/history',    getHistory);
router.delete('/:ticket', auditLog, closeOrder);
router.patch('/:ticket',  auditLog, modifyOrder);

module.exports = router;
