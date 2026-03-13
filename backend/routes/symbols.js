const express = require('express');
const router  = express.Router();
const { listSymbols, getCandles } = require('../controllers/symbolController');

// Public endpoints – no authentication required for market data
router.get('/',                  listSymbols);
router.get('/:symbol/candles',   getCandles);

module.exports = router;
