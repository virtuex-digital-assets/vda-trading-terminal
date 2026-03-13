import marketReducer from '../store/reducers/marketReducer';
import { setCandles, addCandle } from '../store/actions';
import { SET_CANDLES, ADD_CANDLE } from '../store/actions/actionTypes';

describe('marketReducer', () => {
  const initial = marketReducer(undefined, {});

  it('returns the initial state', () => {
    expect(initial.activeSymbol).toBe('EURUSD');
    expect(initial.timeframe).toBe('H1');
    expect(Array.isArray(initial.symbols)).toBe(true);
    expect(initial.candles).toEqual({});
  });

  it('stores candles via SET_CANDLES', () => {
    const candles = [
      { time: '2024-01-01T00:00:00Z', open: 1.085, high: 1.086, low: 1.084, close: 1.0855, volume: 100 },
    ];
    const state = marketReducer(initial, setCandles('EURUSD', 'H1', candles));
    expect(state.candles['EURUSD_H1']).toEqual(candles);
  });

  it('appends a new candle via ADD_CANDLE', () => {
    const first  = { time: '2024-01-01T00:00:00Z', open: 1.085, high: 1.086, low: 1.084, close: 1.0855, volume: 100 };
    const second = { time: '2024-01-01T01:00:00Z', open: 1.0855, high: 1.087, low: 1.084, close: 1.086, volume: 120 };
    let state = marketReducer(initial, setCandles('EURUSD', 'H1', [first]));
    state = marketReducer(state, addCandle('EURUSD', 'H1', second));
    expect(state.candles['EURUSD_H1']).toHaveLength(2);
    expect(state.candles['EURUSD_H1'][1]).toEqual(second);
  });

  it('updates the last candle when timestamp matches (ADD_CANDLE)', () => {
    const candle = { time: '2024-01-01T00:00:00Z', open: 1.085, high: 1.086, low: 1.084, close: 1.0855, volume: 100 };
    const updated = { ...candle, close: 1.0860, volume: 150 };
    let state = marketReducer(initial, setCandles('EURUSD', 'H1', [candle]));
    state = marketReducer(state, addCandle('EURUSD', 'H1', updated));
    expect(state.candles['EURUSD_H1']).toHaveLength(1);
    expect(state.candles['EURUSD_H1'][0].close).toBe(1.0860);
  });
});
