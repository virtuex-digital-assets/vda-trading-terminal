import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  brokerCreateTradingAccount,
  brokerUpdateTradingAccount,
  brokerDisableTradingAccount,
} from '../../../store/actions';
import './TradingAccountsView.css';

const FILTER_TABS = ['All', 'Active', 'Disabled', 'Demo'];

const SERVERS    = ['VDA-Live', 'VDA-Demo'];
const LEVERAGES  = [50, 100, 200, 500];
const ACC_TYPES  = ['Standard', 'Pro', 'Islamic', 'Demo'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];

const EMPTY_FORM = {
  clientId: '',
  server: 'VDA-Live',
  leverage: 100,
  type: 'Standard',
  currency: 'USD',
};

const fmt = (n) =>
  n != null
    ? Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

const TradingAccountsView = () => {
  const dispatch = useDispatch();
  const tradingAccounts = useSelector((s) => s.broker.tradingAccounts);

  const [activeFilter, setActiveFilter]   = useState('All');
  const [searchQuery, setSearchQuery]     = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData]           = useState(EMPTY_FORM);
  const [editingLeverage, setEditingLeverage] = useState(null);
  const [newLeverage, setNewLeverage]     = useState(100);
  const [toast, setToast]                 = useState(null);

  // ── Stats ──
  const total    = tradingAccounts.length;
  const active   = tradingAccounts.filter((a) => a.status === 'active').length;
  const demo     = tradingAccounts.filter((a) => a.type === 'Demo').length;
  const disabled = tradingAccounts.filter((a) => a.status === 'disabled').length;

  // ── Filter + search ──
  const filtered = tradingAccounts.filter((a) => {
    let matchFilter = true;
    if (activeFilter === 'Active')   matchFilter = a.status === 'active' && a.type !== 'Demo';
    else if (activeFilter === 'Disabled') matchFilter = a.status === 'disabled';
    else if (activeFilter === 'Demo')     matchFilter = a.type === 'Demo';

    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      a.clientName.toLowerCase().includes(q) ||
      String(a.login).toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  // ── Toast helper ──
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ──
  const handleDisable = (acc) => {
    if (window.confirm(`Disable trading account ${acc.login} for ${acc.clientName}?`)) {
      dispatch(brokerDisableTradingAccount(acc.id));
    }
  };

  const handleEnable = (acc) => {
    dispatch(brokerUpdateTradingAccount(acc.id, { status: 'active' }));
  };

  const handleResetPassword = (acc) => {
    showToast(`Password reset email sent for account ${acc.login} (${acc.clientName}).`, 'success');
  };

  const handleLeverageSubmit = (acc) => {
    dispatch(brokerUpdateTradingAccount(acc.id, { leverage: Number(newLeverage) }));
    setEditingLeverage(null);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientId.trim()) return;
    dispatch(brokerCreateTradingAccount(formData));
    setFormData(EMPTY_FORM);
    setShowCreateModal(false);
    showToast('Trading account created successfully.', 'success');
  };

  return (
    <div className="view-container">
      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Trading Accounts</h2>
          <span className="view-subtitle">Manage client trading accounts</span>
        </div>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          + New Account
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="view-stats ta-stats">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Accounts</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value success">{active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-value info">{demo}</div>
          <div className="stat-label">Demo</div>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-value danger">{disabled}</div>
          <div className="stat-label">Disabled</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="view-toolbar">
        <div className="filter-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <input
          className="view-search"
          placeholder="Search client or account ID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Login</th>
              <th>Client</th>
              <th>Server</th>
              <th>Type</th>
              <th>Leverage</th>
              <th>Balance</th>
              <th>Equity</th>
              <th>Margin</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-state">
                  <div className="empty-icon">📊</div>
                  <div>No trading accounts match the current filter.</div>
                </td>
              </tr>
            ) : (
              filtered.map((acc) => (
                <React.Fragment key={acc.id}>
                  <tr>
                    <td>
                      <span className="login-id">{acc.login}</span>
                      <span className="acc-id">#{acc.id}</span>
                    </td>
                    <td>
                      <span className="client-name">{acc.clientName}</span>
                    </td>
                    <td className="server-cell">{acc.server}</td>
                    <td>
                      <span className={`badge badge-type-${acc.type.toLowerCase()}`}>
                        {acc.type}
                      </span>
                    </td>
                    <td>
                      <span className="leverage-val">1:{acc.leverage}</span>
                    </td>
                    <td className="num-cell positive">{acc.currency} {fmt(acc.balance)}</td>
                    <td className="num-cell">{acc.currency} {fmt(acc.equity)}</td>
                    <td className="num-cell">{acc.currency} {fmt(acc.margin)}</td>
                    <td>
                      <span className={`badge badge-${acc.status}`}>
                        {acc.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {acc.status === 'active' ? (
                          <button
                            className="btn-danger"
                            onClick={() => handleDisable(acc)}
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            className="btn-success"
                            onClick={() => handleEnable(acc)}
                          >
                            Enable
                          </button>
                        )}
                        <button
                          className="btn-primary"
                          onClick={() => handleResetPassword(acc)}
                        >
                          Reset Pwd
                        </button>
                        <button
                          className="btn-warning"
                          onClick={() => {
                            setEditingLeverage(acc.id);
                            setNewLeverage(acc.leverage);
                          }}
                        >
                          Leverage
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* ── Inline leverage edit row ── */}
                  {editingLeverage === acc.id && (
                    <tr className="inline-action-row">
                      <td colSpan={10}>
                        <div className="inline-action-panel leverage-panel">
                          <span className="inline-label">Edit leverage for {acc.login}:</span>
                          <select
                            className="inline-select"
                            value={newLeverage}
                            onChange={(e) => setNewLeverage(e.target.value)}
                          >
                            {LEVERAGES.map((l) => (
                              <option key={l} value={l}>1:{l}</option>
                            ))}
                          </select>
                          <button
                            className="btn-warning"
                            onClick={() => handleLeverageSubmit(acc)}
                          >
                            Update
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => setEditingLeverage(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Account Modal ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Trading Account</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-field">
                <label>Client ID *</label>
                <input
                  placeholder="e.g. CLT001"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-field">
                <label>Login (auto-generated)</label>
                <input
                  value="Auto-assigned on creation"
                  disabled
                  className="input-disabled"
                />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Server</label>
                  <select
                    value={formData.server}
                    onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                  >
                    {SERVERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-field">
                  <label>Leverage</label>
                  <select
                    value={formData.leverage}
                    onChange={(e) => setFormData({ ...formData, leverage: Number(e.target.value) })}
                  >
                    {LEVERAGES.map((l) => (
                      <option key={l} value={l}>1:{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Account Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {ACC_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-field">
                  <label>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingAccountsView;
