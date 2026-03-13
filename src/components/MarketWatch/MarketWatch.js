import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveSymbol } from '../../store/actions';
import { formatPrice } from '../../utils/formatters';
import './MarketWatch.css';

const MarketWatch = () => {
  const dispatch = useDispatch();
  const { symbols, quotes, activeSymbol } = useSelector((s) => s.market);

  return (
    <div className="market-watch">
      <div className="panel-header">Market Watch</div>
      <table className="mw-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Bid</th>
            <th>Ask</th>
            <th>Chg%</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((sym) => {
            const q = quotes[sym] || {};
            const isActive = sym === activeSymbol;
            const chg = q.changePercent || 0;
            return (
              <tr
                key={sym}
                className={`mw-row${isActive ? ' active' : ''}`}
                onClick={() => dispatch(setActiveSymbol(sym))}
              >
                <td className="sym-name">{sym}</td>
                <td className="bid">{formatPrice(sym, q.bid)}</td>
                <td className="ask">{formatPrice(sym, q.ask)}</td>
                <td className={`chg ${chg >= 0 ? 'positive' : 'negative'}`}>
                  {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MarketWatch;
