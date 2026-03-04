import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTimeframe } from '../../store/actions';
import { formatPrice } from '../../utils/formatters';
import './Chart.css';

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

const Chart = () => {
  const dispatch = useDispatch();
  const { activeSymbol, timeframe, candles, quotes } = useSelector((s) => s.market);
  const canvasRef = useRef(null);

  const key = `${activeSymbol}_${timeframe}`;
  const candleData = candles[key] || [];
  const quote = quotes[activeSymbol] || {};

  useEffect(() => {
    drawChart();
  }, [candleData, activeSymbol, timeframe]); // eslint-disable-line

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 20, bottom: 40, left: 10, right: 70 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const visible = candleData.slice(-120);
    const prices = visible.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const candleWidth = Math.max(2, chartW / visible.length - 1);

    const toX = (i) => padding.left + i * (chartW / visible.length) + candleWidth / 2;
    const toY = (p) => padding.top + chartH - ((p - minPrice) / priceRange) * chartH;

    // Grid lines
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 0.5;
    for (let g = 0; g <= 5; g++) {
      const y = padding.top + (chartH / 5) * g;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      const price = maxPrice - (priceRange / 5) * g;
      ctx.fillStyle = '#5566aa';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatPrice(activeSymbol, price), width - padding.right + 4, y + 4);
    }

    // Candles
    visible.forEach((c, i) => {
      const x = toX(i);
      const openY = toY(c.open);
      const closeY = toY(c.close);
      const highY = toY(c.high);
      const lowY = toY(c.low);
      const isBull = c.close >= c.open;

      ctx.strokeStyle = isBull ? '#26a69a' : '#ef5350';
      ctx.fillStyle = isBull ? '#26a69a' : '#ef5350';

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1, Math.abs(openY - closeY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
    });

    // Current price line
    if (quote.bid) {
      const priceY = toY(quote.bid);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, priceY);
      ctx.lineTo(width - padding.right, priceY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Label
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(width - padding.right, priceY - 8, padding.right, 16);
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatPrice(activeSymbol, quote.bid), width - padding.right + 3, priceY + 4);
    }
  };

  return (
    <div className="chart-panel">
      <div className="chart-toolbar">
        <span className="chart-symbol">{activeSymbol}</span>
        <span className="chart-price bid">{formatPrice(activeSymbol, quote.bid)}</span>
        <span className="separator">/</span>
        <span className="chart-price ask">{formatPrice(activeSymbol, quote.ask)}</span>
        <div className="tf-buttons">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              className={`tf-btn${timeframe === tf ? ' active' : ''}`}
              onClick={() => dispatch(setTimeframe(tf))}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={canvasRef} width={900} height={450} className="chart-canvas" />
      </div>
    </div>
  );
};

export default Chart;
