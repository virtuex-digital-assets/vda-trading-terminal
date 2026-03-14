import React, { useState } from 'react';
import './Documents.css';

const DEMO_DOCS = [
  { id: 'DOC001', user: 'Alice Johnson', type: 'passport', filename: 'passport_alice.pdf', status: 'pending', date: '2025-01-15' },
  { id: 'DOC002', user: 'Bob Chen', type: 'utility_bill', filename: 'bill_bob.pdf', status: 'pending', date: '2025-01-14' },
  { id: 'DOC003', user: 'Carlos Ruiz', type: 'national_id', filename: 'id_carlos.pdf', status: 'approved', date: '2025-01-10' },
  { id: 'DOC004', user: 'Diana Park', type: 'bank_statement', filename: 'bank_diana.pdf', status: 'rejected', date: '2025-01-12' },
];

const DEMO_KYC = [
  { userId: 'U001', user: 'Alice Johnson', status: 'submitted', docsCount: 2, email: 'alice@example.com' },
  { userId: 'U002', user: 'Bob Chen', status: 'approved', docsCount: 3, email: 'bob@example.com' },
  { userId: 'U003', user: 'Carlos Ruiz', status: 'pending', docsCount: 0, email: 'carlos@example.com' },
];

const TABS = ['Pending Review', 'All Documents', 'KYC Status'];

const DOC_TYPE_ICONS = {
  passport: '🛂',
  utility_bill: '📄',
  national_id: '🪪',
  bank_statement: '🏦',
};

const DOC_TYPE_LABELS = {
  passport: 'Passport',
  utility_bill: 'Utility Bill',
  national_id: 'National ID',
  bank_statement: 'Bank Statement',
};

function initials(name) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function DocBadge({ status }) {
  return <span className={`doc-badge ${status}`}>{status}</span>;
}

