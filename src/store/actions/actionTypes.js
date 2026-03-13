// Redux action types for the MT4 trading terminal

// Market data
export const UPDATE_QUOTE = 'UPDATE_QUOTE';
export const SET_ACTIVE_SYMBOL = 'SET_ACTIVE_SYMBOL';
export const ADD_CANDLE = 'ADD_CANDLE';
export const SET_CANDLES = 'SET_CANDLES';
export const SET_TIMEFRAME = 'SET_TIMEFRAME';

// Orders
export const PLACE_ORDER = 'PLACE_ORDER';
export const CLOSE_ORDER = 'CLOSE_ORDER';
export const MODIFY_ORDER = 'MODIFY_ORDER';
export const UPDATE_ORDER_PROFIT = 'UPDATE_ORDER_PROFIT';
export const CANCEL_PENDING_ORDER = 'CANCEL_PENDING_ORDER';
// Bulk-load orders from backend; add a single closed order to history
export const SET_ORDERS = 'SET_ORDERS';
export const ADD_HISTORY_ORDER = 'ADD_HISTORY_ORDER';

// Account
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const SET_LEVERAGE = 'SET_LEVERAGE';

// Connection
export const SET_CONNECTION_STATUS = 'SET_CONNECTION_STATUS';

// Terminal log
export const ADD_LOG = 'ADD_LOG';
export const CLEAR_LOG = 'CLEAR_LOG';

// CRM
export const CRM_SET_VIEW = 'CRM_SET_VIEW';
export const CRM_SELECT_CLIENT = 'CRM_SELECT_CLIENT';
export const CRM_ADD_CLIENT = 'CRM_ADD_CLIENT';
export const CRM_UPDATE_CLIENT = 'CRM_UPDATE_CLIENT';
export const CRM_SET_SEARCH = 'CRM_SET_SEARCH';
export const CRM_SET_STAGE_FILTER = 'CRM_SET_STAGE_FILTER';
export const CRM_ADD_NOTE = 'CRM_ADD_NOTE';
export const CRM_ADD_TRANSACTION = 'CRM_ADD_TRANSACTION';
export const CRM_DELETE_CLIENT = 'CRM_DELETE_CLIENT';
export const CRM_SET_REP_FILTER = 'CRM_SET_REP_FILTER';
export const CRM_IMPORT_CLIENTS = 'CRM_IMPORT_CLIENTS';
