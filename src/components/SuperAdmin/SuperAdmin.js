import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatProfit } from '../../utils/formatters';
import {
  CRM_ADD_CLIENT,
  CRM_DELETE_CLIENT,
  CRM_UPDATE_CLIENT,
  UPDATE_ACCOUNT,
  ADD_LOG,
} from '../../store/actions/actionTypes';
import CRMView from '../CRM/CRMView';
import BrokerMonitor from '../BrokerMonitor/BrokerMonitor';
import MarketFeed from '../MarketFeed/MarketFeed';
import Terminal from '../Terminal/Terminal';
import './SuperAdmin.css';

/**
 * SuperAdmin – Super-Administrator control panel.
 *
 * Provides privileged operations beyond the broker dashboard:
 *  • Global platform statistics
 *  • CRM – full client relationship management
 *  • Risk Monitor – broker exposure & margin risk
 *  • Market Feed – live trading signals
 *  • Terminal Log – system event log
 *  • User / broker account management (create, suspend, adjust balance)
 *  • Symbol configuration (spread, leverage cap)
 *  • Trade history review
 *  • System settings
 *
 * Access: "super_admin" role only (set via Login component).
 */

// ── Symbol configuration defaults ──────────────────────────────────────────
const DEFAULT_SYMBOLS = [
  { symbol: 'EURUSD',  spread: 1.0, leverageCap: 500, active: true  },
  { symbol: 'GBPUSD',  spread: 1.2, leverageCap: 500, active: true  },
  { symbol: 'USDJPY',  spread: 1.0, leverageCap: 500, active: true  },
  { symbol: 'USDCHF',  spread: 1.5, leverageCap: 500, active: true  },
  { symbol: 'AUDUSD',  spread: 1.3, leverageCap: 500, active: true  },
  { symbol: 'USDCAD',  spread: 1.4, leverageCap: 500, active: true  },
  { symbol: 'NZDUSD',  spread: 1.6, leverageCap: 500, active: true  },
  { symbol: 'XAUUSD',  spread: 3.0, leverageCap: 100, active: true  },
  { symbol: 'XAGUSD',  spread: 4.0, leverageCap: 100, active: true  },
  { symbol: 'BTCUSD',  spread: 50,  leverageCap: 10,  active: false },
];

const TABS = ['overview', 'crm', 'risk', 'feed', 'terminal', 'accounts', 'symbols', 'trades', 'settings'];
const TAB_LABELS = {
  overview: '📊 Overview',
  crm:      '👥 CRM',
  risk:     '🛡 Risk Monitor',
  feed:     '🎬 Market Feed',
  terminal: '🖥 Terminal Log',
  accounts: '👤 Accounts',
  symbols:  '📈 Symbols',
  trades:   '📋 Trades',
  settings: '⚙️ Settings',
};

// ── Demo client names ────────────────────────────────────────────────────────
const DEMO_CLIENT_NAMES = ['Alice Johnson', 'Bob Chen', 'Carlos Ruiz', 'Diana Park', 'Ethan Walsh'];

// ── Helpers ──────────────────────────────────────────────────────────────────
// Use Web Crypto API when available; fall back for environments that don't support it.
const newId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  }
  return Math.random().toString(36).slice(2, 10).toUpperCase();
};

