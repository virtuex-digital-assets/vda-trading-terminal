// Shared spread values (in price units) for each symbol
export const SPREADS = {
  EURUSD: 0.0001,
  GBPUSD: 0.0002,
  USDJPY: 0.02,
  XAUUSD: 0.3,
  USDCHF: 0.0002,
  AUDUSD: 0.0002,
  USDCAD: 0.0002,
  NZDUSD: 0.0003,
  BTCUSD: 5.0,
  ETHUSD: 0.5,
};

export function getSpread(symbol) {
  return SPREADS[symbol] || 0.0001;
}

/**
 * Return the number of decimal places used when formatting prices for a symbol.
 * JPY pairs: 3, Gold: 2, Crypto: 2, others: 5.
 */
export function getPricePrecision(symbol) {
  if (!symbol) return 5;
  if (symbol.includes('JPY')) return 3;
  if (symbol === 'XAUUSD') return 2;
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') return 2;
  return 5;
}

/**
 * Contract size per 1 standard lot for each symbol.
 * Forex: 100,000 units of base currency.
 * Gold (XAUUSD): 100 troy oz.
 * Crypto: 1 unit.
 */
export const CONTRACT_SIZES = {
  EURUSD: 100000,
  GBPUSD: 100000,
  USDJPY: 100000,
  XAUUSD: 100,
  USDCHF: 100000,
  AUDUSD: 100000,
  USDCAD: 100000,
  NZDUSD: 100000,
  BTCUSD: 1,
  ETHUSD: 1,
};

/**
 * Calculate required margin in USD for a trade.
 *
 * For quote-USD pairs (EURUSD, GBPUSD, AUDUSD, NZDUSD, XAUUSD, BTCUSD, ETHUSD):
 *   margin = openPrice * lots * contractSize / leverage
 * For USD-base pairs (USDJPY, USDCHF, USDCAD):
 *   margin = lots * contractSize / leverage  (already in USD)
 */
export function calculateMargin(symbol, lots, openPrice, leverage) {
  const contractSize = CONTRACT_SIZES[symbol] || 100000;
  const lev = leverage || 100;
  // USD-base pairs: base is USD so margin is simply notional / leverage
  const usdBasePairs = ['USDJPY', 'USDCHF', 'USDCAD'];
  if (usdBasePairs.includes(symbol)) {
    return parseFloat(((lots * contractSize) / lev).toFixed(2));
  }
  // All others: base quoted in a foreign currency, need open price to convert
  return parseFloat(((openPrice * lots * contractSize) / lev).toFixed(2));
}

/**
 * Calculate realised/floating P&L in USD.
 *
 * For most pairs the P&L is: direction * (closePrice - openPrice) * lots * contractSize
 * For USD-base pairs (USDJPY, USDCHF, USDCAD) the raw P&L is in the quote
 * currency so we divide by the current close price to convert to USD.
 */
export function calculateProfit(symbol, type, openPrice, closePrice, lots) {
  const direction = type === 'BUY' ? 1 : -1;
  const contractSize = CONTRACT_SIZES[symbol] || 100000;
  const usdBasePairs = ['USDJPY', 'USDCHF', 'USDCAD'];
  let profit;
  if (usdBasePairs.includes(symbol)) {
    // P&L in quote currency; divide by close to get USD
    profit = direction * (closePrice - openPrice) * lots * contractSize / closePrice;
  } else {
    profit = direction * (closePrice - openPrice) * lots * contractSize;
  }
  return parseFloat(profit.toFixed(2));
}
