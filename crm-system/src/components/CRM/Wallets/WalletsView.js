import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmAddTransaction } from '../../../store/actions';
import './WalletsView.css';

const PAYMENT_METHODS = ['Bank Transfer', 'Crypto', 'Credit Card'];

function paymentMethodForTx(txId) {
  let hash = 0;
  for (let i = 0; i < txId.length; i++) {
    hash = (hash * 31 + txId.charCodeAt(i)) >>> 0;
  }
  return PAYMENT_METHODS[hash % PAYMENT_METHODS.length];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const WalletsView = () => {
  const dispatch = useDispatch();
  const clients = useSelector((s) => s.crm.clients);

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    type: 'Deposit',
    amount: '',
    paymentMethod: 'Bank Transfer',
  });

  // Stats
  const totalBalance = clients.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalDeposits = clients.reduce((sum, c) => sum + (c.totalDeposits || 0), 0);
  const totalWithdrawals = clients.reduce((sum, c) => sum + (c.totalWithdrawals || 0), 0);
  const pendingCount = clients.reduce(
    (sum, c) => sum + (c.transactions || []).filter((t) => t.status === 'pending').length,
    0
  );

  // Flatten all transactions across clients
  const allTx = clients.flatMap((client) =>
    (client.transactions || []).map((tx) => ({
      ...tx,
      clientName: `${client.firstName} ${client.lastName}`,
      clientId: client.id,
    }))
  );

  // Filter by tab and search
  const filtered = allTx
    .filter((tx) => {
      if (tab === 'deposits') return tx.type === 'Deposit';
      if (tab === 'withdrawals') return tx.type === 'Withdrawal';
      return true;
    })
    .filter((tx) =>
      search === '' ||
      tx.clientName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.clientId || isNaN(amount) || amount <= 0) return;
    dispatch(crmAddTransaction(form.clientId, form.type, amount));
    setShowModal(false);
    setForm({ clientId: '', type: 'Deposit', amount: '', paymentMethod: 'Bank Transfer' });
  };

  return (
    <div className="wallets-view">
      {/* Stats row */}
      <div className="wallets-stats">
        <div className="wallets-stat-card">
          <div className="wallets-stat-label">Total Wallet Balance</div>
          <div className="wallets-stat-value">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="wallets-stat-card">
          <div className="wallets-stat-label">Total Deposits</div>
          <div className="wallets-stat-value green">${totalDeposits.toLocaleString()}</div>
        </div>
        <div className="wallets-stat-card">
          <div className="wallets-stat-label">Total Withdrawals</div>
          <div className="wallets-stat-value red">${totalWithdrawals.toLocaleString()}</div>
        </div>
        <div className="wallets-stat-card">
          <div className="wallets-stat-label">Pending Transactions</div>
          <div className="wallets-stat-value amber">{pendingCount}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="wallets-toolbar">
        <div className="wallets-tabs">
          {[['all', 'All Transactions'], ['deposits', 'Deposits'], ['withdrawals', 'Withdrawals']].map(
            ([key, label]) => (
              <button
                key={key}
                className={`wallets-tab${tab === key ? ' active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            )
          )}
        </div>
        <div className="wallets-toolbar-right">
          <input
            className="wallets-search"
            placeholder="Search by client name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="wallets-add-btn" onClick={() => setShowModal(true)}>
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="wallets-table-wrap">
        <table className="wallets-table">
          <thead>
            <tr>
              <th>TX ID</th>
              <th>Client Name</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="wallets-empty">No transactions found</td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id}>
                  <td className="wallets-txid">{tx.id}</td>
                  <td>{tx.clientName}</td>
                  <td>
                    <span className={`wallets-type ${tx.type === 'Deposit' ? 'deposit' : 'withdrawal'}`}>
                      {tx.type === 'Deposit' ? '💰' : '💸'} {tx.type}
                    </span>
                  </td>
                  <td className={tx.type === 'Deposit' ? 'wallets-amount-green' : 'wallets-amount-red'}>
                    {tx.type === 'Deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </td>
                  <td>
                    <span className={`wallets-status ${tx.status}`}>{tx.status}</span>
                  </td>
                  <td>{paymentMethodForTx(tx.id)}</td>
                  <td>{formatDate(tx.date)}</td>
                  <td className="wallets-actions">
                    {tx.status === 'pending' ? (
                      <>
                        <button className="wallets-btn approve">Approve</button>
                        <button className="wallets-btn reject">Reject</button>
                      </>
                    ) : (
                      <span className="wallets-check" title="Completed">✔</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="wallets-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="wallets-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wallets-modal-header">
              <span>Add Transaction</span>
              <button className="wallets-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="wallets-modal-body" onSubmit={handleSubmit}>
              <label>Client</label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                required
              >
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>

              <label>Type</label>
              <div className="wallets-modal-radio">
                {['Deposit', 'Withdrawal'].map((t) => (
                  <label key={t} className="wallets-radio-label">
                    <input
                      type="radio"
                      name="txType"
                      value={t}
                      checked={form.type === t}
                      onChange={() => setForm({ ...form, type: t })}
                    />
                    {t}
                  </label>
                ))}
              </div>

              <label>Amount (USD)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />

              <label>Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <div className="wallets-modal-footer">
                <button type="button" className="wallets-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="wallets-btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletsView;
