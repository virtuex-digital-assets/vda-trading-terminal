import { formatPrice, formatProfit, formatDateTime } from '../utils/formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('formats EURUSD to 5 decimal places', () => {
      expect(formatPrice('EURUSD', 1.08501)).toBe('1.08501');
    });

    it('formats USDJPY to 3 decimal places', () => {
      expect(formatPrice('USDJPY', 149.503)).toBe('149.503');
    });

    it('formats XAUUSD to 2 decimal places', () => {
      expect(formatPrice('XAUUSD', 2020.5)).toBe('2020.50');
    });

    it('returns dash for null price', () => {
      expect(formatPrice('EURUSD', null)).toBe('—');
    });

    it('handles price of 0', () => {
      expect(formatPrice('EURUSD', 0)).toBe('0.00000');
    });
  });

  describe('formatProfit', () => {
    it('adds + prefix for positive values', () => {
      expect(formatProfit(123.45)).toBe('+123.45');
    });

    it('shows negative sign for negative values', () => {
      expect(formatProfit(-50.1)).toBe('-50.10');
    });

    it('returns dash for undefined', () => {
      expect(formatProfit(undefined)).toBe('—');
    });

    it('shows 0 as positive', () => {
      expect(formatProfit(0)).toBe('+0.00');
    });
  });

  describe('formatDateTime', () => {
    it('returns empty string for null', () => {
      expect(formatDateTime(null)).toBe('');
    });

    it('returns a non-empty string for a valid ISO string', () => {
      const result = formatDateTime('2024-01-15T10:30:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
