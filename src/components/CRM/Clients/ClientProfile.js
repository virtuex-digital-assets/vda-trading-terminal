import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSelectClient, crmUpdateClient, crmAddNote, crmAddTransaction } from '../../../store/actions';
import './ClientList.css';
import './ClientProfile.css';

const STAGES = ['New Lead', 'Contacted', 'KYC Submitted', 'KYC Verified', 'Funded', 'Active', 'Inactive'];
const KYC_STATUSES = ['pending', 'submitted', 'verified', 'rejected'];
const TABS = ['Overview', 'Accounts', 'Transactions', 'Notes'];

const stageBadgeClass = (stage) =>
  'badge badge-' + stage.replace(/\s+/g, '-');

const kycBadgeClass = (kyc) =>
  `badge badge-kyc-${kyc}`;

const fmt = (n) =>
  `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const ClientProfile = () => {
  const dispatch = useDispatch();
  const { clients, selectedClientId } = useSelector((s) => s.crm);
  const client = clients.find((c) => c.id === selectedClientId);

  const [tab, setTab] = useState('Overview');
  const [noteText, setNoteText] = useState('');
  const [txType, setTxType] = useState('Deposit');
  const [txAmount, setTxAmount] = useState('');

  if (!client) return null;

  const handleStageChange = (e) =>
    dispatch(crmUpdateClient(client.id, { stage: e.target.value }));

  const handleKycChange = (e) =>
    dispatch(crmUpdateClient(client.id, { kycStatus: e.target.value }));

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    dispatch(crmAddNote(client.id, noteText.trim(), 'Agent'));
    setNoteText('');
  };

  const handleTxSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (!amt || amt <= 0) return;
    dispatch(crmAddTransaction(client.id, txType, amt));
    setTxAmount('');
  };

  return (
    <div className="client-profile">
      {/* ── Header ── */}
      <div className="cp-header">
        <button className="cp-back-btn" onClick={() => dispatch(crmSelectClient(null))}>
          ← Back
        </button>
        <div>
          <div className="cp-name">{client.firstName} {client.lastName}</div>
          <div className="cp-id">{client.id}</div>
        </div>
        <div className="cp-header-badges">
          <span className={stageBadgeClass(client.stage)}>{client.stage}</span>
          <span className={kycBadgeClass(client.kycStatus)}>KYC: {client.kycStatus}</span>
        </div>
        <span className="cp-assigned">👤 {client.assignedTo}</span>
      </div>

      {/* ── Tabs ── */}
      <div className="cp-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`cp-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Notes'        && client.notes.length > 0        && ` (${client.notes.length})`}
            {t === 'Transactions' && client.transactions.length > 0 && ` (${client.transactions.length})`}
            {t === 'Accounts'     && client.accounts.length > 0     && ` (${client.accounts.length})`}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="cp-tab-content">
        {tab === 'Overview' && (
          <div className="cp-overview-grid">
            {/* Contact info */}
            <div className="cp-section">
              <div className="cp-section-title">Contact Information</div>
              <div className="cp-kv"><span className="cp-kv-label">Email</span>    <span className="cp-kv-val">{client.email || '—'}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Phone</span>    <span className="cp-kv-val">{client.phone || '—'}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Country</span>  <span className="cp-kv-val">{client.country || '—'}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Created</span>  <span className="cp-kv-val">{new Date(client.createdAt).toLocaleDateString()}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Last Active</span><span className="cp-kv-val">{new Date(client.lastActivity).toLocaleDateString()}</span></div>
            </div>

            {/* Financials */}
            <div className="cp-section">
              <div className="cp-section-title">Financials</div>
              <div className="cp-kv"><span className="cp-kv-label">Balance</span>          <span className="cp-kv-val positive">{fmt(client.balance)}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Total Deposits</span>   <span className="cp-kv-val">{fmt(client.totalDeposits)}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Total Withdrawals</span><span className="cp-kv-val">{fmt(client.totalWithdrawals)}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Net Deposits</span>     <span className={`cp-kv-val ${client.totalDeposits - client.totalWithdrawals >= 0 ? 'positive' : 'negative'}`}>{fmt(client.totalDeposits - client.totalWithdrawals)}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Float P&amp;L</span>    <span className={`cp-kv-val ${client.openPL >= 0 ? 'positive' : 'negative'}`}>{fmt(Math.abs(client.openPL))} {client.openPL >= 0 ? '↑' : '↓'}</span></div>
            </div>

            {/* Status controls */}
            <div className="cp-section">
              <div className="cp-section-title">Status Management</div>
              <div className="cp-kv">
                <span className="cp-kv-label">Pipeline Stage</span>
                <select className="cp-stage-select" value={client.stage} onChange={handleStageChange}>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="cp-kv">
                <span className="cp-kv-label">KYC Status</span>
                <select className="cp-kyc-select" value={client.kycStatus} onChange={handleKycChange}>
                  {KYC_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="cp-kv">
                <span className="cp-kv-label">Assigned To</span>
                <span className="cp-kv-val">{client.assignedTo}</span>
              </div>
            </div>

            {/* Record transaction */}
            <div className="cp-section">
              <div className="cp-section-title">Record Transaction</div>
              <form onSubmit={handleTxSubmit}>
                <div className="cp-kv" style={{ borderBottom: 'none', gap: 8, flexWrap: 'wrap' }}>
                  <select
                    className="cp-stage-select"
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    style={{ width: 110 }}
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Withdrawal">Withdrawal</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Amount ($)"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    style={{
                      flex: 1,
                      background: '#1a1a2e',
                      border: '1px solid #2a2a4a',
                      color: '#c8d0e0',
                      padding: '4px 8px',
                      fontSize: 12,
                      borderRadius: 4,
                      outline: 'none',
                    }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '4px 14px' }}>
                    Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === 'Accounts' && (
          <div>
            <div style={{ fontSize: 12, color: '#5566aa', marginBottom: 12 }}>
              MT4 trading accounts linked to this client.
            </div>
            {client.accounts.length === 0 ? (
              <div className="cp-no-accounts">No trading accounts linked yet.</div>
            ) : (
              client.accounts.map((acc) => (
                <div key={acc} className="cp-account-item">
                  <span className="cp-account-icon">💼</span>
                  <span>MT4 Account: <strong>{acc}</strong></span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'Transactions' && (
          <table className="cp-tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {client.transactions.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 14, color: '#5566aa' }}>No transactions yet.</td></tr>
              ) : (
                client.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: '#5566aa' }}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td className={tx.type.toLowerCase()}>{tx.type}</td>
                    <td className={tx.type === 'Deposit' ? 'deposit' : 'withdrawal'}>
                      {tx.type === 'Deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    <td className={tx.status}>{tx.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'Notes' && (
          <div>
            <form className="cp-note-form" onSubmit={handleNoteSubmit}>
              <textarea
                className="cp-note-input"
                placeholder="Add a note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button type="submit" className="cp-note-submit">Add Note</button>
            </form>
            {client.notes.length === 0 ? (
              <div className="cp-no-notes">No notes yet.</div>
            ) : (
              client.notes.map((n) => (
                <div key={n.id} className="cp-note-item">
                  <div className="cp-note-meta">
                    {n.author} · {new Date(n.date).toLocaleString()}
                  </div>
                  <div className="cp-note-text">{n.text}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