const SuperAdmin = () => {
  const dispatch   = useDispatch();
  const orders     = useSelector((s) => s.orders);
  const account    = useSelector((s) => s.account);
  const crmClients = useSelector((s) => s.crm.clients);

  const [tab, setTab]              = useState('overview');
  const [symbols, setSymbols]      = useState(DEFAULT_SYMBOLS);
  const [brokers, setBrokers]      = useState([
    { id: 'B001', name: 'VDA Prime Broker', email: 'broker@vda.trade',  role: 'broker',      status: 'active',    clients: crmClients.length, balance: 250000 },
    { id: 'B002', name: 'Alpha Capital',    email: 'alpha@cap.trade',   role: 'broker',      status: 'active',    clients: 34,                balance: 180000 },
    { id: 'B003', name: 'TestBroker',       email: 'test@broker.com',   role: 'broker',      status: 'suspended', clients: 2,                 balance: 5000   },
  ]);
  const [settings, setSettings]    = useState({
    maxLeverage:       500,
    minDeposit:        100,
    maintenanceMode:   false,
    registrationOpen:  true,
    defaultCurrency:   'USD',
    platformName:      'VDA Trading Terminal',
    supportEmail:      'support@vda.trade',
  });
  const [newBroker, setNewBroker]  = useState({ name: '', email: '', role: 'broker' });
  const [adjTarget, setAdjTarget]  = useState('');
  const [adjAmount, setAdjAmount]  = useState('');
  const [adjNote,   setAdjNote]    = useState('');
  const [msg,       setMsg]        = useState('');

  // ── Flash message helper ─────────────────────────────────────────────────
  const flash = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }, []);

  // ── Computed overview stats ──────────────────────────────────────────────
  const totalOpenOrders  = orders.openOrders.length;
  const totalPnL         = orders.openOrders.reduce((s, o) => s + (o.profit || 0), 0);
  const closedOrders     = orders.closedOrders || [];
  const totalVolume      = [...orders.openOrders, ...closedOrders].reduce((s, o) => s + o.lots, 0);
  const activeAccounts   = brokers.filter((b) => b.status === 'active').length;
  const suspendedCount   = brokers.filter((b) => b.status === 'suspended').length;
  const totalClients     = brokers.reduce((s, b) => s + b.clients, 0);

  // ── Create broker account ────────────────────────────────────────────────
  const handleCreateBroker = () => {
    if (!newBroker.name.trim() || !newBroker.email.trim()) {
      flash('Name and email are required.');
      return;
    }
    const broker = {
      id:      `B${newId()}`,
      name:    newBroker.name.trim(),
      email:   newBroker.email.trim(),
      role:    newBroker.role,
      status:  'active',
      clients: 0,
      balance: 0,
    };
    setBrokers((prev) => [...prev, broker]);
    dispatch({ type: ADD_LOG, payload: `[ADMIN] Created broker "${broker.name}" (${broker.email})` });
    setNewBroker({ name: '', email: '', role: 'broker' });
    flash(`Broker "${broker.name}" created.`);
  };

  // ── Suspend / reinstate account ──────────────────────────────────────────
  const handleToggleSuspend = (id) => {
    setBrokers((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === 'active' ? 'suspended' : 'active' }
          : b
      )
    );
    const broker = brokers.find((b) => b.id === id);
    if (broker) {
      const next = broker.status === 'active' ? 'suspended' : 'active';
      dispatch({ type: ADD_LOG, payload: `[ADMIN] Account "${broker.name}" set to ${next}` });
      flash(`"${broker.name}" is now ${next}.`);
    }
  };

  // ── Balance adjustment (demo account) ────────────────────────────────────
  const handleAdjustBalance = () => {
    const amount = parseFloat(adjAmount);
    if (isNaN(amount)) { flash('Enter a valid amount.'); return; }
    dispatch({ type: UPDATE_ACCOUNT, payload: { balance: Math.max(0, account.balance + amount) } });
    dispatch({ type: ADD_LOG, payload: `[ADMIN] Balance adjusted by ${amount >= 0 ? '+' : ''}${amount.toFixed(2)} — ${adjNote || 'admin adjustment'}` });

    if (adjTarget) {
      // Also record in CRM if client matches
      const client = crmClients.find(
        (c) => c.name.toLowerCase().includes(adjTarget.toLowerCase()) ||
               c.email.toLowerCase().includes(adjTarget.toLowerCase())
      );
      if (client) {
        dispatch({
          type: CRM_UPDATE_CLIENT,
          payload: { id: client.id, balance: (client.balance || 0) + amount },
        });
      }
    }
    setAdjTarget(''); setAdjAmount(''); setAdjNote('');
    flash(`Balance adjusted by ${amount >= 0 ? '+' : ''}${amount.toFixed(2)}.`);
  };

  // ── Symbol toggle ────────────────────────────────────────────────────────
  const handleToggleSymbol = (sym) => {
    setSymbols((prev) =>
      prev.map((s) => s.symbol === sym ? { ...s, active: !s.active } : s)
    );
    dispatch({ type: ADD_LOG, payload: `[ADMIN] Symbol ${sym} toggled` });
  };

  const handleSpreadChange = (sym, value) => {
    const spread = parseFloat(value);
    if (isNaN(spread) || spread < 0) return;
    setSymbols((prev) =>
      prev.map((s) => s.symbol === sym ? { ...s, spread } : s)
    );
  };

  const handleLevCapChange = (sym, value) => {
    const cap = parseInt(value, 10);
    if (isNaN(cap) || cap < 1) return;
    setSymbols((prev) =>
      prev.map((s) => s.symbol === sym ? { ...s, leverageCap: cap } : s)
    );
  };

  // ── Save settings ─────────────────────────────────────────────────────────
  const handleSaveSettings = () => {
    dispatch({ type: ADD_LOG, payload: '[ADMIN] System settings saved' });
    flash('Settings saved successfully.');
  };

  // ── Add demo CRM client ───────────────────────────────────────────────────
  const handleAddDemoClient = () => {
    const name = DEMO_CLIENT_NAMES[Math.floor(Math.random() * DEMO_CLIENT_NAMES.length)];
    dispatch({
      type: CRM_ADD_CLIENT,
      payload: {
        id:      `SA-${newId()}`,
        name,
        email:   `${name.split(' ')[0].toLowerCase()}@demo.trade`,
        phone:   '+1-555-' + Math.floor(1000 + Math.random() * 9000),
        country: 'US',
        stage:   'lead',
        balance: 0,
        kyc:     'pending',
        notes:   [],
        transactions: [],
        rep: 'admin',
      },
    });
    flash(`Demo client "${name}" added to CRM.`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="super-admin">
      {/* Header */}
      <div className="sa-header">
        <span className="sa-title">👑 Super Admin Control Panel</span>
        <span className="sa-subtitle">Platform Management · Full Access</span>
        {msg && <span className="sa-flash">{msg}</span>}
      </div>

      {/* Tab nav */}
      <div className="sa-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`sa-tab${tab === t ? ' sa-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="sa-content">
          <div className="sa-kpi-grid">
            <KpiCard label="Open Positions"  value={totalOpenOrders}            color="#a0b0ff" />
            <KpiCard label="Total Volume"    value={`${totalVolume.toFixed(2)} lots`} color="#50d0a0" />
            <KpiCard label="Floating P&L"    value={formatProfit(totalPnL)}     color={totalPnL >= 0 ? '#50d0a0' : '#ff6060'} />
            <KpiCard label="Active Brokers"  value={activeAccounts}             color="#a0b0ff" />
            <KpiCard label="Suspended"       value={suspendedCount}             color={suspendedCount ? '#ff6060' : '#50d0a0'} />
            <KpiCard label="Total Clients"   value={totalClients + crmClients.length} color="#e0c040" />
            <KpiCard label="Demo Balance"    value={`$${account.balance.toFixed(2)}`} color="#50d0a0" />
            <KpiCard label="Demo Equity"     value={`$${account.equity.toFixed(2)}`}  color="#a0b0ff" />
          </div>

          <div className="sa-section">
            <div className="sa-section-title">Balance Adjustment</div>
            <div className="sa-row">
              <input
                className="sa-input"
                placeholder="Client name or email (optional)"
                value={adjTarget}
                onChange={(e) => setAdjTarget(e.target.value)}
              />
              <input
                className="sa-input sa-input-sm"
                type="number"
                placeholder="Amount (+ / -)"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
              />
              <input
                className="sa-input"
                placeholder="Note / reason"
                value={adjNote}
                onChange={(e) => setAdjNote(e.target.value)}
              />
              <button className="sa-btn sa-btn-primary" onClick={handleAdjustBalance}>
                Adjust
              </button>
            </div>
          </div>

          <div className="sa-section">
            <div className="sa-section-title">Quick Actions</div>
            <div className="sa-row">
              <button className="sa-btn" onClick={handleAddDemoClient}>
                + Add Demo Client
              </button>
              <button
                className={`sa-btn ${settings.maintenanceMode ? 'sa-btn-danger' : ''}`}
                onClick={() => {
                  setSettings((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }));
                  flash(`Maintenance mode ${settings.maintenanceMode ? 'disabled' : 'enabled'}.`);
                }}
              >
                {settings.maintenanceMode ? '🔴 Maintenance ON' : '🟢 Maintenance OFF'}
              </button>
              <button
                className="sa-btn"
                onClick={() => {
                  setSettings((s) => ({ ...s, registrationOpen: !s.registrationOpen }));
                  flash(`Registration ${settings.registrationOpen ? 'closed' : 'opened'}.`);
                }}
              >
                {settings.registrationOpen ? '🔓 Registration Open' : '🔒 Registration Closed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Accounts ─────────────────────────────────────────────────────── */}
      {tab === 'accounts' && (
        <div className="sa-content">
          <div className="sa-section">
            <div className="sa-section-title">Create Broker Account</div>
            <div className="sa-row">
              <input
                className="sa-input"
                placeholder="Broker / firm name"
                value={newBroker.name}
                onChange={(e) => setNewBroker((b) => ({ ...b, name: e.target.value }))}
              />
              <input
                className="sa-input"
                placeholder="Email address"
                value={newBroker.email}
                onChange={(e) => setNewBroker((b) => ({ ...b, email: e.target.value }))}
              />
              <select
                className="sa-select"
                value={newBroker.role}
                onChange={(e) => setNewBroker((b) => ({ ...b, role: e.target.value }))}
              >
                <option value="broker">Broker</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button className="sa-btn sa-btn-primary" onClick={handleCreateBroker}>
                Create
              </button>
            </div>
          </div>

          <div className="sa-section">
            <div className="sa-section-title">Broker Accounts</div>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Clients</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map((b) => (
                  <tr key={b.id} className={b.status === 'suspended' ? 'sa-row-suspended' : ''}>
                    <td className="sa-mono">{b.id}</td>
                    <td>{b.name}</td>
                    <td className="sa-dim">{b.email}</td>
                    <td><span className={`sa-badge sa-role-${b.role}`}>{b.role}</span></td>
                    <td className="sa-center">{b.clients}</td>
                    <td className="sa-right">${b.balance.toLocaleString()}</td>
                    <td>
                      <span className={`sa-badge ${b.status === 'active' ? 'sa-status-active' : 'sa-status-suspended'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`sa-btn sa-btn-sm ${b.status === 'active' ? 'sa-btn-warn' : 'sa-btn-ok'}`}
                        onClick={() => handleToggleSuspend(b.id)}
                      >
                        {b.status === 'active' ? 'Suspend' : 'Reinstate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Symbols ──────────────────────────────────────────────────────── */}
      {tab === 'symbols' && (
        <div className="sa-content">
          <div className="sa-section">
            <div className="sa-section-title">Symbol Configuration</div>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Spread (pts)</th>
                  <th>Max Leverage</th>
                  <th>Status</th>
                  <th>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {symbols.map((s) => (
                  <tr key={s.symbol} className={s.active ? '' : 'sa-row-suspended'}>
                    <td className="sa-symbol">{s.symbol}</td>
                    <td>
                      <input
                        className="sa-input sa-input-num"
                        type="number"
                        min="0"
                        step="0.1"
                        value={s.spread}
                        onChange={(e) => handleSpreadChange(s.symbol, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="sa-input sa-input-num"
                        type="number"
                        min="1"
                        step="1"
                        value={s.leverageCap}
                        onChange={(e) => handleLevCapChange(s.symbol, e.target.value)}
                      />
                    </td>
                    <td>
                      <span className={`sa-badge ${s.active ? 'sa-status-active' : 'sa-status-suspended'}`}>
                        {s.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`sa-btn sa-btn-sm ${s.active ? 'sa-btn-warn' : 'sa-btn-ok'}`}
                        onClick={() => handleToggleSymbol(s.symbol)}
                      >
                        {s.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Trades ───────────────────────────────────────────────────────── */}
      {tab === 'trades' && (
        <div className="sa-content">
          <div className="sa-section">
            <div className="sa-section-title">
              Open Positions ({orders.openOrders.length})
            </div>
            {orders.openOrders.length === 0 ? (
              <div className="sa-empty">No open positions.</div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Lots</th>
                    <th>Open Price</th>
                    <th>SL</th>
                    <th>TP</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.openOrders.map((o) => (
                    <tr key={o.ticket}>
                      <td className="sa-mono">{o.ticket}</td>
                      <td className="sa-symbol">{o.symbol}</td>
                      <td className={`sa-type-${o.type.toLowerCase()}`}>{o.type}</td>
                      <td className="sa-center">{o.lots}</td>
                      <td className="sa-right">{o.openPrice}</td>
                      <td className="sa-right sa-dim">{o.sl || '—'}</td>
                      <td className="sa-right sa-dim">{o.tp || '—'}</td>
                      <td className={`sa-right ${(o.profit || 0) >= 0 ? 'sa-profit' : 'sa-loss'}`}>
                        {formatProfit(o.profit || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="sa-section">
            <div className="sa-section-title">
              Trade History ({closedOrders.length})
            </div>
            {closedOrders.length === 0 ? (
              <div className="sa-empty">No closed trades yet.</div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Lots</th>
                    <th>Open</th>
                    <th>Close</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {closedOrders.map((o) => (
                    <tr key={o.ticket}>
                      <td className="sa-mono">{o.ticket}</td>
                      <td className="sa-symbol">{o.symbol}</td>
                      <td className={`sa-type-${o.type.toLowerCase()}`}>{o.type}</td>
                      <td className="sa-center">{o.lots}</td>
                      <td className="sa-right">{o.openPrice}</td>
                      <td className="sa-right">{o.closePrice || '—'}</td>
                      <td className={`sa-right ${(o.profit || 0) >= 0 ? 'sa-profit' : 'sa-loss'}`}>
                        {formatProfit(o.profit || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── CRM ──────────────────────────────────────────────────────────── */}
      {tab === 'crm' && (
        <div className="sa-embed-view">
          <CRMView />
        </div>
      )}

      {/* ── Risk Monitor ─────────────────────────────────────────────────── */}
      {tab === 'risk' && (
        <div className="sa-embed-view">
          <BrokerMonitor />
        </div>
      )}

      {/* ── Market Feed ──────────────────────────────────────────────────── */}
      {tab === 'feed' && (
        <div className="sa-embed-view">
          <MarketFeed />
        </div>
      )}

      {/* ── Terminal Log ─────────────────────────────────────────────────── */}
      {tab === 'terminal' && (
        <div className="sa-embed-view">
          <Terminal />
        </div>
      )}

      {/* ── Settings ─────────────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="sa-content">
          <div className="sa-section">
            <div className="sa-section-title">Platform Settings</div>
            <div className="sa-form-grid">
              <label className="sa-label">Platform Name</label>
              <input
                className="sa-input"
                value={settings.platformName}
                onChange={(e) => setSettings((s) => ({ ...s, platformName: e.target.value }))}
              />

              <label className="sa-label">Support Email</label>
              <input
                className="sa-input"
                value={settings.supportEmail}
                onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
              />

              <label className="sa-label">Default Currency</label>
              <select
                className="sa-select"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings((s) => ({ ...s, defaultCurrency: e.target.value }))}
              >
                {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <label className="sa-label">Global Max Leverage</label>
              <input
                className="sa-input sa-input-sm"
                type="number"
                min="1"
                max="2000"
                value={settings.maxLeverage}
                onChange={(e) => setSettings((s) => ({ ...s, maxLeverage: parseInt(e.target.value, 10) || 500 }))}
              />

              <label className="sa-label">Minimum Deposit ($)</label>
              <input
                className="sa-input sa-input-sm"
                type="number"
                min="0"
                value={settings.minDeposit}
                onChange={(e) => setSettings((s) => ({ ...s, minDeposit: parseInt(e.target.value, 10) || 0 }))}
              />

              <label className="sa-label">Maintenance Mode</label>
              <div className="sa-toggle-row">
                <button
                  className={`sa-btn ${settings.maintenanceMode ? 'sa-btn-danger' : 'sa-btn-ok'}`}
                  onClick={() => setSettings((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                >
                  {settings.maintenanceMode ? '🔴 ON' : '🟢 OFF'}
                </button>
              </div>

              <label className="sa-label">Open Registration</label>
              <div className="sa-toggle-row">
                <button
                  className={`sa-btn ${settings.registrationOpen ? 'sa-btn-ok' : 'sa-btn-warn'}`}
                  onClick={() => setSettings((s) => ({ ...s, registrationOpen: !s.registrationOpen }))}
                >
                  {settings.registrationOpen ? '🔓 Open' : '🔒 Closed'}
                </button>
              </div>
            </div>

            <div className="sa-row sa-mt">
              <button className="sa-btn sa-btn-primary" onClick={handleSaveSettings}>
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── KPI Card sub-component ────────────────────────────────────────────────
const KpiCard = ({ label, value, color }) => (
  <div className="sa-kpi-card">
    <div className="sa-kpi-value" style={{ color }}>{value}</div>
    <div className="sa-kpi-label">{label}</div>
  </div>
);

export default SuperAdmin;
