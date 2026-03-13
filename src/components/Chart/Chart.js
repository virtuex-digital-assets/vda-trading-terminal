import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTimeframe } from '../../store/actions';
import { formatPrice } from '../../utils/formatters';
import './Chart.css';

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

// ── Technical indicator helpers ─────────────────────────────────────────────

/** Simple Moving Average */
function calcSMA(closes, period) {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

/** Exponential Moving Average */
function calcEMA(closes, period) {
  const k = 2 / (period + 1);
  const result = Array(closes.length).fill(null);
  let prev = null;
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) continue;
    if (prev === null) {
      prev = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result[period - 1] = prev;
    } else {
      prev = closes[i] * k + prev * (1 - k);
      result[i] = prev;
    }
  }
  return result;
}

/** Bollinger Bands: returns { upper, mid, lower } arrays */
function calcBB(closes, period = 20, stdMult = 2) {
  const mid = calcSMA(closes, period);
  const upper = closes.map((_, i) => {
    if (mid[i] === null) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    const mean  = mid[i];
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    return mean + stdMult * Math.sqrt(variance);
  });
  const lower = closes.map((_, i) => {
    if (mid[i] === null) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    const mean  = mid[i];
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    return mean - stdMult * Math.sqrt(variance);
  });
  return { upper, mid, lower };
}

/** MACD helper – returns { macdLine, signalLine, histogram } */
function calcMACD(closes, fast = 12, slow = 26, signal = 9) {
  const emaFast = calcEMA(closes, fast);
  const emaSlow = calcEMA(closes, slow);
  const macd    = closes.map((_, i) =>
    emaFast[i] !== null && emaSlow[i] !== null ? emaFast[i] - emaSlow[i] : null
  );
  const validMacd = macd.filter((v) => v !== null);
  const signalArr = calcEMA(validMacd, signal);
  let si = 0;
  const signalLine = macd.map((v) => {
    if (v === null) return null;
    return signalArr[si++] ?? null;
  });
  const histogram = macd.map((v, i) =>
    v !== null && signalLine[i] !== null ? v - signalLine[i] : null
  );
  return { macdLine: macd, signalLine, histogram };
}

/** Relative Strength Index */
function calcRSI(closes, period = 14) {
  const result = Array(closes.length).fill(null);
  if (closes.length < period + 1) return result;

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= period;
  avgLoss /= period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result[period] = parseFloat((100 - 100 / (1 + rs)).toFixed(2));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs2 = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result[i] = parseFloat((100 - 100 / (1 + rs2)).toFixed(2));
  }
  return result;
}

const INDICATORS = ['None', 'SMA 20', 'EMA 20', 'BB 20', 'MACD', 'RSI 14'];

