import { PLACE_ORDER } from '../actions';

const initialState = {
  orders: [],
  nextId: 1,
};

const ordersReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLACE_ORDER: {
      const order = {
        ...action.payload,
        id: state.nextId,
        timestamp: new Date().toISOString(),
      };
      return { ...state, orders: [order, ...state.orders], nextId: state.nextId + 1 };
    }
    default:
      return state;
  }
};

export default ordersReducer;
