import { UPDATE_PRICES, SET_MARKET_ERROR, SET_MARKET_LOADING } from '../actions';

const initialState = {
  prices: {},
  loading: false,
  error: null,
import { UPDATE_QUOTE, SET_ACTIVE_SYMBOL, SET_CANDLES, ADD_CANDLE, SET_TIMEFRAME } from '../actions/actionTypes';

// Default symbols available in the terminal
const DEFAULT_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'BTCUSD', 'ETHUSD'];

const initialState = {
  symbols: DEFAULT_SYMBOLS,
  quotes: DEFAULT_SYMBOLS.reduce((acc, sym) => {
    acc[sym] = { bid: 0, ask: 0, time: null, change: 0, changePercent: 0 };
    return acc;
  }, {}),
  activeSymbol: 'EURUSD',
  timeframe: 'H1',
  candles: {},   // { 'EURUSD_H1': [ { time, open, high, low, close, volume } ] }
};

const marketReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MARKET_LOADING:
      return { ...state, loading: action.payload };
    case SET_MARKET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case UPDATE_PRICES:
      return { ...state, prices: action.payload, loading: false, error: null };
    case UPDATE_QUOTE: {
      const { symbol, bid, ask, time } = action.payload;
      const prev = state.quotes[symbol] || {};
      const prevBid = prev.bid || bid;
      const change = bid - prevBid;
      const changePercent = prevBid !== 0 ? (change / prevBid) * 100 : 0;
      return {
        ...state,
        quotes: {
          ...state.quotes,
          [symbol]: { bid, ask, time, change, changePercent },
        },
      };
    }

    case SET_ACTIVE_SYMBOL:
      return { ...state, activeSymbol: action.payload };

    case SET_TIMEFRAME:
      return { ...state, timeframe: action.payload };

    case SET_CANDLES: {
      const { symbol, timeframe, candles } = action.payload;
      const key = `${symbol}_${timeframe}`;
      return { ...state, candles: { ...state.candles, [key]: candles } };
    }

    case ADD_CANDLE: {
      const { symbol, timeframe, candle } = action.payload;
      const key = `${symbol}_${timeframe}`;
      const existing = state.candles[key] || [];
      const last = existing[existing.length - 1];
      // If same timestamp, update the last candle; otherwise append
      const updated =
        last && last.time === candle.time
          ? [...existing.slice(0, -1), candle]
          : [...existing, candle];
      return { ...state, candles: { ...state.candles, [key]: updated } };
    }

    default:
      return state;
  }
};

export default marketReducer;
