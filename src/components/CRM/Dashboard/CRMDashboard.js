import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSelectClient } from '../../../store/actions';
import './CRMDashboard.css';

const STAGES = ['New Lead', 'Contacted', 'KYC Submitted', 'KYC Verified', 'Funded', 'Active', 'Inactive'];

const STAGE_COLORS = {
  'New Lead':      '#5566aa',
  'Contacted':     '#4fc3f7',
  'KYC Submitted': '#ffa726',
  'KYC Verified':  '#ab47bc',
  'Funded':        '#29b6f6',
  'Active':        '#66bb6a',
  'Inactive':      '#ef5350',
};

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

const CRMDashboard = () => {
  const dispatch = useDispatch();
  const { clients } = useSelector((s) => s.crm);

  const totalClients      = clients.length;
  const activeClients     = clients.filter((c) => c.stage === 'Active').length;
  const totalDeposits     = clients.reduce((s, c) => s + c.totalDeposits, 0);
  const totalWithdrawals  = clients.reduce((s, c) => s + c.totalWithdrawals, 0);
  const netDeposits       = totalDeposits - totalWithdrawals;
  const totalOpenPL       = clients.reduce((s, c) => s + (c.openPL || 0), 0);
  // Conversion rate = Active ÷ all clients who entered the funnel (excluding Inactive)
  const funnelClients     = clients.filter((c) => c.stage !== 'Inactive').length;
  const conversionRate    = funnelClients > 0 ? ((activeClients / funnelClients) * 100).toFixed(1) : '0.0';

  // Stage counts
  const stageCounts = Object.fromEntries(STAGES.map((s) => [s, 0]));
  clients.forEach((c) => { if (stageCounts[c.stage] !== undefined) stageCounts[c.stage]++; });
  const maxStageCount = Math.max(...Object.values(stageCounts), 1);

  // Top 5 clients by balance
  const topClients = [...clients]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // Recent activity — last 5 notes across all clients
  const recentNotes = clients
    .flatMap((c) => c.notes.map((n) => ({ ...n, clientName: `${c.firstName} ${c.lastName}`, clientId: c.id })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="crm-dash">
      {/* ── Stat cards ─────────────────────────────── */}
      <div className="dash-stats">
        <div className="stat-card">
          <span className="stat-card-label">Total Clients</span>
          <span className="stat-card-value accent">{totalClients}</span>
          <span className="stat-card-sub">{activeClients} active</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Total Deposits</span>
          <span className="stat-card-value positive">{fmt(totalDeposits)}</span>
          <span className="stat-card-sub">all time</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Total Withdrawals</span>
          <span className="stat-card-value">{fmt(totalWithdrawals)}</span>
          <span className="stat-card-sub">all time</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Net Funds</span>
          <span className={`stat-card-value ${netDeposits >= 0 ? 'positive' : ''}`}>{fmt(netDeposits)}</span>
          <span className="stat-card-sub">deposits − withdrawals</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Open P&amp;L</span>
          <span className={`stat-card-value ${totalOpenPL >= 0 ? 'positive' : 'negative'}`}>
            {totalOpenPL >= 0 ? '+' : ''}{fmt(Math.abs(totalOpenPL))}
          </span>
          <span className="stat-card-sub">across all accounts</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Conversion Rate</span>
          <span className="stat-card-value accent">{conversionRate}%</span>
          <span className="stat-card-sub">leads → active</span>
        </div>
      </div>

      {/* ── Two-column section ──────────────────────── */}
      <div className="dash-grid">
        {/* Stage breakdown */}
        <div className="dash-panel">
          <div className="dash-panel-header">Pipeline Stages</div>
          <div className="dash-panel-body">
            {STAGES.map((stage) => (
              <div key={stage} className="stage-row">
                <span className="stage-label">{stage}</span>
                <div className="stage-bar-wrap">
                  <div
                    className="stage-bar-fill"
                    style={{
                      width: `${(stageCounts[stage] / maxStageCount) * 100}%`,
                      background: STAGE_COLORS[stage],
                    }}
                  />
                </div>
                <span className="stage-count">{stageCounts[stage]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients by balance */}
        <div className="dash-panel">
          <div className="dash-panel-header">Top Clients by Balance</div>
          <div className="dash-panel-body">
            <table className="top-clients-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Balance</th>
                  <th>Float P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c) => (
                  <tr
                    key={c.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => dispatch(crmSelectClient(c.id))}
                  >
                    <td>{c.firstName} {c.lastName}</td>
                    <td className="positive">{fmt(c.balance)}</td>
                    <td className={c.openPL >= 0 ? 'positive' : 'negative'}>
                      {c.openPL >= 0 ? '+' : ''}{fmt(Math.abs(c.openPL))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div className="dash-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="dash-panel-header">Recent Activity</div>
          <div className="dash-panel-body">
            {recentNotes.length === 0 ? (
              <div style={{ padding: '12px', color: '#5566aa', fontSize: 12 }}>No recent activity</div>
            ) : (
              <table className="top-clients-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Note</th>
                    <th>Author</th>
                  </tr>
                </thead>
                <tbody>
                  {recentNotes.map((n) => (
                    <tr
                      key={n.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => dispatch(crmSelectClient(n.clientId))}
                    >
                      <td style={{ whiteSpace: 'nowrap', color: '#5566aa' }}>
                        {new Date(n.date).toLocaleDateString()}
                      </td>
                      <td>{n.clientName}</td>
                      <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.text}</td>
                      <td style={{ color: '#5566aa' }}>{n.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
