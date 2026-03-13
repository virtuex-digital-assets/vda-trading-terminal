const db = require('../models');

/**
 * GET /api/symbols
 * Returns the list of available symbols with latest quotes.
 */
function listSymbols(req, res) {
  const symbols = [];
  db.quotes.forEach((quote, symbol) => {
    symbols.push({ symbol, ...quote });
  });
  res.json(symbols);
}

/**
 * GET /api/symbols/:symbol/candles?timeframe=H1&count=200
 * Returns OHLCV candle history for a symbol.
 */
function getCandles(req, res) {
  const { symbol } = req.params;
  const timeframe  = req.query.timeframe || 'H1';
  const count      = Math.min(parseInt(req.query.count || '200', 10), 500);

  const key     = `${symbol}_${timeframe}`;
  const candles = db.candles.get(key);
  if (!candles) {
    return res.status(404).json({ error: `No candles found for ${symbol} ${timeframe}` });
  }
  res.json(candles.slice(-count));
}

module.exports = { listSymbols, getCandles };
