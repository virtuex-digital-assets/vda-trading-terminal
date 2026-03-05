import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSelectClient, crmSetSearch, crmSetStageFilter, crmAddClient } from '../../../store/actions';
import './ClientList.css';

const STAGES_FILTER = ['All', 'New Lead', 'Contacted', 'KYC Submitted', 'KYC Verified', 'Funded', 'Active', 'Inactive'];

const stageBadgeClass = (stage) =>
  'badge badge-' + stage.replace(/\s+/g, '-');

const kycBadgeClass = (kyc) =>
  `badge badge-kyc-${kyc}`;

const ClientList = () => {
  const dispatch = useDispatch();
  const { clients, searchQuery, stageFilter, selectedClientId } = useSelector((s) => s.crm);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: '', assignedTo: 'Alice K.',
  });

  // ── Filter & search ──
  const filtered = clients.filter((c) => {
    const matchStage = stageFilter === 'All' || c.stage === stageFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    return matchStage && matchSearch;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newClient.firstName || !newClient.lastName) return;
    dispatch(crmAddClient(newClient));
    setNewClient({ firstName: '', lastName: '', email: '', phone: '', country: '', assignedTo: 'Alice K.' });
    setShowAddModal(false);
  };

  // ── If a client is selected, show the profile ──
  if (selectedClientId) {
    // Dynamic import via require to avoid circular dep issues with CSS
    const ClientProfile = require('./ClientProfile').default;
    return <ClientProfile />;
  }

  return (
    <div className="client-list">
      {/* ── Toolbar ── */}
      <div className="cl-toolbar">
        <input
          className="cl-search"
          placeholder="Search name, email, country…"
          value={searchQuery}
          onChange={(e) => dispatch(crmSetSearch(e.target.value))}
        />
        <select
          className="cl-filter"
          value={stageFilter}
          onChange={(e) => dispatch(crmSetStageFilter(e.target.value))}
        >
          {STAGES_FILTER.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="cl-add-btn" onClick={() => setShowAddModal(true)}>
          + Add Client
        </button>
      </div>

      {/* ── Table ── */}
      <div className="cl-table-wrap">
        <table className="cl-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Country</th>
              <th>Stage</th>
              <th>KYC</th>
              <th>Balance</th>
              <th>Assigned</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="cl-empty">No clients match the current filter.</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cl-row"
                  onClick={() => dispatch(crmSelectClient(c.id))}
                >
                  <td style={{ color: '#5566aa' }}>{c.id}</td>
                  <td><strong>{c.firstName} {c.lastName}</strong></td>
                  <td style={{ color: '#8899bb' }}>{c.email}</td>
                  <td>{c.country}</td>
                  <td><span className={stageBadgeClass(c.stage)}>{c.stage}</span></td>
                  <td><span className={kycBadgeClass(c.kycStatus)}>{c.kycStatus}</span></td>
                  <td className={c.balance > 0 ? 'positive' : ''}>
                    {c.balance > 0 ? `$${c.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td style={{ color: '#5566aa' }}>{c.assignedTo}</td>
                  <td style={{ color: '#5566aa' }}>
                    {new Date(c.lastActivity).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Client Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Client</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-row">
                <div className="modal-field">
                  <label>First Name *</label>
                  <input
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="modal-field">
                  <label>Last Name *</label>
                  <input
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-field">
                <label>Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Phone</label>
                  <input
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Country</label>
                  <input
                    value={newClient.country}
                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-field">
                <label>Assigned To</label>
                <select
                  value={newClient.assignedTo}
                  onChange={(e) => setNewClient({ ...newClient, assignedTo: e.target.value })}
                >
                  <option>Alice K.</option>
                  <option>Bob T.</option>
                  <option>Carol M.</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
