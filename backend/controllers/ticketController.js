/**
 * Support Tickets controller.
 */

const ticketService = require('../services/ticketService');

// ── Client endpoints ───────────────────────────────────────────────────────

/**
 * GET /api/tickets
 * Returns authenticated user's tickets.
 */
function getMyTickets(req, res) {
  const tickets = ticketService.listTicketsByUser(req.user.id);
  res.json({ tickets, total: tickets.length });
}

/**
 * GET /api/tickets/:id
 * Returns a specific ticket (owner or admin).
 */
function getTicket(req, res) {
  const ticket = ticketService.getTicket(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  // Clients can only view their own tickets
  if (req.user.role === 'trader' && ticket.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Filter internal messages for non-admin viewers
  const filtered = { ...ticket };
  if (req.user.role === 'trader') {
    filtered.messages = ticket.messages.filter((m) => !m.isInternal);
  }

  res.json({ ticket: filtered });
}

/**
 * POST /api/tickets
 * Body: { subject, category?, priority?, body }
 * Creates a new support ticket.
 */
function createTicket(req, res) {
  const { subject, category, priority, body } = req.body;
  if (!subject || !subject.trim()) return res.status(400).json({ error: 'subject is required' });
  if (!body || !body.trim())       return res.status(400).json({ error: 'body is required' });

  try {
    const ticket = ticketService.createTicket({
      userId:   req.user.id,
      subject:  subject.trim(),
      category,
      priority,
      body:     body.trim(),
    });
    res.status(201).json({ ticket });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * POST /api/tickets/:id/messages
 * Body: { body, isInternal? }
 * Adds a reply to a ticket.
 */
function addMessage(req, res) {
  const ticket = ticketService.getTicket(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  // Clients can only reply to their own tickets
  if (req.user.role === 'trader' && ticket.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { body, isInternal } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'body is required' });

  // Clients cannot post internal notes
  const internal = req.user.role !== 'trader' && isInternal === true;

  const result = ticketService.addMessage(req.params.id, {
    authorId:   req.user.id,
    authorRole: req.user.role === 'trader' ? 'client' : req.user.role,
    body:       body.trim(),
    isInternal: internal,
  });
  if (!result) return res.status(404).json({ error: 'Ticket not found' });

  res.status(201).json({ message: result.message, ticket: result.ticket });
}

// ── Admin endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/tickets/admin/all
 * Query: ?status=open&priority=high&category=withdrawal
 * Lists all tickets (admin only).
 */
function listAllTickets(req, res) {
  const { status, priority, category, limit } = req.query;
  const tickets = ticketService.listAllTickets({
    status,
    priority,
    category,
    limit: limit ? parseInt(limit, 10) : 100,
  });
  res.json({ tickets, total: tickets.length });
}

/**
 * GET /api/tickets/admin/stats
 * Returns ticket statistics (admin only).
 */
function getStats(req, res) {
  res.json(ticketService.getStats());
}

/**
 * PATCH /api/tickets/admin/:id/status
 * Body: { status, assignedTo? }
 * Updates ticket status (admin only).
 */
function updateStatus(req, res) {
  const { status, assignedTo } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  try {
    const ticket = ticketService.updateTicketStatus(req.params.id, status, assignedTo);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ ticket });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getMyTickets,
  getTicket,
  createTicket,
  addMessage,
  listAllTickets,
  getStats,
  updateStatus,
};
