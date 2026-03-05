import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeOrder, addLog, updateAccount } from '../../store/actions';
import { formatPrice, formatProfit, formatDateTime } from '../../utils/formatters';
import './Positions.css';

const TABS = ['Positions', 'Orders', 'History'];

const Positions = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('Positions');
  const { openOrders, pendingOrders, history } = useSelector((s) => s.orders);
  const { quotes } = useSelector((s) => s.market);
  const { balance } = useSelector((s) => s.account);

  const handleClose = (ticket, symbol, type, lots, openPrice) => {
    const q = quotes[symbol] || {};
    const closePrice = type === 'BUY' ? q.bid : q.ask;
    const order = openOrders.find((o) => o.ticket === ticket);
    const profit = order ? order.profit : 0;
    const newBalance = parseFloat((balance + profit).toFixed(2));
    dispatch(closeOrder(ticket));
    dispatch(updateAccount({ balance: newBalance }));
    dispatch(
      addLog('info', `Closed #${ticket} ${type} ${lots} ${symbol} @ ${formatPrice(symbol, closePrice)}, P&L: ${formatProfit(profit)}`)
    );
  };

  const totalProfit = openOrders.reduce((sum, o) => sum + (o.profit || 0), 0);

  return (
    <div className="positions-panel">
      <div className="pos-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`pos-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Positions' && openOrders.length > 0 && (
              <span className="badge">{openOrders.length}</span>
            )}
          </button>
        ))}
        <div className="pos-total">
          Float P&L:{' '}
          <span className={totalProfit >= 0 ? 'positive' : 'negative'}>
            {formatProfit(totalProfit)}
          </span>
        </div>
      </div>

      <div className="pos-table-wrap">
        {tab === 'Positions' && (
          <table className="pos-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Open Price</th>
                <th>SL</th>
                <th>TP</th>
                <th>Profit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {openOrders.length === 0 ? (
                <tr><td colSpan={9} className="empty">No open positions</td></tr>
              ) : (
                openOrders.map((o) => (
                  <tr key={o.ticket}>
                    <td>{o.ticket}</td>
                    <td className="sym">{o.symbol}</td>
                    <td className={o.type === 'BUY' ? 'buy-type' : 'sell-type'}>{o.type}</td>
                    <td>{o.lots}</td>
                    <td>{formatPrice(o.symbol, o.openPrice)}</td>
                    <td className="sl">{o.sl ? formatPrice(o.symbol, o.sl) : '—'}</td>
                    <td className="tp">{o.tp ? formatPrice(o.symbol, o.tp) : '—'}</td>
                    <td className={o.profit >= 0 ? 'positive' : 'negative'}>
                      {formatProfit(o.profit)}
                    </td>
                    <td>
                      <button
                        className="close-btn"
                        onClick={() => handleClose(o.ticket, o.symbol, o.type, o.lots, o.openPrice)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'Orders' && (
          <table className="pos-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Price</th>
                <th>SL</th>
                <th>TP</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.length === 0 ? (
                <tr><td colSpan={8} className="empty">No pending orders</td></tr>
              ) : (
                pendingOrders.map((o) => (
                  <tr key={o.ticket}>
                    <td>{o.ticket}</td>
                    <td className="sym">{o.symbol}</td>
                    <td>{o.type}</td>
                    <td>{o.lots}</td>
                    <td>{formatPrice(o.symbol, o.openPrice)}</td>
                    <td>{o.sl ? formatPrice(o.symbol, o.sl) : '—'}</td>
                    <td>{o.tp ? formatPrice(o.symbol, o.tp) : '—'}</td>
                    <td>{formatDateTime(o.openTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'History' && (
          <table className="pos-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Open Price</th>
                <th>Close Time</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={7} className="empty">No history</td></tr>
              ) : (
                history.map((o) => (
                  <tr key={`${o.ticket}-${o.closeTime}`}>
                    <td>{o.ticket}</td>
                    <td className="sym">{o.symbol}</td>
                    <td className={o.type === 'BUY' ? 'buy-type' : 'sell-type'}>{o.type}</td>
                    <td>{o.lots}</td>
                    <td>{formatPrice(o.symbol, o.openPrice)}</td>
                    <td>{formatDateTime(o.closeTime)}</td>
                    <td className={o.profit >= 0 ? 'positive' : 'negative'}>
                      {formatProfit(o.profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Positions;
