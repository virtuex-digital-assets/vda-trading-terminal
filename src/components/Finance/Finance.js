import React, { useState } from 'react';
import './Finance.css';

const DEMO_DEPOSITS = [
  { id: 'DEP001', user: 'Alice Johnson', amount: 5000, currency: 'USD', method: 'Bank Transfer', status: 'pending', date: '2025-01-15' },
  { id: 'DEP002', user: 'Bob Chen', amount: 2500, currency: 'USD', method: 'Stripe', status: 'approved', date: '2025-01-14' },
  { id: 'DEP003', user: 'Carlos Ruiz', amount: 10000, currency: 'USD', method: 'Crypto', status: 'approved', date: '2025-01-13' },
];

const DEMO_WITHDRAWALS = [
  { id: 'WIT001', user: 'Diana Park', amount: 1500, currency: 'USD', method: 'Bank Transfer', status: 'pending', date: '2025-01-15' },
  { id: 'WIT002', user: 'Ethan Walsh', amount: 3000, currency: 'USD', method: 'Bank Transfer', status: 'approved', date: '2025-01-14' },
];

const DEMO_TRANSACTIONS = [
  { id: 'TXN001', user: 'Alice Johnson', type: 'Deposit', amount: 5000, currency: 'USD', date: '2025-01-15' },
  { id: 'TXN002', user: 'Bob Chen', type: 'Deposit', amount: 2500, currency: 'USD', date: '2025-01-14' },
  { id: 'TXN003', user: 'Carlos Ruiz', type: 'Deposit', amount: 10000, currency: 'USD', date: '2025-01-13' },
  { id: 'TXN004', user: 'Diana Park', type: 'Withdrawal', amount: 1500, currency: 'USD', date: '2025-01-15' },
  { id: 'TXN005', user: 'Ethan Walsh', type: 'Withdrawal', amount: 3000, currency: 'USD', date: '2025-01-14' },
];

const DEMO_GATEWAYS = [
  { id: 'GW001', name: 'Stripe', provider: 'stripe', mode: 'sandbox', status: 'enabled' },
  { id: 'GW002', name: 'Bank Transfer', provider: 'bank', mode: 'live', status: 'enabled' },
  { id: 'GW003', name: 'Crypto Gateway', provider: 'crypto', mode: 'sandbox', status: 'disabled' },
];

const TABS = ['Deposits', 'Withdrawals', 'Transactions', 'Payment Gateways'];

const PROVIDER_ICONS = { stripe: '💳', bank: '🏦', crypto: '₿' };

function StatusBadge({ status }) {
  return <span className={`status-badge ${status}`}>{status}</span>;
}

