/**
 * Core trading engine.
 *
 * Handles order placement, modification, closure, margin calculation,
 * P&L updates, and stop-loss / take-profit trigger logic.
 *
 * All methods are synchronous and operate on the in-memory store.
 */

const db = require('../models');
const { calculateMargin, calculatePnL } = require('../utils/margin');

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

  const execPrice = isMarket
    ? (isBuy ? quote.ask : quote.bid)
    : (price || 0);

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

  db.accounts.forEach((account) => {
    accountSummary.push({
      accountId:  account.id,
      login:      account.login,
      balance:    account.balance,
      equity:     account.equity,
      margin:     account.margin,
      marginLevel: account.marginLevel,
      profit:     account.profit,
      openOrders: [...db.openOrders.values()].filter((o) => o.accountId === account.id).length,
    });
  });

  return { symbolExposure, accountSummary };
}

module.exports = {
  placeOrder,
  closeOrder,
  cancelOrder,
  modifyOrder,
  recalculateAccount,
  getBrokerRisk,
};
