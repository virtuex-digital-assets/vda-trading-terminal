const express = require('express');
const router  = express.Router();
const { listSymbols, getCandles, updateSymbol, createSymbol, deleteSymbol } = require('../controllers/symbolController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter, adminLimiter }  = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

// Public endpoints – no authentication required for market data
router.get('/',                listSymbols);
router.get('/:symbol/candles', getCandles);

// Admin endpoints – require authentication + admin role
router.post('/',                adminLimiter, authMiddleware, adminOnly, auditLog, createSymbol);
router.patch('/:symbol',        adminLimiter, authMiddleware, adminOnly, auditLog, updateSymbol);
router.delete('/:symbol',       adminLimiter, authMiddleware, adminOnly, auditLog, deleteSymbol);

module.exports = router;
