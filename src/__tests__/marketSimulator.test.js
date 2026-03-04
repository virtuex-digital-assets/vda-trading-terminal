import { generateSimulatedCandles, simulateNextCandle } from '../utils/marketSimulator';

describe('marketSimulator', () => {
  describe('generateSimulatedCandles', () => {
    it('generates the requested number of candles', () => {
      const candles = generateSimulatedCandles('EURUSD', 'H1', 100);
      expect(candles).toHaveLength(100);
    });

    it('each candle has required OHLCV fields', () => {
      const candles = generateSimulatedCandles('GBPUSD', 'M15', 10);
      candles.forEach((c) => {
        expect(typeof c.time).toBe('number');
        expect(typeof c.open).toBe('number');
        expect(typeof c.high).toBe('number');
        expect(typeof c.low).toBe('number');
        expect(typeof c.close).toBe('number');
        expect(typeof c.volume).toBe('number');
      });
    });

    it('high >= open, close and low <= open, close', () => {
      const candles = generateSimulatedCandles('EURUSD', 'H1', 50);
      candles.forEach((c) => {
        expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close) - 0.0001);
        expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close) + 0.0001);
      });
    });

    it('candle timestamps are sequential and spaced by timeframe', () => {
      const candles = generateSimulatedCandles('USDJPY', 'H1', 5);
      for (let i = 1; i < candles.length; i++) {
        expect(candles[i].time - candles[i - 1].time).toBe(3600);
      }
    });
  });

  describe('simulateNextCandle', () => {
    it('returns newCandle and quote objects', () => {
      const candles = generateSimulatedCandles('EURUSD', 'H1', 10);
      const result = simulateNextCandle('EURUSD', 'H1', candles);
      expect(result).toHaveProperty('newCandle');
      expect(result).toHaveProperty('quote');
    });

    it('quote has bid, ask and time', () => {
      const candles = generateSimulatedCandles('XAUUSD', 'H1', 10);
      const { quote } = simulateNextCandle('XAUUSD', 'H1', candles);
      expect(typeof quote.bid).toBe('number');
      expect(typeof quote.ask).toBe('number');
      expect(typeof quote.time).toBe('string');
    });

    it('ask is greater than bid (positive spread)', () => {
      const candles = generateSimulatedCandles('BTCUSD', 'H1', 10);
      const { quote } = simulateNextCandle('BTCUSD', 'H1', candles);
      expect(quote.ask).toBeGreaterThan(quote.bid);
    });
  });
});
