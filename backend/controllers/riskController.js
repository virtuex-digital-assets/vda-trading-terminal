/**
 * Risk Engine controller.
 */
const riskEngine = require('../services/riskEngine');

function getReport(req, res) {
  res.json(riskEngine.getRiskReport());
}

function getExposure(req, res) {
  const { getExposureSummary } = require('../services/riskEngine');
  // Re-export via riskEngine module
  res.json({ exposure: riskEngine.getRiskReport().exposure });
}

function getOrderBookMapping(req, res) {
  const mapping = riskEngine.getOrderRouting(req.params.ticket);
  if (!mapping) return res.status(404).json({ error: 'Order routing not found' });
  res.json({ ticket: req.params.ticket, ...mapping });
}

function updateConfig(req, res) {
  const allowed = ['maxNetExposureUsd', 'profitableTraderThreshold', 'largePositionLots', 'defaultRoutingMode', 'stopOutLevel'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  riskEngine.updateRiskConfig(updates);
  res.json({ config: riskEngine.riskConfig });
}

module.exports = { getReport, getExposure, getOrderBookMapping, updateConfig };
