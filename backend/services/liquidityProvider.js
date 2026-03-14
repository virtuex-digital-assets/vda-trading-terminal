/**
 * Liquidity Provider (LP) routing service.
 *
 * Routes A-book orders to configured liquidity providers.
 * Supports multiple LPs with spread aggregation, failover, and latency tracking.
 *
 * In production this would connect to real LP APIs (FIX API / REST).
 * Here we simulate LP execution with configurable latency and fill rates.
 */

// ── LP Registry ────────────────────────────────────────────────────────────

const providers = new Map([
  ['lp_prime', {
    id: 'lp_prime',
    name: 'Prime Liquidity Solutions',
    type: 'prime_broker',
    status: 'active',
    priority: 1,
    spreadMarkup: 0.00005,     // added to raw spread
    maxLots: 50,
    minLots: 0.01,
    symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'XAUUSD'],
    latencyMs: 12,
    fillRate: 0.98,            // 98% fill rate
    stats: { ordersRouted: 0, ordersRejected: 0, totalVolume: 0 },
  }],
  ['lp_ecn1', {
    id: 'lp_ecn1',
    name: 'ECN Bridge Alpha',
    type: 'ecn',
    status: 'active',
    priority: 2,
    spreadMarkup: 0.0001,
    maxLots: 100,
    minLots: 0.01,
    symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'XAUUSD', 'BTCUSD', 'ETHUSD'],
    latencyMs: 25,
    fillRate: 0.95,
    stats: { ordersRouted: 0, ordersRejected: 0, totalVolume: 0 },
  }],
  ['lp_crypto', {
    id: 'lp_crypto',
    name: 'Crypto Liquidity Hub',
    type: 'crypto_exchange',
    status: 'active',
    priority: 3,
    spreadMarkup: 0.5,
    maxLots: 10,
    minLots: 0.001,
    symbols: ['BTCUSD', 'ETHUSD'],
    latencyMs: 50,
    fillRate: 0.92,
    stats: { ordersRouted: 0, ordersRejected: 0, totalVolume: 0 },
  }],
]);

// ── Routing logic ──────────────────────────────────────────────────────────

/**
 * Select the best LP for a given symbol and lot size.
 * Sorted by priority; falls back to next if LP doesn't support the symbol.
 *
 * @param {string} symbol
 * @param {number} lots
 * @returns {object|null} LP config or null if no suitable LP found
 */
function selectProvider(symbol, lots) {
  const candidates = [...providers.values()]
    .filter((lp) => lp.status === 'active' && lp.symbols.includes(symbol) && lots >= lp.minLots && lots <= lp.maxLots)
    .sort((a, b) => a.priority - b.priority);
  return candidates[0] || null;
}

/**
 * Simulate routing an A-book order to a LP.
 *
 * @param {object} params
 * @param {string} params.symbol
 * @param {string} params.type    'BUY' | 'SELL'
 * @param {number} params.lots
 * @param {number} params.price
 * @param {number} params.ticket
 * @returns {{ ok: boolean, lpId?: string, execPrice?: number, latencyMs?: number, error?: string }}
 */
function routeToLP({ symbol, type, lots, price, ticket }) {
  const lp = selectProvider(symbol, lots);
  if (!lp) {
    return { ok: false, error: `No LP available for ${symbol} ${lots} lots` };
  }

  // Simulate fill / reject based on fill rate
  if (Math.random() > lp.fillRate) {
    lp.stats.ordersRejected += 1;
    return { ok: false, lpId: lp.id, error: 'LP rejected order (simulated)' };
  }

  // Apply LP spread markup to execution price
  const markup = lp.spreadMarkup;
  const execPrice = type === 'BUY' ? price + markup : price - markup;

  lp.stats.ordersRouted += 1;
  lp.stats.totalVolume += lots;

  return {
    ok: true,
    lpId: lp.id,
    lpName: lp.name,
    execPrice: parseFloat(execPrice.toFixed(5)),
    latencyMs: lp.latencyMs + Math.floor(Math.random() * 10),
    ticket,
  };
}

// ── Aggregated best bid/ask ────────────────────────────────────────────────

/**
 * Get aggregated best bid/ask for a symbol across all active LPs.
 * @param {string} symbol
 * @param {number} midPrice
 * @returns {{ bid: number, ask: number, source: string }}
 */
function getAggregatedQuote(symbol, midPrice) {
  const lps = [...providers.values()].filter((lp) => lp.status === 'active' && lp.symbols.includes(symbol));
  if (lps.length === 0) return { bid: midPrice, ask: midPrice, source: 'internal' };

  // Best (tightest spread) LP wins
  const best = lps.reduce((prev, curr) => (curr.spreadMarkup < prev.spreadMarkup ? curr : prev));
  return {
    bid: parseFloat((midPrice - best.spreadMarkup).toFixed(5)),
    ask: parseFloat((midPrice + best.spreadMarkup).toFixed(5)),
    source: best.id,
  };
}

// ── Management ─────────────────────────────────────────────────────────────

function listProviders() {
  return [...providers.values()].map(({ id, name, type, status, priority, spreadMarkup, maxLots, minLots, symbols, latencyMs, fillRate, stats }) =>
    ({ id, name, type, status, priority, spreadMarkup, maxLots, minLots, symbols, latencyMs, fillRate, stats })
  );
}

function getProvider(id) {
  return providers.get(id) || null;
}

function updateProvider(id, updates) {
  const lp = providers.get(id);
  if (!lp) return null;
  const allowed = ['status', 'priority', 'spreadMarkup', 'maxLots', 'minLots', 'fillRate', 'latencyMs'];
  for (const key of allowed) {
    if (updates[key] !== undefined) lp[key] = updates[key];
  }
  return lp;
}

function addProvider(config) {
  const id = config.id || `lp_${Date.now()}`;
  const lp = {
    id,
    name: config.name || 'New LP',
    type: config.type || 'ecn',
    status: config.status || 'inactive',
    priority: config.priority || 10,
    spreadMarkup: config.spreadMarkup || 0.0001,
    maxLots: config.maxLots || 100,
    minLots: config.minLots || 0.01,
    symbols: config.symbols || [],
    latencyMs: config.latencyMs || 50,
    fillRate: config.fillRate || 0.95,
    stats: { ordersRouted: 0, ordersRejected: 0, totalVolume: 0 },
  };
  providers.set(id, lp);
  return lp;
}

module.exports = {
  selectProvider,
  routeToLP,
  getAggregatedQuote,
  listProviders,
  getProvider,
  updateProvider,
  addProvider,
};
