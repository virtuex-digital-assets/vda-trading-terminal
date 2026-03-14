/**
 * Risk Engine – A-Book / B-Book routing, exposure monitoring, and auto-hedging.
 *
 * A-Book: trade is hedged with a liquidity provider (LP); broker earns markup only.
 * B-Book: trade is internalised; broker is counterparty and profits from trader losses.
 *
 * Routing decision factors:
 *  – trader profitability score  (profitable traders → A-book)
 *  – position size               (large positions → A-book)
 *  – broker exposure limit       (when exposure exceeds threshold → A-book hedge)
 *  – broker setting              (force A-book / force B-book / auto)
 */

const db = require('../models');

// ── Configuration ──────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  // Exposure threshold in USD before auto-hedging triggers
  maxNetExposureUsd: 500_000,
  // Trader profit score threshold above which we A-book the trader
  profitableTraderThreshold: 0.6,
  // Lot size above which we always A-book
  largePositionLots: 5,
  // Default routing mode: 'auto' | 'a-book' | 'b-book'
  defaultRoutingMode: 'auto',
  // Stop-out margin level %
  stopOutLevel: 20,
};

const riskConfig = { ...DEFAULT_CONFIG };

// ── Trader profitability tracking ──────────────────────────────────────────

// userId → { totalTrades, profitableTrades, totalPnL }
const traderStats = new Map();

function updateTraderStats(userId, pnl) {
  const stats = traderStats.get(userId) || { totalTrades: 0, profitableTrades: 0, totalPnL: 0 };
  stats.totalTrades += 1;
  if (pnl > 0) stats.profitableTrades += 1;
  stats.totalPnL += pnl;
  traderStats.set(userId, stats);
}

function getTraderProfitScore(userId) {
  const stats = traderStats.get(userId);
  if (!stats || stats.totalTrades === 0) return 0;
  return stats.profitableTrades / stats.totalTrades;
}

// ── Exposure tracking ──────────────────────────────────────────────────────

// symbol → { netLots, netUsd, buyLots, sellLots }
const symbolExposure = new Map();

function updateExposure(symbol, lots, type, price, contractSize) {
  const exp = symbolExposure.get(symbol) || { netLots: 0, netUsd: 0, buyLots: 0, sellLots: 0 };
  const usdValue = lots * contractSize * price;
  if (type === 'BUY') {
    exp.buyLots += lots;
    exp.netLots += lots;
    exp.netUsd += usdValue;
  } else {
    exp.sellLots += lots;
    exp.netLots -= lots;
    exp.netUsd -= usdValue;
  }
  symbolExposure.set(symbol, exp);
}

function removeExposure(symbol, lots, type, price, contractSize) {
  const exp = symbolExposure.get(symbol);
  if (!exp) return;
  const usdValue = lots * contractSize * price;
  if (type === 'BUY') {
    exp.buyLots  = Math.max(0, exp.buyLots - lots);
    exp.netLots -= lots;
    exp.netUsd  -= usdValue;
  } else {
    exp.sellLots = Math.max(0, exp.sellLots - lots);
    exp.netLots += lots;
    exp.netUsd  += usdValue;
  }
  symbolExposure.set(symbol, exp);
}

function getExposureSummary() {
  const result = [];
  for (const [symbol, exp] of symbolExposure.entries()) {
    result.push({ symbol, ...exp });
  }
  return result;
}

function getTotalNetExposureUsd() {
  let total = 0;
  for (const exp of symbolExposure.values()) {
    total += Math.abs(exp.netUsd);
  }
  return total;
}

// ── Routing decision ───────────────────────────────────────────────────────

/**
 * Determine whether a new order should be routed to A-book (LP) or B-book (internal).
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.symbol
 * @param {number} params.lots
 * @param {string} params.type  'BUY' | 'SELL'
 * @param {number} params.price
 * @param {number} params.contractSize
 * @returns {{ book: 'a-book' | 'b-book', reason: string }}
 */
function routeOrder({ userId, symbol, lots, type, price, contractSize }) {
  const mode = riskConfig.defaultRoutingMode;

  if (mode === 'a-book') return { book: 'a-book', reason: 'forced a-book' };
  if (mode === 'b-book') return { book: 'b-book', reason: 'forced b-book' };

  // Auto routing
  const profitScore = getTraderProfitScore(userId);
  if (profitScore >= riskConfig.profitableTraderThreshold) {
    return { book: 'a-book', reason: `trader profit score ${profitScore.toFixed(2)} exceeds threshold` };
  }

  if (lots >= riskConfig.largePositionLots) {
    return { book: 'a-book', reason: `large position ${lots} lots` };
  }

  const netExposure = getTotalNetExposureUsd();
  if (netExposure + lots * (contractSize || 100000) * price > riskConfig.maxNetExposureUsd) {
    return { book: 'a-book', reason: `net exposure ${netExposure.toFixed(0)} exceeds limit` };
  }

  return { book: 'b-book', reason: 'standard internalization' };
}

// ── Order book tracking ────────────────────────────────────────────────────

// ticket → { book, reason, hedgeRef }
const orderBookMapping = new Map();

function recordOrderRouting(ticket, book, reason) {
  orderBookMapping.set(String(ticket), { book, reason, hedgeRef: null, ts: new Date().toISOString() });
}

function getOrderRouting(ticket) {
  return orderBookMapping.get(String(ticket)) || null;
}

// ── Stop-out check ─────────────────────────────────────────────────────────

/**
 * Check whether an account should be stopped out.
 * @param {object} account
 * @returns {boolean}
 */
function shouldStopOut(account) {
  if (account.margin === 0) return false;
  const marginLevel = (account.equity / account.margin) * 100;
  return marginLevel <= riskConfig.stopOutLevel;
}

// ── Risk report ────────────────────────────────────────────────────────────

function getRiskReport() {
  const exposure = getExposureSummary();
  const totalNetUsd = getTotalNetExposureUsd();
  const openOrders = [...db.openOrders.values()];
  const totalOpenPnL = openOrders.reduce((s, o) => s + (o.profit || 0), 0);
  const aBookOrders = [...orderBookMapping.values()].filter((m) => m.book === 'a-book').length;
  const bBookOrders = [...orderBookMapping.values()].filter((m) => m.book === 'b-book').length;

  return {
    totalNetExposureUsd: totalNetUsd,
    totalOpenPnL,
    exposure,
    orderRouting: { aBook: aBookOrders, bBook: bBookOrders },
    config: riskConfig,
    stopOutLevel: riskConfig.stopOutLevel,
    ts: new Date().toISOString(),
  };
}

function updateRiskConfig(updates) {
  Object.assign(riskConfig, updates);
}

module.exports = {
  routeOrder,
  updateExposure,
  removeExposure,
  recordOrderRouting,
  getOrderRouting,
  updateTraderStats,
  getTraderProfitScore,
  shouldStopOut,
  getRiskReport,
  updateRiskConfig,
  riskConfig,
};
