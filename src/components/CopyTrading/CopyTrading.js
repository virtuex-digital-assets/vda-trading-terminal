/**
 * CopyTrading – Strategy provider leaderboard and follower subscription UI.
 *
 * Tabs:
 *  • Leaderboard  – browse and follow public strategies
 *  • My Strategies – manage strategies you run as provider
 *  • My Subscriptions – manage active copy subscriptions
 */
import React, { useState, useEffect, useCallback } from 'react';
import backendBridge from '../../services/backendBridge';
import './CopyTrading.css';

const TABS = ['leaderboard', 'myStrategies', 'subscriptions'];
const TAB_LABELS = {
  leaderboard:   '🏆 Leaderboard',
  myStrategies:  '📊 My Strategies',
  subscriptions: '🔗 My Subscriptions',
};

function fmt(n, d = 2) { return typeof n === 'number' ? n.toFixed(d) : '—'; }
function pct(n)         { return typeof n === 'number' ? `${(n * 100).toFixed(1)}%` : '—'; }

export default function CopyTrading() {
  const [tab, setTab]             = useState('leaderboard');
  const [leaderboard, setLboard]  = useState([]);
  const [strategies,  setStrats]  = useState([]);
  const [subscriptions, setSubs]  = useState([]);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');

  // New strategy form
  const [newStrat, setNewStrat] = useState({ name: '', description: '', performanceFee: 20, isPublic: true });

  // Subscribe modal
  const [subModal, setSubModal]   = useState(null); // { strategy }
  const [riskFactor, setRiskFactor] = useState(1.0);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const load = useCallback(async () => {
    if (!backendBridge.isConfigured()) return;
    setLoading(true);
    try {
      const [lb, my, subs] = await Promise.all([
        backendBridge.get('/copy-trading/leaderboard'),
        backendBridge.get('/copy-trading/strategies'),
        backendBridge.get('/copy-trading/subscriptions'),
      ]);
      setLboard(lb.leaderboard || []);
      setStrats(my.strategies  || []);
      setSubs(subs.subscriptions || []);
    } catch (e) {
      flash(`Failed to load copy trading data: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreateStrategy() {
    if (!newStrat.name.trim()) { flash('Strategy name is required.'); return; }
    try {
      await backendBridge.post('/copy-trading/strategies', newStrat);
      flash('Strategy created!');
      setNewStrat({ name: '', description: '', performanceFee: 20, isPublic: true });
      load();
    } catch (e) {
      flash(`Error: ${e.message}`);
    }
  }

  async function handleSubscribe() {
    if (!subModal) return;
    try {
      await backendBridge.post('/copy-trading/subscriptions', {
        strategyId: subModal.id,
        riskFactor: parseFloat(riskFactor),
      });
      flash(`Subscribed to "${subModal.name}"!`);
      setSubModal(null);
      load();
    } catch (e) {
      flash(`Error: ${e.message}`);
    }
  }

  async function handleUnsubscribe(id) {
    try {
      await backendBridge.delete(`/copy-trading/subscriptions/${id}`);
      flash('Unsubscribed.');
      load();
    } catch (e) {
      flash(`Error: ${e.message}`);
    }
  }

  return (
    <div className="copy-trading">
      <div className="ct-header">
        <span className="ct-title">📈 Copy Trading</span>
        <span className="ct-subtitle">Follow top traders · Earn automatically</span>
        {msg && <span className="ct-flash">{msg}</span>}
      </div>

      <div className="ct-tabs">
        {TABS.map((t) => (
          <button key={t} className={`ct-tab${tab === t ? ' ct-tab-active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {loading && <div className="ct-loading">Loading…</div>}

      {/* ── Leaderboard ──────────────────────────────────────────────────── */}
      {tab === 'leaderboard' && (
        <div className="ct-section">
          {leaderboard.length === 0 && !loading && (
            <div className="ct-empty">No public strategies available yet.</div>
          )}
          <div className="ct-cards">
            {leaderboard.map((s, i) => (
              <div key={s.id} className="ct-card">
                <div className="ct-card-rank">#{i + 1}</div>
                <div className="ct-card-name">{s.name}</div>
                <div className="ct-card-stats">
                  <div className="ct-stat">
                    <span className="ct-stat-label">Total PnL</span>
                    <span className={`ct-stat-val ${s.totalPnL >= 0 ? 'pos' : 'neg'}`}>
                      ${fmt(s.totalPnL)}
                    </span>
                  </div>
                  <div className="ct-stat">
                    <span className="ct-stat-label">Win Rate</span>
                    <span className="ct-stat-val">{pct(s.winRate)}</span>
                  </div>
                  <div className="ct-stat">
                    <span className="ct-stat-label">Monthly</span>
                    <span className="ct-stat-val">{fmt(s.monthlyReturn)}%</span>
                  </div>
                  <div className="ct-stat">
                    <span className="ct-stat-label">Followers</span>
                    <span className="ct-stat-val">{s.followers}</span>
                  </div>
                  <div className="ct-stat">
                    <span className="ct-stat-label">Fee</span>
                    <span className="ct-stat-val">{s.performanceFee}%</span>
                  </div>
                </div>
                <button className="ct-btn ct-btn-follow" onClick={() => { setSubModal(s); setRiskFactor(1.0); }}>
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── My Strategies ────────────────────────────────────────────────── */}
      {tab === 'myStrategies' && (
        <div className="ct-section">
          <div className="ct-section-title">Create Strategy</div>
          <div className="ct-form">
            <input className="ct-input" placeholder="Strategy name" value={newStrat.name}
              onChange={(e) => setNewStrat((s) => ({ ...s, name: e.target.value }))} />
            <input className="ct-input" placeholder="Description" value={newStrat.description}
              onChange={(e) => setNewStrat((s) => ({ ...s, description: e.target.value }))} />
            <label className="ct-label">
              Performance fee (%)
              <input className="ct-input ct-input-sm" type="number" min="0" max="50" value={newStrat.performanceFee}
                onChange={(e) => setNewStrat((s) => ({ ...s, performanceFee: Number(e.target.value) }))} />
            </label>
            <label className="ct-label">
              <input type="checkbox" checked={newStrat.isPublic}
                onChange={(e) => setNewStrat((s) => ({ ...s, isPublic: e.target.checked }))} />
              &nbsp;Public
            </label>
            <button className="ct-btn ct-btn-primary" onClick={handleCreateStrategy}>Create</button>
          </div>

          <div className="ct-section-title" style={{ marginTop: '1.5rem' }}>My Strategies</div>
          {strategies.length === 0 && (
            <div className="ct-empty">You have no strategies yet.</div>
          )}
          <table className="ct-table">
            <thead><tr><th>Name</th><th>Followers</th><th>PnL</th><th>Fee</th><th>Status</th></tr></thead>
            <tbody>
              {strategies.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.stats?.followers ?? 0}</td>
                  <td className={s.stats?.totalPnL >= 0 ? 'pos' : 'neg'}>${fmt(s.stats?.totalPnL)}</td>
                  <td>{s.performanceFee}%</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── My Subscriptions ─────────────────────────────────────────────── */}
      {tab === 'subscriptions' && (
        <div className="ct-section">
          {subscriptions.length === 0 && !loading && (
            <div className="ct-empty">You are not following any strategies.</div>
          )}
          <table className="ct-table">
            <thead><tr><th>Strategy</th><th>Risk Factor</th><th>Copied Trades</th><th>PnL</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.strategyId?.slice(0, 8)}…</td>
                  <td>{sub.riskFactor}×</td>
                  <td>{sub.stats?.copiedTrades ?? 0}</td>
                  <td className={sub.stats?.totalPnL >= 0 ? 'pos' : 'neg'}>${fmt(sub.stats?.totalPnL)}</td>
                  <td>{sub.status}</td>
                  <td>
                    {sub.status === 'active' && (
                      <button className="ct-btn ct-btn-danger" onClick={() => handleUnsubscribe(sub.id)}>
                        Unfollow
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Subscribe modal ───────────────────────────────────────────────── */}
      {subModal && (
        <div className="ct-modal-overlay" onClick={() => setSubModal(null)}>
          <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ct-modal-title">Follow: {subModal.name}</div>
            <div className="ct-modal-body">
              <label className="ct-label">
                Risk Factor (0.1 – 5.0)
                <input className="ct-input" type="number" step="0.1" min="0.1" max="5" value={riskFactor}
                  onChange={(e) => setRiskFactor(e.target.value)} />
              </label>
              <p className="ct-note">A risk factor of 1.0 copies trades at the same lot size as the provider.</p>
            </div>
            <div className="ct-modal-actions">
              <button className="ct-btn ct-btn-primary" onClick={handleSubscribe}>Confirm</button>
              <button className="ct-btn" onClick={() => setSubModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
