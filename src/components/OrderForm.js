import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../store/actions';
import { SUPPORTED_SYMBOLS } from '../services/marketService';

const OrderForm = () => {
  const dispatch = useDispatch();
  const prices  = useSelector((state) => state.market.prices);
  const wallet  = useSelector((state) => state.wallet);

  const [symbol,   setSymbol]   = useState(SUPPORTED_SYMBOLS[0]);
  const [side,     setSide]     = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [message,  setMessage]  = useState(null);

  const currentPrice = prices[symbol] ? prices[symbol].price : null;
  const total        = currentPrice && quantity ? currentPrice * parseFloat(quantity) : 0;

  const validate = () => {
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      return 'Please enter a valid quantity.';
    }
    if (!currentPrice) {
      return 'Price data not available yet. Please wait.';
    }
    const qty = parseFloat(quantity);
    if (side === 'BUY' && total > wallet.usdBalance) {
      return `Insufficient USD balance. You need $${total.toFixed(2)} but have $${wallet.usdBalance.toFixed(2)}.`;
    }
    if (side === 'SELL' && (wallet.holdings[symbol] || 0) < qty) {
      return `Insufficient ${symbol} balance.`;
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }
    const qty = parseFloat(quantity);
    dispatch(placeOrder({ symbol, side, quantity: qty, price: currentPrice }));
    setMessage({ type: 'success', text: `${side} order placed: ${qty} ${symbol} @ $${currentPrice.toLocaleString()}` });
    setQuantity('');
  };

  return (
    <div className="card order-form">
      <div className="card-header">Place Order</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="side-toggle">
            <button
              type="button"
              className={side === 'BUY' ? 'active-buy' : ''}
              onClick={() => { setSide('BUY'); setMessage(null); }}
            >
              Buy
            </button>
            <button
              type="button"
              className={side === 'SELL' ? 'active-sell' : ''}
              onClick={() => { setSide('SELL'); setMessage(null); }}
            >
              Sell
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="symbol">Asset</label>
            <select id="symbol" value={symbol} onChange={(e) => { setSymbol(e.target.value); setMessage(null); }}>
              {SUPPORTED_SYMBOLS.map((s) => (
                <option key={s} value={s}>{s}/USD</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setMessage(null); }}
            />
          </div>

          <div className="order-total">
            <span>Estimated Total</span>
            <span>
              {currentPrice
                ? `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '—'}
            </span>
          </div>

          <button
            type="submit"
            className={`btn-submit ${side === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
            disabled={!currentPrice}
          >
            {side === 'BUY' ? `Buy ${symbol}` : `Sell ${symbol}`}
          </button>

          {message && (
            <p className={`order-message ${message.type === 'error' ? 'negative' : 'positive'}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
