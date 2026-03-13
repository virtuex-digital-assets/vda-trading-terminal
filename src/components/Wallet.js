import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateAccount } from '../store/actions';
import backendBridge from '../services/backendBridge';

const fmt = (n) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Wallet = () => {
  const dispatch  = useDispatch();
  const account   = useSelector((state) => state.account);
  const { usdBalance, holdings } = useSelector((state) => state.wallet);
  const prices    = useSelector((state) => state.market.prices);

  const [tab,        setTab]        = useState('overview');  // 'overview' | 'deposit' | 'withdraw' | 'history'
  const [amount,     setAmount]     = useState('');
  const [note,       setNote]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [message,    setMessage]    = useState(null);   // { type: 'success'|'error', text }
  const [txHistory,  setTxHistory]  = useState([]);
  const [histLoaded, setHistLoaded] = useState(false);

  const holdingEntries = Object.entries(holdings || {});
  const portfolioValue = holdingEntries.reduce((sum, [symbol, qty]) => {
    const price = prices[symbol] ? prices[symbol].price : 0;
    return sum + qty * price;
  }, 0);

  // Prefer live trading account balance when backend is connected
  const balance    = account && account.balance != null ? account.balance : (usdBalance || 0);
  const totalValue = balance + portfolioValue;

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDeposit = useCallback(async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return showMsg('error', 'Enter a valid amount');
    if (!backendBridge.isConfigured()) return showMsg('error', 'Backend not connected');
    setLoading(true);
    try {
      const data = await backendBridge.post('/wallet/deposit', { amount: amt, note });
      if (data.account) dispatch(updateAccount(data.account));
      showMsg('success', `Deposit of $${fmt(amt)} completed`);
      setAmount(''); setNote('');
    } catch (err) {
      showMsg('error', err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  }, [amount, note, dispatch]);

  const handleWithdraw = useCallback(async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return showMsg('error', 'Enter a valid amount');
    if (!backendBridge.isConfigured()) return showMsg('error', 'Backend not connected');
    if (amt > balance) return showMsg('error', 'Amount exceeds available balance');
    setLoading(true);
    try {
      const data = await backendBridge.post('/wallet/withdraw', { amount: amt, note });
      if (data.account) dispatch(updateAccount(data.account));
      showMsg('success', `Withdrawal of $${fmt(amt)} submitted`);
      setAmount(''); setNote('');
    } catch (err) {
      showMsg('error', err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  }, [amount, note, balance, dispatch]);

  const loadHistory = useCallback(async () => {
    if (!backendBridge.isConfigured()) {
      setTxHistory([]);
      setHistLoaded(true);
      return;
    }
    try {
      const data = await backendBridge.get('/wallet/transactions');
      setTxHistory(Array.isArray(data) ? data : []);
    } catch (_) {
      setTxHistory([]);
    }
    setHistLoaded(true);
  }, []);

  const switchTab = (t) => {
    setTab(t);
    if (t === 'history' && !histLoaded) loadHistory();
  };

  const statusColor = (s) => s === 'completed' ? '#26a69a' : s === 'rejected' ? '#ef5350' : '#ffa726';

  return (
    <div className="card wallet">
      <div className="card-header">Wallet</div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a4a', background: '#0d0d1e' }}>
        {['overview', 'deposit', 'withdraw', 'history'].map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            style={{
              flex: 1, padding: '6px 0', background: tab === t ? '#1a1a3e' : 'transparent',
              border: 'none', color: tab === t ? '#4fc3f7' : '#8899aa', cursor: 'pointer',
              fontSize: '11px', textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {message && (
        <div style={{
          padding: '6px 12px', fontSize: '12px',
          background: message.type === 'success' ? '#1b3a2b' : '#3a1b1b',
          color: message.type === 'success' ? '#26a69a' : '#ef5350',
        }}>
          {message.text}
        </div>
      )}

      <div className="card-body">
        {/* ── Overview ──────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            <div className="wallet-balance">
              <div className="balance-label">Account Balance</div>
              <div className="balance-amount">${fmt(balance)}</div>
            </div>
            {account && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', fontSize: '12px' }}>
                <div style={{ background: '#12122a', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#8899aa' }}>Equity</div>
                  <div style={{ color: '#c9d1d9' }}>${fmt(account.equity)}</div>
                </div>
                <div style={{ background: '#12122a', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#8899aa' }}>Free Margin</div>
                  <div style={{ color: '#c9d1d9' }}>${fmt(account.freeMargin)}</div>
                </div>
                <div style={{ background: '#12122a', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#8899aa' }}>Margin Used</div>
                  <div style={{ color: '#c9d1d9' }}>${fmt(account.margin)}</div>
                </div>
                <div style={{ background: '#12122a', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#8899aa' }}>Floating P&L</div>
                  <div style={{ color: (account.profit || 0) >= 0 ? '#26a69a' : '#ef5350' }}>
                    ${fmt(account.profit)}
                  </div>
                </div>
              </div>
            )}
            {holdingEntries.length > 0 && (
              <>
                <div className="holdings-title" style={{ marginTop: '12px' }}>Holdings</div>
                {holdingEntries.map(([symbol, qty]) => {
                  const price = prices[symbol] ? prices[symbol].price : 0;
                  const value = qty * price;
                  return (
                    <div key={symbol} className="holding-row">
                      <div>
                        <div className="holding-symbol">{symbol}</div>
                        <div className="holding-qty">{qty.toFixed(6)} units</div>
                      </div>
                      <div className="holding-value positive">${fmt(value)}</div>
                    </div>
                  );
                })}
                <div className="wallet-balance" style={{ marginTop: '8px' }}>
                  <div className="balance-label">Total Portfolio Value</div>
                  <div className="balance-amount" style={{ fontSize: '18px' }}>${fmt(totalValue)}</div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Deposit ───────────────────────────────────────────────── */}
        {tab === 'deposit' && (
          <div>
            <p style={{ color: '#8899aa', fontSize: '12px', marginBottom: '12px' }}>
              Deposit funds to your trading account. Demo deposits are credited instantly.
            </p>
            <label style={{ display: 'block', color: '#8899aa', fontSize: '12px', marginBottom: '4px' }}>Amount (USD)</label>
            <input
              type="number" min="1" step="100" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              style={{ width: '100%', padding: '8px', background: '#12122a', border: '1px solid #2a2a4a', color: '#c9d1d9', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '8px' }}
            />
            <label style={{ display: 'block', color: '#8899aa', fontSize: '12px', marginBottom: '4px' }}>Note (optional)</label>
            <input
              type="text" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Payment reference"
              style={{ width: '100%', padding: '8px', background: '#12122a', border: '1px solid #2a2a4a', color: '#c9d1d9', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            <button
              onClick={handleDeposit} disabled={loading}
              style={{ width: '100%', padding: '10px', background: '#26a69a', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Processing…' : 'Deposit Funds'}
            </button>
          </div>
        )}

        {/* ── Withdraw ──────────────────────────────────────────────── */}
        {tab === 'withdraw' && (
          <div>
            <p style={{ color: '#8899aa', fontSize: '12px', marginBottom: '12px' }}>
              Withdraw funds from your trading account. Available: <strong style={{ color: '#c9d1d9' }}>${fmt(balance)}</strong>
            </p>
            <label style={{ display: 'block', color: '#8899aa', fontSize: '12px', marginBottom: '4px' }}>Amount (USD)</label>
            <input
              type="number" min="1" step="100" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              style={{ width: '100%', padding: '8px', background: '#12122a', border: '1px solid #2a2a4a', color: '#c9d1d9', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '8px' }}
            />
            <label style={{ display: 'block', color: '#8899aa', fontSize: '12px', marginBottom: '4px' }}>Note (optional)</label>
            <input
              type="text" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bank reference"
              style={{ width: '100%', padding: '8px', background: '#12122a', border: '1px solid #2a2a4a', color: '#c9d1d9', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            <button
              onClick={handleWithdraw} disabled={loading}
              style={{ width: '100%', padding: '10px', background: '#ef5350', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Processing…' : 'Request Withdrawal'}
            </button>
          </div>
        )}

        {/* ── History ───────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div>
            {!histLoaded ? (
              <p style={{ color: '#8899aa', fontSize: '12px' }}>Loading…</p>
            ) : txHistory.length === 0 ? (
              <p style={{ color: '#8899aa', fontSize: '12px' }}>No transactions yet.</p>
            ) : (
              txHistory.map((tx) => (
                <div key={tx.id} style={{ padding: '8px 0', borderBottom: '1px solid #1a1a2e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: tx.type === 'deposit' ? '#26a69a' : '#ef5350', fontSize: '12px', textTransform: 'capitalize' }}>
                      {tx.type}
                    </span>
                    <span style={{ color: '#c9d1d9', fontSize: '12px', fontWeight: 'bold' }}>
                      {tx.type === 'deposit' ? '+' : '-'}${fmt(tx.amount)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ color: '#5566aa', fontSize: '10px' }}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </span>
                    <span style={{ color: statusColor(tx.status), fontSize: '10px', textTransform: 'capitalize' }}>
                      {tx.status}
                    </span>
                  </div>
                  {tx.note && <div style={{ color: '#5566aa', fontSize: '10px', marginTop: '2px' }}>{tx.note}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;

