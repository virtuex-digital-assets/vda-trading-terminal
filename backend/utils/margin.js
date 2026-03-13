/**
 * Margin and P&L utilities.
 */

// Symbols whose base currency is USD – no price conversion needed for margin.
const USD_BASE_SYMBOLS = new Set(['USDJPY', 'USDCHF', 'USDCAD']);

// Precious metals – contract size is in ounces/units, not 100k.
const METAL_CONTRACT = { XAUUSD: 100 }; // 1 lot = 100 oz gold

/**
 * Calculate the required margin for a position (result in USD).
 *
 * Rules:
 *  • USD/xxx pairs (USDJPY, USDCHF, USDCAD): contract is 100,000 USD units →
 *      margin = lots × 100,000 / leverage
 *  • xxx/USD pairs (EURUSD, GBPUSD, …): margin = lots × 100,000 × price / leverage
 *  • XAUUSD: 1 lot = 100 oz → margin = lots × 100 × price / leverage
 *  • BTCUSD / ETHUSD: 1 lot = 1 coin → margin = lots × price / leverage
 *
 * @param {string} symbol
 * @param {number} lots
 * @param {number} openPrice
 * @param {number} leverage
 * @returns {number} required margin in USD
 */
function calculateMargin(symbol, lots, openPrice, leverage) {
  let notionalUSD;

  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') {
    notionalUSD = lots * openPrice;
  } else if (METAL_CONTRACT[symbol]) {
    notionalUSD = lots * METAL_CONTRACT[symbol] * openPrice;
  } else if (USD_BASE_SYMBOLS.has(symbol)) {
    // Base currency = USD: notional is already in USD
    notionalUSD = lots * 100000;
  } else {
    // Base currency is foreign (EURUSD, GBPUSD, …): price converts to USD
    notionalUSD = lots * 100000 * openPrice;
  }

  return parseFloat((notionalUSD / leverage).toFixed(2));
}

/**
 * Calculate the floating P&L for an open position (result in USD).
 *
 * @param {string} type     'BUY' | 'SELL'
 * @param {string} symbol
 * @param {number} lots
 * @param {number} openPrice
 * @param {number} currentPrice  Current bid (for BUY) or ask (for SELL)
 * @returns {number} profit/loss in USD
 */
function calculatePnL(type, symbol, lots, openPrice, currentPrice) {
  const isCrypto = symbol === 'BTCUSD' || symbol === 'ETHUSD';
  const isJPY    = symbol.includes('JPY');
  const isXAU    = symbol === 'XAUUSD';

  let priceDiff  = currentPrice - openPrice;
  if (type === 'SELL') priceDiff = -priceDiff;

  let pnl;
  if (isCrypto) {
    pnl = lots * priceDiff;
  } else if (isXAU) {
    pnl = lots * METAL_CONTRACT.XAUUSD * priceDiff;
  } else if (USD_BASE_SYMBOLS.has(symbol)) {
    // USD is base: P&L denominated in quote currency, convert back to USD
    const pipValue = isJPY ? 0.01 : 0.0001;
    const pips     = priceDiff / pipValue;
    // Each pip for USD-base pair = $1 per mini-lot (10,000 units) → $10 per std lot
    // More precisely: P&L_in_quote = priceDiff × lots × 100,000
    // P&L_in_USD = P&L_in_quote / currentPrice
    pnl = (priceDiff * lots * 100000) / currentPrice;
  } else {
    // xxx/USD pair: priceDiff is already in USD
    pnl = priceDiff * lots * 100000;
  }

  return parseFloat(pnl.toFixed(2));
}

module.exports = { calculateMargin, calculatePnL };
