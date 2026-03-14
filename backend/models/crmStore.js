/**
 * In-memory CRM data store.
 */

const { v4: uuidv4 } = require('uuid');

// ── CRM Clients ─────────────────────────────────────────────────────────────

const crmClients = new Map();

// ── CRM Leads ───────────────────────────────────────────────────────────────

const crmLeads = new Map();

// ── CRM Notes ───────────────────────────────────────────────────────────────

const crmNotes = new Map();

// ── CRM Activities ──────────────────────────────────────────────────────────

const crmActivities = new Map();

// ── Support Tickets ─────────────────────────────────────────────────────────

const supportTickets = new Map();

// ── ID counter ──────────────────────────────────────────────────────────────

let crmCounter = 1;
function nextCrmId() {
  const ts = Date.now().toString(36).toUpperCase();
  return `CRM${ts}${String(crmCounter++).padStart(4, '0')}`;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function createClient(fields = {}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const client = {
    id,
    userId: fields.userId || null,
    name: fields.name || '',
    email: fields.email || '',
    phone: fields.phone || '',
    country: fields.country || '',
    status: fields.status || 'active',
    assignedTo: fields.assignedTo || null,
    brokerId: fields.brokerId || null,
    notes: fields.notes || '',
    createdAt: now,
    updatedAt: now,
  };
  crmClients.set(id, client);
  return client;
}

function createLead(fields = {}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const lead = {
    id,
    name: fields.name || '',
    email: fields.email || '',
    phone: fields.phone || '',
    source: fields.source || '',
    status: fields.status || 'new',
    assignedTo: fields.assignedTo || null,
    brokerId: fields.brokerId || null,
    notes: fields.notes || '',
    createdAt: now,
    updatedAt: now,
  };
  crmLeads.set(id, lead);
  return lead;
}

function createNote(fields = {}) {
  const id = nextCrmId();
  const note = {
    id,
    clientId: fields.clientId || null,
    leadId: fields.leadId || null,
    content: fields.content || '',
    authorId: fields.authorId || null,
    createdAt: new Date().toISOString(),
  };
  crmNotes.set(id, note);
  return note;
}

function createActivity(fields = {}) {
  const id = nextCrmId();
  const activity = {
    id,
    clientId: fields.clientId || null,
    leadId: fields.leadId || null,
    type: fields.type || 'note',
    description: fields.description || '',
    authorId: fields.authorId || null,
    createdAt: new Date().toISOString(),
  };
  crmActivities.set(id, activity);
  return activity;
}

function createTicket(fields = {}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const ticket = {
    id,
    clientId: fields.clientId || null,
    subject: fields.subject || '',
    status: fields.status || 'open',
    priority: fields.priority || 'medium',
    assignedTo: fields.assignedTo || null,
    brokerId: fields.brokerId || null,
    createdAt: now,
    updatedAt: now,
  };
  supportTickets.set(id, ticket);
  return ticket;
}

module.exports = {
  crmClients,
  crmLeads,
  crmNotes,
  crmActivities,
  supportTickets,
  nextCrmId,
  createClient,
  createLead,
  createNote,
  createActivity,
  createTicket,
};
