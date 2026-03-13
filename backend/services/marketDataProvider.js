/**
 * Market Data Provider — adapter layer.
 *
 * Abstracts the source of real-time market data so the WebSocket server and
 * the rest of the backend never depend on a specific data source.
 *
 * Built-in providers
 * ──────────────────
 *  • 'simulator'  – deterministic Gaussian random-walk (default, always available)
 *  • 'external'   – connect to a real liquidity provider / exchange REST+WS API
 *                   by setting MARKET_DATA_PROVIDER=external and the required
 *                   environment variables listed in .env.example.
 *
 * Adding a new provider
 * ─────────────────────
 * 1. Create backend/services/providers/<name>.js exporting { subscribe, getCandles }.
 * 2. Add the name to the PROVIDERS map below.
 * 3. Set MARKET_DATA_PROVIDER=<name> in your .env file.
 *
 * Interface expected from every provider module:
 *
 *   subscribe(symbols, onTick)
 *     Start streaming ticks. `onTick` is called with
 *     { symbol, bid, ask, time, candle, timeframe } for each tick.
 *     Returns a cleanup function () => void.
 *
 *   getCandles(symbol, timeframe, count)
 *     Returns a Promise<candle[]> where each candle is
 *     { time, open, high, low, close, volume }.
 */

const config = require('../config/config');
const simulatorProvider = require('./providers/simulatorProvider');

// Registry of available providers
const PROVIDERS = {
  simulator: simulatorProvider,
  // To add an external provider:
  // 1. Create backend/services/providers/externalProvider.js implementing
  //    the same interface: subscribe(symbols, onTick) and getCandles(symbol, tf, count).
  // 2. Set MARKET_DATA_PROVIDER=external in your .env file.
  // 3. Add required API keys (e.g., MARKET_API_KEY) to .env.example and config.js.
  // external: require('./providers/externalProvider'),
};

/**
 * Resolve which provider to use based on the MARKET_DATA_PROVIDER env var.
 * Falls back to the simulator if the requested provider is not registered.
 */
function resolveProvider() {
  const name = (config.marketDataProvider || 'simulator').toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) {
    console.warn(`[MarketDataProvider] Unknown provider "${name}", falling back to simulator.`);
    return PROVIDERS.simulator;
  }
  return provider;
}

const activeProvider = resolveProvider();

/**
 * Start streaming ticks for the given symbols.
 *
 * @param {string[]} symbols     List of symbols to subscribe to.
 * @param {Function} onTick      Called on every tick with tick data.
 * @returns {Function}           Cleanup / unsubscribe function.
 */
function subscribe(symbols, onTick) {
  return activeProvider.subscribe(symbols, onTick);
}

/**
 * Fetch historical OHLCV candles.
 *
 * @param {string} symbol
 * @param {string} timeframe   e.g. 'M1', 'H1', 'D1'
 * @param {number} [count=200]
 * @returns {Promise<object[]>}
 */
async function getCandles(symbol, timeframe, count = 200) {
  return activeProvider.getCandles(symbol, timeframe, count);
}

/** Name of the active provider (for health/debug endpoints). */
function providerName() {
  const name = (config.marketDataProvider || 'simulator').toLowerCase();
  return PROVIDERS[name] ? name : 'simulator';
}

module.exports = { subscribe, getCandles, providerName };
