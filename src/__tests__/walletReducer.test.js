import walletReducer from '../store/reducers/walletReducer';
import { placeOrder } from '../store/actions';

const initialState = { usdBalance: 10000, holdings: {} };

describe('walletReducer', () => {
  it('returns the initial state', () => {
    expect(walletReducer(undefined, {})).toEqual(initialState);
  });

  it('deducts balance and adds holding on BUY', () => {
    const order = { symbol: 'BTC', side: 'BUY', quantity: 0.1, price: 50000 };
    const state = walletReducer(initialState, placeOrder(order));
    expect(state.usdBalance).toBeCloseTo(5000);
    expect(state.holdings['BTC']).toBeCloseTo(0.1);
  });

  it('does not allow BUY when balance is insufficient', () => {
    const order = { symbol: 'BTC', side: 'BUY', quantity: 1, price: 50000 };
    const state = walletReducer(initialState, placeOrder(order));
    expect(state).toEqual(initialState);
  });

  it('adds balance and removes holding on SELL', () => {
    const stateWithHolding = { usdBalance: 5000, holdings: { ETH: 1 } };
    const order = { symbol: 'ETH', side: 'SELL', quantity: 1, price: 3000 };
    const state = walletReducer(stateWithHolding, placeOrder(order));
    expect(state.usdBalance).toBeCloseTo(8000);
    expect(state.holdings['ETH']).toBeUndefined();
  });

  it('does not allow SELL when holding is insufficient', () => {
    const stateWithHolding = { usdBalance: 5000, holdings: { ETH: 0.5 } };
    const order = { symbol: 'ETH', side: 'SELL', quantity: 1, price: 3000 };
    const state = walletReducer(stateWithHolding, placeOrder(order));
    expect(state).toEqual(stateWithHolding);
  });

  it('ignores unsupported asset', () => {
    const order = { symbol: 'UNKNOWN', side: 'BUY', quantity: 1, price: 100 };
    const state = walletReducer(initialState, placeOrder(order));
    expect(state).toEqual(initialState);
  });
});
