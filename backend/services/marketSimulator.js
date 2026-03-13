/**
 * Server-side market data simulator.
 *
 * Generates realistic-looking OHLCV candle data and bid/ask quotes using a
 * Gaussian random-walk model.  Used when no live MT4 bridge is connected.
 */

const SEED_PRICES = {
  EURUSD:  1.0850,
  GBPUSD:  1.2650,
  USDJPY:  149.50,
  XAUUSD:  2020.0,
  USDCHF:  0.8950,
  AUDUSD:  0.6520,
  USDCAD:  1.3580,
  NZDUSD:  0.6090,
  BTCUSD:  52000.0,
  ETHUSD:  2800.0,
};

const VOLATILITY = {
  EURUSD:  0.0008,
  GBPUSD:  0.001,
  USDJPY:  0.1,
  XAUUSD:  1.5,
  USDCHF:  0.0008,
  AUDUSD:  0.0009,
  USDCAD:  0.0009,
  NZDUSD:  0.0009,
  BTCUSD:  200,
  ETHUSD:  30,
};

const SPREADS = {
  EURUSD:  0.0001,
  GBPUSD:  0.0002,
  USDJPY:  0.02,
  XAUUSD:  0.3,
  USDCHF:  0.0002,
  AUDUSD:  0.0002,
  USDCAD:  0.0002,
  NZDUSD:  0.0003,
  BTCUSD:  5.0,
  ETHUSD:  0.5,
};

const TIMEFRAME_SECONDS = {
  M1:  60,
  M5:  300,
  M15: 900,
  M30: 1800,
  H1:  3600,
  H4:  14400,
  D1:  86400,
  W1:  604800,
};

const DEFAULT_SYMBOLS = Object.keys(SEED_PRICES);

/** Gaussian random (Box-Muller transform). */
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function barTime(ts, tfSeconds) {
  return Math.floor(ts / tfSeconds) * tfSeconds;
}

/**
 * Get the current spread for a symbol.
 * Uses the symbol registry if available, falls back to hardcoded SPREADS.
 */
function getSpread(symbol) {
  // Lazy-require to avoid circular dependency at module load time
  try {
    const db = require('../models');
    const cfg = db.symbolRegistry && db.symbolRegistry.get(symbol);
    if (cfg && cfg.spread !== undefined) return cfg.spread;
  } catch (_) { /* ignore */ }
  return SPREADS[symbol] || 0.0001;
}

function getDecimals(symbol) {
  if (symbol.includes('JPY')) return 3;
  if (symbol === 'XAUUSD') return 2;
  if (symbol === 'BTCUSD') return 2;
  if (symbol === 'ETHUSD') return 2;
  return 5;
}

/**
 * Generate `count` historical candles for a symbol/timeframe combination
 * ending at "now".
 */
function generateSimulatedCandles(symbol, timeframe, count = 200) {
  const tfSec = TIMEFRAME_SECONDS[timeframe] || 3600;
  const vol   = VOLATILITY[symbol] || 0.001;
  let price   = SEED_PRICES[symbol] || 1.0;

  const nowSec   = Math.floor(Date.now() / 1000);
  const startTime = barTime(nowSec, tfSec) - (count - 1) * tfSec;

  const result = [];
  for (let i = 0; i < count; i++) {
    const time  = startTime + i * tfSec;
    price       = Math.max(0.0001, price + randn() * vol);
    const open  = price;
    const close = Math.max(0.0001, price + randn() * vol * 0.5);
    const high  = Math.max(open, close) + Math.abs(randn() * vol * 0.3);
    const low   = Math.min(open, close) - Math.abs(randn() * vol * 0.3);
    const volume = Math.floor(100 + Math.random() * 900);
    result.push({ time, open, high, low, close, volume });
    price = close;
  }
  return result;
}

/**
 * Advance the simulator by one tick.
 * Returns `{ newCandle, quote }`.
 */
function simulateNextCandle(symbol, timeframe, existingCandles) {
  const tfSec   = TIMEFRAME_SECONDS[timeframe] || 3600;
  const vol     = VOLATILITY[symbol] || 0.001;
  const spread  = getSpread(symbol);
  const dec     = getDecimals(symbol);

  const nowSec         = Math.floor(Date.now() / 1000);
  const currentBarTime = barTime(nowSec, tfSec);

  const lastCandle = existingCandles[existingCandles.length - 1];
  const prevClose  = lastCandle ? lastCandle.close : (SEED_PRICES[symbol] || 1.0);

  const tick = Math.max(0.0001, prevClose + randn() * vol * 0.15);

  let newCandle;
  if (lastCandle && lastCandle.time === currentBarTime) {
    newCandle = {
      ...lastCandle,
      high:   Math.max(lastCandle.high, tick),
      low:    Math.min(lastCandle.low, tick),
      close:  tick,
      volume: lastCandle.volume + Math.floor(Math.random() * 10),
    };
  } else {
    newCandle = {
      time:   currentBarTime,
      open:   prevClose,
      high:   Math.max(prevClose, tick),
      low:    Math.min(prevClose, tick),
      close:  tick,
      volume: Math.floor(10 + Math.random() * 50),
    };
  }

  const bid = parseFloat(newCandle.close.toFixed(dec));
  const ask = parseFloat((bid + spread).toFixed(dec));

  return {
    newCandle,
    quote: { bid, ask, time: new Date().toISOString() },
  };
}

module.exports = {
  DEFAULT_SYMBOLS,
  SEED_PRICES,
  VOLATILITY,
  SPREADS,
  TIMEFRAME_SECONDS,
  generateSimulatedCandles,
  simulateNextCandle,
  getSpread,
  getDecimals,
};
