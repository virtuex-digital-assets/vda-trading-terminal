import {
  UPDATE_QUOTE,
  SET_ACTIVE_SYMBOL,
  ADD_CANDLE,
  SET_CANDLES,
  SET_TIMEFRAME,
  PLACE_ORDER,
  CLOSE_ORDER,
  MODIFY_ORDER,
  UPDATE_ORDER_PROFIT,
  UPDATE_ACCOUNT,
  SET_LEVERAGE,
  SET_CONNECTION_STATUS,
  ADD_LOG,
  CLEAR_LOG,
} from './actionTypes';

// ── Market data actions ────────────────────────────────────────────────────
export const updateQuote = (symbol, bid, ask, time) => ({
  type: UPDATE_QUOTE,
  payload: { symbol, bid, ask, time },
});

export const setActiveSymbol = (symbol) => ({
  type: SET_ACTIVE_SYMBOL,
  payload: symbol,
});

export const setCandles = (symbol, timeframe, candles) => ({
  type: SET_CANDLES,
  payload: { symbol, timeframe, candles },
});

export const addCandle = (symbol, timeframe, candle) => ({
  type: ADD_CANDLE,
  payload: { symbol, timeframe, candle },
});

export const setTimeframe = (timeframe) => ({
  type: SET_TIMEFRAME,
  payload: timeframe,
});

// ── Order actions ──────────────────────────────────────────────────────────
export const placeOrder = (order) => ({
  type: PLACE_ORDER,
  payload: order,
});

export const closeOrder = (ticket) => ({
  type: CLOSE_ORDER,
  payload: ticket,
});

export const modifyOrder = (ticket, sl, tp) => ({
  type: MODIFY_ORDER,
  payload: { ticket, sl, tp },
});

export const updateOrderProfit = (ticket, profit) => ({
  type: UPDATE_ORDER_PROFIT,
  payload: { ticket, profit },
});

// ── Account actions ────────────────────────────────────────────────────────
export const updateAccount = (accountData) => ({
  type: UPDATE_ACCOUNT,
  payload: accountData,
});

export const setLeverage = (leverage) => ({
  type: SET_LEVERAGE,
  payload: leverage,
});

// ── Connection actions ─────────────────────────────────────────────────────
export const setConnectionStatus = (status) => ({
  type: SET_CONNECTION_STATUS,
  payload: status,
});

// ── Terminal log actions ───────────────────────────────────────────────────
export const addLog = (level, message) => ({
  type: ADD_LOG,
  payload: { level, message, time: new Date().toISOString() },
});

export const clearLog = () => ({ type: CLEAR_LOG });
