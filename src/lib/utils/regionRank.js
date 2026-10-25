import User from '@/models/User';
import UserTestAttempt from '@/models/UserTestAttempt';
import UserStreak from '@/models/UserStreak';

// State / City rank: the All India Rank ordering (total exam time, then exams, accuracy, score)
// restricted to the active students of one state or one city. `state` and `city` are free-text on
// the User, so they are matched case-insensitively. For states every Delhi spelling ("Delhi (NCT)")
// counts as one; cities are NOT merged, so "Delhi", "South Delhi" and "New Delhi" rank separately.

const FIELDS = ['state', 'city'];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const placeKey = (value, field) => {
    const s = String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return field === 'state' && /\bdelhi\b/.test(s) ? 'delhi' : s;
};

const placeRegex = (key, field) => (field === 'state' && key === 'delhi'
    ? /\bdelhi\b/i
    : new RegExp(`^\\s*${key.split(' ').map(escapeRe).join('\\s+')}\\s*$`, 'i'));

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Every place that has at least one active student, biggest first (admin dropdown).
export async function listPlaces(field) {
    if (!FIELDS.includes(field)) return [];
    const rows = await User.find({ status: 'active', role: { $ne: 'admin' }, [field]: { $type: 'string', $ne: '' } })
        .select(field)
        .lean();
    const map = new Map();
    for (const r of rows) {
        const key = placeKey(r[field], field);
        if (!key) continue;
        const cur = map.get(key) || { value: key, count: 0, spellings: new Map() };
        cur.count += 1;
        const raw = String(r[field]).trim();
        cur.spellings.set(raw, (cur.spellings.get(raw) || 0) + 1);
        map.set(key, cur);
    }
    return [...map.values()]
        .map((p) => ({
            value: p.value,
            count: p.count,
            label: p.value === 'delhi' ? 'Delhi' : [...p.spellings.entries()].sort((a, b) => b[1] - a[1])[0][0],
        }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

// Ranked students of one place. Returns { place, totalUsers, data } where data is the top `limit`
// (rank is the real position) and `me` is the caller's row even when they are outside the top.
export async function rankPlace({ field, value, limit = 10, userId = null }) {
    const key = placeKey(value, field);
    if (!FIELDS.includes(field) || !key) return { place: '', totalUsers: 0, data: [], me: null };

    const users = await User.find({ status: 'active', role: { $ne: 'admin' }, [field]: placeRegex(key, field) })
        .select('name username profilePicture city state subscriptionStatus')
        .lean();
    if (!users.length) return { place: key === 'delhi' ? 'Delhi' : titleCase(key), totalUsers: 0, data: [], me: null };

    const byId = new Map(users.map((u) => [String(u._id), u]));
    const rows = await UserTestAttempt.aggregate([
        { $match: { status: 'Completed', user: { $in: users.map((u) => u._id) } } },
        { $lookup: { from: 'practicetests', localField: 'practiceTest', foreignField: '_id', as: 'pt' } },
        { $unwind: { path: '$pt', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$user',
                totalExams: { $sum: 1 },
                avgAccuracy: { $avg: '$accuracy' },
                totalScore: { $sum: '$score' },
                totalMarks: { $sum: { $ifNull: ['$pt.totalMarks', 0] } },
                totalCorrect: { $sum: '$correctCount' },
                totalTimeSpent: { $sum: '$totalTime' },
            },
        },
        { $sort: { totalTimeSpent: -1, totalExams: -1, avgAccuracy: -1, totalScore: -1, _id: 1 } },
    ]);

    const streaks = await UserStreak.find({ user: { $in: rows.map((r) => r._id) } }).select('user currentStreak').lean();
    const streakOf = new Map(streaks.map((s) => [String(s.user), s.currentStreak || 0]));

    const ranked = rows.map((r, idx) => {
        const u = byId.get(String(r._id)) || {};
        const acc = Math.round((r.avgAccuracy || 0) * 10) / 10;
        return {
            rank: idx + 1,
            userId: r._id,
            name: u.name,
            username: u.username,
            profilePicture: u.profilePicture,
            city: u.city,
            state: u.state,
            subscriptionStatus: u.subscriptionStatus,
            totalExams: r.totalExams,
            avgAccuracy: acc,
            avgPercentage: acc,
            totalScore: Math.round((r.totalScore || 0) * 10) / 10,
            totalMarks: r.totalMarks || 0,
            totalCorrect: r.totalCorrect || 0,
            totalTimeSpent: r.totalTimeSpent || 0,
            currentStreak: streakOf.get(String(r._id)) || 0,
        };
    });

    // Display name: Delhi is merged; otherwise the most common spelling among these students.
    const place = key === 'delhi' ? 'Delhi' : (() => {
        const counts = new Map();
        for (const u of users) { const raw = String(u[field]).trim(); counts.set(raw, (counts.get(raw) || 0) + 1); }
        return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    })();

    const meId = userId ? String(userId) : null;
    return {
        place,
        totalUsers: ranked.length,
        data: ranked.slice(0, limit),
        me: meId ? ranked.find((r) => String(r.userId) === meId) || null : null,
    };
}

// The caller's own position in their state and in their city (same ordering as the region pages).
// Each entry is { place, rank, total }; rank is null when they have no completed exam yet, and the
// entry is null when the state / city is not set.
export async function regionRanksFor(user) {
    const out = { stateRank: null, cityRank: null };
    await Promise.all([['state', 'stateRank'], ['city', 'cityRank']].map(async ([field, key]) => {
        const value = String(user?.[field] || '').trim();
        if (!value) return;
        const r = await rankPlace({ field, value, limit: 1, userId: user._id });
        out[key] = { place: r.place, rank: r.me?.rank || null, total: r.totalUsers };
    }));
    return out;
}
