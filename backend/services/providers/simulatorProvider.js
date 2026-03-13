/**
 * Simulator provider — wraps the existing Gaussian random-walk market simulator.
 *
 * This provider is the default data source when no external feed is configured.
 * It satisfies the MarketDataProvider interface:
 *   subscribe(symbols, onTick) → cleanup()
 *   getCandles(symbol, timeframe, count) → Promise<candle[]>
 */

const {
  generateSimulatedCandles,
  simulateNextCandle,
  DEFAULT_SYMBOLS,
  TIMEFRAME_SECONDS,
} = require('../marketSimulator');

const db = require('../../models');

// Per-symbol candle cache: 'SYMBOL_TF' → candle[]
const candleCache = new Map();

/**
 * Subscribe to tick updates for the given symbols.
 *
 * @param {string[]} symbols
 * @param {Function} onTick   Called with tick data on each interval
 * @returns {Function}        Cleanup function to stop the feed
 */
function subscribe(symbols, onTick) {
  const symbolList = symbols && symbols.length ? symbols : DEFAULT_SYMBOLS;
  const TIMEFRAME  = 'M1';
  const TICK_MS    = 1000; // generate a new tick every second

  // Seed historical candles for each symbol if not already cached
  symbolList.forEach((symbol) => {
    const key = `${symbol}_${TIMEFRAME}`;
    if (!candleCache.has(key)) {
      candleCache.set(key, generateSimulatedCandles(symbol, TIMEFRAME, 200));
    }
  });

  const timer = setInterval(() => {
    symbolList.forEach((symbol) => {
      const key     = `${symbol}_${TIMEFRAME}`;
      const candles = candleCache.get(key) || [];
      const { newCandle, quote } = simulateNextCandle(symbol, TIMEFRAME, candles);

      // Update in-place
      if (candles.length > 0 && candles[candles.length - 1].time === newCandle.time) {
        candles[candles.length - 1] = newCandle;
      } else {
        candles.push(newCandle);
        if (candles.length > 500) candles.shift();
      }
      candleCache.set(key, candles);

      // Persist to the shared db quote map so trading engine can use it
      db.quotes.set(symbol, { ...quote, symbol });

      onTick({ symbol, bid: quote.bid, ask: quote.ask, time: quote.time, candle: newCandle, timeframe: TIMEFRAME });
    });
  }, TICK_MS);

  // Prevent the timer from keeping the Node.js process alive in test
  // environments where Jest tears down the module registry before all
  // timers fire (avoids "Cannot use 'import' after environment teardown").
  if (timer.unref) timer.unref();

  return function cleanup() {
    clearInterval(timer);
  };
}

/**
 * Return historical candles for a symbol/timeframe.
 *
 * @param {string} symbol
 * @param {string} timeframe
 * @param {number} [count=200]
 * @returns {Promise<object[]>}
 */
async function getCandles(symbol, timeframe, count = 200) {
  const key = `${symbol}_${timeframe}`;
  if (candleCache.has(key) && timeframe === 'M1') {
    return candleCache.get(key).slice(-count);
  }
  return generateSimulatedCandles(symbol, timeframe, count);
}

module.exports = { subscribe, getCandles };
