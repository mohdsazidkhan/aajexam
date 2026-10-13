// Age from a date of birth, as whole years + months + days, worked out against the calendar date
// "today" (the age is never stored, so it cannot go stale).

// 'YYYY-MM-DD' (or an ISO string starting with it) -> { y, m, d }, or null when it is not a real date.
export function parseDobParts(dob) {
  if (typeof dob !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dob);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return { y, m, d };
}

// { years, months, days } between the date of birth and `now`, or null if the date is invalid or in the future.
// Whole months are counted first; the birthday of a month that is too short (31st, 29th Feb) falls on that
// month's last day, so the leftover days are never negative.
export function calcAge(dob, now = new Date()) {
  const parts = parseDobParts(dob);
  if (!parts) return null;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  // The date `monthsLater` months after the date of birth, with the day clamped to that month's length.
  const anniversary = (monthsLater) => {
    const index = parts.m - 1 + monthsLater;
    const year = parts.y + Math.floor(index / 12);
    const month = index % 12;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return Date.UTC(year, month, Math.min(parts.d, lastDay));
  };

  let totalMonths = (now.getFullYear() - parts.y) * 12 + (now.getMonth() + 1 - parts.m);
  if (anniversary(totalMonths) > today) totalMonths -= 1;
  if (totalMonths < 0) return null;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: Math.round((today - anniversary(totalMonths)) / 86400000),
  };
}
