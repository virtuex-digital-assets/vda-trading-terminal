import marketReducer from '../store/reducers/marketReducer';
import ordersReducer from '../store/reducers/ordersReducer';
import accountReducer from '../store/reducers/accountReducer';
import { UPDATE_QUOTE, SET_ACTIVE_SYMBOL, SET_TIMEFRAME, PLACE_ORDER, CLOSE_ORDER, UPDATE_ACCOUNT, SET_ORDERS, ADD_HISTORY_ORDER } from '../store/actions/actionTypes';

describe('marketReducer', () => {
  const initial = marketReducer(undefined, {});

  it('returns default state', () => {
    expect(initial.activeSymbol).toBe('EURUSD');
    expect(initial.timeframe).toBe('H1');
    expect(Array.isArray(initial.symbols)).toBe(true);
  });

  it('handles UPDATE_QUOTE', () => {
    const state = marketReducer(initial, {
      type: UPDATE_QUOTE,
      payload: { symbol: 'EURUSD', bid: 1.0850, ask: 1.0851, time: '2024-01-01T00:00:00Z' },
    });
    expect(state.quotes['EURUSD'].bid).toBe(1.0850);
    expect(state.quotes['EURUSD'].ask).toBe(1.0851);
  });

  it('handles SET_ACTIVE_SYMBOL', () => {
    const state = marketReducer(initial, { type: SET_ACTIVE_SYMBOL, payload: 'GBPUSD' });
    expect(state.activeSymbol).toBe('GBPUSD');
  });

  it('handles SET_TIMEFRAME', () => {
    const state = marketReducer(initial, { type: SET_TIMEFRAME, payload: 'M5' });
    expect(state.timeframe).toBe('M5');
  });
});

describe('ordersReducer', () => {
  const initial = ordersReducer(undefined, {});

  it('returns default empty state', () => {
    expect(initial.openOrders).toHaveLength(0);
    expect(initial.pendingOrders).toHaveLength(0);
    expect(initial.history).toHaveLength(0);
  });

  it('handles PLACE_ORDER (market BUY)', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085, sl: null, tp: null };
    const state = ordersReducer(initial, { type: PLACE_ORDER, payload: order });
    expect(state.openOrders).toHaveLength(1);
    expect(state.openOrders[0].symbol).toBe('EURUSD');
    expect(state.openOrders[0].ticket).toBeDefined();
  });

  it('handles PLACE_ORDER (pending BUY LIMIT)', () => {
    const order = { symbol: 'EURUSD', type: 'BUY LIMIT', lots: 0.1, openPrice: 1.080 };
    const state = ordersReducer(initial, { type: PLACE_ORDER, payload: order });
    expect(state.pendingOrders).toHaveLength(1);
    expect(state.openOrders).toHaveLength(0);
  });

  it('handles CLOSE_ORDER', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085 };
    const stateWithOrder = ordersReducer(initial, { type: PLACE_ORDER, payload: order });
    const ticket = stateWithOrder.openOrders[0].ticket;
    const closedState = ordersReducer(stateWithOrder, { type: CLOSE_ORDER, payload: ticket });
    expect(closedState.openOrders).toHaveLength(0);
    expect(closedState.history).toHaveLength(1);
  });

  it('handles PLACE_ORDER with server-provided ticket', () => {
    const order = { symbol: 'GBPUSD', type: 'BUY', lots: 0.5, openPrice: 1.27, ticket: 9999 };
    const state = ordersReducer(initial, { type: PLACE_ORDER, payload: order });
    expect(state.openOrders[0].ticket).toBe(9999);
  });

  it('handles SET_ORDERS', () => {
    const open    = [{ ticket: 1, type: 'BUY',   symbol: 'EURUSD', lots: 0.1, openPrice: 1.085, profit: 0 }];
    const pending = [{ ticket: 2, type: 'BUY LIMIT', symbol: 'GBPUSD', lots: 0.1, openPrice: 1.27 }];
    const history = [{ ticket: 3, type: 'SELL', symbol: 'USDJPY', lots: 0.2, openPrice: 147.5, closeTime: '2024-01-01T00:00:00Z', profit: 50 }];
    const state = ordersReducer(initial, { type: SET_ORDERS, payload: { open, pending, history } });
    expect(state.openOrders).toHaveLength(1);
    expect(state.pendingOrders).toHaveLength(1);
    expect(state.history).toHaveLength(1);
    expect(state.openOrders[0].ticket).toBe(1);
  });

  it('handles ADD_HISTORY_ORDER', () => {
    const closed = { ticket: 5, type: 'BUY', symbol: 'EURUSD', lots: 0.1, openPrice: 1.08, closeTime: '2024-02-01T00:00:00Z', profit: 20 };
    const state = ordersReducer(initial, { type: ADD_HISTORY_ORDER, payload: closed });
    expect(state.history).toHaveLength(1);
    expect(state.history[0].ticket).toBe(5);
  });

  it('ADD_HISTORY_ORDER ignores duplicates', () => {
    const closed = { ticket: 5, type: 'BUY', symbol: 'EURUSD', lots: 0.1, openPrice: 1.08, closeTime: '2024-02-01T00:00:00Z', profit: 20 };
    const s1 = ordersReducer(initial, { type: ADD_HISTORY_ORDER, payload: closed });
    const s2 = ordersReducer(s1, { type: ADD_HISTORY_ORDER, payload: closed });
    expect(s2.history).toHaveLength(1);
  it('handles PLACE_ORDER with server-assigned ticket (backend mode)', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085, ticket: 5001 };
    const state = ordersReducer(initial, { type: PLACE_ORDER, payload: order });
    expect(state.openOrders[0].ticket).toBe(5001);
  });

  it('handles SET_ORDERS (bulk replace from backend)', () => {
    const openOrder   = { ticket: 2001, symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085, profit: 0 };
    const pendOrder   = { ticket: 2002, symbol: 'EURUSD', type: 'BUY LIMIT', lots: 0.1, openPrice: 1.080 };
    const closedOrder = { ticket: 2000, symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085, closePrice: 1.086, profit: 10 };
    const state = ordersReducer(initial, {
      type: SET_ORDERS,
      payload: { open: [openOrder], pending: [pendOrder], history: [closedOrder] },
    });
    expect(state.openOrders).toHaveLength(1);
    expect(state.openOrders[0].ticket).toBe(2001);
    expect(state.pendingOrders).toHaveLength(1);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].profit).toBe(10);
  });

  it('handles ADD_HISTORY_ORDER', () => {
    const closed = { ticket: 3001, symbol: 'GBPUSD', type: 'SELL', lots: 0.5, profit: 25 };
    const state = ordersReducer(initial, { type: ADD_HISTORY_ORDER, payload: closed });
    expect(state.history).toHaveLength(1);
    expect(state.history[0].ticket).toBe(3001);
  });
});

describe('accountReducer', () => {
  const initial = accountReducer(undefined, {});

  it('returns default state', () => {
    expect(initial.balance).toBe(10000.0);
    expect(initial.leverage).toBe(100);
    expect(initial.currency).toBe('USD');
  });

  it('handles UPDATE_ACCOUNT', () => {
    const state = accountReducer(initial, {
      type: UPDATE_ACCOUNT,
      payload: { balance: 12000, equity: 12500 },
    });
    expect(state.balance).toBe(12000);
    expect(state.equity).toBe(12500);
    expect(state.leverage).toBe(100); // unchanged
  });
});
