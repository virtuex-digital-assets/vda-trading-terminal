const express = require('express');
const router  = express.Router();
const {
  listDeposits, createDeposit, approveDeposit, rejectDeposit,
  listWithdrawals, createWithdrawal, approveWithdrawal, rejectWithdrawal,
  listGateways, createGateway, updateGateway, toggleGateway,
} = require('../controllers/financeController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(apiLimiter, authMiddleware);

// Deposits
router.get('/deposits',                      listDeposits);
router.post('/deposits',                     auditLog, createDeposit);
router.patch('/deposits/:id/approve',        adminOnly, auditLog, approveDeposit);
router.patch('/deposits/:id/reject',         adminOnly, auditLog, rejectDeposit);

// Withdrawals
router.get('/withdrawals',                   listWithdrawals);
router.post('/withdrawals',                  auditLog, createWithdrawal);
router.patch('/withdrawals/:id/approve',     adminOnly, auditLog, approveWithdrawal);
router.patch('/withdrawals/:id/reject',      adminOnly, auditLog, rejectWithdrawal);

// Gateways
router.get('/gateways',                      adminOnly, listGateways);
router.post('/gateways',                     adminOnly, auditLog, createGateway);
router.patch('/gateways/:id',                adminOnly, auditLog, updateGateway);
router.patch('/gateways/:id/toggle',         adminOnly, auditLog, toggleGateway);

module.exports = router;
