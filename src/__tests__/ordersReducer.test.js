import ordersReducer from '../store/reducers/ordersReducer';
import { placeOrder, closeOrder, setOrders, addHistoryOrder } from '../store/actions';

describe('ordersReducer', () => {
  it('returns the initial state', () => {
    expect(ordersReducer(undefined, {})).toEqual({
      openOrders: [],
      pendingOrders: [],
      history: [],
    });
  });

  it('adds a BUY order to openOrders', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085 };
    const state = ordersReducer(undefined, placeOrder(order));
    expect(state.openOrders).toHaveLength(1);
    expect(state.openOrders[0]).toMatchObject(order);
    expect(state.openOrders[0].ticket).toBeDefined();
  });

  it('does not duplicate an order with the same ticket', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, ticket: 1001 };
    let state = ordersReducer(undefined, placeOrder(order));
    state = ordersReducer(state, placeOrder(order));
    expect(state.openOrders).toHaveLength(1);
  });

  it('moves order from openOrders to history on CLOSE_ORDER', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, ticket: 2001 };
    let state = ordersReducer(undefined, placeOrder(order));
    state = ordersReducer(state, closeOrder(2001));
    expect(state.openOrders).toHaveLength(0);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].ticket).toBe(2001);
  });
});
