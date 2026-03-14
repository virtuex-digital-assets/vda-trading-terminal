const express = require('express');
const router  = express.Router();
const {
  listClients, getClient, createClient, updateClient, deleteClient,
  listLeads, createLead, updateLead,
  listNotes, createNote,
  listActivities, createActivity,
  listTickets, getTicket, createTicket, updateTicket,
} = require('../controllers/crmController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(apiLimiter, authMiddleware);

// Clients
router.get('/clients',         listClients);
router.get('/clients/:id',     getClient);
router.post('/clients',        auditLog, createClient);
router.patch('/clients/:id',   auditLog, updateClient);
router.delete('/clients/:id',  adminOnly, auditLog, deleteClient);

// Leads
router.get('/leads',           listLeads);
router.post('/leads',          auditLog, createLead);
router.patch('/leads/:id',     auditLog, updateLead);

// Notes
router.get('/notes',           listNotes);
router.post('/notes',          auditLog, createNote);

// Activities
router.get('/activities',      listActivities);
router.post('/activities',     auditLog, createActivity);

// Tickets
router.get('/tickets',         listTickets);
router.get('/tickets/:id',     getTicket);
router.post('/tickets',        auditLog, createTicket);
router.patch('/tickets/:id',   auditLog, updateTicket);

module.exports = router;
