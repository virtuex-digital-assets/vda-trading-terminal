import { calculateMargin, calculateProfit } from '../utils/constants';

describe('calculateMargin', () => {
  it('calculates correct margin for EURUSD (quote-USD pair)', () => {
    // 0.1 lot EURUSD @ 1.0850, leverage 100
    // margin = 1.0850 * 0.1 * 100000 / 100 = $108.50
    const margin = calculateMargin('EURUSD', 0.1, 1.085, 100);
    expect(margin).toBeCloseTo(108.5, 1);
  });

  it('calculates correct margin for USDJPY (USD-base pair)', () => {
    // 0.1 lot USDJPY @ 149.50, leverage 100
    // margin = 0.1 * 100000 / 100 = $100 (not affected by JPY rate)
    const margin = calculateMargin('USDJPY', 0.1, 149.5, 100);
    expect(margin).toBeCloseTo(100, 1);
  });

  it('calculates correct margin for XAUUSD (gold, 100 oz per lot)', () => {
    // 0.1 lot XAUUSD @ 2020, leverage 100
    // margin = 2020 * 0.1 * 100 / 100 = $202
    const margin = calculateMargin('XAUUSD', 0.1, 2020, 100);
    expect(margin).toBeCloseTo(202, 1);
  });

  it('calculates correct margin for BTCUSD (crypto, 1 unit per lot)', () => {
    // 0.1 lot BTCUSD @ 52000, leverage 100
    // margin = 52000 * 0.1 * 1 / 100 = $52
    const margin = calculateMargin('BTCUSD', 0.1, 52000, 100);
    expect(margin).toBeCloseTo(52, 1);
  });

  it('uses leverage=100 as default when not provided', () => {
    const m1 = calculateMargin('EURUSD', 0.1, 1.085, 100);
    const m2 = calculateMargin('EURUSD', 0.1, 1.085, undefined);
    expect(m1).toBe(m2);
  });
});

describe('calculateProfit', () => {
  it('calculates correct profit for BUY EURUSD (quote-USD)', () => {
    // 0.1 lot BUY EURUSD, open 1.0850, close 1.0860 → 10 pips
    // profit = (1.0860 - 1.0850) * 0.1 * 100000 = $10
    const profit = calculateProfit('EURUSD', 'BUY', 1.085, 1.086, 0.1);
    expect(profit).toBeCloseTo(10, 0);
  });

  it('calculates correct profit for SELL EURUSD (quote-USD)', () => {
    // 0.1 lot SELL EURUSD, open 1.0860, close 1.0850 → 10 pips profit
    const profit = calculateProfit('EURUSD', 'SELL', 1.086, 1.085, 0.1);
    expect(profit).toBeCloseTo(10, 0);
  });

  it('calculates negative profit for losing trade', () => {
    // 0.1 lot BUY EURUSD, price goes down 10 pips
    const profit = calculateProfit('EURUSD', 'BUY', 1.086, 1.085, 0.1);
    expect(profit).toBeCloseTo(-10, 0);
  });

  it('calculates correct profit for USDJPY (USD-base pair)', () => {
    // 0.1 lot BUY USDJPY, open 149.50, close 149.60 (10 pips)
    // profit in JPY = (149.60 - 149.50) * 0.1 * 100000 = 1000 JPY
    // profit in USD = 1000 / 149.60 ≈ $6.68
    const profit = calculateProfit('USDJPY', 'BUY', 149.5, 149.6, 0.1);
    expect(profit).toBeGreaterThan(0);
    expect(profit).toBeCloseTo(6.68, 0);
  });

  it('calculates correct profit for XAUUSD (gold)', () => {
    // 0.1 lot BUY XAU, open 2020, close 2030 → $10 move
    // profit = 10 * 0.1 * 100 = $100
    const profit = calculateProfit('XAUUSD', 'BUY', 2020, 2030, 0.1);
    expect(profit).toBeCloseTo(100, 0);
  });

  it('calculates correct profit for BTCUSD (crypto)', () => {
    // 0.1 lot BUY BTC, open 52000, close 52100 → $100 move
    // profit = 100 * 0.1 * 1 = $10
    const profit = calculateProfit('BTCUSD', 'BUY', 52000, 52100, 0.1);
    expect(profit).toBeCloseTo(10, 0);
  });

  it('returns zero profit when open and close price are equal', () => {
    const profit = calculateProfit('EURUSD', 'BUY', 1.085, 1.085, 0.1);
    expect(profit).toBe(0);
  });
});
