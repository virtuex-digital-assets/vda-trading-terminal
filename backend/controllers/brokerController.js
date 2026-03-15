/**
 * Broker controller.
 *
 * Manages white-label broker organisations via the whiteLabelService.
 */

const wl = require('../services/whiteLabelService');

// ── Platform summary ──────────────────────────────────────────────────────────

function getPlatformSummary(req, res) {
  try {
    res.json(wl.getPlatformSummary());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Brokers ───────────────────────────────────────────────────────────────────

function listBrokers(req, res) {
  try {
    res.json({ brokers: wl.listBrokers() });
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
    const { name, ownerEmail } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const broker = wl.createBroker({ name, ownerEmail });
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

function deleteBroker(req, res) {
  try {
    const deleted = wl.deleteBroker(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Broker not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function toggleBroker(req, res) {
  try {
    const broker = wl.getBroker(req.params.id);
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    const updated = wl.updateBroker(req.params.id, {
      status: broker.status === 'active' ? 'inactive' : 'active',
    });
    res.json({ broker: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPlatformSummary,
  listBrokers,
  getBroker,
  createBroker: createBrokerHandler,
  updateBroker,
  updateBranding,
  updateTradingConditions,
  deleteBroker,
  toggleBroker,
};
