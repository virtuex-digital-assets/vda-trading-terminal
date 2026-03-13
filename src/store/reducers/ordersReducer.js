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
      // Use server-assigned ticket when available (backend mode), otherwise
      // generate a client-side ticket for simulator mode.
      const ticket = action.payload.ticket ?? ++ticketCounter;
      const order = {
        ...action.payload,
        ticket,
        openTime: action.payload.openTime ?? new Date().toISOString(),
        profit: action.payload.profit ?? 0,
      };
      if (order.type === 'BUY' || order.type === 'SELL') {
        return { ...state, openOrders: [...state.openOrders, order] };
      }
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

    // ── Backend sync ──────────────────────────────────────────────────────

    case SET_ORDERS: {
      // Replace entire orders state with data from the backend.
      const { open = [], pending = [], history = [] } = action.payload;
      return { ...state, openOrders: open, pendingOrders: pending, history };
    }

    case ADD_HISTORY_ORDER: {
      // Prepend a single closed order returned by the REST close endpoint.
      return { ...state, history: [action.payload, ...state.history] };
    }

    default:
      return state;
  }
};

export default ordersReducer;
