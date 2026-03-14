/**
 * Support Tickets routes.
 *
 * Client routes:
 *   GET    /api/tickets               – list own tickets
 *   POST   /api/tickets               – create a ticket
 *   GET    /api/tickets/:id           – get a ticket
 *   POST   /api/tickets/:id/messages  – reply to a ticket
 *
 * Admin routes:
 *   GET    /api/tickets/admin/all              – list all tickets
 *   GET    /api/tickets/admin/stats            – ticket statistics
 *   PATCH  /api/tickets/admin/:id/status       – update ticket status
 */

const express    = require('express');
const router     = express.Router();
const ticketCtrl = require('../controllers/ticketController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(apiLimiter, authMiddleware);

// ── Admin routes (must be before :id routes to avoid conflicts) ───────────
router.get('/admin/all',         adminLimiter, adminOnly, ticketCtrl.listAllTickets);
router.get('/admin/stats',       adminLimiter, adminOnly, ticketCtrl.getStats);
router.patch('/admin/:id/status', adminLimiter, adminOnly, auditLog, ticketCtrl.updateStatus);

// ── Client routes ─────────────────────────────────────────────────────────
router.get('/',            ticketCtrl.getMyTickets);
router.post('/',           auditLog, ticketCtrl.createTicket);
router.get('/:id',         ticketCtrl.getTicket);
router.post('/:id/messages', auditLog, ticketCtrl.addMessage);

module.exports = router;
