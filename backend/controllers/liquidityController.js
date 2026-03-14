/**
 * Liquidity Provider controller.
 */
const lpService = require('../services/liquidityProvider');

function listProviders(req, res) {
  res.json({ providers: lpService.listProviders() });
}

function getProvider(req, res) {
  const lp = lpService.getProvider(req.params.id);
  if (!lp) return res.status(404).json({ error: 'Provider not found' });
  res.json({ provider: lp });
}

function addProvider(req, res) {
  const lp = lpService.addProvider(req.body);
  res.status(201).json({ provider: lp });
}

function updateProvider(req, res) {
  const lp = lpService.updateProvider(req.params.id, req.body);
  if (!lp) return res.status(404).json({ error: 'Provider not found' });
  res.json({ provider: lp });
}

module.exports = { listProviders, getProvider, addProvider, updateProvider };
