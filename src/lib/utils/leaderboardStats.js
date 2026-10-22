import mongoose from 'mongoose';
import LeaderboardStat from '@/models/LeaderboardStat';
import User from '@/models/User';
import UserStreak from '@/models/UserStreak';
import { cached } from '@/lib/utils/sharedCache';

// Reads/writes for the precomputed leaderboard totals (see models/LeaderboardStat.js).

const oid = (v) => (v instanceof mongoose.Types.ObjectId ? v : new mongoose.Types.ObjectId(String(v)));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const utcDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

// Aggregation-pipeline update: adds this attempt to a row (creating it on first use) and
// refreshes the derived averages in the same atomic write.
function addAttemptPipeline(a) {
    const inc = (field, by) => ({ $add: [{ $ifNull: [`$${field}`, 0] }, by] });
    return [
        {
            $set: {
                n: inc('n', 1),
                sumAccuracy: inc('sumAccuracy', a.accuracy),
                sumPercentage: inc('sumPercentage', a.percentage),
                totalScore: inc('totalScore', a.score),
                totalMarks: inc('totalMarks', a.marks),
                totalCorrect: inc('totalCorrect', a.correct),
                totalTime: inc('totalTime', a.time),
                bestScore: { $max: [{ $ifNull: ['$bestScore', -1e15] }, a.best] },
            },
        },
        {
            $set: {
                avgAccuracy: { $divide: ['$sumAccuracy', '$n'] },
                avgPercentage: { $divide: ['$sumPercentage', '$n'] },
            },
        },
    ];
}

/**
 * Add one completed attempt to the precomputed totals. Never throws: a stats failure must
 * not fail the student's submit (the backfill/reconcile script repairs any drift).
 *
 * @param {'quiz'|'exam'} kind
 * @param {object} p { user, examId?, createdAt, accuracy, percentage, score, marks, correct, time, best }
 */
export async function recordAttemptStat(kind, p) {
    try {
        const user = oid(p.user);
        const day = utcDay(new Date(p.createdAt || Date.now()));
        const a = {
            accuracy: num(p.accuracy), percentage: num(p.percentage), score: num(p.score),
            marks: num(p.marks), correct: num(p.correct), time: num(p.time), best: num(p.best),
        };
        const update = addAttemptPipeline(a);
        const rows = [
            { scope: 'all', day: null },
            { scope: 'all', day },
        ];
        if (kind === 'exam' && p.examId) rows.push({ scope: String(p.examId), day: null });

        await LeaderboardStat.collection.bulkWrite(
            rows.map((r) => ({
                updateOne: { filter: { kind, user, scope: r.scope, day: r.day }, update, upsert: true },
            })),
            { ordered: false }
        );
    } catch (err) {
        console.error('recordAttemptStat failed:', err);
    }
}

// True once the backfill script has finished (it writes the meta row last).
export function statsReady() {
    return cached('leaderboard-stats-ready', 60, async () => {
        const row = await LeaderboardStat.findOne({ kind: 'meta', scope: 'ready' }).select('_id').lean();
        return !!row;
    });
}

const r1 = (v) => Math.round((v + Number.EPSILON) * 10) / 10;

// Attaches user + streak info and shapes rows like the old aggregation output.
// `countKey` is the name the endpoint exposes for the attempt count (totalQuizzes | totalExams).
async function shapeRows(rows, { kind, countKey }) {
    if (!rows.length) return [];
    const ids = rows.map((r) => r.user);
    const [users, streaks] = await Promise.all([
        User.find({ _id: { $in: ids }, status: 'active' }).select('name username profilePicture city subscriptionStatus').lean(),
        UserStreak.find({ user: { $in: ids } }).select('user currentStreak longestStreak').lean(),
    ]);
    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const streakMap = new Map(streaks.map((s) => [String(s.user), s]));

    return rows
        .filter((r) => userMap.has(String(r.user)))
        .map((r) => {
            const u = userMap.get(String(r.user));
            const s = streakMap.get(String(r.user));
            const avgPct = kind === 'exam' ? r.avgAccuracy : r.avgPercentage;
            return {
                userId: r.user,
                name: u.name,
                username: u.username,
                profilePicture: u.profilePicture,
                city: u.city,
                subscriptionStatus: u.subscriptionStatus,
                [countKey]: r.n,
                avgPercentage: r1(avgPct || 0),
                avgAccuracy: r1(r.avgAccuracy || 0),
                totalScore: r1(r.totalScore || 0),
                totalMarks: r.totalMarks || 0,
                totalCorrect: r.totalCorrect || 0,
                totalTimeSpent: r.totalTime || 0,
                bestScore: r1(r.bestScore || 0),
                currentStreak: s?.currentStreak || 0,
                longestStreak: s?.longestStreak || 0,
            };
        });
}

const SORT = { totalTime: -1, n: -1, avgAccuracy: -1, totalScore: -1, user: 1 };

/** Lifetime board straight off the index — no scan of attempts. */
export async function topLifetime({ kind, scope = 'all', pool, countKey }) {
    const rows = await LeaderboardStat.find({ kind, scope, day: null })
        .sort(SORT).limit(pool).lean();
    return shapeRows(rows, { kind, countKey });
}

/** Rolling-window board: sums the daily rows of the last `days` days (small vs. raw attempts). */
export async function topWindow({ kind, days, pool, countKey }) {
    const since = utcDay(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
    const grouped = await LeaderboardStat.aggregate([
        { $match: { kind, scope: 'all', day: { $gte: since } } },
        {
            $group: {
                _id: '$user',
                n: { $sum: '$n' },
                sumAccuracy: { $sum: '$sumAccuracy' },
                sumPercentage: { $sum: '$sumPercentage' },
                totalScore: { $sum: '$totalScore' },
                totalMarks: { $sum: '$totalMarks' },
                totalCorrect: { $sum: '$totalCorrect' },
                totalTime: { $sum: '$totalTime' },
                bestScore: { $max: '$bestScore' },
            },
        },
        {
            $addFields: {
                avgAccuracy: { $divide: ['$sumAccuracy', '$n'] },
                avgPercentage: { $divide: ['$sumPercentage', '$n'] },
            },
        },
        { $sort: { totalTime: -1, n: -1, avgAccuracy: -1, totalScore: -1, _id: 1 } },
        { $limit: pool },
    ], { allowDiskUse: true });
    const rows = grouped.map((g) => ({ ...g, user: g._id }));
    return shapeRows(rows, { kind, countKey });
}

/** Platform-wide totals for the All India Rank header, from the per-user lifetime rows. */
export async function examScopeTotals(scope = 'all') {
    const [agg] = await LeaderboardStat.aggregate([
        { $match: { kind: 'exam', scope, day: null } },
        { $group: { _id: null, users: { $sum: 1 }, attempts: { $sum: '$n' }, time: { $sum: '$totalTime' } } },
    ]);
    return { users: agg?.users || 0, attempts: agg?.attempts || 0, time: agg?.time || 0 };
}
