/**
 * Core trading engine.
 *
 * Handles order placement, modification, closure, margin calculation,
 * P&L updates, stop-loss / take-profit trigger logic, and realistic
 * slippage simulation.
 *
 * All methods are synchronous and operate on the in-memory store.
 */

const db = require('../models');
const { calculateMargin, calculatePnL } = require('../utils/margin');
const config = require('../config/config');

// ── Slippage helpers ────────────────────────────────────────────────────────

/**
 * Apply realistic slippage to a market order execution price.
 *
 * Slippage is modelled as a random fraction of the symbol's spread:
 *   slip = spread × U[0, SLIP_FACTOR]
 * For a BUY the execution price is nudged UP (adverse); for a SELL it is
 * nudged DOWN.  This reflects the real-world behaviour of a market maker
 * widening quotes under fast-market conditions.
 *
 * @param {string}  symbol
 * @param {string}  type      'BUY' | 'SELL'
 * @param {number}  price     Raw mid/ask/bid price
 * @returns {number}  Slippage-adjusted execution price
 */
function applySlippage(symbol, type, price) {
  try {
    const slipFactor = config.maxSlippageFactor || 1.5;
    const cfg    = db.symbolRegistry && db.symbolRegistry.get(symbol);
    const spread = cfg ? (cfg.spread || 0) : 0;
    const slip   = spread * Math.random() * slipFactor;
    // BUY  → trader pays more (price rises)
    // SELL → trader receives less (price falls)
    return type === 'BUY' ? price + slip : price - slip;
  } catch (_) {
    return price;
  }
}

/**
 * Place a new order.
 *
 * @param {object} params
 * @param {string} params.accountId
 * @param {string} params.symbol
 * @param {string} params.type       BUY | SELL | BUY LIMIT | SELL LIMIT | BUY STOP | SELL STOP
 * @param {number} params.lots
 * @param {number} [params.price]    Required for pending orders
 * @param {number} [params.sl]       Stop-loss price
 * @param {number} [params.tp]       Take-profit price
 * @param {string} [params.comment]
 * @returns {{ ok: boolean, order?: object, error?: string }}
 */
function placeOrder({ accountId, symbol, type, lots, price, sl, tp, comment }) {
  const account = db.getAccountById(accountId);
  if (!account) return { ok: false, error: 'Account not found' };

  const quote = db.quotes.get(symbol);
  if (!quote) return { ok: false, error: `No quote available for ${symbol}` };

  const isMarket = type === 'BUY' || type === 'SELL';
  const isBuy    = type.startsWith('BUY');

  let execPrice = isMarket
    ? (isBuy ? quote.ask : quote.bid)
    : (price || 0);

  // Apply slippage only to market orders
  if (isMarket) {
    execPrice = applySlippage(symbol, type, execPrice);
  }

  if (!execPrice || execPrice <= 0) {
    return { ok: false, error: 'Invalid execution price' };
  }
  if (!lots || lots <= 0) {
    return { ok: false, error: 'Invalid lot size' };
  }

  const margin = calculateMargin(symbol, lots, execPrice, account.leverage);

  if (isMarket && account.freeMargin < margin) {
    return { ok: false, error: `Insufficient free margin (required: $${margin}, available: $${account.freeMargin})` };
  }

  const ticket = db.nextTicket();
  const order = {
    ticket,
    accountId,
    symbol,
    type,
    lots: parseFloat(lots),
    openPrice: parseFloat(execPrice.toFixed(5)),
    sl:   sl  ? parseFloat(sl)  : null,
    tp:   tp  ? parseFloat(tp)  : null,
    comment: comment || '',
    openTime: new Date().toISOString(),
    profit: 0,
    swap: 0,
    commission: 0,
  };

  if (isMarket) {
    db.openOrders.set(ticket, order);
    // Deduct margin from account
    const newMargin      = parseFloat((account.margin + margin).toFixed(2));
    const newFreeMargin  = parseFloat((account.equity - newMargin).toFixed(2));
    const marginLevel    = newMargin > 0 ? parseFloat(((account.equity / newMargin) * 100).toFixed(2)) : 0;
    Object.assign(account, { margin: newMargin, freeMargin: newFreeMargin, marginLevel });
  } else {
    db.pendingOrders.set(ticket, order);
  }

  return { ok: true, order };
}

/**
 * Close an open market order at current market price.
 *
 * @param {number} ticket
 * @returns {{ ok: boolean, closedOrder?: object, error?: string }}
 */
