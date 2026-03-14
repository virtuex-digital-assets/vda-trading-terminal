import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  brokerApproveKyc,
  brokerRejectKyc,
  brokerRequestKycDocs,
} from '../../../store/actions';
import './KYCView.css';

const DOC_TYPE_LABELS = {
  passport: 'Passport',
  proof_of_address: 'Proof of Address',
  drivers_license: "Driver's License",
};

const FILTER_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const KYCView = () => {
  const dispatch = useDispatch();
  const kycDocuments = useSelector((s) => s.broker.kycDocuments);

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [requestingId, setRequestingId] = useState(null);
  const [requestNotes, setRequestNotes] = useState('');

  // ── Stats ──
  const pending   = kycDocuments.filter((d) => d.status === 'pending').length;
  const approvedToday = kycDocuments.filter((d) => {
    if (d.status !== 'approved' || !d.approvedAt) return false;
    const today = new Date().toDateString();
    return new Date(d.approvedAt).toDateString() === today;
  }).length;
  const rejected  = kycDocuments.filter((d) => d.status === 'rejected').length;

  // ── Filter + search ──
  const filtered = kycDocuments.filter((d) => {
    const matchFilter =
      activeFilter === 'All' ||
      d.status === activeFilter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      d.clientName.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      (d.country || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ── Handlers ──
  const handleApprove = (doc) => {
    if (window.confirm(`Approve KYC document for ${doc.clientName}?`)) {
      dispatch(brokerApproveKyc(doc.id));
    }
  };

  const handleRejectSubmit = (docId) => {
    if (!rejectReason.trim()) return;
    dispatch(brokerRejectKyc(docId, rejectReason.trim()));
    setRejectingId(null);
    setRejectReason('');
  };

  const handleRequestSubmit = (docId) => {
    dispatch(brokerRequestKycDocs(docId, requestNotes.trim()));
    setRequestingId(null);
    setRequestNotes('');
  };

  return (
    <div className="view-container">
      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">KYC Verification</h2>
          <span className="view-subtitle">Manage client identity documents</span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="view-stats kyc-stats">
        <div className="stat-card">
          <div className="stat-value">{kycDocuments.length}</div>
          <div className="stat-label">Total Documents</div>
        </div>
        <div className="stat-card stat-card-warn">
          <div className="stat-value warn">{pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value success">{approvedToday}</div>
          <div className="stat-label">Approved Today</div>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-value danger">{rejected}</div>
          <div className="stat-label">Rejected Docs</div>
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
              {tab !== 'All' && (
                <span className="tab-count">
                  {kycDocuments.filter((d) =>
                    d.status === tab.toLowerCase()
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          className="view-search"
          placeholder="Search client, ID, country…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 28 }}>
                <input type="checkbox" className="row-check" />
              </th>
              <th>ID</th>
              <th>Client</th>
              <th>Country</th>
              <th>Document Type</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  <div className="empty-icon">📄</div>
                  <div>No KYC documents match the current filter.</div>
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <React.Fragment key={doc.id}>
                  <tr>
                    <td>
                      <input type="checkbox" className="row-check" />
                    </td>
                    <td className="id-cell">{doc.id}</td>
                    <td>
                      <span className="client-name">{doc.clientName}</span>
                      <span className="client-id">#{doc.clientId}</span>
                    </td>
                    <td>{doc.country || '—'}</td>
                    <td>{DOC_TYPE_LABELS[doc.type] || doc.type}</td>
                    <td>
                      <span className={`badge badge-${doc.status}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(doc.submittedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="action-btns">
                        {doc.status !== 'approved' && (
                          <button
                            className="btn-success"
                            onClick={() => handleApprove(doc)}
                          >
                            Approve
                          </button>
                        )}
                        {doc.status !== 'rejected' && (
                          <button
                            className="btn-danger"
                            onClick={() => {
                              setRejectingId(doc.id);
                              setRejectReason('');
                              setRequestingId(null);
                            }}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          className="btn-warning"
                          onClick={() => {
                            setRequestingId(doc.id);
                            setRequestNotes('');
                            setRejectingId(null);
                          }}
                        >
                          Request Docs
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* ── Inline reject reason row ── */}
                  {rejectingId === doc.id && (
                    <tr className="inline-action-row">
                      <td />
                      <td colSpan={7}>
                        <div className="inline-action-panel reject-panel">
                          <span className="inline-label">Rejection reason:</span>
                          <input
                            className="inline-input"
                            placeholder="Enter reason for rejection…"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRejectSubmit(doc.id);
                              if (e.key === 'Escape') setRejectingId(null);
                            }}
                          />
                          <button
                            className="btn-danger"
                            onClick={() => handleRejectSubmit(doc.id)}
                            disabled={!rejectReason.trim()}
                          >
                            Confirm Reject
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => setRejectingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* ── Inline request docs row ── */}
                  {requestingId === doc.id && (
                    <tr className="inline-action-row">
                      <td />
                      <td colSpan={7}>
                        <div className="inline-action-panel request-panel">
                          <span className="inline-label">Request notes (optional):</span>
                          <input
                            className="inline-input"
                            placeholder="Specify which documents are needed…"
                            value={requestNotes}
                            onChange={(e) => setRequestNotes(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRequestSubmit(doc.id);
                              if (e.key === 'Escape') setRequestingId(null);
                            }}
                          />
                          <button
                            className="btn-warning"
                            onClick={() => handleRequestSubmit(doc.id)}
                          >
                            Send Request
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => setRequestingId(null)}
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
    </div>
  );
};

export default KYCView;
