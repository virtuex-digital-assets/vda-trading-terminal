const db            = require('../models');
const tradingEngine = require('../services/tradingEngine');
const { broadcast } = require('../services/wsServer');

/**
 * GET /api/admin/risk
 * Returns broker-level risk metrics: symbol exposure + account summaries.
 * Requires admin role.
 */
function getRisk(req, res) {
  const risk = tradingEngine.getBrokerRisk();
  res.json(risk);
}

/**
 * GET /api/admin/accounts
 * Returns all trading accounts with their current status.
 */
function listAccounts(req, res) {
  const accounts = [...db.accounts.values()].map((a) => {
    // eslint-disable-next-line no-unused-vars
    const { userId, ...safe } = a;
    return safe;
  });
  res.json(accounts);
}

/**
 * GET /api/admin/orders
 * Returns all open orders across all accounts.
 */
function listAllOrders(req, res) {
  const open    = [...db.openOrders.values()];
  const pending = [...db.pendingOrders.values()];
  res.json({ open, pending });
}

/**
 * POST /api/admin/orders/:ticket/close
 * Force-close any open order (admin override).
 */
function forceCloseOrder(req, res) {
  const ticket = parseInt(req.params.ticket, 10);
  const result = tradingEngine.closeOrder(ticket);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json(result.closedOrder);
}

/**
 * POST /api/admin/accounts/:accountId/adjust
 * Adjust trading account balance (credit / debit).
 * Body: { amount: number, note?: string }
 */
function adjustBalance(req, res) {
  const { accountId } = req.params;
  const account = db.getAccountById(accountId);
  if (!account) return res.status(404).json({ error: 'Account not found' });

  const amount = parseFloat(req.body.amount);
  if (isNaN(amount)) return res.status(400).json({ error: 'amount must be a number' });

  const newBalance   = parseFloat((account.balance + amount).toFixed(2));
  if (newBalance < 0) return res.status(400).json({ error: 'Balance cannot go negative' });

  account.balance   = newBalance;
  account.equity    = parseFloat((newBalance + (account.profit || 0)).toFixed(2));
  account.freeMargin = parseFloat((account.equity - account.margin).toFixed(2));

  broadcast({ type: 'account', ...account }, (client) => client._accountId === accountId);

  res.json({
    accountId,
    adjustment: amount,
    note:        req.body.note || '',
    balance:     account.balance,
    equity:      account.equity,
  });
}

/**
 * GET /api/admin/users
 * List all users (super_admin only).
 */
function listUsers(req, res) {
  const users = [...db.users.values()].map((u) => ({
    id:        u.id,
    email:     u.email,
    name:      u.name,
    role:      u.role,
    status:    u.status || 'active',
    createdAt: u.createdAt,
  }));
  res.json(users);
}

/**
 * POST /api/admin/users
 * Create a new user account (super_admin only).
 * Body: { email, password, name, role }
 */
function createUser(req, res) {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (db.getUserByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const validRoles = ['trader', 'admin', 'super_admin'];
  const userRole   = validRoles.includes(role) ? role : 'trader';
  const user       = db.createUser(email, password, name, userRole);
  const account    = userRole === 'trader' ? db.createAccount(user.id) : null;

  res.status(201).json({
    user:    { id: user.id, email: user.email, name: user.name, role: user.role },
    account: account ? (({ userId, ...safe }) => safe)(account) : null, // eslint-disable-line no-unused-vars
  });
}

/**
 * PATCH /api/admin/users/:userId/status
 * Suspend or reinstate a user (super_admin only).
 * Body: { status: 'active' | 'suspended' }
 */
function setUserStatus(req, res) {
  const user = db.getUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: "status must be 'active' or 'suspended'" });
  }
  user.status = status;
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, status });
}

/**
 * GET /api/admin/audit
 * Returns recent audit log entries (admin / super_admin only).
 * Query: ?limit=100
 */
function getAuditLog(req, res) {
  const limit  = Math.min(parseInt(req.query.limit || '100', 10), 1000);
  const entries = db.auditLogs.slice(-limit).reverse();
  res.json(entries);
}

/**
 * GET /api/admin/metrics
 * System-wide performance and activity metrics.
 */
function getMetrics(req, res) {
  const memUsage  = process.memoryUsage();
  const uptime    = Math.floor(process.uptime());

  const totalOrders   = db.openOrders.size + db.pendingOrders.size;
  const closedOrders  = db.closedOrders.size;
  const totalUsers    = db.users.size;
  const totalAccounts = db.accounts.size;
  const auditEntries  = db.auditLogs.length;

  // Simple trading activity: count orders closed in the last 24h
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let tradesLast24h = 0;
  db.closedOrders.forEach((o) => {
    if (new Date(o.closeTime).getTime() > oneDayAgo) tradesLast24h++;
  });

  // Aggregate P&L across all closed orders
  let totalRealizedPnL = 0;
  db.closedOrders.forEach((o) => { totalRealizedPnL += o.profit || 0; });

  res.json({
    system: {
      uptime,
      uptimeFormatted: formatUptime(uptime),
      nodeVersion: process.version,
      memoryMB: {
        rss:      parseFloat((memUsage.rss / 1048576).toFixed(1)),
        heapUsed: parseFloat((memUsage.heapUsed / 1048576).toFixed(1)),
        heapTotal: parseFloat((memUsage.heapTotal / 1048576).toFixed(1)),
      },
    },
    trading: {
      openOrders:     db.openOrders.size,
      pendingOrders:  db.pendingOrders.size,
      totalActiveOrders: totalOrders,
      closedOrders,
      tradesLast24h,
      totalRealizedPnL: parseFloat(totalRealizedPnL.toFixed(2)),
    },
    users: {
      totalUsers,
      totalAccounts,
    },
    audit: {
      totalAuditEntries: auditEntries,
    },
    wallet: {
      totalTransactions: db.walletTransactions.size,
    },
    timestamp: new Date().toISOString(),
  });
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
  getRisk,
  listAccounts,
  listAllOrders,
  forceCloseOrder,
  adjustBalance,
  listUsers,
  createUser,
  setUserStatus,
  getAuditLog,
  getMetrics,
};
