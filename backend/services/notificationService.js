/**
 * Notification Service.
 *
 * Manages in-platform notifications for users.
 *
 * Types: system | trade | payment | kyc | ticket | margin_call | stop_out
 * Channels: in_app (WebSocket push + REST), email (stubbed in demo)
 */

const { v4: uuidv4 } = require('uuid');

// ── Data store ────────────────────────────────────────────────────────────

/**
 * Notifications  id → {
 *   id, userId, type, title, body, isRead, data, createdAt
 * }
 */
const notifications = new Map();

// ── Constants ─────────────────────────────────────────────────────────────

const VALID_TYPES = [
  'system',
  'trade',
  'payment',
  'kyc',
  'ticket',
  'margin_call',
  'stop_out',
  'copy_trade',
  'affiliate',
];

// ── Create & retrieve ─────────────────────────────────────────────────────

function createNotification({ userId, type, title, body, data = null }) {
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid notification type. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  const id           = uuidv4();
  const notification = {
    id,
    userId,
    type,
    title:     String(title || '').slice(0, 200),
    body:      String(body || '').slice(0, 1000),
    isRead:    false,
    data:      data || null,
    createdAt: new Date().toISOString(),
  };
  notifications.set(id, notification);
  return notification;
}

function getNotification(id) {
  return notifications.get(id) || null;
}

function listByUser(userId, { unreadOnly = false, limit = 50 } = {}) {
  let all = [...notifications.values()].filter((n) => n.userId === userId);
  if (unreadOnly) all = all.filter((n) => !n.isRead);
  all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  return all.slice(0, limit);
}

function getUnreadCount(userId) {
  return [...notifications.values()].filter((n) => n.userId === userId && !n.isRead).length;
}

// ── Mark as read ──────────────────────────────────────────────────────────

function markAsRead(id, userId) {
  const n = notifications.get(id);
  if (!n) return null;
  if (n.userId !== userId) return null; // user can only mark their own
  n.isRead = true;
  return n;
}

function markAllAsRead(userId) {
  let count = 0;
  for (const n of notifications.values()) {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true;
      count++;
    }
  }
  return count;
}

// ── System broadcast ──────────────────────────────────────────────────────

/**
 * Creates a notification for every user whose ID is in the list.
 */
function broadcastToUsers(userIds, { type, title, body, data } = {}) {
  return userIds.map((uid) => createNotification({ userId: uid, type, title, body, data }));
}

// ── Helper factories ──────────────────────────────────────────────────────

function notifyMarginCall(userId, { symbol, marginLevel }) {
  return createNotification({
    userId,
    type:  'margin_call',
    title: '⚠️ Margin Call Warning',
    body:  `Your margin level has dropped to ${marginLevel.toFixed(1)}%. Please deposit funds or close positions.`,
    data:  { symbol, marginLevel },
  });
}

function notifyStopOut(userId, { symbol, ticket }) {
  return createNotification({
    userId,
    type:  'stop_out',
    title: '🚨 Stop Out – Position Closed',
    body:  `Position #${ticket} on ${symbol} was automatically closed due to insufficient margin.`,
    data:  { symbol, ticket },
  });
}

function notifyDepositApproved(userId, { amount, currency }) {
  return createNotification({
    userId,
    type:  'payment',
    title: '✅ Deposit Approved',
    body:  `Your deposit of ${currency} ${amount.toFixed(2)} has been credited to your account.`,
    data:  { amount, currency },
  });
}

function notifyWithdrawalProcessed(userId, { amount, currency, status }) {
  return createNotification({
    userId,
    type:  'payment',
    title: status === 'paid' ? '✅ Withdrawal Processed' : '❌ Withdrawal Rejected',
    body:  `Your withdrawal request of ${currency} ${amount.toFixed(2)} has been ${status}.`,
    data:  { amount, currency, status },
  });
}

function notifyKycUpdate(userId, { level, status }) {
  return createNotification({
    userId,
    type:  'kyc',
    title: status === 'approved' ? '✅ KYC Verified' : '❌ KYC Action Required',
    body:  status === 'approved'
      ? `Your identity verification (level ${level}) has been approved.`
      : 'Your KYC submission requires attention. Please check your documents.',
    data:  { level, status },
  });
}

function notifyTicketReply(userId, { ticketId, subject }) {
  return createNotification({
    userId,
    type:  'ticket',
    title: '💬 New Reply on Support Ticket',
    body:  `A staff member has replied to your ticket: "${subject}".`,
    data:  { ticketId, subject },
  });
}

module.exports = {
  createNotification,
  getNotification,
  listByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  broadcastToUsers,
  notifyMarginCall,
  notifyStopOut,
  notifyDepositApproved,
  notifyWithdrawalProcessed,
  notifyKycUpdate,
  notifyTicketReply,
  VALID_TYPES,
};
