import ordersReducer from '../store/reducers/ordersReducer';
import { PLACE_ORDER, CLOSE_ORDER, SET_ORDERS, ADD_HISTORY_ORDER, CANCEL_PENDING_ORDER } from '../store/actions/actionTypes';

describe('ordersReducer', () => {
  const initial = ordersReducer(undefined, {});

  it('returns the initial state', () => {
    expect(initial).toEqual({ openOrders: [], pendingOrders: [], history: [] });
  });

  it('records a placed market order in openOrders', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085 };
    const state = ordersReducer(undefined, { type: PLACE_ORDER, payload: order });
    expect(state.openOrders).toHaveLength(1);
    expect(state.openOrders[0].symbol).toBe('EURUSD');
    expect(state.openOrders[0].ticket).toBeDefined();
  });

  it('records a pending order in pendingOrders', () => {
    const order = { symbol: 'GBPUSD', type: 'BUY LIMIT', lots: 0.1, openPrice: 1.27 };
    const state = ordersReducer(undefined, { type: PLACE_ORDER, payload: order });
    expect(state.pendingOrders).toHaveLength(1);
    expect(state.openOrders).toHaveLength(0);
  });

  it('uses server-provided ticket when available', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085, ticket: 9999 };
    const state = ordersReducer(undefined, { type: PLACE_ORDER, payload: order });
    expect(state.openOrders[0].ticket).toBe(9999);
  });

  it('closes an open order and moves it to history', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085 };
    const s1 = ordersReducer(undefined, { type: PLACE_ORDER, payload: order });
    const ticket = s1.openOrders[0].ticket;
    const s2 = ordersReducer(s1, { type: CLOSE_ORDER, payload: ticket });
    expect(s2.openOrders).toHaveLength(0);
    expect(s2.history).toHaveLength(1);
  });

  it('cancels a pending order', () => {
    const order = { symbol: 'EURUSD', type: 'SELL STOP', lots: 0.1, openPrice: 1.08 };
    const s1 = ordersReducer(undefined, { type: PLACE_ORDER, payload: order });
    const ticket = s1.pendingOrders[0].ticket;
    const s2 = ordersReducer(s1, { type: CANCEL_PENDING_ORDER, payload: ticket });
    expect(s2.pendingOrders).toHaveLength(0);
  });

  it('replaces all orders via SET_ORDERS', () => {
    const open    = [{ ticket: 1, type: 'BUY',       symbol: 'EURUSD', lots: 0.1, openPrice: 1.085, profit: 0 }];
    const pending = [{ ticket: 2, type: 'BUY LIMIT', symbol: 'GBPUSD', lots: 0.1, openPrice: 1.27 }];
    const history = [{ ticket: 3, type: 'SELL',      symbol: 'USDJPY', lots: 0.2, openPrice: 147.5, profit: 50 }];
    const state = ordersReducer(initial, { type: SET_ORDERS, payload: { open, pending, history } });
    expect(state.openOrders).toHaveLength(1);
    expect(state.pendingOrders).toHaveLength(1);
    expect(state.history).toHaveLength(1);
  });

  it('adds a closed order to history via ADD_HISTORY_ORDER', () => {
    const closed = { ticket: 5, type: 'BUY', symbol: 'EURUSD', lots: 0.1, openPrice: 1.08, profit: 20 };
    const state = ordersReducer(initial, { type: ADD_HISTORY_ORDER, payload: closed });
    expect(state.history).toHaveLength(1);
    expect(state.history[0].ticket).toBe(5);
  });

  it('ADD_HISTORY_ORDER ignores duplicates', () => {
    const closed = { ticket: 5, type: 'BUY', symbol: 'EURUSD', lots: 0.1, openPrice: 1.08, profit: 20 };
    const s1 = ordersReducer(initial, { type: ADD_HISTORY_ORDER, payload: closed });
    const s2 = ordersReducer(s1, { type: ADD_HISTORY_ORDER, payload: closed });
    expect(s2.history).toHaveLength(1);
  });
});
