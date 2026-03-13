/**
 * Backend configuration.
 * All values can be overridden via environment variables.
 */
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  wsPort: parseInt(process.env.WS_PORT || '5001', 10),

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'vda-trading-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Demo account defaults
  defaultBalance: parseFloat(process.env.DEFAULT_BALANCE || '10000'),
  defaultLeverage: parseInt(process.env.DEFAULT_LEVERAGE || '100', 10),

  // Simulator
  tickIntervalMs: parseInt(process.env.TICK_INTERVAL_MS || '500', 10),
  candleHistoryCount: parseInt(process.env.CANDLE_HISTORY_COUNT || '200', 10),

  // Market data provider: 'simulator' (default) | 'external'
  marketDataProvider: process.env.MARKET_DATA_PROVIDER || 'simulator',

  // CORS – origins allowed to call the REST API
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
};
