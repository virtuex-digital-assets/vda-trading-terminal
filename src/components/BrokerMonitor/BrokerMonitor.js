import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { formatProfit } from '../../utils/formatters';
import backendBridge from '../../services/backendBridge';
import './BrokerMonitor.css';

/**
 * BrokerMonitor – Admin / Broker risk monitoring dashboard.
 *
 * Aggregates all open positions across all accounts to show:
 *  • Symbol-level buy/sell exposure and net lots (margin heatmap)
 *  • Per-account equity snapshot with health score
 *  • Accounts at liquidation risk
 *  • Total floating P&L and platform-wide aggregates
 *
 * In standalone mode this reads from the Redux store.
 * When connected to the backend data is fetched from /api/admin/risk.
 */
const BrokerMonitor = () => {
  const { openOrders: reduxOrders } = useSelector((s) => s.orders);
  const account                     = useSelector((s) => s.account);
  const { quotes }                  = useSelector((s) => s.market);
  const [tab, setTab]               = useState('exposure');

  // Backend-sourced data (when REACT_APP_API_URL is configured)
  const [riskData,     setRiskData]     = useState(null);
  const [allAccounts,  setAllAccounts]  = useState(null);
  const [allOrders,    setAllOrders]    = useState(null);
  const [loadError,    setLoadError]    = useState('');

  const fetchAdminData = useCallback(async () => {
    if (!backendBridge.isConfigured()) return;
    try {
      const [risk, accounts, orders] = await Promise.all([
        backendBridge.getRisk(),
        backendBridge.listAccounts(),
        backendBridge.listAllOrders(),
      ]);
      setRiskData(risk);
      setAllAccounts(accounts);
      setAllOrders(orders);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!backendBridge.isConfigured()) return;
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, [fetchAdminData]);

  // ── Derive display data ─────────────────────────────────────────────────

  // Use backend data when available, fall back to Redux store
  const openOrders = allOrders || reduxOrders;

  // Aggregate symbol exposure from orders
  const exposureMap = {};
  openOrders.forEach((order) => {
    if (!exposureMap[order.symbol]) {
      exposureMap[order.symbol] = { symbol: order.symbol, buyLots: 0, sellLots: 0, netLots: 0, pnl: 0 };
    }
    const exp = exposureMap[order.symbol];
    if (order.type === 'BUY') exp.buyLots  = +(exp.buyLots  + order.lots).toFixed(2);
    else                      exp.sellLots = +(exp.sellLots + order.lots).toFixed(2);
    exp.netLots = +(exp.buyLots - exp.sellLots).toFixed(2);
    exp.pnl     = +(exp.pnl + (order.profit || 0)).toFixed(2);
  });
  const exposureRows = Object.values(exposureMap);

  const totalPnL   = openOrders.reduce((s, o) => s + (o.profit || 0), 0);
  const totalLots  = openOrders.reduce((s, o) => s + o.lots, 0);
  const atRisk     = account.marginLevel > 0 && account.marginLevel < 150;

  // Account rows: backend list (multiple accounts) or single Redux account
  const accountRows = allAccounts
    ? allAccounts.map((a) => ({
        login:       a.login,
        balance:     a.balance,
        equity:      a.equity,
        margin:      a.margin,
        marginLevel: a.marginLevel,
        profit:      a.profit,
        // allOrders have accountId; filter by account; fall back to full count
        openOrders:  allOrders
          ? allOrders.filter((o) => o.accountId === a.id).length
          : 0,
      }))
    : [{
        login:       account.login,
        balance:     account.balance,
        equity:      account.equity,
        margin:      account.margin,
        marginLevel: account.marginLevel,
        profit:      account.profit,
        openOrders:  reduxOrders.length,
      }];

  // Margin-call risk orders (SL very close to current price)
  const marginRiskOrders = openOrders.filter((o) => {
    if (!o.sl) return false;
    const q = quotes[o.symbol];
    if (!q) return false;
    const currentPrice = o.type === 'BUY' ? q.bid : q.ask;
    const dist = Math.abs(currentPrice - o.sl) / currentPrice;
    return dist < 0.005; // within 0.5% of SL
  });

  return (
    <div className="broker-monitor">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bm-header">
        <span className="bm-title">🛡 Broker Risk Monitor</span>
        <div className="bm-stats">
          <span className="bm-stat">
            Open Positions: <strong>{openOrders.length}</strong>
          </span>
          <span className="bm-stat">
            Total Lots: <strong>{totalLots.toFixed(2)}</strong>
          </span>
          <span className={`bm-stat${totalPnL >= 0 ? ' positive' : ' negative'}`}>
            Float P&L: <strong>{formatProfit(totalPnL)}</strong>
          </span>
          {atRisk && (
            <span className="bm-alert">⚠ LOW MARGIN LEVEL: {account.marginLevel.toFixed(1)}%</span>
          )}
          {loadError && (
            <span className="bm-alert" title={loadError}>⚠ API error</span>
          )}
          {backendBridge.isConfigured() && (
            <button className="bm-refresh-btn" onClick={fetchAdminData} title="Refresh data">↺</button>
          )}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="bm-tabs">
        {['exposure', 'accounts', 'marginCall'].map((t) => (
          <button
            key={t}
            className={`bm-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'exposure'   ? '📊 Symbol Exposure' :
             t === 'accounts'   ? '👤 Accounts' :
                                  `⚠ Margin Risk${marginRiskOrders.length > 0 ? ` (${marginRiskOrders.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Symbol exposure table ──────────────────────────────────────── */}
      {tab === 'exposure' && (
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Buy Lots</th>
                <th>Sell Lots</th>
                <th>Net Lots</th>
                <th>Float P&L</th>
                <th>Bid</th>
                <th>Ask</th>
              </tr>
            </thead>
            <tbody>
              {exposureRows.length === 0 ? (
                <tr><td colSpan={7} className="empty">No open positions</td></tr>
              ) : (
                exposureRows.map((row) => {
                  const q = quotes[row.symbol] || {};
                  return (
                    <tr key={row.symbol} className={Math.abs(row.netLots) > 2 ? 'high-risk' : ''}>
                      <td className="sym">{row.symbol}</td>
                      <td className="buy-type">{row.buyLots}</td>
                      <td className="sell-type">{row.sellLots}</td>
                      <td className={row.netLots > 0 ? 'buy-type' : row.netLots < 0 ? 'sell-type' : ''}>
                        {row.netLots > 0 ? '+' : ''}{row.netLots}
                      </td>
                      <td className={row.pnl >= 0 ? 'positive' : 'negative'}>
                        {formatProfit(row.pnl)}
                      </td>
                      <td>{q.bid ? q.bid.toFixed(5) : '—'}</td>
                      <td>{q.ask ? q.ask.toFixed(5) : '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {exposureRows.length > 0 && (
              <tfoot>
                <tr className="totals-row">
                  <td><strong>TOTAL</strong></td>
                  <td>{exposureRows.reduce((s, r) => +(s + r.buyLots).toFixed(2), 0)}</td>
                  <td>{exposureRows.reduce((s, r) => +(s + r.sellLots).toFixed(2), 0)}</td>
                  <td></td>
                  <td className={totalPnL >= 0 ? 'positive' : 'negative'}>
                    <strong>{formatProfit(totalPnL)}</strong>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* ── Account snapshot table ─────────────────────────────────────── */}
      {tab === 'accounts' && (
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>Login</th>
                <th>Balance</th>
                <th>Equity</th>
                <th>Margin</th>
                <th>Margin Level</th>
                <th>Float P&L</th>
                <th>Open Orders</th>
              </tr>
            </thead>
            <tbody>
              {accountRows.map((a, i) => (
                <tr key={i} className={a.marginLevel > 0 && a.marginLevel < 150 ? 'high-risk' : ''}>
                  <td>{a.login}</td>
                  <td>${a.balance.toFixed(2)}</td>
                  <td>${a.equity.toFixed(2)}</td>
                  <td>${a.margin.toFixed(2)}</td>
                  <td className={a.marginLevel < 100 ? 'negative' : a.marginLevel < 200 ? 'warn' : 'positive'}>
                    {a.marginLevel > 0 ? `${a.marginLevel.toFixed(1)}%` : '—'}
                  </td>
                  <td className={a.profit >= 0 ? 'positive' : 'negative'}>
                    {formatProfit(a.profit)}
                  </td>
                  <td>{a.openOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Margin risk orders ─────────────────────────────────────────── */}
      {tab === 'marginCall' && (
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Open Price</th>
                <th>SL</th>
                <th>Current</th>
                <th>Dist to SL</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {marginRiskOrders.length === 0 ? (
                <tr><td colSpan={9} className="empty">No orders near stop-loss</td></tr>
              ) : (
                marginRiskOrders.map((o) => {
                  const q = quotes[o.symbol] || {};
                  const currentPrice = o.type === 'BUY' ? q.bid : q.ask;
                  const dist = o.sl ? Math.abs(currentPrice - o.sl) : null;
                  return (
                    <tr key={o.ticket} className="high-risk">
                      <td>{o.ticket}</td>
                      <td className="sym">{o.symbol}</td>
                      <td className={o.type === 'BUY' ? 'buy-type' : 'sell-type'}>{o.type}</td>
                      <td>{o.lots}</td>
                      <td>{o.openPrice}</td>
                      <td className="sl">{o.sl}</td>
                      <td>{currentPrice ? currentPrice.toFixed(5) : '—'}</td>
                      <td className="negative">{dist ? dist.toFixed(5) : '—'}</td>
                      <td className={o.profit >= 0 ? 'positive' : 'negative'}>
                        {formatProfit(o.profit)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BrokerMonitor;