function closeOrder(ticket) {
  const order = db.openOrders.get(ticket);
  if (!order) return { ok: false, error: `Open order #${ticket} not found` };

  const account = db.getAccountById(order.accountId);
  if (!account) return { ok: false, error: 'Account not found' };

  const quote = db.quotes.get(order.symbol);
  const closePrice = quote
    ? (order.type === 'BUY' ? quote.bid : quote.ask)
    : order.openPrice;

  const profit = calculatePnL(order.type, order.symbol, order.lots, order.openPrice, closePrice);
  const margin = calculateMargin(order.symbol, order.lots, order.openPrice, account.leverage);

  const closedOrder = {
    ...order,
    closePrice: parseFloat(closePrice.toFixed(5)),
    closeTime:  new Date().toISOString(),
    profit:     parseFloat(profit.toFixed(2)),
  };

  db.openOrders.delete(ticket);
  db.closedOrders.set(ticket, closedOrder);

  // Update account
  const newBalance    = parseFloat((account.balance + profit).toFixed(2));
  const newMargin     = Math.max(0, parseFloat((account.margin - margin).toFixed(2)));
  const newEquity     = parseFloat((newBalance + totalFloatingProfit(account.id)).toFixed(2));
  const newFreeMargin = parseFloat((newEquity - newMargin).toFixed(2));
  const marginLevel   = newMargin > 0 ? parseFloat(((newEquity / newMargin) * 100).toFixed(2)) : 0;

  Object.assign(account, {
    balance:     newBalance,
    equity:      newEquity,
    margin:      newMargin,
    freeMargin:  newFreeMargin,
    marginLevel,
    profit:      parseFloat(totalFloatingProfit(account.id).toFixed(2)),
  });

  return { ok: true, closedOrder };
}

/**
 * Cancel a pending order.
 */
function cancelOrder(ticket) {
  const order = db.pendingOrders.get(ticket);
  if (!order) return { ok: false, error: `Pending order #${ticket} not found` };
  db.pendingOrders.delete(ticket);
  const closed = { ...order, closeTime: new Date().toISOString(), status: 'cancelled', profit: 0 };
  db.closedOrders.set(ticket, closed);
  return { ok: true, order: closed };
}

/**
 * Modify stop-loss and/or take-profit of an existing order.
 */
function modifyOrder(ticket, { sl, tp }) {
  const order = db.openOrders.get(ticket) || db.pendingOrders.get(ticket);
  if (!order) return { ok: false, error: `Order #${ticket} not found` };
  if (sl !== undefined) order.sl = sl ? parseFloat(sl) : null;
  if (tp !== undefined) order.tp = tp ? parseFloat(tp) : null;
  return { ok: true, order };
}

/**
 * Recalculate floating P&L for all open orders of an account and update
 * equity / free margin.  Called on every price tick.
 *
 * @param {string} accountId
 */
function recalculateAccount(accountId) {
  const account = db.getAccountById(accountId);
  if (!account) return;

  let totalProfit = 0;
  const ordersToClose = [];

  db.openOrders.forEach((order) => {
    if (order.accountId !== accountId) return;
    const quote = db.quotes.get(order.symbol);
    if (!quote) return;

    const closePrice = order.type === 'BUY' ? quote.bid : quote.ask;
    const profit     = calculatePnL(order.type, order.symbol, order.lots, order.openPrice, closePrice);
    order.profit     = parseFloat(profit.toFixed(2));
    totalProfit      += order.profit;

    // Check SL/TP
    if (order.sl && ((order.type === 'BUY' && closePrice <= order.sl) ||
                     (order.type === 'SELL' && closePrice >= order.sl))) {
      ordersToClose.push({ ticket: order.ticket, reason: 'sl' });
    } else if (order.tp && ((order.type === 'BUY' && closePrice >= order.tp) ||
                             (order.type === 'SELL' && closePrice <= order.tp))) {
      ordersToClose.push({ ticket: order.ticket, reason: 'tp' });
    }
  });

  // Trigger pending orders
  db.pendingOrders.forEach((order) => {
    if (order.accountId !== accountId) return;
    const quote = db.quotes.get(order.symbol);
    if (!quote) return;
    let triggered = false;
    if (order.type === 'BUY LIMIT'  && quote.ask <= order.openPrice) triggered = true;
    if (order.type === 'SELL LIMIT' && quote.bid >= order.openPrice) triggered = true;
    if (order.type === 'BUY STOP'   && quote.ask >= order.openPrice) triggered = true;
    if (order.type === 'SELL STOP'  && quote.bid <= order.openPrice) triggered = true;
    if (triggered) {
      const newType = order.type.startsWith('BUY') ? 'BUY' : 'SELL';
      db.pendingOrders.delete(order.ticket);
      db.openOrders.set(order.ticket, { ...order, type: newType, openTime: new Date().toISOString() });
    }
  });

  // Auto-close SL/TP orders
  ordersToClose.forEach(({ ticket }) => closeOrder(ticket));

  // Update account equity
  const equity      = parseFloat((account.balance + totalProfit).toFixed(2));
  const freeMargin  = parseFloat((equity - account.margin).toFixed(2));
  const marginLevel = account.margin > 0 ? parseFloat(((equity / account.margin) * 100).toFixed(2)) : 0;

  Object.assign(account, { equity, profit: parseFloat(totalProfit.toFixed(2)), freeMargin, marginLevel });

  // Margin call: close all orders if margin level < 50%
  if (account.margin > 0 && marginLevel < 50) {
    db.openOrders.forEach((order) => {
      if (order.accountId === accountId) closeOrder(order.ticket);
    });
  }
}

