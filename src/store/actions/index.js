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

// ── CRM actions ────────────────────────────────────────────────────────────
import {
  CRM_SET_VIEW,
  CRM_SELECT_CLIENT,
  CRM_ADD_CLIENT,
  CRM_UPDATE_CLIENT,
  CRM_SET_SEARCH,
  CRM_SET_STAGE_FILTER,
  CRM_ADD_NOTE,
  CRM_ADD_TRANSACTION,
} from './actionTypes';

export const crmSetView = (view) => ({ type: CRM_SET_VIEW, payload: view });
export const crmSelectClient = (id) => ({ type: CRM_SELECT_CLIENT, payload: id });
export const crmAddClient = (data) => ({ type: CRM_ADD_CLIENT, payload: data });
export const crmUpdateClient = (id, changes) => ({ type: CRM_UPDATE_CLIENT, payload: { id, changes } });
export const crmSetSearch = (query) => ({ type: CRM_SET_SEARCH, payload: query });
export const crmSetStageFilter = (stage) => ({ type: CRM_SET_STAGE_FILTER, payload: stage });
export const crmAddNote = (clientId, text, author) => ({ type: CRM_ADD_NOTE, payload: { clientId, text, author } });
export const crmAddTransaction = (clientId, txType, amount) => ({ type: CRM_ADD_TRANSACTION, payload: { clientId, txType, amount } });
