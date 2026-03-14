/**
 * Support Tickets Service.
 *
 * Manages client support tickets and staff replies.
 *
 * Ticket statuses: open → in_progress → resolved | closed
 * Priority levels: low | medium | high | urgent
 * Categories: general | deposit | withdrawal | technical | kyc | trading | other
 */

const { v4: uuidv4 } = require('uuid');

// ── Data stores ────────────────────────────────────────────────────────────

/**
 * Tickets  id → {
 *   id, userId, brokerId, subject, category, priority, status,
 *   messages: [{ id, authorId, authorRole, body, isInternal, createdAt }],
 *   assignedTo, createdAt, updatedAt, resolvedAt
 * }
 */
const tickets = new Map();

// ── Constants ──────────────────────────────────────────────────────────────

const VALID_CATEGORIES = ['general', 'deposit', 'withdrawal', 'technical', 'kyc', 'trading', 'other'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const VALID_STATUSES   = ['open', 'in_progress', 'resolved', 'closed'];

// ── CRUD ────────────────────────────────────────────────────────────────────

function createTicket({ userId, subject, category = 'general', priority = 'medium', body, brokerId = null }) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  const id  = uuidv4();
  const now = new Date().toISOString();
  const ticket = {
    id,
    userId,
    brokerId,
    subject:    String(subject || '').slice(0, 255),
    category,
    priority,
    status:     'open',
    assignedTo: null,
    messages:   [],
    createdAt:  now,
    updatedAt:  now,
    resolvedAt: null,
  };

  // Add initial message if body is provided
  if (body) {
    ticket.messages.push(_makeMessage({ authorId: userId, authorRole: 'client', body }));
  }

  tickets.set(id, ticket);
  return ticket;
}

function getTicket(id) {
  return tickets.get(id) || null;
}

function listTicketsByUser(userId) {
  return [...tickets.values()]
    .filter((t) => t.userId === userId)
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
}

function listAllTickets({ status, priority, category, limit = 100 } = {}) {
  let all = [...tickets.values()];
  if (status)   all = all.filter((t) => t.status === status);
  if (priority) all = all.filter((t) => t.priority === priority);
  if (category) all = all.filter((t) => t.category === category);
  all.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  return all.slice(0, limit);
}

// ── Messages ───────────────────────────────────────────────────────────────

function addMessage(ticketId, { authorId, authorRole, body, isInternal = false }) {
  const ticket = tickets.get(ticketId);
  if (!ticket) return null;

  const msg = _makeMessage({ authorId, authorRole, body, isInternal });
  ticket.messages.push(msg);
  ticket.updatedAt = new Date().toISOString();

  // Auto-set status to in_progress when staff replies
  if (authorRole !== 'client' && ticket.status === 'open') {
    ticket.status = 'in_progress';
  }

  return { ticket, message: msg };
}

function _makeMessage({ authorId, authorRole, body, isInternal = false }) {
  return {
    id:         uuidv4(),
    authorId,
    authorRole, // 'client' | 'admin' | 'support'
    body:       String(body || '').slice(0, 5000),
    isInternal, // internal notes are hidden from the client
    createdAt:  new Date().toISOString(),
  };
}

// ── Status management ──────────────────────────────────────────────────────

function updateTicketStatus(ticketId, status, assignedTo = null) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const ticket = tickets.get(ticketId);
  if (!ticket) return null;

  ticket.status    = status;
  ticket.updatedAt = new Date().toISOString();
  if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
  if (status === 'resolved' || status === 'closed') {
    ticket.resolvedAt = ticket.resolvedAt || new Date().toISOString();
  }
  return ticket;
}

// ── Stats ──────────────────────────────────────────────────────────────────

function getStats() {
  const all     = [...tickets.values()];
  const byStatus = Object.fromEntries(
    VALID_STATUSES.map((s) => [s, all.filter((t) => t.status === s).length])
  );
  return {
    total:    all.length,
    byStatus,
    openUrgent: all.filter((t) => t.status === 'open' && t.priority === 'urgent').length,
  };
}

// ── Seed demo tickets ──────────────────────────────────────────────────────

(function seedDemoTickets() {
  const t1 = createTicket({
    userId:   'demo-user-001',
    subject:  'Unable to withdraw funds',
    category: 'withdrawal',
    priority: 'high',
    body:     'I submitted a withdrawal request 3 days ago but it has not been processed.',
  });
  t1.status = 'open';

  const t2 = createTicket({
    userId:   'demo-user-002',
    subject:  'KYC documents rejected',
    category: 'kyc',
    priority: 'medium',
    body:     'My passport was rejected. Please advise on what to resubmit.',
  });
  addMessage(t2.id, {
    authorId:   'admin-001',
    authorRole: 'admin',
    body:       'Thank you for reaching out. Please resubmit a clearer scan of your passport.',
  });

  const t3 = createTicket({
    userId:   'demo-user-003',
    subject:  'Chart not loading',
    category: 'technical',
    priority: 'low',
    body:     'The EURUSD chart is showing a blank screen.',
  });
  updateTicketStatus(t3.id, 'resolved');
})();

module.exports = {
  createTicket,
  getTicket,
  listTicketsByUser,
  listAllTickets,
  addMessage,
  updateTicketStatus,
  getStats,
  VALID_CATEGORIES,
  VALID_PRIORITIES,
  VALID_STATUSES,
};
