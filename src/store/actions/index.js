// Action types
export const PLACE_ORDER    = 'PLACE_ORDER';
export const UPDATE_PRICES  = 'UPDATE_PRICES';
export const SET_MARKET_ERROR = 'SET_MARKET_ERROR';
export const SET_MARKET_LOADING = 'SET_MARKET_LOADING';

// Action creators
export const placeOrder = (order) => ({ type: PLACE_ORDER, payload: order });

export const updatePrices = (prices) => ({ type: UPDATE_PRICES, payload: prices });

export const setMarketError = (error) => ({ type: SET_MARKET_ERROR, payload: error });

export const setMarketLoading = (loading) => ({ type: SET_MARKET_LOADING, payload: loading });
