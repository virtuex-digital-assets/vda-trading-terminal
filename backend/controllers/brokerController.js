/**
 * White Label broker controller.
 */
const whiteLabelService = require('../services/whiteLabelService');

function getPlatformSummary(req, res) {
  res.json(whiteLabelService.getPlatformSummary());
}

function listBrokers(req, res) {
  res.json({ brokers: whiteLabelService.listBrokers() });
}

function createBroker(req, res) {
  const { name, ownerEmail, domain, customDomain } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  if (!ownerEmail || !ownerEmail.trim()) return res.status(400).json({ error: 'ownerEmail is required' });

  const broker = whiteLabelService.createBroker({ name: name.trim(), ownerEmail: ownerEmail.trim(), domain, customDomain });
  res.status(201).json({ broker });
}

function getBroker(req, res) {
  const broker = whiteLabelService.getBroker(req.params.id);
  if (!broker) return res.status(404).json({ error: 'Broker not found' });
  res.json({ broker });
}

function updateBroker(req, res) {
  const broker = whiteLabelService.updateBroker(req.params.id, req.body);
  if (!broker) return res.status(404).json({ error: 'Broker not found' });
  res.json({ broker });
}

function deleteBroker(req, res) {
  const deleted = whiteLabelService.deleteBroker(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Broker not found' });
  res.json({ ok: true });
}

function updateBranding(req, res) {
  const broker = whiteLabelService.updateBroker(req.params.id, { branding: req.body });
  if (!broker) return res.status(404).json({ error: 'Broker not found' });
  res.json({ broker });
}

function updateTradingConditions(req, res) {
  const broker = whiteLabelService.updateBroker(req.params.id, { tradingConditions: req.body });
  if (!broker) return res.status(404).json({ error: 'Broker not found' });
  res.json({ broker });
}

function updateMt4Config(req, res) {
  const broker = whiteLabelService.updateBroker(req.params.id, { mt4ServerConfig: req.body });
  if (!broker) return res.status(404).json({ error: 'Broker not found' });
  res.json({ broker });
}

module.exports = {
  getPlatformSummary,
  listBrokers,
  createBroker,
  getBroker,
  updateBroker,
  deleteBroker,
  updateBranding,
  updateTradingConditions,
  updateMt4Config,
};
