/** Format a price to the correct number of decimal places for the symbol. */
export function formatPrice(symbol, price) {
  if (!price && price !== 0) return '—';
  const decimals = symbol && symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' ? 2 : 5;
  return Number(price).toFixed(decimals);
}

/** Format profit/loss with sign and 2 decimal places. */
export function formatProfit(value) {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}`;
}

/** Format a Unix timestamp (seconds) as HH:MM. */
export function formatBarTime(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format ISO datetime as a short string. */
export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