/** Sum floating profit for all open orders belonging to an account. */
function totalFloatingProfit(accountId) {
  let total = 0;
  db.openOrders.forEach((o) => {
    if (o.accountId === accountId) total += o.profit || 0;
  });
  return total;
}

/**
 * Broker-level risk summary across ALL accounts.
 *
 * Returns:
 *  symbolExposure  – per-symbol buy/sell/net lots and unrealised P&L
 *  accountSummary  – per-account snapshot with margin health score
 *  marginHeatmap   – symbols ranked by net exposure (for heatmap display)
 *  liquidationRisk – accounts at or near margin call (level < 150%)
 *  totals          – platform-wide aggregates
 */
function getBrokerRisk() {
  const symbolExposure = {};   // symbol → { buyLots, sellLots, netLots, unrealisedPnL }
  const accountSummary = [];   // per-account snapshot

  db.openOrders.forEach((order) => {
    if (!symbolExposure[order.symbol]) {
      symbolExposure[order.symbol] = { buyLots: 0, sellLots: 0, netLots: 0, unrealisedPnL: 0 };
    }
    const exp = symbolExposure[order.symbol];
    if (order.type === 'BUY') {
      exp.buyLots  = parseFloat((exp.buyLots  + order.lots).toFixed(2));
    } else {
      exp.sellLots = parseFloat((exp.sellLots + order.lots).toFixed(2));
    }
    exp.netLots      = parseFloat((exp.buyLots - exp.sellLots).toFixed(2));
    exp.unrealisedPnL = parseFloat((exp.unrealisedPnL + (order.profit || 0)).toFixed(2));
  });

  let totalBalance    = 0;
  let totalEquity     = 0;
  let totalMargin     = 0;
  let totalProfit     = 0;
  let openOrderCount  = 0;

  db.accounts.forEach((account) => {
    const acctOrders = [...db.openOrders.values()].filter((o) => o.accountId === account.id);
    const marginLevel = account.marginLevel || 0;

    // Health score: 100 = fully healthy, 0 = margin call imminent
    let healthScore = 100;
    if (account.margin > 0) {
      healthScore = Math.min(100, Math.max(0, Math.round((marginLevel / 200) * 100)));
    }

    accountSummary.push({
      accountId:   account.id,
      login:       account.login,
      balance:     account.balance,
      equity:      account.equity,
      margin:      account.margin,
      freeMargin:  account.freeMargin,
      marginLevel: account.marginLevel,
      profit:      account.profit,
      openOrders:  acctOrders.length,
      healthScore,
    });

    totalBalance   += account.balance;
    totalEquity    += account.equity;
    totalMargin    += account.margin;
    totalProfit    += account.profit || 0;
    openOrderCount += acctOrders.length;
  });

  // Margin heatmap: symbols sorted by absolute net exposure
  const marginHeatmap = Object.entries(symbolExposure)
    .map(([symbol, exp]) => ({
      symbol,
      netLots:      exp.netLots,
      absNetLots:   Math.abs(exp.netLots),
      buyLots:      exp.buyLots,
      sellLots:     exp.sellLots,
      unrealisedPnL: exp.unrealisedPnL,
    }))
    .sort((a, b) => b.absNetLots - a.absNetLots);

  // Liquidation risk: accounts with margin level < 150% (and margin > 0)
  const liquidationRisk = accountSummary
    .filter((a) => a.margin > 0 && a.marginLevel < 150)
    .sort((a, b) => a.marginLevel - b.marginLevel)
    .map((a) => ({
      accountId:   a.accountId,
      login:       a.login,
      marginLevel: a.marginLevel,
      equity:      a.equity,
      margin:      a.margin,
      riskLevel:   a.marginLevel < 50 ? 'CRITICAL' : a.marginLevel < 100 ? 'HIGH' : 'MEDIUM',
    }));

  const totals = {
    totalBalance:   parseFloat(totalBalance.toFixed(2)),
    totalEquity:    parseFloat(totalEquity.toFixed(2)),
    totalMargin:    parseFloat(totalMargin.toFixed(2)),
    totalProfit:    parseFloat(totalProfit.toFixed(2)),
    openOrderCount,
    accountCount:   db.accounts.size,
  };

  return { symbolExposure, accountSummary, marginHeatmap, liquidationRisk, totals };
}

module.exports = {
  placeOrder,
  closeOrder,
  cancelOrder,
  modifyOrder,
  recalculateAccount,
  getBrokerRisk,
};
