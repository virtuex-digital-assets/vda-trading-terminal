import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { placeOrder, updateAccount, addLog } from '../../store/actions';
import { formatPrice } from '../../utils/formatters';
import './OrderPanel.css';

const ORDER_TYPES = ['BUY', 'SELL', 'BUY LIMIT', 'SELL LIMIT', 'BUY STOP', 'SELL STOP'];

const LOT_SIZES = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0];

const OrderPanel = () => {
  const dispatch = useDispatch();
  const { activeSymbol, quotes } = useSelector((s) => s.market);
  const { balance, leverage } = useSelector((s) => s.account);

  const [orderType, setOrderType] = useState('BUY');
  const [lots, setLots] = useState(0.1);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');

  const quote = quotes[activeSymbol] || {};
  const isMarket = orderType === 'BUY' || orderType === 'SELL';
  const isBuy = orderType.startsWith('BUY');

  const openPrice = isMarket
    ? (isBuy ? quote.ask : quote.bid)
    : parseFloat(price) || 0;

  const requiredMargin = openPrice
    ? parseFloat(((openPrice * lots * 100000) / leverage).toFixed(2))
    : 0;

  const canTrade = balance >= requiredMargin && openPrice > 0 && lots > 0;

  const submitOrder = (type) => {
    const isBuyType = type.startsWith('BUY');
    const execPrice = isMarket
      ? (isBuyType ? quote.ask : quote.bid)
      : parseFloat(price) || 0;

    if (!execPrice || lots <= 0) {
      dispatch(addLog('error', `Cannot place order: invalid price or lot size`));
      return;
    }

    const margin = parseFloat(((execPrice * lots * 100000) / leverage).toFixed(2));
    if (balance < margin) {
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

    dispatch(placeOrder(order));
    dispatch(updateAccount({ margin: parseFloat(margin.toFixed(2)) }));
    dispatch(
      addLog(
        'info',
        `Order placed: ${type} ${lots} ${activeSymbol} @ ${formatPrice(activeSymbol, execPrice)}`
      )
    );
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
            className={`op-btn buy${!canTrade ? ' disabled' : ''}`}
            onClick={() => submitOrder(isMarket ? 'BUY' : orderType)}
            disabled={!canTrade}
          >
            ▲ BUY
          </button>
          <button
            className={`op-btn sell${!canTrade ? ' disabled' : ''}`}
            onClick={() => submitOrder(isMarket ? 'SELL' : orderType)}
            disabled={!canTrade}
          >
            ▼ SELL
          </button>
        </div>
        {!canTrade && openPrice > 0 && (
          <div className="op-warn">Insufficient margin</div>
        )}
      </div>
    </div>
  );
};

export default OrderPanel;