function PendingTab({ data, onAction }) {
  const pending = data.filter((d) => d.status === 'pending');
  if (pending.length === 0) {
    return (
      <div className="docs-section">
        <div className="docs-section-header">
          <span className="docs-section-title">Pending Review</span>
        </div>
        <div className="docs-empty">No documents pending review.</div>
      </div>
    );
  }
  return (
    <div className="docs-section">
      <div className="docs-section-header">
        <span className="docs-section-title">Pending Review</span>
        <DocBadge status="pending" />
      </div>
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>User</th>
              <th>Type</th>
              <th>Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div className="doc-type-icon">
                    <span className="doc-icon">{DOC_TYPE_ICONS[doc.type] || '📄'}</span>
                    <span className="doc-filename">{doc.filename}</span>
                  </div>
                </td>
                <td>{doc.user}</td>
                <td>{DOC_TYPE_LABELS[doc.type] || doc.type}</td>
                <td style={{ color: '#8b949e' }}>{doc.date}</td>
                <td>
                  <div className="doc-actions">
                    <button className="doc-btn-view">View</button>
                    <button className="doc-btn-approve" onClick={() => onAction(doc.id, 'approved')}>Approve</button>
                    <button className="doc-btn-reject" onClick={() => onAction(doc.id, 'rejected')}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllDocsTab({ data, onAction }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? data : data.filter((d) => d.status === filter);

  return (
    <div className="docs-section">
      <div className="docs-section-header">
        <span className="docs-section-title">All Documents</span>
        <select
          className="docs-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Document</th>
              <th>User</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id}>
                <td style={{ fontFamily: 'monospace', color: '#8b949e' }}>{doc.id}</td>
                <td>
                  <div className="doc-type-icon">
                    <span className="doc-icon">{DOC_TYPE_ICONS[doc.type] || '📄'}</span>
                    <span className="doc-filename">{doc.filename}</span>
                  </div>
                </td>
                <td>{doc.user}</td>
                <td>{DOC_TYPE_LABELS[doc.type] || doc.type}</td>
                <td><DocBadge status={doc.status} /></td>
                <td style={{ color: '#8b949e' }}>{doc.date}</td>
                <td>
                  <div className="doc-actions">
                    <button className="doc-btn-view">View</button>
                    {doc.status === 'pending' && (
                      <>
                        <button className="doc-btn-approve" onClick={() => onAction(doc.id, 'approved')}>Approve</button>
                        <button className="doc-btn-reject" onClick={() => onAction(doc.id, 'rejected')}>Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="docs-empty">No documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KYCStatusTab({ data, onKYCAction }) {
  return (
    <div className="docs-section">
      <div className="docs-section-header">
        <span className="docs-section-title">KYC Status</span>
      </div>
      <div className="kyc-list">
        {data.map((u) => (
          <div className="kyc-row" key={u.userId}>
            <div className="kyc-avatar">{initials(u.user)}</div>
            <div className="kyc-info">
              <div className="kyc-name">{u.user}</div>
              <div className="kyc-email">{u.email}</div>
            </div>
            <div className="kyc-docs-count">{u.docsCount} doc{u.docsCount !== 1 ? 's' : ''}</div>
            <DocBadge status={u.status} />
            <div className="kyc-actions">
              {u.status !== 'approved' && (
                <button className="doc-btn-approve" onClick={() => onKYCAction(u.userId, 'approved')}>
                  Verify KYC
                </button>
              )}
              {u.status === 'approved' && (
                <button className="doc-btn-reject" onClick={() => onKYCAction(u.userId, 'pending')}>
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Documents = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [docs, setDocs] = useState(DEMO_DOCS);
  const [kyc, setKYC] = useState(DEMO_KYC);

  const handleDocAction = (id, newStatus) => {
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, status: newStatus } : d));
  };

  const handleKYCAction = (userId, newStatus) => {
    setKYC((prev) => prev.map((u) => u.userId === userId ? { ...u, status: newStatus } : u));
  };

  const pendingCount = docs.filter((d) => d.status === 'pending').length;
  const approvedCount = docs.filter((d) => d.status === 'approved').length;
  const rejectedCount = docs.filter((d) => d.status === 'rejected').length;
  const kycVerified = kyc.filter((u) => u.status === 'approved').length;

  return (
    <div className="docs-wrap">
      <div className="docs-header">
        <h2>📋 Documents & KYC</h2>
        <span className="docs-header-sub">Identity verification and document management</span>
      </div>

      <div className="docs-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`docs-tab${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
            {i === 0 && pendingCount > 0 && (
              <span style={{ marginLeft: 6, background: '#d29922', color: '#0d1117', borderRadius: 10, padding: '0 5px', fontSize: 10, fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="docs-content">
        <div className="docs-summary">
          <div className="docs-summary-card">
            <div className="docs-summary-icon">⏳</div>
            <div className="docs-summary-value" style={{ color: '#d29922' }}>{pendingCount}</div>
            <div className="docs-summary-label">Pending Review</div>
          </div>
          <div className="docs-summary-card">
            <div className="docs-summary-icon">✅</div>
            <div className="docs-summary-value" style={{ color: '#3fb950' }}>{approvedCount}</div>
            <div className="docs-summary-label">Approved</div>
          </div>
          <div className="docs-summary-card">
            <div className="docs-summary-icon">❌</div>
            <div className="docs-summary-value" style={{ color: '#f85149' }}>{rejectedCount}</div>
            <div className="docs-summary-label">Rejected</div>
          </div>
          <div className="docs-summary-card">
            <div className="docs-summary-icon">🛡️</div>
            <div className="docs-summary-value" style={{ color: '#60a5fa' }}>{kycVerified}</div>
            <div className="docs-summary-label">KYC Verified</div>
          </div>
        </div>

        {activeTab === 0 && <PendingTab data={docs} onAction={handleDocAction} />}
        {activeTab === 1 && <AllDocsTab data={docs} onAction={handleDocAction} />}
        {activeTab === 2 && <KYCStatusTab data={kyc} onKYCAction={handleKYCAction} />}
      </div>
    </div>
  );
};

export default Documents;
