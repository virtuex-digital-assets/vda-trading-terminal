/**
 * Centralised error-handling middleware.
 * Must be registered AFTER all routes (4-argument function).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${message}`);
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
