// Rebuilds the precomputed leaderboard totals (LeaderboardStat) from the raw attempts.
//
// Run once after deploying the code that maintains them, and again any time you want to
// reconcile drift (e.g. after deleting attempts by hand). While it runs, the "ready" marker is
// removed, so /api/leaderboard and /api/air transparently use the old full-scan path; the
// marker is written last, which flips them to the precomputed path.
//
// Usage: node scripts/backfillLeaderboardStats.js          (dry run: prints attempt counts)
//        node scripts/backfillLeaderboardStats.js --write  (rebuilds the totals)
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const WRITE = process.argv.includes('--write');
const BATCH = 1000;

const SUMS_COMMON = {
    n: { $sum: 1 },
    sumAccuracy: { $sum: '$accuracy' },
    totalScore: { $sum: '$score' },
    totalCorrect: { $sum: '$correctCount' },
    totalTime: { $sum: '$totalTime' },
};

function toRow(kind, scope, g) {
    const n = g.n || 0;
    return {
        kind,
        user: g._id.user,
        scope,
        day: g._id.day || null,
        n,
        sumAccuracy: g.sumAccuracy || 0,
        sumPercentage: g.sumPercentage || 0,
        totalScore: g.totalScore || 0,
        totalMarks: g.totalMarks || 0,
        totalCorrect: g.totalCorrect || 0,
        totalTime: g.totalTime || 0,
        bestScore: g.bestScore ?? 0,
        avgAccuracy: n ? (g.sumAccuracy || 0) / n : 0,
        avgPercentage: n ? (g.sumPercentage || 0) / n : 0,
    };
}

async function flush(coll, ops) {
    if (!ops.length) return 0;
    await coll.bulkWrite(ops, { ordered: false });
    return ops.length;
}

// Streams a grouped aggregation into replaceOne-upserts.
async function load(coll, srcModel, pipeline, kind, scopeOf) {
    let written = 0;
    let ops = [];
    const cursor = srcModel.aggregate(pipeline, { allowDiskUse: true }).cursor({ batchSize: BATCH });
    for await (const g of cursor) {
        const scope = scopeOf(g);
        if (!scope) continue;
        const row = toRow(kind, scope, g);
        ops.push({
            replaceOne: {
                filter: { kind, user: row.user, scope: row.scope, day: row.day },
                replacement: row,
                upsert: true,
            },
        });
        if (ops.length >= BATCH) { written += await flush(coll, ops); ops = []; }
    }
    written += await flush(coll, ops);
    return written;
}

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const coll = db.collection('leaderboardstats');
    const QuizAttempt = db.collection('quizattempts');
    const UserTestAttempt = db.collection('usertestattempts');

    // Native collections for aggregation (no Mongoose models needed in a standalone script).
    const asModel = (c) => ({ aggregate: (p, o) => c.aggregate(p, o) });
    const quizSrc = asModel(QuizAttempt);
    const examSrc = asModel(UserTestAttempt);

    const quizCount = await QuizAttempt.countDocuments({ status: 'Completed' });
    const examCount = await UserTestAttempt.countDocuments({ status: 'Completed' });
    console.log(`Completed quiz attempts: ${quizCount}, completed exam attempts: ${examCount}`);
    if (!WRITE) { console.log('Dry run - pass --write to rebuild.'); await mongoose.disconnect(); return; }

    await coll.createIndex({ kind: 1, user: 1, scope: 1, day: 1 }, { unique: true });
    await coll.createIndex({ kind: 1, scope: 1, day: 1, totalTime: -1, n: -1, avgAccuracy: -1, totalScore: -1, user: 1 });

    // Take the board offline (old scan path) while rebuilding.
    await coll.deleteOne({ kind: 'meta', scope: 'ready' });
    await coll.deleteMany({ kind: { $in: ['quiz', 'exam'] } });

    const dayExpr = { $dateTrunc: { date: '$createdAt', unit: 'day', timezone: 'UTC' } };

    // ---- quiz ----
    const quizMatch = { $match: { status: 'Completed' } };
    const quizSums = {
        ...SUMS_COMMON,
        sumPercentage: { $sum: '$percentage' },
        totalMarks: { $sum: '$totalMarks' },
        bestScore: { $max: '$percentage' },
    };
    let w = await load(coll, quizSrc, [quizMatch, { $group: { _id: { user: '$user' }, ...quizSums } }], 'quiz', () => 'all');
    console.log('quiz lifetime rows:', w);
    w = await load(coll, quizSrc, [quizMatch, { $group: { _id: { user: '$user', day: dayExpr }, ...quizSums } }], 'quiz', () => 'all');
    console.log('quiz daily rows:', w);

    // ---- exam (marks + exam id come from the attempt's PracticeTest -> ExamPattern) ----
    const examBase = [
        { $match: { status: 'Completed' } },
        { $lookup: { from: 'practicetests', localField: 'practiceTest', foreignField: '_id', as: 't', pipeline: [{ $project: { totalMarks: 1, examPattern: 1 } }] } },
        { $unwind: { path: '$t', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'exampatterns', localField: 't.examPattern', foreignField: '_id', as: 'p', pipeline: [{ $project: { exam: 1 } }] } },
        { $unwind: { path: '$p', preserveNullAndEmptyArrays: true } },
        { $addFields: { marks: { $ifNull: ['$t.totalMarks', 0] }, examId: '$p.exam' } },
    ];
    const examSums = {
        ...SUMS_COMMON,
        sumPercentage: { $sum: '$accuracy' }, // exam boards show accuracy as the average percentage
        totalMarks: { $sum: '$marks' },
        bestScore: { $max: '$score' },
    };
    w = await load(coll, examSrc, [...examBase, { $group: { _id: { user: '$user' }, ...examSums } }], 'exam', () => 'all');
    console.log('exam lifetime rows:', w);
    w = await load(coll, examSrc, [...examBase, { $group: { _id: { user: '$user', day: dayExpr }, ...examSums } }], 'exam', () => 'all');
    console.log('exam daily rows:', w);
    w = await load(
        coll, examSrc,
        [...examBase, { $match: { examId: { $ne: null } } }, { $group: { _id: { user: '$user', examId: '$examId' }, ...examSums } }],
        'exam', (g) => String(g._id.examId)
    );
    console.log('exam per-exam rows:', w);

    await coll.insertOne({ kind: 'meta', scope: 'ready', day: null, n: 0, builtAt: new Date() });
    console.log('Done. Leaderboards now read the precomputed totals.');
    await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
