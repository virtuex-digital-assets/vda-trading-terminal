import axios from 'axios';

// CoinGecko IDs mapped from ticker symbols
const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  ADA: 'cardano',
};

const BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetch current prices for all supported assets.
 * Returns an object keyed by symbol: { BTC: { usd, usd_24h_change }, ... }
 */
export const fetchPrices = async () => {
  const ids = Object.values(COIN_IDS).join(',');
  const { data } = await axios.get(`${BASE_URL}/simple/price`, {
    params: { ids, vs_currencies: 'usd', include_24hr_change: true },
  });

  const result = {};
  for (const [symbol, id] of Object.entries(COIN_IDS)) {
    if (data[id]) {
      result[symbol] = {
        price: data[id].usd,
        change24h: data[id].usd_24h_change,
      };
    }
  }
  return result;
};

export const SUPPORTED_SYMBOLS = Object.keys(COIN_IDS);
