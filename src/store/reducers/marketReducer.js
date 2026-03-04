import { UPDATE_PRICES, SET_MARKET_ERROR, SET_MARKET_LOADING } from '../actions';

const initialState = {
  prices: {},
  loading: false,
  error: null,
};

const marketReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MARKET_LOADING:
      return { ...state, loading: action.payload };
    case SET_MARKET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case UPDATE_PRICES:
      return { ...state, prices: action.payload, loading: false, error: null };
    default:
      return state;
  }
};

export default marketReducer;
