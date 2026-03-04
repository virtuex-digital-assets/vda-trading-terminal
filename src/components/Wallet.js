import React from 'react';
import { useSelector } from 'react-redux';

const Wallet = () => {
  const { usdBalance, holdings } = useSelector((state) => state.wallet);
  const prices = useSelector((state) => state.market.prices);

  const holdingEntries = Object.entries(holdings);

  const portfolioValue = holdingEntries.reduce((sum, [symbol, qty]) => {
    const price = prices[symbol] ? prices[symbol].price : 0;
    return sum + qty * price;
  }, 0);

  const totalValue = usdBalance + portfolioValue;

  return (
    <div className="card wallet">
      <div className="card-header">Virtual Wallet</div>
      <div className="card-body">
        <div className="wallet-balance">
          <div className="balance-label">Total Portfolio Value</div>
          <div className="balance-amount">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="wallet-balance">
          <div className="balance-label">USD Balance</div>
          <div className="balance-amount" style={{ fontSize: '20px', color: '#c9d1d9' }}>
            ${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="holdings-title">Holdings</div>
        {holdingEntries.length === 0 ? (
          <p className="empty-state">No holdings yet</p>
        ) : (
          holdingEntries.map(([symbol, qty]) => {
            const price = prices[symbol] ? prices[symbol].price : 0;
            const value = qty * price;
            return (
              <div key={symbol} className="holding-row">
                <div>
                  <div className="holding-symbol">{symbol}</div>
                  <div className="holding-qty">{qty.toFixed(6)} units</div>
                </div>
                <div className="holding-value positive">
                  ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Wallet;
