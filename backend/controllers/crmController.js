/**
 * CRM controller.
 *
 * Manages clients, leads, notes, activities, and support tickets.
 */

const {
  crmClients, crmLeads, crmNotes, crmActivities, supportTickets,
  createClient, createLead, createNote, createActivity, createTicket,
} = require('../models/crmStore');

// ── Clients ──────────────────────────────────────────────────────────────────

function listClients(req, res) {
  try {
    let clients = [...crmClients.values()];
    if (req.user.role !== 'super_admin' && req.user.brokerId) {
      clients = clients.filter((c) => c.brokerId === req.user.brokerId);
    }
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getClient(req, res) {
  try {
    const client = crmClients.get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createClientHandler(req, res) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    const client = createClient({ ...req.body });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateClient(req, res) {
  try {
    const client = crmClients.get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const updatable = ['name', 'email', 'phone', 'country', 'status', 'assignedTo', 'brokerId', 'notes'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) client[key] = req.body[key];
    }
    client.updatedAt = new Date().toISOString();
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function deleteClient(req, res) {
  try {
    if (!crmClients.has(req.params.id)) {
      return res.status(404).json({ error: 'Client not found' });
    }
    crmClients.delete(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Leads ─────────────────────────────────────────────────────────────────────

function listLeads(req, res) {
  try {
    const leads = [...crmLeads.values()];
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createLeadHandler(req, res) {
  try {
    const lead = createLead({ ...req.body });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateLead(req, res) {
  try {
    const lead = crmLeads.get(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    const updatable = ['name', 'email', 'phone', 'source', 'status', 'assignedTo', 'brokerId', 'notes'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) lead[key] = req.body[key];
    }
    lead.updatedAt = new Date().toISOString();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Notes ─────────────────────────────────────────────────────────────────────

function listNotes(req, res) {
  try {
    const { clientId, leadId } = req.query;
    let notes = [...crmNotes.values()];
    if (clientId) notes = notes.filter((n) => n.clientId === clientId);
    if (leadId)   notes = notes.filter((n) => n.leadId === leadId);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createNoteHandler(req, res) {
  try {
    const { clientId, leadId, content } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });
    const note = createNote({ clientId, leadId, content, authorId: req.user.id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Activities ────────────────────────────────────────────────────────────────

function listActivities(req, res) {
  try {
    const { clientId, leadId } = req.query;
    let activities = [...crmActivities.values()];
    if (clientId) activities = activities.filter((a) => a.clientId === clientId);
    if (leadId)   activities = activities.filter((a) => a.leadId === leadId);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createActivityHandler(req, res) {
  try {
    const activity = createActivity({ ...req.body, authorId: req.user.id });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Tickets ───────────────────────────────────────────────────────────────────

function listTickets(req, res) {
  try {
    const tickets = [...supportTickets.values()];
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getTicket(req, res) {
  try {
    const ticket = supportTickets.get(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createTicketHandler(req, res) {
  try {
    const ticket = createTicket({ ...req.body });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateTicket(req, res) {
  try {
    const ticket = supportTickets.get(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const updatable = ['status', 'priority', 'assignedTo', 'brokerId', 'subject'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) ticket[key] = req.body[key];
    }
    ticket.updatedAt = new Date().toISOString();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listClients,
  getClient,
  createClient: createClientHandler,
  updateClient,
  deleteClient,
  listLeads,
  createLead: createLeadHandler,
  updateLead,
  listNotes,
  createNote: createNoteHandler,
  listActivities,
  createActivity: createActivityHandler,
  listTickets,
  getTicket,
  createTicket: createTicketHandler,
  updateTicket,
};
