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
  const numericFields = new Set([
    'spread',
    'leverageCap',
    'contractSize',
    'pipSize',
    'digits',
  ]);
  const booleanFields = new Set(['active']);

  const updates = {};

  allowed.forEach((field) => {
    if (req.body[field] === undefined) return;

    const raw = req.body[field];

    if (numericFields.has(field)) {
      const num = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(num)) {
        return res.status(400).json({ error: `Invalid numeric value for ${field}` });
      }
      updates[field] = num;
    } else if (booleanFields.has(field)) {
      let boolVal;
      if (typeof raw === 'boolean') {
        boolVal = raw;
      } else if (typeof raw === 'string') {
        const lowered = raw.toLowerCase().trim();
        if (lowered === 'true') {
          boolVal = true;
        } else if (lowered === 'false') {
          boolVal = false;
        } else {
          return res.status(400).json({ error: `Invalid boolean value for ${field}` });
        }
      } else {
        return res.status(400).json({ error: `Invalid boolean value for ${field}` });
      }
      updates[field] = boolVal;
    } else {
      updates[field] = raw;
    }
  });

  Object.assign(cfg, updates);

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

  // Use nullish coalescing so that 0 is treated as a valid value, not "missing"
  const spreadRaw       = req.body.spread ?? 0.0001;
  const leverageCapRaw  = req.body.leverageCap ?? 500;
  const contractSizeRaw = req.body.contractSize ?? 100000;
  const pipSizeRaw      = req.body.pipSize ?? 0.0001;
  const digitsRaw       = req.body.digits ?? 5;

  const spread       = parseFloat(spreadRaw);
  const leverageCap  = parseInt(leverageCapRaw, 10);
  const contractSize = parseInt(contractSizeRaw, 10);
  const pipSize      = parseFloat(pipSizeRaw);
  const digits       = parseInt(digitsRaw, 10);

  if (Number.isNaN(spread) || spread < 0) {
    return res.status(400).json({ error: 'Invalid spread: must be a number >= 0' });
  }
  if (Number.isNaN(leverageCap) || leverageCap < 1) {
    return res.status(400).json({ error: 'Invalid leverageCap: must be an integer >= 1' });
  }
  if (Number.isNaN(contractSize) || contractSize <= 0) {
    return res.status(400).json({ error: 'Invalid contractSize: must be an integer > 0' });
  }
  if (Number.isNaN(pipSize) || pipSize <= 0) {
    return res.status(400).json({ error: 'Invalid pipSize: must be a number > 0' });
  }
  if (Number.isNaN(digits) || digits < 0) {
    return res.status(400).json({ error: 'Invalid digits: must be an integer >= 0' });
  }

  const cfg = {
    symbol,
    description:  req.body.description || symbol,
    spread,
    leverageCap,
    contractSize,
    pipSize,
    digits,
    currency:     req.body.currency || 'USD',
    tradingHours: req.body.tradingHours || '00:00-24:00',
    active:       req.body.active !== undefined ? Boolean(req.body.active) : true,
  };

  db.symbolRegistry.set(symbol, cfg);
  res.status(201).json(cfg);
}

/**
 * DELETE /api/symbols/:symbol
 * Remove a symbol (admin only).
 * Cannot delete symbols that have open or pending orders.
 */
function deleteSymbol(req, res) {
  const { symbol } = req.params;
  if (!db.symbolRegistry.has(symbol)) {
    return res.status(404).json({ error: `Symbol ${symbol} not found` });
  }

  // Prevent deletion if there are open or pending orders on this symbol
  const hasOpen = [...db.openOrders.values()].some((o) => o.symbol === symbol) ||
                  [...db.pendingOrders.values()].some((o) => o.symbol === symbol);
  if (hasOpen) {
    return res.status(400).json({ error: `Cannot delete ${symbol}: open orders exist` });
  }

  db.symbolRegistry.delete(symbol);
  res.json({ ok: true, symbol });
}

module.exports = { listSymbols, getCandles, updateSymbol, createSymbol, deleteSymbol };
