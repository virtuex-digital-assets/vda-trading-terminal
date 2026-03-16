/**
 * Broker controller.
 *
 * Manages white-label broker tenants using the whiteLabelService.
 */

const wl = require('../services/whiteLabelService');

// ── Brokers ───────────────────────────────────────────────────────────────────

function getSummary(req, res) {
  try {
    const summary = wl.getPlatformSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function listBrokers(req, res) {
  try {
    const brokers = wl.listBrokers();
    res.json({ brokers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getBroker(req, res) {
  try {
    const broker = wl.getBroker(req.params.id);
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    res.json({ broker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createBrokerHandler(req, res) {
  try {
    const { name, ownerEmail, domain, customDomain } = req.body;
    if (!name || !ownerEmail) {
      return res.status(400).json({ error: 'name and ownerEmail are required' });
    }
    const broker = wl.createBroker({ name, ownerEmail, domain, customDomain });
    res.status(201).json({ broker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateBroker(req, res) {
  try {
    const broker = wl.updateBroker(req.params.id, req.body);
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    res.json({ broker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateBranding(req, res) {
  try {
    const broker = wl.updateBroker(req.params.id, { branding: req.body });
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    res.json({ broker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateTradingConditions(req, res) {
  try {
    const broker = wl.updateBroker(req.params.id, { tradingConditions: req.body });
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    res.json({ broker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function toggleBroker(req, res) {
  try {
    const broker = wl.getBroker(req.params.id);
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    const updated = wl.updateBroker(req.params.id, {
      status: broker.status === 'active' ? 'suspended' : 'active',
    });
    res.json({ broker: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function deleteBroker(req, res) {
  try {
    const exists = wl.getBroker(req.params.id);
    if (!exists) return res.status(404).json({ error: 'Broker not found' });
    wl.deleteBroker(req.params.id);
    res.json({ message: 'Broker removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getSummary,
  listBrokers,
  getBroker,
  createBroker: createBrokerHandler,
  updateBroker,
  updateBranding,
  updateTradingConditions,
  toggleBroker,
  deleteBroker,
};
