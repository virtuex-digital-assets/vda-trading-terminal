const db             = require('../models');
const tradingEngine  = require('../services/tradingEngine');
const { broadcast }  = require('../services/wsServer');

function getAccountId(req) {
  return db.getAccountByUserId(req.user.id)?.id || null;
}

/**
 * GET /api/orders
 * Returns open + pending orders for the authenticated account.
 */
function listOrders(req, res) {
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  const open    = [...db.openOrders.values()].filter((o) => o.accountId === accountId);
  const pending = [...db.pendingOrders.values()].filter((o) => o.accountId === accountId);
  res.json({ open, pending });
}

/**
 * POST /api/orders
 * Body: { symbol, type, lots, price?, sl?, tp?, comment? }
 */
function placeOrder(req, res) {
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  const { symbol, type, lots, price, sl, tp, comment } = req.body;
  const result = tradingEngine.placeOrder({ accountId, symbol, type, lots, price, sl, tp, comment });

  if (!result.ok) return res.status(400).json({ error: result.error });

  broadcast({ type: 'order', action: 'open', order: result.order },
    (client) => client._accountId === accountId);
  res.status(201).json(result.order);
}

/**
 * DELETE /api/orders/:ticket
 * Close an open market order, or cancel a pending order.
 */
function closeOrder(req, res) {
  const ticket    = parseInt(req.params.ticket, 10);
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  // Verify ownership
  const openOrder    = db.openOrders.get(ticket);
  const pendingOrder = db.pendingOrders.get(ticket);
  const order        = openOrder || pendingOrder;
  if (!order) return res.status(404).json({ error: `Order #${ticket} not found` });
  if (order.accountId !== accountId) return res.status(403).json({ error: 'Not your order' });

  const result = openOrder
    ? tradingEngine.closeOrder(ticket)
    : tradingEngine.cancelOrder(ticket);

  if (!result.ok) return res.status(400).json({ error: result.error });

  broadcast({ type: 'order', action: 'close', order: result.closedOrder || result.order },
    (client) => client._accountId === accountId);
  res.json(result.closedOrder || result.order);
}

/**
 * PATCH /api/orders/:ticket
 * Modify SL/TP of an existing order.
 * Body: { sl?, tp? }
 */
function modifyOrder(req, res) {
  const ticket    = parseInt(req.params.ticket, 10);
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  const order = db.openOrders.get(ticket) || db.pendingOrders.get(ticket);
  if (!order) return res.status(404).json({ error: `Order #${ticket} not found` });
  if (order.accountId !== accountId) return res.status(403).json({ error: 'Not your order' });

  const result = tradingEngine.modifyOrder(ticket, req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  broadcast({ type: 'order', action: 'modify', order: result.order },
    (client) => client._accountId === accountId);
  res.json(result.order);
}

/**
 * GET /api/orders/history
 * Returns closed order history for the authenticated account.
 */
function getHistory(req, res) {
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  const history = [...db.closedOrders.values()]
    .filter((o) => o.accountId === accountId)
    .sort((a, b) => new Date(b.closeTime) - new Date(a.closeTime));
  res.json(history);
}

module.exports = { listOrders, placeOrder, closeOrder, modifyOrder, getHistory };
