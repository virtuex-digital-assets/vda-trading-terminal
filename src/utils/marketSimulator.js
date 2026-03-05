/**
 * Market data simulator used when no live MT4 bridge is connected.
 * Generates realistic-looking OHLCV candles using a random-walk model.
 */

import { getSpread } from './constants';

// Seed prices for each symbol (realistic approximations)
const SEED_PRICES = {
  EURUSD: 1.0850,
  GBPUSD: 1.2650,
  USDJPY: 149.50,
  XAUUSD: 2020.0,
  USDCHF: 0.8950,
  AUDUSD: 0.6520,
  USDCAD: 1.3580,
  NZDUSD: 0.6090,
  BTCUSD: 52000.0,
  ETHUSD: 2800.0,
};

// Volatility (pip-per-bar σ relative to price)
const VOLATILITY = {
  EURUSD: 0.0008,
  GBPUSD: 0.001,
  USDJPY: 0.1,
  XAUUSD: 1.5,
  USDCHF: 0.0008,
  AUDUSD: 0.0009,
  USDCAD: 0.0009,
  NZDUSD: 0.0009,
  BTCUSD: 200,
  ETHUSD: 30,
};

const TIMEFRAME_SECONDS = {
  M1: 60,
  M5: 300,
  M15: 900,
  M30: 1800,
  H1: 3600,
  H4: 14400,
  D1: 86400,
  W1: 604800,
};

/** Gaussian random (Box-Muller) */
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Floor a Unix timestamp to the start of the current bar */
function barTime(ts, tfSeconds) {
  return Math.floor(ts / tfSeconds) * tfSeconds;
}

/**
 * Generate an array of OHLCV candles ending at 'now'.
 */
export function generateSimulatedCandles(symbol, timeframe, count) {
  const tfSec = TIMEFRAME_SECONDS[timeframe] || 3600;
  const vol = VOLATILITY[symbol] || 0.001;
  let price = SEED_PRICES[symbol] || 1.0;

  const nowSec = Math.floor(Date.now() / 1000);
  const startTime = barTime(nowSec, tfSec) - (count - 1) * tfSec;

  const candles = [];
  for (let i = 0; i < count; i++) {
    const time = startTime + i * tfSec;
    price = Math.max(0.0001, price + randn() * vol);
    const open = price;
    const close = Math.max(0.0001, price + randn() * vol * 0.5);
    const high = Math.max(open, close) + Math.abs(randn() * vol * 0.3);
    const low = Math.min(open, close) - Math.abs(randn() * vol * 0.3);
    const volume = Math.floor(100 + Math.random() * 900);
    candles.push({ time, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

/**
 * Advance the simulator by one tick.
 * Returns the updated last candle and a quote object.
 */
export function simulateNextCandle(symbol, timeframe, existingCandles) {
  const tfSec = TIMEFRAME_SECONDS[timeframe] || 3600;
  const vol = VOLATILITY[symbol] || 0.001;
  const spread = getSpread(symbol);

  const nowSec = Math.floor(Date.now() / 1000);
  const currentBarTime = barTime(nowSec, tfSec);

  const lastCandle = existingCandles[existingCandles.length - 1];
  const prevClose = lastCandle ? lastCandle.close : SEED_PRICES[symbol] || 1.0;

  // New tick price
  const tick = Math.max(0.0001, prevClose + randn() * vol * 0.15);

  let newCandle;
  if (lastCandle && lastCandle.time === currentBarTime) {
    // Update existing bar
    newCandle = {
      ...lastCandle,
      high: Math.max(lastCandle.high, tick),
      low: Math.min(lastCandle.low, tick),
      close: tick,
      volume: lastCandle.volume + Math.floor(Math.random() * 10),
    };
  } else {
    // Open new bar
    newCandle = {
      time: currentBarTime,
      open: prevClose,
      high: Math.max(prevClose, tick),
      low: Math.min(prevClose, tick),
      close: tick,
      volume: Math.floor(10 + Math.random() * 50),
    };
  }

  const bid = parseFloat(newCandle.close.toFixed(symbol.includes('JPY') ? 3 : 5));
  const ask = parseFloat((bid + spread).toFixed(symbol.includes('JPY') ? 3 : 5));

  return {
    newCandle,
    quote: { bid, ask, time: new Date().toISOString() },
  };
}

export function simulateQuote(symbol, lastPrice) {
  const vol = VOLATILITY[symbol] || 0.001;
  const spread = getSpread(symbol);
  const bid = Math.max(0.0001, lastPrice + randn() * vol * 0.1);
  const ask = bid + spread;
  return { bid, ask, time: new Date().toISOString() };
}


