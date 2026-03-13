/**
 * VDA Trading Terminal – Backend Server
 *
 * Starts an Express REST API + WebSocket server that powers the trading
 * platform.
 *
 * REST API base: http://localhost:5000/api
 * WebSocket:     ws://localhost:5000  (upgrade from HTTP)
 *
 * Default demo credentials:
 *   Admin:  admin@vda.trade / Admin1234!
 *   Trader: demo@vda.trade  / Demo1234!
 *
 * Set REACT_APP_MT4_BRIDGE_URL=ws://localhost:5000 in the React app to
 * connect the frontend to this backend instead of the built-in simulator.
 */

require('dotenv').config();
const http   = require('http');
const express = require('express');
const cors    = require('cors');
const config  = require('./config/config');

// Routes
const authRoutes    = require('./routes/auth');
const orderRoutes   = require('./routes/orders');
const accountRoutes = require('./routes/account');
const symbolRoutes  = require('./routes/symbols');
const adminRoutes   = require('./routes/admin');
const walletRoutes  = require('./routes/wallet');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Request logger ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/symbols', symbolRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/wallet',  walletRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const { providerName } = require('./services/marketDataProvider');
  res.json({
    status: 'ok',
    ts: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    marketDataProvider: providerName(),
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ── HTTP + WebSocket server ────────────────────────────────────────────────
const httpServer = http.createServer(app);

const { startWsServer } = require('./services/wsServer');
startWsServer(httpServer);

if (require.main === module) {
  httpServer.listen(config.port, () => {
    console.log(`VDA Trading Terminal – Backend Server`);
    console.log(`  REST API  → http://localhost:${config.port}/api`);
    console.log(`  WebSocket → ws://localhost:${config.port}`);
    console.log(`  Demo:  super@vda.trade  / Super1234!  (super_admin)`);
    console.log(`  Demo:  admin@vda.trade  / Admin1234!  (admin)`);
    console.log(`  Demo:  demo@vda.trade   / Demo1234!   (trader)`);
  });
}

module.exports = app;          // exported for testing
module.exports.httpServer = httpServer; // allow tests to close the server
