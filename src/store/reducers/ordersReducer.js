import { PLACE_ORDER, CLOSE_ORDER, MODIFY_ORDER, UPDATE_ORDER_PROFIT, CANCEL_PENDING_ORDER, SET_ORDERS, ADD_HISTORY_ORDER } from '../actions/actionTypes';

let ticketCounter = 1000;

const initialState = {
  openOrders: [],     // market orders currently open
  pendingOrders: [],  // limit / stop orders waiting to be triggered
  history: [],        // closed orders
};

const ordersReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLACE_ORDER: {
      const ticket = action.payload.ticket != null ? action.payload.ticket : ++ticketCounter;
      const order = {
        ...action.payload,
        ticket,
        openTime: action.payload.openTime || new Date().toISOString(),
        profit: action.payload.profit ?? 0,
      };
      // Avoid duplicates (backend WS may re-send an order we already have)
      const alreadyOpen    = state.openOrders.some((o) => o.ticket === ticket);
      const alreadyPending = state.pendingOrders.some((o) => o.ticket === ticket);
      if (order.type === 'BUY' || order.type === 'SELL') {
        if (alreadyOpen) return state;
        return { ...state, openOrders: [...state.openOrders, order] };
      }
      if (alreadyPending) return state;
      return { ...state, pendingOrders: [...state.pendingOrders, order] };
    }

    case CLOSE_ORDER: {
      const ticket = action.payload;
      const order = state.openOrders.find((o) => o.ticket === ticket);
      if (!order) return state;
      const closed = { ...order, closeTime: new Date().toISOString() };
      return {
        ...state,
        openOrders: state.openOrders.filter((o) => o.ticket !== ticket),
        history: [closed, ...state.history],
      };
    }

    case MODIFY_ORDER: {
      const { ticket, sl, tp } = action.payload;
      const updateList = (list) =>
        list.map((o) => (o.ticket === ticket ? { ...o, sl, tp } : o));
      return {
        ...state,
        openOrders: updateList(state.openOrders),
        pendingOrders: updateList(state.pendingOrders),
      };
    }

    case UPDATE_ORDER_PROFIT: {
      const { ticket, profit } = action.payload;
      return {
        ...state,
        openOrders: state.openOrders.map((o) =>
          o.ticket === ticket ? { ...o, profit } : o
        ),
      };
    }

    case CANCEL_PENDING_ORDER: {
      return {
        ...state,
        pendingOrders: state.pendingOrders.filter((o) => o.ticket !== action.payload),
      };
    }

    case SET_ORDERS: {
      // Replace order lists loaded from the backend (undefined keys are left unchanged)
      return {
        ...state,
        ...(action.payload.open    !== undefined && { openOrders:    action.payload.open }),
        ...(action.payload.pending !== undefined && { pendingOrders: action.payload.pending }),
        ...(action.payload.history !== undefined && { history:       action.payload.history }),
      };
    }

    case ADD_HISTORY_ORDER: {
      const order = action.payload;
      // Deduplicate: don't add if already present in history
      if (state.history.some((o) => o.ticket === order.ticket)) return state;
      // Remove from open orders if it's still there (close race)
      return {
        ...state,
        openOrders: state.openOrders.filter((o) => o.ticket !== order.ticket),
        history: [order, ...state.history],
      };
    }

    default:
      return state;
  }
};

export default ordersReducer;
