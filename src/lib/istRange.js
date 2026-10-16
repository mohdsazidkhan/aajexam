const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Returns a createdAt range ({ $gte, $lt? }) aligned to IST day boundaries, or null for all-time.
// "Last N days/months/years" includes today, so Last 7 Days = today + the previous 6 IST days.
export function getISTRange(period) {
    // Shift so UTC getters read as IST wall-clock, then shift back when building Dates.
    const ist = new Date(Date.now() + IST_OFFSET_MS);
    const y = ist.getUTCFullYear();
    const m = ist.getUTCMonth();
    const d = ist.getUTCDate();
    const istMidnight = (yy, mm, dd) => new Date(Date.UTC(yy, mm, dd) - IST_OFFSET_MS);

    switch (period) {
        case 'today':
            return { $gte: istMidnight(y, m, d) };
        case 'yesterday':
            return { $gte: istMidnight(y, m, d - 1), $lt: istMidnight(y, m, d) };
        case 'weekly':
        case '7d':
            return { $gte: istMidnight(y, m, d - 6) };
        case 'monthly':
        case '30d':
            return { $gte: istMidnight(y, m, d - 29) };
        case '3m':
            return { $gte: istMidnight(y, m - 3, d + 1) };
        case '6m':
            return { $gte: istMidnight(y, m - 6, d + 1) };
        case '1y':
            return { $gte: istMidnight(y - 1, m, d + 1) };
        case '5y':
            return { $gte: istMidnight(y - 5, m, d + 1) };
        default:
            return null;
    }
}
