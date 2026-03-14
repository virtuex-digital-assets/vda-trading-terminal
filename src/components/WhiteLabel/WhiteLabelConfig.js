/**
 * WhiteLabelConfig – Broker management and white-label configuration UI.
 *
 * Used inside the SuperAdmin panel to create and manage white-label brokers.
 */
import React, { useState, useEffect, useCallback } from 'react';
import backendBridge from '../../services/backendBridge';
import './WhiteLabelConfig.css';

function fmt(n) { return typeof n === 'number' ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—'; }

export default function WhiteLabelConfig() {
  const [brokers, setBrokers]       = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState('');
  const [selected, setSelected]     = useState(null);
  const [newBroker, setNewBroker]   = useState({ name: '', ownerEmail: '', domain: '' });
  const [editBrand, setEditBrand]   = useState(false);
  const [brand, setBrand]           = useState({});
  const [editCond, setEditCond]     = useState(false);
  const [cond, setCond]             = useState({});

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const load = useCallback(async () => {
    if (!backendBridge.isConfigured()) return;
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.all([
        backendBridge.get('/brokers/summary'),
        backendBridge.get('/brokers'),
      ]);
      setSummary(sumRes);
      setBrokers(listRes.brokers || []);
    } catch (e) {
      flash(`Load error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!newBroker.name.trim() || !newBroker.ownerEmail.trim()) {
      flash('Name and owner email are required.'); return;
    }
    try {
      await backendBridge.post('/brokers', newBroker);
      flash('Broker created!');
      setNewBroker({ name: '', ownerEmail: '', domain: '' });
      load();
    } catch (e) { flash(`Error: ${e.message}`); }
  }

  async function handleStatusChange(id, status) {
    try {
      await backendBridge.patch(`/brokers/${id}`, { status });
      flash('Status updated.');
      load();
    } catch (e) { flash(`Error: ${e.message}`); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this broker?')) return;
    try {
      await backendBridge.delete(`/brokers/${id}`);
      flash('Broker deleted.');
      setSelected(null);
      load();
    } catch (e) { flash(`Error: ${e.message}`); }
  }

  async function saveBranding() {
    try {
      await backendBridge.patch(`/brokers/${selected.id}/branding`, brand);
      flash('Branding saved.');
      setEditBrand(false);
      load();
    } catch (e) { flash(`Error: ${e.message}`); }
  }

  async function saveConditions() {
    try {
      await backendBridge.patch(`/brokers/${selected.id}/trading-conditions`, cond);
      flash('Trading conditions saved.');
      setEditCond(false);
      load();
    } catch (e) { flash(`Error: ${e.message}`); }
  }

  function openBroker(b) {
    setSelected(b);
    setBrand({ ...b.branding });
    setCond({ ...b.tradingConditions });
    setEditBrand(false);
    setEditCond(false);
  }

  const statusColor = { active: '#3fb950', suspended: '#f85149', inactive: '#8b949e' };

  return (
    <div className="wl-config">
      {msg && <div className="wl-flash">{msg}</div>}

      {/* ── Platform summary ─────────────────────────────────────────────── */}
      {summary && (
        <div className="wl-summary">
          <div className="wl-stat"><span>Brokers</span><strong>{summary.totalBrokers}</strong></div>
          <div className="wl-stat"><span>Active</span><strong>{summary.activeBrokers}</strong></div>
          <div className="wl-stat"><span>Total Traders</span><strong>{fmt(summary.totalTraders)}</strong></div>
          <div className="wl-stat"><span>Total Deposits</span><strong>${fmt(summary.totalDeposits)}</strong></div>
          <div className="wl-stat"><span>Revenue</span><strong>${fmt(summary.totalRevenue)}</strong></div>
        </div>
      )}

      <div className="wl-body">
        {/* ── Broker list ──────────────────────────────────────────────── */}
        <div className="wl-sidebar">
          <div className="wl-sidebar-title">Brokers</div>
          {loading && <div className="wl-loading">Loading…</div>}
          <div className="wl-broker-list">
            {brokers.map((b) => (
              <div
                key={b.id}
                className={`wl-broker-item${selected?.id === b.id ? ' wl-broker-item-active' : ''}`}
                onClick={() => openBroker(b)}
              >
                <div className="wl-broker-name">{b.name}</div>
                <div className="wl-broker-meta">
                  <span style={{ color: statusColor[b.status] || '#8b949e' }}>⬤ {b.status}</span>
                  <span>{b.stats?.traders ?? 0} traders</span>
                </div>
              </div>
            ))}
          </div>

          {/* Create form */}
          <div className="wl-create-form">
            <div className="wl-sidebar-title" style={{ marginTop: '12px' }}>New Broker</div>
            <input className="wl-input" placeholder="Broker name" value={newBroker.name}
              onChange={(e) => setNewBroker((b) => ({ ...b, name: e.target.value }))} />
            <input className="wl-input" placeholder="Owner email" value={newBroker.ownerEmail}
              onChange={(e) => setNewBroker((b) => ({ ...b, ownerEmail: e.target.value }))} />
            <input className="wl-input" placeholder="Domain (optional)" value={newBroker.domain}
              onChange={(e) => setNewBroker((b) => ({ ...b, domain: e.target.value }))} />
            <button className="wl-btn wl-btn-primary" onClick={handleCreate}>Create Broker</button>
          </div>
        </div>

        {/* ── Broker detail ─────────────────────────────────────────────── */}
        {selected ? (
          <div className="wl-detail">
            <div className="wl-detail-header">
              <span className="wl-detail-name">{selected.name}</span>
              <div className="wl-detail-actions">
                {selected.status === 'active'
                  ? <button className="wl-btn wl-btn-warn" onClick={() => handleStatusChange(selected.id, 'suspended')}>Suspend</button>
                  : <button className="wl-btn wl-btn-ok"   onClick={() => handleStatusChange(selected.id, 'active')}>Activate</button>
                }
                <button className="wl-btn wl-btn-danger" onClick={() => handleDelete(selected.id)}>Delete</button>
              </div>
            </div>

            {/* Info grid */}
            <div className="wl-info-grid">
              <div><span>ID</span><strong>{selected.id}</strong></div>
              <div><span>Slug</span><strong>{selected.slug}</strong></div>
              <div><span>Owner</span><strong>{selected.ownerEmail}</strong></div>
              <div><span>Domain</span><strong>{selected.domain}</strong></div>
              <div><span>Status</span><strong style={{ color: statusColor[selected.status] }}>{selected.status}</strong></div>
              <div><span>Created</span><strong>{selected.createdAt?.slice(0, 10)}</strong></div>
            </div>

            {/* Stats */}
            <div className="wl-stats-row">
              <div className="wl-stat-box"><span>Traders</span><strong>{fmt(selected.stats?.traders)}</strong></div>
              <div className="wl-stat-box"><span>Deposits</span><strong>${fmt(selected.revenue?.totalDeposits)}</strong></div>
              <div className="wl-stat-box"><span>Withdrawals</span><strong>${fmt(selected.revenue?.totalWithdrawals)}</strong></div>
              <div className="wl-stat-box"><span>Commissions</span><strong>${fmt(selected.revenue?.commissions)}</strong></div>
            </div>

            {/* Branding */}
            <div className="wl-section">
              <div className="wl-section-hdr">
                <span>Branding</span>
                <button className="wl-btn wl-btn-sm" onClick={() => setEditBrand(!editBrand)}>
                  {editBrand ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editBrand ? (
                <div className="wl-form">
                  <label>Primary Color
                    <input className="wl-input" value={brand.primaryColor || ''} onChange={(e) => setBrand((b) => ({ ...b, primaryColor: e.target.value }))} />
                  </label>
                  <label>Secondary Color
                    <input className="wl-input" value={brand.secondaryColor || ''} onChange={(e) => setBrand((b) => ({ ...b, secondaryColor: e.target.value }))} />
                  </label>
                  <label>Support Email
                    <input className="wl-input" value={brand.supportEmail || ''} onChange={(e) => setBrand((b) => ({ ...b, supportEmail: e.target.value }))} />
                  </label>
                  <label>Logo URL
                    <input className="wl-input" value={brand.logoUrl || ''} onChange={(e) => setBrand((b) => ({ ...b, logoUrl: e.target.value }))} />
                  </label>
                  <button className="wl-btn wl-btn-primary" onClick={saveBranding}>Save Branding</button>
                </div>
              ) : (
                <div className="wl-brand-preview">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="wl-color-swatch" style={{ background: selected.branding?.primaryColor }} />
                    <span>{selected.branding?.primaryColor}</span>
                    <span className="wl-color-swatch" style={{ background: selected.branding?.secondaryColor }} />
                    <span>{selected.branding?.secondaryColor}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: 4 }}>{selected.branding?.supportEmail}</div>
                </div>
              )}
            </div>

            {/* Trading conditions */}
            <div className="wl-section">
              <div className="wl-section-hdr">
                <span>Trading Conditions</span>
                <button className="wl-btn wl-btn-sm" onClick={() => setEditCond(!editCond)}>
                  {editCond ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editCond ? (
                <div className="wl-form">
                  {['defaultLeverage','maxLeverage','commissionPerLot','minDeposit'].map((k) => (
                    <label key={k}>{k}
                      <input className="wl-input" type="number" value={cond[k] ?? ''} onChange={(e) => setCond((c) => ({ ...c, [k]: Number(e.target.value) }))} />
                    </label>
                  ))}
                  <button className="wl-btn wl-btn-primary" onClick={saveConditions}>Save Conditions</button>
                </div>
              ) : (
                <div className="wl-cond-grid">
                  {Object.entries(selected.tradingConditions || {}).map(([k, v]) => (
                    <div key={k}><span>{k}</span><strong>{v}</strong></div>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="wl-section">
              <div className="wl-section-hdr"><span>Features</span></div>
              <div className="wl-features">
                {Object.entries(selected.features || {}).map(([k, v]) => (
                  <div key={k} className={`wl-feature ${v ? 'on' : 'off'}`}>
                    {v ? '✓' : '✗'} {k}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="wl-empty">Select a broker to view details.</div>
        )}
      </div>
    </div>
  );
}
