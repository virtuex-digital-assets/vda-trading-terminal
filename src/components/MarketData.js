import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrices } from '../services/marketService';
import { updatePrices, setMarketError, setMarketLoading } from '../store/actions';

const REFRESH_INTERVAL_MS = 30000;

const MarketData = () => {
  const dispatch = useDispatch();
  const { prices, loading, error } = useSelector((state) => state.market);

  const loadPrices = async () => {
    dispatch(setMarketLoading(true));
    try {
      const data = await fetchPrices();
      dispatch(updatePrices(data));
    } catch (err) {
      dispatch(setMarketError('Failed to load market data. Retrying…'));
    }
  };

  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [dispatch]); // eslint-disable-line

  const symbols = Object.keys(prices);

  return (
    <div className="card market-data">
      <div className="card-header">Live Market Prices</div>
      <div className="card-body">
        {loading && symbols.length === 0 && (
          <p className="ticker-loading">Loading market data…</p>
        )}
        {error && symbols.length === 0 && (
          <p className="ticker-error">{error}</p>
        )}
        <div className="ticker-grid">
          {symbols.map((symbol) => {
            const { price, change24h } = prices[symbol];
            const positive = change24h >= 0;
            return (
              <div key={symbol} className="ticker-item">
                <div className="ticker-symbol">{symbol}/USD</div>
                <div className={`ticker-price ${positive ? 'positive' : 'negative'}`}>
                  ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`ticker-change ${positive ? 'positive' : 'negative'}`}>
                  {positive ? '▲' : '▼'} {Math.abs(change24h).toFixed(2)}% (24h)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketData;
