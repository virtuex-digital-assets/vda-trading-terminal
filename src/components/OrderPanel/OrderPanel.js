import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { placeOrder, addLog } from '../../store/actions';
import backendBridge from '../../services/backendBridge';
import { formatPrice } from '../../utils/formatters';
import { calculateMargin } from '../../utils/constants';
import backendBridge from '../../services/backendBridge';
import './OrderPanel.css';

const ORDER_TYPES = ['BUY', 'SELL', 'BUY LIMIT', 'SELL LIMIT', 'BUY STOP', 'SELL STOP'];

const LOT_SIZES = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0];

const OrderPanel = () => {
  const dispatch = useDispatch();
  const { activeSymbol, quotes } = useSelector((s) => s.market);
  const { balance, freeMargin, leverage } = useSelector((s) => s.account);

  const [orderType, setOrderType] = useState('BUY');
  const [lots, setLots] = useState(0.1);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const quote = quotes[activeSymbol] || {};
  const isMarket = orderType === 'BUY' || orderType === 'SELL';
  const isBuy = orderType.startsWith('BUY');

  const openPrice = isMarket
    ? (isBuy ? quote.ask : quote.bid)
    : parseFloat(price) || 0;

  const requiredMargin = openPrice
    ? calculateMargin(activeSymbol, parseFloat(lots), openPrice, leverage)
    : 0;

  const canTrade = freeMargin >= requiredMargin && openPrice > 0 && lots > 0;
  const btnDisabled = !canTrade || submitting;
  const btnClass = (side) => `op-btn ${side}${btnDisabled ? ' disabled' : ''}`;

  const submitOrder = async (type) => {
    const isBuyType = type.startsWith('BUY');
    const execPrice = isMarket
      ? (isBuyType ? quote.ask : quote.bid)
      : parseFloat(price) || 0;

    if (!execPrice || lots <= 0) {
      dispatch(addLog('error', `Cannot place order: invalid price or lot size`));
      return;
    }

    const margin = calculateMargin(activeSymbol, parseFloat(lots), execPrice, leverage);
    if (freeMargin < margin) {
      dispatch(addLog('error', `Insufficient margin to place ${type} ${lots} ${activeSymbol}`));
      return;
    }

    const order = {
      symbol: activeSymbol,
      type,
      lots: parseFloat(lots),
      openPrice: parseFloat(execPrice.toFixed(5)),
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null,
      comment,
    };

    if (backendBridge.isConfigured()) {
      setSubmitting(true);
      try {
        const confirmed = await backendBridge.placeOrder(order);
        // Dispatch with the backend-assigned ticket so Redux state matches.
        dispatch(placeOrder(confirmed));
        dispatch(addLog('info', `Order placed: ${type} ${lots} ${activeSymbol} @ ${formatPrice(activeSymbol, execPrice)}`));
        setPrice('');
        setComment('');
      } catch (err) {
        dispatch(addLog('error', `Order rejected: ${err.message}`));
    setSubmitError('');
    setSubmitting(true);

    if (backendBridge.isConfigured()) {
      // ── Live backend mode ───────────────────────────────────────────────
      try {
        const placed = await backendBridge.placeOrder(order);
        // Dispatch with server-assigned ticket so UI reflects backend state
        dispatch(placeOrder(placed));
        dispatch(
          addLog(
            'info',
            `Order placed: ${placed.type} ${placed.lots} ${placed.symbol} @ ${formatPrice(placed.symbol, placed.openPrice)} #${placed.ticket}`
          )
        );
        setPrice('');
        setComment('');
      } catch (err) {
        const msg = `Order rejected: ${err.message}`;
        setSubmitError(msg);
        dispatch(addLog('error', msg));
      } finally {
        setSubmitting(false);
      }
    } else {
      // Simulator / offline mode – dispatch directly to Redux.
      dispatch(placeOrder(order));
      dispatch(addLog('info', `Order placed: ${type} ${lots} ${activeSymbol} @ ${formatPrice(activeSymbol, execPrice)}`));
      setPrice('');
      setComment('');
    }
      // ── Demo / simulator mode ────────────────────────────────────────────
    if (backendBridge.isConfigured()) {
      // Live backend: REST API creates the order and assigns a server ticket.
      backendBridge.placeOrder(order);
    } else {
      dispatch(placeOrder(order));
      // Note: account margin is recalculated automatically on each simulator tick
      try {
        await backendBridge.placeOrder(order);
      } catch (err) {
        dispatch(addLog('error', `Order failed: ${err.message}`));
        return;
      }
    } else {
      dispatch(placeOrder(order));
      dispatch(
        addLog(
          'info',
          `Order placed: ${type} ${lots} ${activeSymbol} @ ${formatPrice(activeSymbol, execPrice)}`
        )
      );
      setPrice('');
      setComment('');
      setSubmitting(false);
    }
    }
    setPrice('');
    setComment('');
  };

  return (
    <div className="order-panel">
      <div className="panel-header">New Order</div>
      <div className="op-body">
        <div className="op-row">
          <label>Symbol</label>
          <span className="op-value sym">{activeSymbol}</span>
        </div>
        <div className="op-row">
          <label>Bid / Ask</label>
          <span className="op-value">
            <span className="bid">{formatPrice(activeSymbol, quote.bid)}</span>
            {' / '}
            <span className="ask">{formatPrice(activeSymbol, quote.ask)}</span>
          </span>
        </div>

        <div className="op-divider" />

        <div className="op-row">
          <label>Order Type</label>
          <select
            className="op-select"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            {ORDER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="op-row">
          <label>Lot Size</label>
          <input
            className="op-input"
            type="number"
            min={0.01}
            step={0.01}
            value={lots}
            onChange={(e) => setLots(e.target.value)}
          />
        </div>

        <div className="op-quick-lots">
          {LOT_SIZES.map((l) => (
            <button key={l} className="lot-btn" onClick={() => setLots(l)}>
              {l}
            </button>
          ))}
        </div>

        {!isMarket && (
          <div className="op-row">
            <label>Price</label>
            <input
              className="op-input"
              type="number"
              step="0.00001"
              placeholder={formatPrice(activeSymbol, isBuy ? quote.ask : quote.bid)}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        )}

        <div className="op-row">
          <label>Stop Loss</label>
          <input
            className="op-input"
            type="number"
            step="0.00001"
            placeholder="0"
            value={sl}
            onChange={(e) => setSl(e.target.value)}
          />
        </div>

        <div className="op-row">
          <label>Take Profit</label>
          <input
            className="op-input"
            type="number"
            step="0.00001"
            placeholder="0"
            value={tp}
            onChange={(e) => setTp(e.target.value)}
          />
        </div>

        <div className="op-row">
          <label>Comment</label>
          <input
            className="op-input"
            type="text"
            maxLength={32}
            placeholder="optional"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="op-divider" />

        <div className="op-row">
          <label>Req. Margin</label>
          <span className="op-value">${requiredMargin.toFixed(2)}</span>
        </div>
        <div className="op-row">
          <label>Open Price</label>
          <span className="op-value">{formatPrice(activeSymbol, openPrice) || '—'}</span>
        </div>

        <div className="op-actions">
          <button
            className={btnClass('buy')}
            onClick={() => submitOrder(isMarket ? 'BUY' : orderType)}
            disabled={btnDisabled}
            className={`op-btn buy${(!canTrade || submitting) ? ' disabled' : ''}`}
            onClick={() => submitOrder(isMarket ? 'BUY' : orderType)}
            disabled={!canTrade || submitting}
          >
            {submitting ? '…' : '▲ BUY'}
          </button>
          <button
            className={btnClass('sell')}
            onClick={() => submitOrder(isMarket ? 'SELL' : orderType)}
            disabled={btnDisabled}
            className={`op-btn sell${(!canTrade || submitting) ? ' disabled' : ''}`}
            onClick={() => submitOrder(isMarket ? 'SELL' : orderType)}
            disabled={!canTrade || submitting}
          >
            {submitting ? '…' : '▼ SELL'}
          </button>
        </div>
        {submitting && <div className="op-warn">Sending order…</div>}
        {!canTrade && !submitting && openPrice > 0 && (
          <div className="op-warn">Insufficient margin</div>
        )}
        {submitError && (
          <div className="op-warn">{submitError}</div>
        )}
      </div>
    </div>
  );
};

export default OrderPanel;
