const db = require('../models');

/**
 * GET /api/symbols
 * Returns the list of available symbols with latest quotes.
 */
function listSymbols(req, res) {
  const symbols = [];
  db.symbolRegistry.forEach((cfg, symbol) => {
    const quote = db.quotes.get(symbol) || {};
    symbols.push({ ...cfg, ...quote });
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

/**
 * PATCH /api/symbols/:symbol
 * Update symbol configuration (admin only).
 * Body: { spread?, leverageCap?, contractSize?, pipSize?, digits?,
 *         description?, tradingHours?, active? }
 */
function updateSymbol(req, res) {
  const { symbol } = req.params;
  const cfg = db.symbolRegistry.get(symbol);
  if (!cfg) {
    return res.status(404).json({ error: `Symbol ${symbol} not found` });
  }

  const allowed = ['description', 'spread', 'leverageCap', 'contractSize',
                   'pipSize', 'digits', 'tradingHours', 'active'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) cfg[field] = req.body[field];
  });

  res.json(cfg);
}

/**
 * POST /api/symbols
 * Create a new symbol (admin only).
 * Body: { symbol, description, spread, leverageCap, contractSize,
 *         pipSize, digits, currency, tradingHours, active }
 */
function createSymbol(req, res) {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'symbol is required' });
  if (db.symbolRegistry.has(symbol)) {
    return res.status(409).json({ error: `Symbol ${symbol} already exists` });
  }

  const cfg = {
    symbol,
    description:  req.body.description  || symbol,
    spread:       parseFloat(req.body.spread      || 0.0001),
    leverageCap:  parseInt(req.body.leverageCap   || 500, 10),
    contractSize: parseInt(req.body.contractSize  || 100000, 10),
    pipSize:      parseFloat(req.body.pipSize     || 0.0001),
    digits:       parseInt(req.body.digits        || 5, 10),
    currency:     req.body.currency  || 'USD',
    tradingHours: req.body.tradingHours || '00:00-24:00',
    active:       req.body.active !== undefined ? Boolean(req.body.active) : true,
  };

  db.symbolRegistry.set(symbol, cfg);
  res.status(201).json(cfg);
}

/**
 * DELETE /api/symbols/:symbol
 * Remove a custom symbol (admin only – cannot delete built-in symbols that
 * have open orders).
 */
function deleteSymbol(req, res) {
  const { symbol } = req.params;
  if (!db.symbolRegistry.has(symbol)) {
    return res.status(404).json({ error: `Symbol ${symbol} not found` });
  }

  // Prevent deletion if there are open orders on this symbol
  const hasOpen = [...db.openOrders.values()].some((o) => o.symbol === symbol) ||
                  [...db.pendingOrders.values()].some((o) => o.symbol === symbol);
  if (hasOpen) {
    return res.status(400).json({ error: `Cannot delete ${symbol}: open orders exist` });
  }

  db.symbolRegistry.delete(symbol);
  res.json({ ok: true, symbol });
}

module.exports = { listSymbols, getCandles, updateSymbol, createSymbol, deleteSymbol };
