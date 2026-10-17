// Shared rules for the monthly current-affairs digest pages.
// Individual daily items are 1-2 sentences (thin), so they are noindex; a whole
// month on one page is the indexable unit. A month only counts as indexable
// once it has enough items to be a real compilation.
export const DIGEST_MIN_ITEMS = 30;

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// "2026-10" -> { year, month, start, end } (UTC bounds, end exclusive), or null.
export function parseDigestMonth(segment) {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(String(segment || ''));
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (year < 2020 || year > 2100) return null;
  return {
    year,
    month,
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export const digestKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;
