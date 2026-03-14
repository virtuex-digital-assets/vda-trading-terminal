/**
 * MT4 Bridge controller.
 */
const mt4Service = require('../services/mt4BridgeService');

function listServers(req, res) {
  res.json({ servers: mt4Service.listServers() });
}

function getServer(req, res) {
  const server = mt4Service.getServerStatus(req.params.id);
  if (!server) return res.status(404).json({ error: 'Server not found' });
  res.json({ server });
}

function addServer(req, res) {
  const { name, host, port, login, password } = req.body;
  if (!name || !host) return res.status(400).json({ error: 'name and host are required' });
  const server = mt4Service.addServer({ name, host, port, login, password });
  res.status(201).json({ server });
}

function updateServer(req, res) {
  const server = mt4Service.updateServer(req.params.id, req.body);
  if (!server) return res.status(404).json({ error: 'Server not found' });
  res.json({ server });
}

function connect(req, res) {
  const result = mt4Service.connect(req.params.id);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json(result);
}

function disconnect(req, res) {
  const result = mt4Service.disconnect(req.params.id);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json(result);
}

function getOpenPositions(req, res) {
  const result = mt4Service.getOpenPositions(req.params.id);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json(result);
}

function syncBalance(req, res) {
  const result = mt4Service.syncBalance(req.params.id, req.params.login);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json(result);
}

module.exports = { listServers, getServer, addServer, updateServer, connect, disconnect, getOpenPositions, syncBalance };
