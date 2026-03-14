/**
 * Broker controller.
 *
 * Manages broker organisations and their admin users.
 */

const {
  brokers, brokerAdmins,
  createBroker, createBrokerAdmin,
} = require('../models/brokerStore');

// ── Brokers ───────────────────────────────────────────────────────────────────

function listBrokers(req, res) {
  try {
    const list = [...brokers.values()];
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getBroker(req, res) {
  try {
    const broker = brokers.get(req.params.id);
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    res.json(broker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createBrokerHandler(req, res) {
  try {
    const { name, email, phone, country } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    const broker = createBroker({ name, email, phone, country });
    res.status(201).json(broker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateBroker(req, res) {
  try {
    const broker = brokers.get(req.params.id);
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    const updatable = ['name', 'email', 'phone', 'country'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) broker[key] = req.body[key];
    }
    broker.updatedAt = new Date().toISOString();
    res.json(broker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function toggleBroker(req, res) {
  try {
    const broker = brokers.get(req.params.id);
    if (!broker) return res.status(404).json({ error: 'Broker not found' });
    broker.status = broker.status === 'active' ? 'inactive' : 'active';
    broker.updatedAt = new Date().toISOString();
    res.json(broker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Broker Admins ─────────────────────────────────────────────────────────────

function listBrokerAdmins(req, res) {
  try {
    const brokerId = req.params.id;
    if (!brokers.has(brokerId)) return res.status(404).json({ error: 'Broker not found' });
    const admins = [...brokerAdmins.values()].filter((a) => a.brokerId === brokerId);
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function assignBrokerAdmin(req, res) {
  try {
    const brokerId = req.params.id;
    if (!brokers.has(brokerId)) return res.status(404).json({ error: 'Broker not found' });
    const { userId, role } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const brokerAdmin = createBrokerAdmin({ brokerId, userId, role: role || 'admin' });
    res.status(201).json(brokerAdmin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listBrokers,
  getBroker,
  createBroker: createBrokerHandler,
  updateBroker,
  toggleBroker,
  listBrokerAdmins,
  assignBrokerAdmin,
};
