/**
 * Affiliates – IB (Introducing Broker) Partner Portal.
 *
 * Allows traders to:
 *  • Register as an affiliate / IB partner
 *  • View their unique referral code and link
 *  • Track referrals, commissions, and payouts
 *  • Request commission payouts
 */
import React, { useState, useEffect, useCallback } from 'react';
import backendBridge from '../../services/backendBridge';
import './Affiliates.css';

function fmt(n, d = 2) {
  return typeof n === 'number' ? n.toFixed(d) : '0.00';
}

export default function Affiliates() {
  const [affiliate,   setAffiliate]   = useState(null);
  const [referrals,   setReferrals]   = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [payouts,     setPayouts]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [msg,         setMsg]         = useState({ text: '', type: '' });
  const [tab,         setTab]         = useState('overview');

  const [regForm, setRegForm]   = useState({ name: '', email: '' });
  const [payForm, setPayForm]   = useState({ amount: '', method: 'bank_transfer' });

  const flash = (text, type = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const load = useCallback(async () => {
    if (!backendBridge.isConfigured()) return;
    setLoading(true);
    try {
      const data = await backendBridge.get('/affiliates/me');
      setAffiliate(data.affiliate);
      setReferrals(data.referrals || []);
      setCommissions(data.commissions || []);
      setPayouts(data.payouts || []);
    } catch (e) {
      if (e.message && e.message.includes('404')) {
        setAffiliate(null);
      } else {
        flash(`Failed to load affiliate data: ${e.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRegister(e) {
    e.preventDefault();
    if (!regForm.name.trim())  { flash('Name is required.', 'error');  return; }
    if (!regForm.email.trim()) { flash('Email is required.', 'error'); return; }
    try {
      const data = await backendBridge.post('/affiliates/register', regForm);
      setAffiliate(data.affiliate);
      flash('🎉 Successfully registered as an affiliate!', 'success');
      load();
    } catch (err) {
      flash(`Registration failed: ${err.message}`, 'error');
    }
  }

  async function handlePayout(e) {
    e.preventDefault();
    const amount = parseFloat(payForm.amount);
    if (isNaN(amount) || amount <= 0) {
      flash('Please enter a valid amount.', 'error');
      return;
    }
    try {
      await backendBridge.post('/affiliates/payout', { ...payForm, amount });
      flash('Payout request submitted! Processing within 2-5 business days.', 'success');
      setPayForm({ amount: '', method: 'bank_transfer' });
      load();
    } catch (err) {
      flash(`Payout request failed: ${err.message}`, 'error');
    }
  }

  if (!backendBridge.isConfigured()) {
    return (
      <div className="affiliates-panel">
        <div className="panel-header">🤝 Affiliate / IB Partner</div>
        <div className="affiliates-demo-notice">
          <p>The affiliate portal is available when connected to the backend.</p>
          <p>Set <code>REACT_APP_API_URL</code> to connect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliates-panel">
      <div className="panel-header">🤝 Affiliate / IB Partner</div>

      {msg.text && (
        <div className={`affiliates-msg affiliates-msg-${msg.type}`}>{msg.text}</div>
      )}

      {loading && !affiliate && (
        <div className="affiliates-loading">Loading…</div>
      )}

      {/* Not registered yet */}
      {!loading && !affiliate && (
        <div className="affiliates-register">
          <div className="affiliates-register-header">
            <h2>Become an IB Partner</h2>
            <p>Join our affiliate program and earn commissions on every trade your referred clients make.</p>
          </div>

          <div className="affiliates-benefits">
            <div className="affiliates-benefit">
              <span className="affiliates-benefit-icon">💵</span>
              <div>
                <strong>Commission Per Lot</strong>
                <p>Earn up to $5 per lot traded by your referrals</p>
              </div>
            </div>
            <div className="affiliates-benefit">
              <span className="affiliates-benefit-icon">📊</span>
              <div>
                <strong>Real-Time Dashboard</strong>
                <p>Track referrals, commissions, and payouts live</p>
              </div>
            </div>
            <div className="affiliates-benefit">
              <span className="affiliates-benefit-icon">💳</span>
              <div>
                <strong>Flexible Payouts</strong>
                <p>Bank transfer, crypto, or e-wallet withdrawals</p>
              </div>
            </div>
          </div>

          <form className="affiliates-form" onSubmit={handleRegister}>
            <h3>Register Now</h3>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
            />
            <label>Contact Email</label>
            <input
              type="email"
              placeholder="contact@example.com"
              value={regForm.email}
              onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
            />
            <button type="submit" className="affiliates-btn-primary">
              🚀 Register as Affiliate
            </button>
          </form>
        </div>
      )}

      {/* Registered affiliate dashboard */}
      {affiliate && (
        <>
          {/* Referral code banner */}
          <div className="affiliates-ref-banner">
            <div className="affiliates-ref-code">
              <span className="affiliates-ref-label">Your Referral Code</span>
              <span className="affiliates-ref-value">{affiliate.referralCode}</span>
            </div>
            <div className="affiliates-ref-link">
              <span className="affiliates-ref-label">Referral Link</span>
              <code>https://platform.vda.trade/register?ref={affiliate.referralCode}</code>
            </div>
            <div className="affiliates-ref-tier">
              <span className="affiliates-ref-label">Tier</span>
              <span className="affiliates-tier-badge">Tier {affiliate.tier}</span>
            </div>
          </div>

          {/* Stats cards */}
          <div className="affiliates-stats">
            <div className="affiliates-stat-card">
              <div className="affiliates-stat-value">{affiliate.stats?.referrals || 0}</div>
              <div className="affiliates-stat-label">Total Referrals</div>
            </div>
            <div className="affiliates-stat-card">
              <div className="affiliates-stat-value">{affiliate.stats?.activeTraders || 0}</div>
              <div className="affiliates-stat-label">Active Traders</div>
            </div>
            <div className="affiliates-stat-card">
              <div className="affiliates-stat-value">{fmt(affiliate.stats?.totalVolumeLots || 0, 0)}</div>
              <div className="affiliates-stat-label">Total Volume (Lots)</div>
            </div>
            <div className="affiliates-stat-card affiliates-stat-green">
              <div className="affiliates-stat-value">${fmt(affiliate.stats?.totalCommission || 0)}</div>
              <div className="affiliates-stat-label">Total Earned</div>
            </div>
            <div className="affiliates-stat-card affiliates-stat-yellow">
              <div className="affiliates-stat-value">${fmt(affiliate.stats?.pendingCommission || 0)}</div>
              <div className="affiliates-stat-label">Pending Balance</div>
            </div>
            <div className="affiliates-stat-card">
              <div className="affiliates-stat-value">${fmt(affiliate.stats?.paidOut || 0)}</div>
              <div className="affiliates-stat-label">Total Paid Out</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="affiliates-tabs">
            {['overview', 'referrals', 'commissions', 'payouts', 'payout_request'].map((t) => (
              <button
                key={t}
                className={`affiliates-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'overview'        && '📊 Overview'}
                {t === 'referrals'       && `👥 Referrals (${referrals.length})`}
                {t === 'commissions'     && `💰 Commissions (${commissions.length})`}
                {t === 'payouts'         && `📤 Payouts (${payouts.length})`}
                {t === 'payout_request'  && '💳 Request Payout'}
              </button>
            ))}
          </div>

          <div className="affiliates-tab-content">
            {/* Overview tab */}
            {tab === 'overview' && (
              <div className="affiliates-overview">
                <div className="affiliates-overview-info">
                  <div><strong>Name:</strong> {affiliate.name}</div>
                  <div><strong>Email:</strong> {affiliate.email}</div>
                  <div><strong>Commission Type:</strong> {affiliate.commissionType}</div>
                  <div><strong>Commission Rate:</strong> {affiliate.commissionRate}</div>
                  <div><strong>Status:</strong>
                    <span style={{ color: affiliate.status === 'active' ? '#27ae60' : '#e74c3c' }}>
                      {' '}{affiliate.status}
                    </span>
                  </div>
                  <div><strong>Member Since:</strong> {new Date(affiliate.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="affiliates-overview-help">
                  <h4>How it works</h4>
                  <ol>
                    <li>Share your referral code or link with potential traders</li>
                    <li>When they register and trade, you earn commissions</li>
                    <li>Commissions accumulate in your pending balance</li>
                    <li>Request payouts anytime to your preferred method</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Referrals tab */}
            {tab === 'referrals' && (
              <div className="affiliates-table-wrap">
                {referrals.length === 0 ? (
                  <p className="affiliates-empty">No referrals yet. Share your referral code to get started!</p>
                ) : (
                  <table className="affiliates-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Deposit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((r) => (
                        <tr key={r.id}>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td>{r.status}</td>
                          <td>${fmt(r.depositAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Commissions tab */}
            {tab === 'commissions' && (
              <div className="affiliates-table-wrap">
                {commissions.length === 0 ? (
                  <p className="affiliates-empty">No commissions recorded yet.</p>
                ) : (
                  <table className="affiliates-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Lots</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((c) => (
                        <tr key={c.id}>
                          <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td>{c.type}</td>
                          <td>{fmt(c.lots, 2)}</td>
                          <td className="affiliates-amount-pos">${fmt(c.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Payouts tab */}
            {tab === 'payouts' && (
              <div className="affiliates-table-wrap">
                {payouts.length === 0 ? (
                  <p className="affiliates-empty">No payout requests yet.</p>
                ) : (
                  <table className="affiliates-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id}>
                          <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td>${fmt(p.amount)}</td>
                          <td>{p.method}</td>
                          <td>
                            <span
                              style={{
                                color: p.status === 'paid' ? '#27ae60'
                                     : p.status === 'rejected' ? '#e74c3c'
                                     : '#f39c12',
                              }}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Payout request tab */}
            {tab === 'payout_request' && (
              <div className="affiliates-payout-form">
                <div className="affiliates-payout-balance">
                  Available Balance:
                  <strong>${fmt(affiliate.stats?.pendingCommission || 0)}</strong>
                </div>
                <form onSubmit={handlePayout} className="affiliates-form">
                  <label>Amount (USD)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={payForm.amount}
                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  />
                  <label>Payout Method</label>
                  <select
                    value={payForm.method}
                    onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                  >
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="crypto_btc">₿ Bitcoin (BTC)</option>
                    <option value="crypto_usdt">💵 USDT (TRC20)</option>
                    <option value="skrill">💳 Skrill</option>
                    <option value="neteller">💳 Neteller</option>
                  </select>
                  <button type="submit" className="affiliates-btn-primary">
                    📤 Request Payout
                  </button>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
