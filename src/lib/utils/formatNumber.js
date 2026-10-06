// Scores are sums of fractional marks, so floats carry noise (5.699999999999999).
// Show at most 2 decimals; whole numbers stay whole.
export function fmtNum(n) {
  const v = Number(n);
  if (n === null || n === undefined || n === '' || !Number.isFinite(v)) return n;
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}
