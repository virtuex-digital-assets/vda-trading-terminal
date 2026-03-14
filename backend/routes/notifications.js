/**
 * Notification routes.
 *
 *   GET    /api/notifications           – list own notifications
 *   GET    /api/notifications/count     – unread count
 *   PATCH  /api/notifications/:id/read  – mark as read
 *   PATCH  /api/notifications/read-all  – mark all as read
 */

const express      = require('express');
const router       = express.Router();
const notifService = require('../services/notificationService');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter, authMiddleware);

/**
 * GET /api/notifications
 * Query: ?unreadOnly=true&limit=50
 */
router.get('/', (req, res) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  const limit      = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const items      = notifService.listByUser(req.user.id, { unreadOnly, limit });
  res.json({ notifications: items, total: items.length });
});

/**
 * GET /api/notifications/count
 */
router.get('/count', (req, res) => {
  res.json({ unread: notifService.getUnreadCount(req.user.id) });
});

/**
 * PATCH /api/notifications/read-all
 */
router.patch('/read-all', (req, res) => {
  const count = notifService.markAllAsRead(req.user.id);
  res.json({ marked: count });
});

/**
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', (req, res) => {
  const n = notifService.markAsRead(req.params.id, req.user.id);
  if (!n) return res.status(404).json({ error: 'Notification not found' });
  res.json({ notification: n });
});

module.exports = router;