const Chart = () => {
  const dispatch = useDispatch();
  const { activeSymbol, timeframe, candles, quotes } = useSelector((s) => s.market);
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);

  const key        = `${activeSymbol}_${timeframe}`;
  const candleData = candles[key] || [];
  const quote      = quotes[activeSymbol] || {};

  // ── Indicator + zoom state ────────────────────────────────────────────────
  const [indicator, setIndicator] = useState('None');
  const [zoom,      setZoom]      = useState(1);       // 1 = no zoom (show 120 candles)
  const [offset,    setOffset]    = useState(0);       // candles scrolled from right

  // drag state stored in refs (not state) to avoid re-render loops
  const dragRef = useRef({ active: false, startX: 0, startOffset: 0 });

  const visibleCount = Math.max(20, Math.round(120 / zoom));

  const getVisible = useCallback(() => {
    const total  = candleData.length;
    const count  = Math.min(visibleCount, total);
    const start  = Math.max(0, total - count - offset);
    return candleData.slice(start, start + count);
  }, [candleData, visibleCount, offset]);

  // ── Zoom via wheel ────────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => Math.min(8, Math.max(0.25, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  }, []);

  // ── Pan via drag ──────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    dragRef.current = { active: true, startX: e.clientX, startOffset: offset };
  }, [offset]);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pixelsPerCandle = canvas.width / visibleCount;
    const candleDelta = Math.round(-dx / pixelsPerCandle);
    const newOffset = Math.max(0,
      Math.min(candleData.length - visibleCount,
        dragRef.current.startOffset + candleDelta));
    setOffset(newOffset);
  }, [visibleCount, candleData.length]);

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  // ── Attach wheel listener (non-passive) ──────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Drawing ───────────────────────────────────────────────────────────────
  useEffect(() => {
    drawChart();
  }, [candleData, activeSymbol, timeframe, indicator, zoom, offset]); // eslint-disable-line

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;

    // Resize canvas to container
    const container = containerRef.current;
    if (container) {
      canvas.width  = container.clientWidth  || 900;
      canvas.height = container.clientHeight || 450;
    }

    const ctx    = canvas.getContext('2d');
    const width  = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 20, bottom: 40, left: 10, right: 70 };
    const chartW  = width  - padding.left - padding.right;
    const chartH  = height - padding.top  - padding.bottom;

    const visible = getVisible();
    if (visible.length === 0) return;

    const prices = visible.flatMap((c) => [c.high, c.low]);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);

    // Expand range slightly for indicator lines
    const priceMargin = (maxPrice - minPrice) * 0.1 || 0.001;
    minPrice -= priceMargin;
    maxPrice += priceMargin;
    const priceRange = maxPrice - minPrice || 1;

    const candleWidth = Math.max(2, chartW / visible.length - 1);
    const toX = (i) => padding.left + i * (chartW / visible.length) + candleWidth / 2;
    const toY = (p) => padding.top  + chartH - ((p - minPrice) / priceRange) * chartH;

    // ── Grid ──────────────────────────────────────────────────────────────
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth   = 0.5;
    for (let g = 0; g <= 5; g++) {
      const y = padding.top + (chartH / 5) * g;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      const price = maxPrice - (priceRange / 5) * g;
      ctx.fillStyle  = '#5566aa';
      ctx.font       = '10px monospace';
      ctx.textAlign  = 'left';
      ctx.fillText(formatPrice(activeSymbol, price), width - padding.right + 4, y + 4);
    }

    // ── Candles ───────────────────────────────────────────────────────────
    visible.forEach((c, i) => {
      const x      = toX(i);
      const openY  = toY(c.open);
      const closeY = toY(c.close);
      const highY  = toY(c.high);
      const lowY   = toY(c.low);
      const isBull = c.close >= c.open;

      ctx.strokeStyle = isBull ? '#26a69a' : '#ef5350';
      ctx.fillStyle   = isBull ? '#26a69a' : '#ef5350';

      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.lineWidth = 1;
      ctx.stroke();

      const bodyTop = Math.min(openY, closeY);
      const bodyH   = Math.max(1, Math.abs(openY - closeY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
    });

    // ── Indicators ────────────────────────────────────────────────────────
    const totalCandles = candleData.length;
    const count        = Math.min(visibleCount, totalCandles);
    const startIdx     = Math.max(0, totalCandles - count - offset);
    const visibleIdx   = Array.from({ length: visible.length }, (_, i) => startIdx + i);

    const closes = candleData.map((c) => c.close);

    const drawLine = (values, color, lineWidth = 1.5) => {
      ctx.strokeStyle = color;
      ctx.lineWidth   = lineWidth;
      ctx.setLineDash([]);
      ctx.beginPath();
      let started = false;
      visibleIdx.forEach((di, vi) => {
        const v = values[di];
        if (v === null || v === undefined) { started = false; return; }
        const x = toX(vi);
        const y = toY(v);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    if (indicator === 'SMA 20') {
      const sma = calcSMA(closes, 20);
      drawLine(sma, '#ffd700');

    } else if (indicator === 'EMA 20') {
      const ema = calcEMA(closes, 20);
      drawLine(ema, '#ff8c00');

    } else if (indicator === 'BB 20') {
      const { upper, mid, lower } = calcBB(closes);
      ctx.setLineDash([3, 3]);
      drawLine(upper, '#7ec8e3');
      drawLine(lower, '#7ec8e3');
      ctx.setLineDash([]);
      drawLine(mid, '#aaa', 1);
      // Shade band area
      ctx.setLineDash([]);
      ctx.strokeStyle = 'transparent';
      ctx.fillStyle   = 'rgba(126,200,227,0.06)';
      ctx.beginPath();
      let startedBand = false;
      visibleIdx.forEach((di, vi) => {
        const u = upper[di];
        if (u === null || u === undefined) { startedBand = false; return; }
        const x = toX(vi);
        if (!startedBand) { ctx.moveTo(x, toY(u)); startedBand = true; }
        else ctx.lineTo(x, toY(u));
      });
      [...visibleIdx].reverse().forEach((di, vi) => {
        const l = lower[di];
        if (l === null || l === undefined) return;
        const x = toX(visibleIdx.length - 1 - vi);
        ctx.lineTo(x, toY(l));
      });
      ctx.closePath();
      ctx.fill();

    } else if (indicator === 'MACD') {
      // Draw MACD in a sub-panel below the candles
      const macdH = Math.round(height * 0.22);
      const macdTop = height - macdH;
      ctx.fillStyle = '#12122a';
      ctx.fillRect(0, macdTop, width, macdH);
      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, macdTop); ctx.lineTo(width, macdTop); ctx.stroke();

      const { macdLine, signalLine, histogram } = calcMACD(closes);
      const macdVals = visibleIdx.map((di) => macdLine[di]).filter((v) => v !== null);
      const macdMin  = Math.min(...macdVals, 0) * 1.2;
      const macdMax  = Math.max(...macdVals, 0) * 1.2 || 0.001;
      const macdRange = macdMax - macdMin || 0.001;
      const toMY = (v) => macdTop + macdH - ((v - macdMin) / macdRange) * macdH;

      // Histogram bars
      visibleIdx.forEach((di, vi) => {
        const h = histogram[di];
        if (h === null || h === undefined) return;
        const x   = toX(vi);
        const y   = toMY(h);
        const zero = toMY(0);
        ctx.fillStyle = h >= 0 ? '#26a69a' : '#ef5350';
        ctx.fillRect(x - candleWidth / 2, Math.min(y, zero), candleWidth, Math.abs(y - zero) || 1);
      });

      // MACD + signal lines
      ctx.strokeStyle = '#4fc3f7';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      let sm = false;
      visibleIdx.forEach((di, vi) => {
        const v = macdLine[di];
        if (v === null || v === undefined) { sm = false; return; }
        if (sm) { ctx.lineTo(toX(vi), toMY(v)); }
        else    { ctx.moveTo(toX(vi), toMY(v)); sm = true; }
      });
      ctx.stroke();

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      let ss = false;
      visibleIdx.forEach((di, vi) => {
        const v = signalLine[di];
        if (v === null || v === undefined) { ss = false; return; }
        if (ss) { ctx.lineTo(toX(vi), toMY(v)); }
        else    { ctx.moveTo(toX(vi), toMY(v)); ss = true; }
      });
      ctx.stroke();
    } else if (indicator === 'RSI 14') {
      // Draw RSI in a sub-panel below the candles
      const rsiH   = Math.round(height * 0.22);
      const rsiTop = height - rsiH;
      ctx.fillStyle = '#12122a';
      ctx.fillRect(0, rsiTop, width, rsiH);
      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, rsiTop); ctx.lineTo(width, rsiTop); ctx.stroke();

      const rsiVals = calcRSI(closes);
      const toRY = (v) => rsiTop + rsiH - (v / 100) * rsiH;

      // Overbought (70), midline (50), oversold (30)
      [70, 50, 30].forEach((level) => {
        ctx.strokeStyle = level === 50 ? '#334466' : '#443322';
        ctx.lineWidth   = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, toRY(level));
        ctx.lineTo(width, toRY(level));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle  = '#7788bb';
        ctx.font       = '8px monospace';
        ctx.textAlign  = 'right';
        ctx.fillText(String(level), width - padding.right - 2, toRY(level) + 3);
      });

      // RSI line
      ctx.strokeStyle = '#ce93d8';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      let sr = false;
      visibleIdx.forEach((di, vi) => {
        const v = rsiVals[di];
        if (v === null || v === undefined) { sr = false; return; }
        if (sr) { ctx.lineTo(toX(vi), toRY(v)); }
        else    { ctx.moveTo(toX(vi), toRY(v)); sr = true; }
      });
      ctx.stroke();

      // Current RSI value label
      const lastRsi = rsiVals[visibleIdx[visibleIdx.length - 1]];
      if (lastRsi !== null && lastRsi !== undefined) {
        ctx.fillStyle  = '#ce93d8';
        ctx.font       = 'bold 9px monospace';
        ctx.textAlign  = 'left';
        ctx.fillText(`RSI: ${lastRsi.toFixed(1)}`, padding.left + 4, rsiTop + 12);
      }
    }

    // ── Current price line ────────────────────────────────────────────────
    if (quote.bid) {
      const priceY = toY(quote.bid);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, priceY);
      ctx.lineTo(width - padding.right, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffd700';
      ctx.fillRect(width - padding.right, priceY - 8, padding.right, 16);
      ctx.fillStyle  = '#1a1a2e';
      ctx.font       = 'bold 10px monospace';
      ctx.textAlign  = 'left';
      ctx.fillText(formatPrice(activeSymbol, quote.bid), width - padding.right + 3, priceY + 4);
    }

    // ── Time axis labels ──────────────────────────────────────────────────
    ctx.fillStyle  = '#5566aa';
    ctx.font       = '9px monospace';
    ctx.textAlign  = 'center';
    const step = Math.max(1, Math.floor(visible.length / 6));
    visible.forEach((c, i) => {
      if (i % step !== 0) return;
      const x   = toX(i);
      const d   = new Date(c.time * 1000);
      const lbl = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(lbl, x, height - padding.bottom + 14);
    });
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

        {/* Indicator selector */}
        <select
          className="indicator-select"
          value={indicator}
          onChange={(e) => setIndicator(e.target.value)}
          title="Technical Indicator"
        >
          {INDICATORS.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>

        {/* Zoom controls */}
        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={() => setZoom((z) => Math.min(8, parseFloat((z * 1.25).toFixed(2))))}
            title="Zoom in"
          >+</button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button
            className="zoom-btn"
            onClick={() => setZoom((z) => Math.max(0.25, parseFloat((z * 0.8).toFixed(2))))}
            title="Zoom out"
          >−</button>
          <button
            className="zoom-btn"
            onClick={() => { setZoom(1); setOffset(0); }}
            title="Reset view"
          >⌂</button>
        </div>
      </div>

      <div
        className="chart-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: 'crosshair' }}
      >
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
};

export default Chart;
