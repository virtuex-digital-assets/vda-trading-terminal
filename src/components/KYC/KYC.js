/**
 * KYC – Know Your Customer verification centre.
 *
 * Allows traders to:
 *  • View their KYC verification status and level
 *  • Submit identity and address verification documents
 *  • Track document review status
 *
 * Admins can review and approve/reject documents via the SuperAdmin panel.
 */
import React, { useState, useCallback, useEffect } from 'react';
import backendBridge from '../../services/backendBridge';
import './KYC.css';

const DOC_TYPES = [
  { value: 'passport',              label: '🛂 Passport' },
  { value: 'national_id',           label: '🪪 National ID Card' },
  { value: 'drivers_license',       label: '🚗 Driver\'s License' },
  { value: 'utility_bill',          label: '🏠 Utility Bill' },
  { value: 'bank_statement',        label: '🏦 Bank Statement' },
  { value: 'selfie',                label: '🤳 Selfie with ID' },
  { value: 'corporate_registration',label: '🏢 Corporate Registration' },
];

const STATUS_BADGE = {
  not_submitted: { label: '⚪ Not Submitted',  color: '#888' },
  pending:       { label: '🟡 Pending Review', color: '#f39c12' },
  approved:      { label: '🟢 Verified',       color: '#27ae60' },
  rejected:      { label: '🔴 Rejected',       color: '#e74c3c' },
};

const DOC_STATUS_BADGE = {
  pending:  { label: '⏳ Pending', color: '#f39c12' },
  approved: { label: '✅ Approved', color: '#27ae60' },
  rejected: { label: '❌ Rejected', color: '#e74c3c' },
};

const KYC_LEVELS = [
  { level: 0, label: 'Unverified',       desc: 'Submit your identity documents to start verification.' },
  { level: 1, label: 'Basic Verified',   desc: 'Identity document approved.' },
  { level: 2, label: 'Enhanced',         desc: 'Identity + Proof of Address verified.' },
  { level: 3, label: 'Fully Verified',   desc: 'All documents verified. Full platform access.' },
];

export default function KYC() {
  const [profile,   setProfile]   = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState({ text: '', type: '' });

  // Upload form
  const [form, setForm] = useState({
    type:     'passport',
    fileName: '',
    fileUrl:  '',
    mimeType: 'image/jpeg',
    fileSize: 0,
  });

  const flash = (text, type = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const load = useCallback(async () => {
    if (!backendBridge.isConfigured()) return;
    setLoading(true);
    try {
      const data = await backendBridge.get('/kyc/profile');
      setProfile(data.profile);
      setDocuments(data.documents || []);
    } catch (e) {
      flash(`Could not load KYC data: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fileName.trim() && !form.fileUrl.trim()) {
      flash('Please enter a file name or URL.', 'error');
      return;
    }
    try {
      await backendBridge.post('/kyc/documents', form);
      flash('Document submitted for review. We will notify you once reviewed.', 'success');
      setForm({ ...form, fileName: '', fileUrl: '' });
      load();
    } catch (err) {
      flash(`Submission failed: ${err.message}`, 'error');
    }
  }

  const levelInfo = KYC_LEVELS.find((l) => l.level === (profile?.level ?? 0)) || KYC_LEVELS[0];
  const statusInfo = STATUS_BADGE[profile?.status || 'not_submitted'];

  // Demo mode notice
  if (!backendBridge.isConfigured()) {
    return (
      <div className="kyc-panel">
        <div className="panel-header">🪪 KYC Verification</div>
        <div className="kyc-demo-notice">
          <p>KYC verification is available when connected to the backend server.</p>
          <p>Set <code>REACT_APP_API_URL</code> to connect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-panel">
      <div className="panel-header">🪪 KYC Verification</div>

      {msg.text && (
        <div className={`kyc-msg kyc-msg-${msg.type}`}>{msg.text}</div>
      )}

      {/* Status banner */}
      <div className="kyc-status-banner">
        <div className="kyc-level-badge" style={{ borderColor: statusInfo.color }}>
          <span className="kyc-level-num">{levelInfo.level}</span>
          <span className="kyc-level-label">{levelInfo.label}</span>
        </div>
        <div className="kyc-status-detail">
          <div className="kyc-status-badge" style={{ color: statusInfo.color }}>
            {statusInfo.label}
          </div>
          <div className="kyc-status-desc">{levelInfo.desc}</div>
          {profile?.rejectionReason && (
            <div className="kyc-rejection">⚠️ {profile.rejectionReason}</div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="kyc-progress-bar">
        <div
          className="kyc-progress-fill"
          style={{ width: `${((profile?.level || 0) / 3) * 100}%` }}
        />
      </div>
      <div className="kyc-progress-labels">
        <span>Unverified</span>
        <span>Basic</span>
        <span>Enhanced</span>
        <span>Full</span>
      </div>

      <div className="kyc-body">
        {/* Left – Submit document */}
        <div className="kyc-section">
          <h3>Submit Document</h3>
          <form className="kyc-form" onSubmit={handleSubmit}>
            <label>Document Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>

            <label>File Name / Description</label>
            <input
              type="text"
              placeholder="e.g. passport_scan.jpg"
              value={form.fileName}
              onChange={(e) => setForm({ ...form, fileName: e.target.value })}
            />

            <label>File URL (optional – for demo)</label>
            <input
              type="url"
              placeholder="https://example.com/document.jpg"
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
            />

            <label>MIME Type</label>
            <select
              value={form.mimeType}
              onChange={(e) => setForm({ ...form, mimeType: e.target.value })}
            >
              <option value="image/jpeg">JPEG Image</option>
              <option value="image/png">PNG Image</option>
              <option value="application/pdf">PDF Document</option>
            </select>

            <button type="submit" className="kyc-btn" disabled={loading}>
              {loading ? 'Submitting…' : '📤 Submit Document'}
            </button>
          </form>

          <div className="kyc-help">
            <h4>Required Documents</h4>
            <ul>
              <li><strong>Level 1:</strong> Passport, National ID, or Driver's License</li>
              <li><strong>Level 2:</strong> + Utility Bill or Bank Statement (proof of address)</li>
              <li><strong>Level 3:</strong> + Selfie holding your ID document</li>
            </ul>
          </div>
        </div>

        {/* Right – Document history */}
        <div className="kyc-section">
          <h3>Submitted Documents</h3>
          {documents.length === 0 ? (
            <p className="kyc-empty">No documents submitted yet.</p>
          ) : (
            <div className="kyc-doc-list">
              {documents.map((doc) => {
                const badge = DOC_STATUS_BADGE[doc.status] || DOC_STATUS_BADGE.pending;
                const typeDef = DOC_TYPES.find((t) => t.value === doc.type);
                return (
                  <div key={doc.id} className="kyc-doc-card">
                    <div className="kyc-doc-icon">
                      {typeDef?.label.split(' ')[0] || '📄'}
                    </div>
                    <div className="kyc-doc-info">
                      <div className="kyc-doc-name">{typeDef?.label || doc.type}</div>
                      <div className="kyc-doc-file">{doc.fileName || doc.fileUrl || '—'}</div>
                      <div className="kyc-doc-date">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="kyc-doc-status" style={{ color: badge.color }}>
                      {badge.label}
                      {doc.rejectionReason && (
                        <div className="kyc-doc-reason">{doc.rejectionReason}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
