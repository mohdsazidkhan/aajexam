// The app's users are in India, but the server (Vercel) runs in UTC. "Today" for a daily
// challenge must therefore be the current calendar day in Asia/Kolkata, otherwise between
// 00:00 and 05:30 IST the server still thinks it is yesterday and finds no challenge.
//
// The returned window is [Asia/Kolkata midnight, next midnight) as UTC instants. A challenge
// stored at UTC midnight of day D (what the bulk generator writes on the server) and one
// stored at IST midnight of day D (what a script run on an Indian machine writes) both fall
// inside the window of IST day D, and neither day D-1 nor D+1 overlaps it.
export const APP_TIME_ZONE = 'Asia/Kolkata';
const DAY_MS = 24 * 60 * 60 * 1000;

// YYYY-MM-DD of the given instant in Asia/Kolkata.
export function istDateString(now = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);
}

export function istDayRange(now = new Date()) {
    // Asia/Kolkata has no daylight saving, so midnight there is always +05:30.
    const start = new Date(`${istDateString(now)}T00:00:00+05:30`);
    return { start, end: new Date(start.getTime() + DAY_MS) };
}
