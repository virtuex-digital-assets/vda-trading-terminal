import marketReducer from '../store/reducers/marketReducer';
import { UPDATE_QUOTE, SET_ACTIVE_SYMBOL, SET_TIMEFRAME, SET_CANDLES, ADD_CANDLE } from '../store/actions/actionTypes';

describe('marketReducer', () => {
  const initial = marketReducer(undefined, {});

  it('returns the initial state', () => {
    expect(initial.activeSymbol).toBe('EURUSD');
    expect(initial.timeframe).toBe('H1');
    expect(Array.isArray(initial.symbols)).toBe(true);
    expect(initial.symbols.length).toBeGreaterThan(0);
    expect(typeof initial.quotes).toBe('object');
    expect(typeof initial.candles).toBe('object');
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

  it('handles SET_CANDLES', () => {
    const candles = [
      { time: '2024-01-01T00:00:00Z', open: 1.08, high: 1.09, low: 1.07, close: 1.085, volume: 100 },
    ];
    const state = marketReducer(initial, { type: SET_CANDLES, payload: { symbol: 'EURUSD', timeframe: 'H1', candles } });
    expect(state.candles['EURUSD_H1']).toEqual(candles);
  });

  it('handles ADD_CANDLE (append new candle)', () => {
    const existing = [{ time: '2024-01-01T00:00:00Z', open: 1.08, high: 1.09, low: 1.07, close: 1.085, volume: 100 }];
    const s1 = marketReducer(initial, { type: SET_CANDLES, payload: { symbol: 'EURUSD', timeframe: 'H1', candles: existing } });
    const newCandle = { time: '2024-01-01T01:00:00Z', open: 1.085, high: 1.09, low: 1.084, close: 1.088, volume: 80 };
    const s2 = marketReducer(s1, { type: ADD_CANDLE, payload: { symbol: 'EURUSD', timeframe: 'H1', candle: newCandle } });
    expect(s2.candles['EURUSD_H1']).toHaveLength(2);
    expect(s2.candles['EURUSD_H1'][1]).toEqual(newCandle);
  });

  it('handles ADD_CANDLE (update last candle on same timestamp)', () => {
    const existing = [{ time: '2024-01-01T00:00:00Z', open: 1.08, high: 1.09, low: 1.07, close: 1.085, volume: 100 }];
    const s1 = marketReducer(initial, { type: SET_CANDLES, payload: { symbol: 'EURUSD', timeframe: 'H1', candles: existing } });
    const updatedCandle = { time: '2024-01-01T00:00:00Z', open: 1.08, high: 1.092, low: 1.07, close: 1.090, volume: 150 };
    const s2 = marketReducer(s1, { type: ADD_CANDLE, payload: { symbol: 'EURUSD', timeframe: 'H1', candle: updatedCandle } });
    expect(s2.candles['EURUSD_H1']).toHaveLength(1);
    expect(s2.candles['EURUSD_H1'][0].close).toBe(1.090);
  });
});
