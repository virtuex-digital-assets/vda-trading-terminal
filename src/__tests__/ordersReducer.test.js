import ordersReducer from '../store/reducers/ordersReducer';
import { placeOrder } from '../store/actions';

describe('ordersReducer', () => {
  it('returns the initial state', () => {
    expect(ordersReducer(undefined, {})).toEqual({ orders: [], nextId: 1 });
  });

  it('records a placed order', () => {
    const order = { symbol: 'BTC', side: 'BUY', quantity: 0.1, price: 50000 };
    const state = ordersReducer(undefined, placeOrder(order));
    expect(state.orders).toHaveLength(1);
    expect(state.orders[0]).toMatchObject(order);
    expect(state.orders[0].id).toBeDefined();
    expect(state.orders[0].timestamp).toBeDefined();
  });

  it('prepends new orders (most recent first)', () => {
    const first  = placeOrder({ symbol: 'BTC', side: 'BUY',  quantity: 0.1, price: 50000 });
    const second = placeOrder({ symbol: 'ETH', side: 'SELL', quantity: 1,   price: 3000  });
    let state = ordersReducer(undefined, first);
    state = ordersReducer(state, second);
    expect(state.orders[0].symbol).toBe('ETH');
    expect(state.orders[1].symbol).toBe('BTC');
  });
});
