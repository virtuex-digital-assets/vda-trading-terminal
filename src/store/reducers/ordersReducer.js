import { PLACE_ORDER } from '../actions';

const initialState = {
  orders: [],
  nextId: 1,
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
      // If the order already has a ticket (e.g. confirmed by backend) use it;
      // otherwise generate a new one for simulator/optimistic mode.
      const ticket = action.payload.ticket || ++ticketCounter;
      const openTime = action.payload.openTime || new Date().toISOString();
      const order = { ...action.payload, ticket, openTime, profit: action.payload.profit ?? 0 };
      const order = {
        ...action.payload,
        id: state.nextId,
        timestamp: new Date().toISOString(),
      };
      return { ...state, orders: [order, ...state.orders], nextId: state.nextId + 1 };
    }
      // Use server-supplied ticket if provided (backend mode), otherwise auto-generate
      const ticket = action.payload.ticket != null ? action.payload.ticket : ++ticketCounter;
      const order = { ...action.payload, ticket, openTime: action.payload.openTime || new Date().toISOString(), profit: action.payload.profit || 0 };
      // Use server-assigned ticket when available (backend mode), otherwise
      // generate a client-side ticket for simulator mode.
      const ticket = action.payload.ticket ?? ++ticketCounter;
      const order = {
        ...action.payload,
        ticket,
        openTime: action.payload.openTime ?? new Date().toISOString(),
        profit: action.payload.profit ?? 0,
      };
      // Use server-assigned ticket when available (backend mode), otherwise auto-generate
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
      const { open, pending, history } = action.payload;
    // ── Backend sync ──────────────────────────────────────────────────────

    case SET_ORDERS: {
      // Replace entire orders state with data from the backend.
      const { open = [], pending = [], history = [] } = action.payload;
      return { ...state, openOrders: open, pendingOrders: pending, history };
    }

    case ADD_HISTORY_ORDER: {
      return { ...state, history: [action.payload, ...state.history] };
      const order = action.payload;
      // Avoid duplicates by ticket number alone (closeTime may be absent)
      const exists = state.history.some((o) => o.ticket === order.ticket);
      if (exists) return state;
      return { ...state, history: [order, ...state.history] };
      // Prepend a single closed order returned by the REST close endpoint.
      return { ...state, history: [action.payload, ...state.history] };
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
