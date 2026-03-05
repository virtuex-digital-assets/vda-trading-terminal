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