function DepositsTab({ data, onAction }) {
  return (
    <div className="finance-section">
      <div className="finance-section-title">Deposit Requests</div>
      <div className="finance-table-wrap">
        <table className="finance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td style={{ fontFamily: 'monospace', color: '#8b949e' }}>{row.id}</td>
                <td>{row.user}</td>
                <td style={{ fontWeight: 700 }}>${row.amount.toLocaleString()}</td>
                <td>{row.currency}</td>
                <td>{row.method}</td>
                <td><StatusBadge status={row.status} /></td>
                <td style={{ color: '#8b949e' }}>{row.date}</td>
                <td>
                  {row.status === 'pending' && (
                    <div className="finance-actions">
                      <button className="btn-approve" onClick={() => onAction(row.id, 'approved', 'deposit')}>Approve</button>
                      <button className="btn-reject" onClick={() => onAction(row.id, 'rejected', 'deposit')}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WithdrawalsTab({ data, onAction }) {
  return (
    <div className="finance-section">
      <div className="finance-section-title">Withdrawal Requests</div>
      <div className="finance-table-wrap">
        <table className="finance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td style={{ fontFamily: 'monospace', color: '#8b949e' }}>{row.id}</td>
                <td>{row.user}</td>
                <td style={{ fontWeight: 700 }}>${row.amount.toLocaleString()}</td>
                <td>{row.currency}</td>
                <td>{row.method}</td>
                <td><StatusBadge status={row.status} /></td>
                <td style={{ color: '#8b949e' }}>{row.date}</td>
                <td>
                  {row.status === 'pending' && (
                    <div className="finance-actions">
                      <button className="btn-approve" onClick={() => onAction(row.id, 'approved', 'withdrawal')}>Approve</button>
                      <button className="btn-reject" onClick={() => onAction(row.id, 'rejected', 'withdrawal')}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionsTab({ data }) {
  return (
    <div className="finance-section">
      <div className="finance-section-title">All Transactions</div>
      <div className="finance-table-wrap">
        <table className="finance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td style={{ fontFamily: 'monospace', color: '#8b949e' }}>{row.id}</td>
                <td>{row.user}</td>
                <td>
                  <span style={{ color: row.type === 'Deposit' ? '#3fb950' : '#f85149', fontWeight: 700 }}>
                    {row.type}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>${row.amount.toLocaleString()}</td>
                <td>{row.currency}</td>
                <td style={{ color: '#8b949e' }}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GatewaysTab({ data, onToggle }) {
  return (
    <div className="finance-section">
      <div className="finance-section-title">Payment Gateways</div>
      <div className="gateway-cards">
        {data.map((gw) => (
          <div className="gateway-card" key={gw.id}>
            <div className="gateway-card-header">
              <div className="gateway-provider-icon">
                {PROVIDER_ICONS[gw.provider] || '⚙️'}
              </div>
              <div className="gateway-card-info">
                <div className="gateway-card-name">{gw.name}</div>
                <div className="gateway-card-badges">
                  <span className={`status-badge ${gw.mode}`}>{gw.mode}</span>
                  <span className={`status-badge ${gw.status}`}>{gw.status}</span>
                </div>
              </div>
            </div>
            <div className="gateway-actions">
              <button
                className={`btn-toggle ${gw.status === 'enabled' ? 'disable' : 'enable'}`}
                onClick={() => onToggle(gw.id)}
              >
                {gw.status === 'enabled' ? '⏸ Disable Gateway' : '▶ Enable Gateway'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Finance = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [deposits, setDeposits] = useState(DEMO_DEPOSITS);
  const [withdrawals, setWithdrawals] = useState(DEMO_WITHDRAWALS);
  const [gateways, setGateways] = useState(DEMO_GATEWAYS);

  const handleAction = (id, newStatus, type) => {
    if (type === 'deposit') {
      setDeposits((prev) => prev.map((d) => d.id === id ? { ...d, status: newStatus } : d));
    } else {
      setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: newStatus } : w));
    }
  };

  const handleToggleGateway = (id) => {
    setGateways((prev) =>
      prev.map((gw) =>
        gw.id === id
          ? { ...gw, status: gw.status === 'enabled' ? 'disabled' : 'enabled' }
          : gw
      )
    );
  };

  const totalDeposits = deposits.filter((d) => d.status === 'approved').reduce((s, d) => s + d.amount, 0);
  const totalWithdrawals = withdrawals.filter((w) => w.status === 'approved').reduce((s, w) => s + w.amount, 0);
  const pendingApprovals = deposits.filter((d) => d.status === 'pending').length + withdrawals.filter((w) => w.status === 'pending').length;
  const activeGateways = gateways.filter((g) => g.status === 'enabled').length;

  return (
    <div className="finance-wrap">
      <div className="finance-header">
        <h2>💰 Finance</h2>
        <span className="finance-header-sub">Deposits · Withdrawals · Transactions</span>
      </div>

      <div className="finance-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`finance-tab${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="finance-content">
        <div className="finance-summary">
          <div className="summary-card">
            <div className="summary-card-icon">📥</div>
            <div className="summary-card-value" style={{ color: '#3fb950' }}>
              ${totalDeposits.toLocaleString()}
            </div>
            <div className="summary-card-label">Total Deposits</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon">📤</div>
            <div className="summary-card-value" style={{ color: '#f85149' }}>
              ${totalWithdrawals.toLocaleString()}
            </div>
            <div className="summary-card-label">Total Withdrawals</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon">⏳</div>
            <div className="summary-card-value" style={{ color: '#d29922' }}>
              {pendingApprovals}
            </div>
            <div className="summary-card-label">Pending Approvals</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon">🔌</div>
            <div className="summary-card-value" style={{ color: '#2563eb' }}>
              {activeGateways}
            </div>
            <div className="summary-card-label">Active Gateways</div>
          </div>
        </div>

        {activeTab === 0 && <DepositsTab data={deposits} onAction={handleAction} />}
        {activeTab === 1 && <WithdrawalsTab data={withdrawals} onAction={handleAction} />}
        {activeTab === 2 && <TransactionsTab data={DEMO_TRANSACTIONS} />}
        {activeTab === 3 && <GatewaysTab data={gateways} onToggle={handleToggleGateway} />}
      </div>
    </div>
  );
};

export default Finance;
