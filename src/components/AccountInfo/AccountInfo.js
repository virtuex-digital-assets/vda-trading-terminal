import React from 'react';
import { useSelector } from 'react-redux';
import './AccountInfo.css';

const AccountInfo = () => {
  const account = useSelector((s) => s.account);
  const { status, broker, pingMs } = useSelector((s) => s.connection);

  const items = [
    { label: 'Login', value: account.login },
    { label: 'Server', value: account.server },
    { label: 'Balance', value: `$${account.balance.toFixed(2)}` },
    { label: 'Equity', value: `$${account.equity.toFixed(2)}` },
    { label: 'Margin', value: `$${account.margin.toFixed(2)}` },
    { label: 'Free Margin', value: `$${account.freeMargin.toFixed(2)}` },
    {
      label: 'Margin Level',
      value: account.marginLevel > 0 ? `${account.marginLevel.toFixed(1)}%` : '—',
    },
    { label: 'Float P&L', value: `$${account.profit >= 0 ? '+' : ''}${account.profit.toFixed(2)}`, isProfit: true, profit: account.profit },
    { label: 'Leverage', value: `1:${account.leverage}` },
  ];

  return (
    <div className="account-info">
      <div className="panel-header">
        Account
        <span className={`conn-dot conn-${status}`} title={broker || status}>
          {status === 'connected' ? '●' : status === 'connecting' ? '◌' : '○'}
        </span>
        {pingMs !== null && <span className="ping">{pingMs}ms</span>}
      </div>
      <div className="ai-grid">
        {items.map(({ label, value, isProfit, profit }) => (
          <div key={label} className="ai-item">
            <span className="ai-label">{label}</span>
            <span className={`ai-value${isProfit ? (profit >= 0 ? ' positive' : ' negative') : ''}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="ai-footer">
        <span className={`status-${status}`}>
          {status === 'connected' ? `Connected – ${broker}` :
           status === 'connecting' ? `Connecting…` :
           status === 'error' ? 'Connection error' :
           'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default AccountInfo;
