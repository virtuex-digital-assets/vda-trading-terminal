const express  = require('express');
const router   = express.Router();
const {
  requestDeposit, requestWithdrawal, getTransactions,
  updateTransactionStatus, getAllTransactions,
} = require('../controllers/walletController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

// All wallet routes require authentication
router.use(apiLimiter, authMiddleware);

router.post('/deposit',            auditLog, requestDeposit);
router.post('/withdraw',           auditLog, requestWithdrawal);
router.get('/transactions',        getTransactions);

// Admin-only wallet management
router.get('/transactions/all',                   adminLimiter, adminOnly, getAllTransactions);
router.patch('/transactions/:txId/status',        adminLimiter, adminOnly, auditLog, updateTransactionStatus);

module.exports = router;
