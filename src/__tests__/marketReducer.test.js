import marketReducer from '../store/reducers/marketReducer';
import { updatePrices, setMarketError, setMarketLoading } from '../store/actions';

describe('marketReducer', () => {
  const initial = { prices: {}, loading: false, error: null };

  it('returns the initial state', () => {
    expect(marketReducer(undefined, {})).toEqual(initial);
  });

  it('sets loading flag', () => {
    const state = marketReducer(initial, setMarketLoading(true));
    expect(state.loading).toBe(true);
  });

  it('stores prices and clears loading/error', () => {
    const prices = { BTC: { price: 50000, change24h: 1.5 } };
    const state = marketReducer({ ...initial, loading: true }, updatePrices(prices));
    expect(state.prices).toEqual(prices);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('stores error and clears loading', () => {
    const state = marketReducer({ ...initial, loading: true }, setMarketError('Network error'));
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });
});
