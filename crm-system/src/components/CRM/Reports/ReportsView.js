import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import './ReportsView.css';

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtK = (n) => {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
  return '$' + n;
};

// ── Demo data ──────────────────────────────────────────────────────────────

const MONTHLY_DEPOSITS = [22000, 35000, 28000, 45000, 31000, 52000, 48000, 39000, 55000, 61000, 47000, 70000];
const CLIENT_GROWTH    = [1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 9, 10];
const MONTHS           = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STAGE_COLORS = {
  Active:    '#4fc3f7',
  Funded:    '#66bb6a',
  Lead:      '#ffa726',
  Demo:      '#ab47bc',
  Churned:   '#ef5350',
  Dormant:   '#8899bb',
};

// ── Bar Chart (SVG) ────────────────────────────────────────────────────────

const BarChart = ({ data, labels }) => {
  const W = 600, H = 200;
  const padL = 50, padR = 16, padT = 20, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = Math.max(...data);
  const barW = chartW / data.length;
  const barGap = barW * 0.25;

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => i / yTicks);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" aria-label="Monthly Deposits Bar Chart">
      {/* background */}
      <rect width={W} height={H} fill="#16213e" rx="4" />

      {/* y-grid lines + labels */}
      {yLines.map((f, i) => {
        const y = padT + chartH * (1 - f);
        const val = Math.round(maxVal * f);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y}
              stroke="#2a2a4a" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 3'} />
            <text x={padL - 4} y={y + 4} textAnchor="end"
              fill="#5566aa" fontSize="9">{fmtK(val)}</text>
          </g>
        );
      })}

      {/* bars */}
      {data.map((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = padL + i * barW + barGap / 2;
        const y = padT + chartH - barH;
        const w = barW - barGap;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={barH}
              fill="#4fc3f7" fillOpacity="0.85" rx="2" />
            {/* x-axis label */}
            <text x={x + w / 2} y={H - padB + 14} textAnchor="middle"
              fill="#8899bb" fontSize="9">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Line Chart (SVG) ──────────────────────────────────────────────────────

const LineChart = ({ data, labels }) => {
  const W = 600, H = 200;
  const padL = 40, padR = 16, padT = 20, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = Math.max(...data);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const pts = data.map((v, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - ((v - minVal) / range) * chartH,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    `M ${pts[0].x},${padT + chartH} ` +
    pts.map((p) => `L ${p.x},${p.y}`).join(' ') +
    ` L ${pts[pts.length - 1].x},${padT + chartH} Z`;

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => i / yTicks);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" aria-label="Client Growth Line Chart">
      <rect width={W} height={H} fill="#16213e" rx="4" />

      {yLines.map((f, i) => {
        const y = padT + chartH * (1 - f);
        const val = Math.round((minVal + range * f));
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y}
              stroke="#2a2a4a" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 3'} />
            <text x={padL - 4} y={y + 4} textAnchor="end"
              fill="#5566aa" fontSize="9">{val}</text>
          </g>
        );
      })}

      {/* area fill */}
      <path d={areaPath} fill="#66bb6a" fillOpacity="0.1" />

      {/* line */}
      <polyline points={polyline} fill="none" stroke="#66bb6a" strokeWidth="2" />

      {/* dots + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#66bb6a" />
          <text x={p.x} y={H - padB + 14} textAnchor="middle"
            fill="#8899bb" fontSize="9">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
};

// ── Donut Chart (SVG) ─────────────────────────────────────────────────────

const DonutChart = ({ slices }) => {
  const W = 200, H = 200;
  const cx = 100, cy = 100;
  const outerR = 80, innerR = 50;
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;

  let angle = -Math.PI / 2;
  const arcs = slices.map((sl) => {
    const sweep = (sl.value / total) * 2 * Math.PI;
    const startAngle = angle;
    angle += sweep;
    const endAngle = angle;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    return { d, color: sl.color };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="donut-svg" aria-label="Stage Distribution Donut Chart">
      <rect width={W} height={H} fill="#16213e" rx="4" />
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill={arc.color} fillOpacity="0.85" />
      ))}
      <circle cx={cx} cy={cy} r={innerR - 2} fill="#16213e" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#c8d0e0" fontSize="13" fontWeight="700">
        {slices.reduce((s, sl) => s + sl.value, 0)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#5566aa" fontSize="9">
        CLIENTS
      </text>
    </svg>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────

const ReportsView = () => {
  const clients   = useSelector((s) => s.crm.clients);
  const affiliates = useSelector((s) => s.broker.affiliates);

  // ── Overview stats ──
  const totalClients   = clients.length;
  const activeClients  = clients.filter((c) => c.stage === 'Active').length;
  const totalDeposits  = clients.reduce((s, c) => s + (c.totalDeposits || 0), 0);
  const totalWithdraws = clients.reduce((s, c) => s + (c.totalWithdrawals || 0), 0);
  const netRevenue     = totalDeposits - totalWithdraws;

  // ── Stage distribution slices ──
  const stageMap = useMemo(() => {
    const map = {};
    clients.forEach((c) => {
      map[c.stage] = (map[c.stage] || 0) + 1;
    });
    return map;
  }, [clients]);

  const stageSlices = Object.entries(stageMap).map(([stage, count]) => ({
    label: stage,
    value: count,
    color: STAGE_COLORS[stage] || '#5566aa',
  }));

  // ── Top 5 clients by deposits ──
  const topClients = [...clients]
    .sort((a, b) => (b.totalDeposits || 0) - (a.totalDeposits || 0))
    .slice(0, 5);

  // ── Affiliate commission summary ──
  const totalPaid    = affiliates.reduce((s, a) => s + (a.paidCommission || 0), 0);
  const totalPending = affiliates.reduce((s, a) => s + (a.pendingCommission || 0), 0);

  return (
    <div className="view-container">
      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Reports & Analytics</h2>
          <span className="view-subtitle">Business performance overview</span>
        </div>
      </div>

      {/* ── Overview stats ── */}
      <div className="view-stats rpt-stats">
        <div className="stat-card stat-card-info">
          <div className="stat-value info">{totalClients}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value success">{activeClients}</div>
          <div className="stat-label">Active Clients</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value success">{fmt(totalDeposits)}</div>
          <div className="stat-label">Total Deposits</div>
        </div>
        <div className="stat-card stat-card-warn">
          <div className="stat-value warn">{fmt(totalWithdraws)}</div>
          <div className="stat-label">Total Withdrawals</div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-value info">{fmt(netRevenue)}</div>
          <div className="stat-label">Net Revenue</div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="charts-row">
        {/* Bar chart */}
        <div className="chart-panel">
          <div className="panel-title">Monthly Deposits Overview</div>
          <BarChart data={MONTHLY_DEPOSITS} labels={MONTHS} />
        </div>

        {/* Line chart */}
        <div className="chart-panel">
          <div className="panel-title">Client Growth (Cumulative)</div>
          <LineChart data={CLIENT_GROWTH} labels={MONTHS} />
        </div>
      </div>

      {/* ── Donut + top clients row ── */}
      <div className="bottom-row">
        {/* Donut chart */}
        <div className="chart-panel donut-panel">
          <div className="panel-title">Client Stage Distribution</div>
          <div className="donut-layout">
            <DonutChart slices={stageSlices} />
            <div className="donut-legend">
              {stageSlices.map((sl) => (
                <div key={sl.label} className="legend-item">
                  <span className="legend-dot" style={{ background: sl.color }} />
                  <span className="legend-label">{sl.label}</span>
                  <span className="legend-val">{sl.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top clients */}
        <div className="chart-panel flex-1">
          <div className="panel-title">Top Clients by Deposits</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Country</th>
                <th>Deposits</th>
                <th>Withdrawals</th>
                <th>Net</th>
                <th>Accounts</th>
              </tr>
            </thead>
            <tbody>
              {topClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">No client data.</td>
                </tr>
              )}
              {topClients.map((c, idx) => (
                <tr key={c.id}>
                  <td className="rank-cell">#{idx + 1}</td>
                  <td>
                    <span className="client-name">{c.firstName} {c.lastName}</span>
                    <span className="client-id">{c.id}</span>
                  </td>
                  <td className="muted-cell">{c.country}</td>
                  <td className="num-cell success-text">{fmt(c.totalDeposits)}</td>
                  <td className="num-cell warn-text">{fmt(c.totalWithdrawals)}</td>
                  <td className="num-cell info-text">
                    {fmt((c.totalDeposits || 0) - (c.totalWithdrawals || 0))}
                  </td>
                  <td className="num-cell">{(c.accounts || []).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Affiliate Commission Summary ── */}
      <div className="section-wrap">
        <div className="panel">
          <div className="panel-title">Affiliate Commission Summary</div>
          <div className="aff-summary-stats">
            <div className="aff-summary-stat">
              <span className="aff-summary-label">Total Paid</span>
              <span className="aff-summary-val success-text">{fmt(totalPaid)}</span>
            </div>
            <div className="aff-summary-stat">
              <span className="aff-summary-label">Total Pending</span>
              <span className="aff-summary-val warn-text">{fmt(totalPending)}</span>
            </div>
            <div className="aff-summary-stat">
              <span className="aff-summary-label">Active Partners</span>
              <span className="aff-summary-val info-text">
                {affiliates.filter((a) => a.status === 'active').length}
              </span>
            </div>
          </div>
          <table className="data-table aff-table">
            <thead>
              <tr>
                <th>IB</th>
                <th>Name</th>
                <th>Level</th>
                <th>Status</th>
                <th>Paid Commission</th>
                <th>Pending</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">No affiliates.</td>
                </tr>
              )}
              {affiliates.map((aff) => (
                <tr key={aff.id}>
                  <td className="id-cell">{aff.id}</td>
                  <td>
                    <span className="client-name">{aff.name}</span>
                    <span className="client-id">{aff.contactEmail}</span>
                  </td>
                  <td>
                    <span className={`badge ${aff.level === 1 ? 'badge-master' : 'badge-sub'}`}>
                      {aff.level === 1 ? 'Master IB' : 'Sub-IB'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${aff.status}`}>{aff.status}</span>
                  </td>
                  <td className="num-cell success-text">{fmt(aff.paidCommission)}</td>
                  <td className="num-cell warn-text">{fmt(aff.pendingCommission)}</td>
                  <td className="num-cell">{((aff.commissionRate || 0) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
