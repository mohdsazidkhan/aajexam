import mongoose from 'mongoose';

// Precomputed per-user leaderboard totals, maintained on every attempt submit
// (lib/utils/leaderboardStats.js) so leaderboards read an index instead of scanning
// every attempt on the platform.
//
//   kind  'quiz' | 'exam'  (QuizAttempt vs UserTestAttempt)
//   scope 'all' | <examId> (exam kind only gets per-exam rows, used by All India Rank)
//   day   null            -> lifetime row
//         Date (UTC 00:00) -> that day's row, summed over a window for weekly/monthly boards
//
// A single meta row ({ kind: 'meta', scope: 'ready' }) is written by the backfill script;
// until it exists the leaderboard endpoints keep using the old full-scan path.
const leaderboardStatSchema = new mongoose.Schema({
    kind: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scope: { type: String, required: true, default: 'all' },
    day: { type: Date, default: null },

    n: { type: Number, default: 0 },
    sumAccuracy: { type: Number, default: 0 },
    sumPercentage: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    // Derived on every write; part of the lifetime sort index.
    avgAccuracy: { type: Number, default: 0 },
    avgPercentage: { type: Number, default: 0 },
}, { timestamps: false });

leaderboardStatSchema.index({ kind: 1, user: 1, scope: 1, day: 1 }, { unique: true });
// Lifetime board order: time spent, attempts, accuracy, score, then user as the final tie-break.
leaderboardStatSchema.index({ kind: 1, scope: 1, day: 1, totalTime: -1, n: -1, avgAccuracy: -1, totalScore: -1, user: 1 });

const LeaderboardStat = mongoose.models.LeaderboardStat || mongoose.model('LeaderboardStat', leaderboardStatSchema);
export default LeaderboardStat;
