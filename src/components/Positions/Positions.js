import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeOrder, modifyOrder, cancelPendingOrder, addLog, updateAccount, addHistoryOrder } from '../../store/actions';
import backendBridge from '../../services/backendBridge';
import { formatPrice, formatProfit, formatDateTime } from '../../utils/formatters';
import './Positions.css';

const TABS = ['Positions', 'Orders', 'History'];

// ── Modify Order Modal ─────────────────────────────────────────────────────
const ModifyModal = ({ order, onClose, onSave }) => {
  const { activeSymbol, quotes } = useSelector((s) => s.market);
  const q = quotes[order.symbol] || {};
  const [sl, setSl] = useState(order.sl ? String(order.sl) : '');
  const [tp, setTp] = useState(order.tp ? String(order.tp) : '');

  const handleSave = () => {
    onSave(order.ticket, sl ? parseFloat(sl) : null, tp ? parseFloat(tp) : null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          Modify Order #{order.ticket}
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-row">
            <span className="modal-label">Symbol</span>
            <span className="modal-value sym">{order.symbol}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Type / Lots</span>
            <span className="modal-value">{order.type} {order.lots}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Open Price</span>
            <span className="modal-value">{formatPrice(order.symbol, order.openPrice)}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Current Bid/Ask</span>
            <span className="modal-value">
              <span className="bid">{formatPrice(order.symbol, q.bid)}</span>
              {' / '}
              <span className="ask">{formatPrice(order.symbol, q.ask)}</span>
            </span>
          </div>
          <div className="modal-divider" />
          <div className="modal-row">
            <label className="modal-label" htmlFor="mod-sl">Stop Loss</label>
            <input
              id="mod-sl"
              className="modal-input"
              type="number"
              step="0.00001"
              placeholder="0 = no SL"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
            />
          </div>
          <div className="modal-row">
            <label className="modal-label" htmlFor="mod-tp">Take Profit</label>
            <input
              id="mod-tp"
              className="modal-input"
              type="number"
              step="0.00001"
              placeholder="0 = no TP"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn save" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const Positions = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('Positions');
  const [modifyTarget, setModifyTarget] = useState(null);
  const [closingTicket, setClosingTicket] = useState(null);
  const [closeError, setCloseError] = useState('');
  const [modifyError, setModifyError] = useState('');
  const { openOrders, pendingOrders, history } = useSelector((s) => s.orders);
  const { quotes } = useSelector((s) => s.market);
  const { balance } = useSelector((s) => s.account);

  const handleClose = async (ticket, symbol, type, lots, openPrice) => {
    const q = quotes[symbol] || {};
    const closePrice = type === 'BUY' ? q.bid : q.ask;
    const order = openOrders.find((o) => o.ticket === ticket);
    const profit = order?.profit ?? 0;

    setCloseError('');
    setClosingTicket(ticket);

    if (backendBridge.isConfigured()) {
      try {
        const closed = await backendBridge.closeOrder(ticket);
        dispatch(closeOrder(ticket));
        if (closed.balance != null) {
          dispatch(updateAccount({ balance: closed.balance }));
        } else {
          dispatch(updateAccount({ balance: parseFloat((balance + profit).toFixed(2)) }));
        }
        dispatch(
          addLog('info', `Closed #${ticket} ${type} ${lots} ${symbol} @ ${formatPrice(symbol, closePrice)}, P&L: ${formatProfit(closed.profit || profit)}`)
        );
      } catch (err) {
        const msg = `Failed to close #${ticket}: ${err.message}`;
        setCloseError(msg);
        dispatch(addLog('error', msg));
      } finally {
        setClosingTicket(null);
      }
    } else {
      const newBalance = parseFloat((balance + profit).toFixed(2));
      dispatch(closeOrder(ticket));
      dispatch(updateAccount({ balance: newBalance }));
      dispatch(
        addLog('info', `Closed #${ticket} ${type} ${lots} ${symbol} @ ${formatPrice(symbol, closePrice)}, P&L: ${formatProfit(profit)}`)
      );
      setClosingTicket(null);
    }
  };

  const handleCancelPending = async (ticket) => {
    if (backendBridge.isConfigured()) {
      try {
        await backendBridge.closeOrder(ticket);
        dispatch(cancelPendingOrder(ticket));
        dispatch(addLog('info', `Cancelled pending order #${ticket}`));
      } catch (err) {
        dispatch(addLog('error', `Failed to cancel #${ticket}: ${err.message}`));
      }
      return;
    }
    dispatch(cancelPendingOrder(ticket));
    dispatch(addLog('info', `Cancelled pending order #${ticket}`));
  };

  const handleModifySave = async (ticket, sl, tp) => {
    setModifyError('');

    if (backendBridge.isConfigured()) {
      try {
        await backendBridge.modifyOrder(ticket, sl, tp);
        dispatch(modifyOrder(ticket, sl, tp));
        dispatch(addLog('info', `Modified #${ticket}: SL=${sl || '—'}, TP=${tp || '—'}`));
        return true;
      } catch (err) {
        const msg = `Failed to modify #${ticket}: ${err.message}`;
        setModifyError(msg);
        dispatch(addLog('error', msg));
        return false;
      }
    } else {
      dispatch(modifyOrder(ticket, sl, tp));
      dispatch(addLog('info', `Modified #${ticket}: SL=${sl || '—'}, TP=${tp || '—'}`));
      return true;
    }
  };

  const totalProfit = openOrders.reduce((sum, o) => sum + (o.profit || 0), 0);

  return (
    <div className="positions-panel">
      {modifyTarget && (
        <ModifyModal
          order={modifyTarget}
          onClose={() => { setModifyTarget(null); setModifyError(''); }}
          onSave={async (ticket, sl, tp) => {
            const ok = await handleModifySave(ticket, sl, tp);
            if (ok) setModifyTarget(null);
          }}
        />
      )}
      {closeError && <div className="pos-error">{closeError}</div>}
      {modifyError && <div className="pos-error">{modifyError}</div>}
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
                <th colSpan={2}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {openOrders.length === 0 ? (
                <tr><td colSpan={10} className="empty">No open positions</td></tr>
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
                        className="modify-btn"
                        title="Modify SL/TP"
                        disabled={closingTicket === o.ticket}
                        onClick={() => { setModifyError(''); setModifyTarget(o); }}
                      >
                        ✎
                      </button>
                    </td>
                    <td>
                      <button
                        className="close-btn"
                        title="Close position"
                        disabled={closingTicket === o.ticket}
                        onClick={() => handleClose(o.ticket, o.symbol, o.type, o.lots, o.openPrice)}
                      >
                        {closingTicket === o.ticket ? '…' : '✕'}
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.length === 0 ? (
                <tr><td colSpan={9} className="empty">No pending orders</td></tr>
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
                    <td>
                      <button
                        className="close-btn"
                        title="Cancel pending order"
                        onClick={() => handleCancelPending(o.ticket)}
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
