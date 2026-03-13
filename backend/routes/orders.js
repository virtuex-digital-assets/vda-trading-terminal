const express = require('express');
const router  = express.Router();
const { listOrders, placeOrder, closeOrder, modifyOrder, getHistory } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/',           listOrders);
router.post('/',          placeOrder);
router.get('/history',    getHistory);
router.delete('/:ticket', closeOrder);
router.patch('/:ticket',  modifyOrder);

module.exports = router;
