/**
 * Tests for the core trading engine (order placement, closure, margin calc).
 */

const { calculateMargin, calculatePnL } = require('../utils/margin');
const tradingEngine = require('../services/tradingEngine');
const db = require('../models');

// Seed a test account + quotes before tests
let testAccountId;

beforeAll(() => {
  // Create a test user + account
  const user = db.createUser('test@vda.trade', 'Test1234!', 'Test Trader', 'trader');
  const account = db.createAccount(user.id, { balance: 10000, equity: 10000, freeMargin: 10000, leverage: 100 });
  testAccountId = account.id;

  // Seed quotes
  db.quotes.set('EURUSD', { bid: 1.08500, ask: 1.08510, time: new Date().toISOString() });
  db.quotes.set('USDJPY', { bid: 149.500, ask: 149.520, time: new Date().toISOString() });
  db.quotes.set('BTCUSD', { bid: 52000.0, ask: 52005.0, time: new Date().toISOString() });
});

// ── Margin calculator ──────────────────────────────────────────────────────

describe('calculateMargin', () => {
  test('EURUSD 0.1 lots @ 1.0850 with 100:1 leverage', () => {
    const margin = calculateMargin('EURUSD', 0.1, 1.0850, 100);
    expect(margin).toBeCloseTo(108.50, 1);
  });

  test('USDJPY 1 lot @ 149.50 with 100:1 leverage', () => {
    // USD is base currency → margin = 1 × 100,000 / 100 = 1,000 USD
    const margin = calculateMargin('USDJPY', 1.0, 149.50, 100);
    expect(margin).toBeCloseTo(1000.00, 1);
  });

  test('BTCUSD 0.1 lots @ 52000 with 10:1 leverage', () => {
    // contract size = 1 for crypto
    const margin = calculateMargin('BTCUSD', 0.1, 52000, 10);
    expect(margin).toBeCloseTo(520.00, 1);
  });
});

// ── P&L calculator ─────────────────────────────────────────────────────────

describe('calculatePnL', () => {
  test('BUY EURUSD 1 lot: +10 pip profit', () => {
    const pnl = calculatePnL('BUY', 'EURUSD', 1.0, 1.08500, 1.08600);
    expect(pnl).toBeCloseTo(100, 0);
  });

  test('SELL EURUSD 1 lot: 10 pip profit (price goes down)', () => {
    const pnl = calculatePnL('SELL', 'EURUSD', 1.0, 1.08600, 1.08500);
    expect(pnl).toBeCloseTo(100, 0);
  });

  test('BUY EURUSD 1 lot: loss when price drops', () => {
    const pnl = calculatePnL('BUY', 'EURUSD', 1.0, 1.08600, 1.08500);
    expect(pnl).toBeCloseTo(-100, 0);
  });

  test('SELL USDJPY 1 lot: profit when price drops', () => {
    const pnl = calculatePnL('SELL', 'USDJPY', 1.0, 149.50, 149.40);
    expect(pnl).toBeGreaterThan(0);
  });
});

// ── Order placement ────────────────────────────────────────────────────────

describe('tradingEngine.placeOrder', () => {
  test('places a BUY market order successfully', () => {
    const result = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0.1,
    });
    expect(result.ok).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order.type).toBe('BUY');
    expect(result.order.symbol).toBe('EURUSD');
    expect(result.order.lots).toBe(0.1);
    expect(db.openOrders.has(result.order.ticket)).toBe(true);
  });

  test('places a SELL market order successfully', () => {
    const result = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'SELL',
      lots: 0.05,
    });
    expect(result.ok).toBe(true);
    expect(result.order.type).toBe('SELL');
  });

  test('rejects order with invalid lots', () => {
    const result = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/invalid lot/i);
  });

  test('rejects order for unknown account', () => {
    const result = tradingEngine.placeOrder({
      accountId: 'non-existent',
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0.1,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/account not found/i);
  });

  test('places a pending BUY LIMIT order', () => {
    const result = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY LIMIT',
      lots: 0.1,
      price: 1.08000,
    });
    expect(result.ok).toBe(true);
    expect(db.pendingOrders.has(result.order.ticket)).toBe(true);
  });
});

// ── Order closure ──────────────────────────────────────────────────────────

describe('tradingEngine.closeOrder', () => {
  test('closes an open order and records profit', () => {
    // First place an order
    const { order } = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0.1,
    });
    expect(order).toBeDefined();

    const result = tradingEngine.closeOrder(order.ticket);
    expect(result.ok).toBe(true);
    expect(db.openOrders.has(order.ticket)).toBe(false);
    expect(db.closedOrders.has(order.ticket)).toBe(true);
  });

  test('returns error for non-existent ticket', () => {
    const result = tradingEngine.closeOrder(99999);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });
});

// ── Order modification ─────────────────────────────────────────────────────

describe('tradingEngine.modifyOrder', () => {
  test('modifies SL/TP of an open order', () => {
    const { order } = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0.1,
    });
    const result = tradingEngine.modifyOrder(order.ticket, { sl: 1.08000, tp: 1.09000 });
    expect(result.ok).toBe(true);
    expect(result.order.sl).toBe(1.08000);
    expect(result.order.tp).toBe(1.09000);
  });
});
