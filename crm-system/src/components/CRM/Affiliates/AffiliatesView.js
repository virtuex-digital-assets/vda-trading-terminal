import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { brokerAddAffiliate, brokerUpdateAffiliate } from '../../../store/actions';
import './AffiliatesView.css';

const fmt = (n) =>
  '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FILTER_TABS = ['All', 'Active', 'Pending'];
const AGENTS = ['Alice K.', 'Bob T.', 'Carol M.'];

const EMPTY_FORM = {
  name: '',
  contactEmail: '',
  commissionRate: '',
  level: '1',
  parentId: '',
  referralCode: '',
};

const AffiliatesView = () => {
  const dispatch = useDispatch();
  const affiliates = useSelector((s) => s.broker.affiliates);

  const [activeFilter, setActiveFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // ── Stats ──
  const totalIBs = affiliates.length;
  const activeIBs = affiliates.filter((a) => a.status === 'active').length;
  const totalCommission = affiliates.reduce((s, a) => s + (a.paidCommission || 0), 0);
  const pendingCommission = affiliates.reduce((s, a) => s + (a.pendingCommission || 0), 0);

  // ── Filter ──
  const filtered = affiliates.filter((a) => {
    if (activeFilter === 'All') return true;
    return a.status === activeFilter.toLowerCase();
  });

  // ── Handlers ──
  const handleToggleStatus = (aff) => {
    const newStatus = aff.status === 'active' ? 'inactive' : 'active';
    dispatch(brokerUpdateAffiliate(aff.id, { status: newStatus }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'level' && value === '1') {
      setForm((prev) => ({ ...prev, level: '1', parentId: '' }));
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Name is required.');
    if (!form.contactEmail.trim()) return setFormError('Email is required.');
    if (!form.commissionRate || isNaN(Number(form.commissionRate)))
      return setFormError('Enter a valid commission rate.');
    if (!form.referralCode.trim()) return setFormError('Referral code is required.');
    if (form.level === '2' && !form.parentId) return setFormError('Select a parent IB for level 2.');

    dispatch(
      brokerAddAffiliate({
        name: form.name.trim(),
        contactEmail: form.contactEmail.trim(),
        commissionRate: Number(form.commissionRate) / 100,
        level: Number(form.level),
        parentId: form.level === '2' ? form.parentId : null,
        referralCode: form.referralCode.trim(),
      })
    );
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  // ── IB hierarchy for tree view ──
  const masterIBs = affiliates.filter((a) => a.level === 1);
  const subIBs = affiliates.filter((a) => a.level === 2);
  const level1IBs = affiliates.filter((a) => a.level === 1);

  return (
    <div className="view-container">
      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">IB Partners</h2>
          <span className="view-subtitle">Manage introducing broker affiliates</span>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add IB Partner
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="view-stats aff-stats">
        <div className="stat-card stat-card-info">
          <div className="stat-value info">{totalIBs}</div>
          <div className="stat-label">Total IBs</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value success">{activeIBs}</div>
          <div className="stat-label">Active IBs</div>
        </div>
        <div className="stat-card stat-card-warn">
          <div className="stat-value warn">{fmt(totalCommission)}</div>
          <div className="stat-label">Total Commission Paid</div>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-value danger">{fmt(pendingCommission)}</div>
          <div className="stat-label">Pending Commission</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="view-toolbar">
        <div className="filter-tabs">
          {FILTER_TABS.map((tab) => {
            const count =
              tab === 'All'
                ? affiliates.length
                : affiliates.filter((a) => a.status === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                className={`filter-tab${activeFilter === tab ? ' active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab} <span className="tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>IB ID</th>
              <th>Name / Email</th>
              <th>Level</th>
              <th>Referral Code</th>
              <th>Clients</th>
              <th>Volume</th>
              <th>Rate</th>
              <th>Total Commission</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="empty-state">
                  <div className="empty-icon">🤝</div>
                  No IB partners found.
                </td>
              </tr>
            )}
            {filtered.map((aff) => (
              <tr key={aff.id}>
                <td className="id-cell">{aff.id}</td>
                <td>
                  <span className="client-name">{aff.name}</span>
                  <span className="client-id">{aff.contactEmail}</span>
                </td>
                <td>
                  <span className={`badge ${aff.level === 1 ? 'badge-master' : 'badge-sub'}`}>
                    {aff.level === 1 ? 'Master IB' : 'Sub-IB'}
                  </span>
                </td>
                <td>
                  <span className="referral-code">{aff.referralCode}</span>
                </td>
                <td className="num-cell">{(aff.referredClients || []).length}</td>
                <td className="num-cell">
                  {'$' + (aff.totalVolume || 0).toLocaleString()}
                </td>
                <td className="num-cell">
                  {((aff.commissionRate || 0) * 100).toFixed(1)}%
                </td>
                <td className="num-cell success-text">{fmt(aff.totalCommission)}</td>
                <td className="num-cell warn-text">{fmt(aff.pendingCommission)}</td>
                <td>
                  <span className={`badge badge-${aff.status}`}>
                    {aff.status}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    {aff.status === 'active' ? (
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => handleToggleStatus(aff)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn-success btn-sm"
                        onClick={() => handleToggleStatus(aff)}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── IB Hierarchy Tree ── */}
      <div className="section-wrap">
        <div className="panel">
          <div className="panel-title">IB Hierarchy</div>
          <div className="ib-tree">
            {masterIBs.length === 0 && (
              <div className="tree-empty">No IB partners yet.</div>
            )}
            {masterIBs.map((master) => {
              const children = subIBs.filter((s) => s.parentId === master.id);
              return (
                <div key={master.id} className="tree-node">
                  <div className="tree-master">
                    <span className="tree-icon">🏢</span>
                    <span className="tree-name">{master.name}</span>
                    <span className="tree-meta">
                      {master.id} · {master.referralCode} ·{' '}
                      <span className={`badge badge-${master.status}`}>{master.status}</span>
                    </span>
                    <span className="tree-clients">
                      {(master.referredClients || []).length} clients
                    </span>
                  </div>
                  {children.map((sub) => (
                    <div key={sub.id} className="tree-child">
                      <span className="tree-connector">└─</span>
                      <span className="tree-icon">👤</span>
                      <span className="tree-name">{sub.name}</span>
                      <span className="tree-meta">
                        {sub.id} · {sub.referralCode} ·{' '}
                        <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                      </span>
                      <span className="tree-clients">
                        {(sub.referredClients || []).length} clients
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Add IB Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Add IB Partner</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleAddSubmit}>
              {formError && <div className="form-error">{formError}</div>}

              <div className="form-row">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Company or person name"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleFormChange}
                  placeholder="contact@example.com"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Commission Rate (%)</label>
                <input
                  className="form-input"
                  name="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.commissionRate}
                  onChange={handleFormChange}
                  placeholder="e.g. 1.5"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Level</label>
                <select
                  className="form-input"
                  name="level"
                  value={form.level}
                  onChange={handleFormChange}
                >
                  <option value="1">1 – Master IB</option>
                  <option value="2">2 – Sub-IB</option>
                </select>
              </div>
              {form.level === '2' && (
                <div className="form-row">
                  <label className="form-label">Parent IB</label>
                  <select
                    className="form-input"
                    name="parentId"
                    value={form.parentId}
                    onChange={handleFormChange}
                  >
                    <option value="">Select parent IB…</option>
                    {level1IBs.map((ib) => (
                      <option key={ib.id} value={ib.id}>
                        {ib.name} ({ib.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-row">
                <label className="form-label">Referral Code</label>
                <input
                  className="form-input"
                  name="referralCode"
                  value={form.referralCode}
                  onChange={handleFormChange}
                  placeholder="e.g. IB2024"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliatesView;
