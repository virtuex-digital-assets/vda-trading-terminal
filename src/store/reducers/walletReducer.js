import { PLACE_ORDER } from '../actions/actionTypes';

const SUPPORTED_ASSETS = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA'];

const initialState = {
  usdBalance: 10000,
  holdings: {},
};

const walletReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLACE_ORDER: {
      const { symbol, side, quantity, price } = action.payload;
      const cost = quantity * price;

      if (!SUPPORTED_ASSETS.includes(symbol)) return state;

      if (side === 'BUY') {
        if (state.usdBalance < cost) return state;
        return {
          ...state,
          usdBalance: state.usdBalance - cost,
          holdings: {
            ...state.holdings,
            [symbol]: (state.holdings[symbol] || 0) + quantity,
          },
        };
      }

      if (side === 'SELL') {
        const currentQty = state.holdings[symbol] || 0;
        if (currentQty < quantity) return state;
        const newQty = currentQty - quantity;
        const newHoldings = { ...state.holdings };
        if (newQty === 0) {
          delete newHoldings[symbol];
        } else {
          newHoldings[symbol] = newQty;
        }
        return {
          ...state,
          usdBalance: state.usdBalance + cost,
          holdings: newHoldings,
        };
      }

      return state;
    }
    default:
      return state;
  }
};

export default walletReducer;
