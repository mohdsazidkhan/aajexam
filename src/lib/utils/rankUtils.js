import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import User from '@/models/User';
import { cached } from '@/lib/utils/sharedCache';

// Mirrors /api/leaderboard exactly (all-time, type=exam|quiz) so a user's rank on the
// profile always equals their position on the Quizzes / Exams leaderboard tabs:
//   - same grouping per user over Completed attempts,
//   - same sort: total time spent, then attempts, accuracy and total score,
//   - only users with status 'active' take part in the ranking.
// `_id` is a final tie-breaker here and in /api/leaderboard so two users with identical
// stats can never swap places between the two views.
// "total" is the platform's total student count, not just the users who have attempts,
// so the badge reads "#159 of 766 students" rather than "of 204 attempters".
async function getUserAIR(userId, type) {
    const Model = type === 'exam' ? UserTestAttempt : QuizAttempt;

    const groupStage = type === 'exam' ? {
        _id: '$user',
        totalAttempts: { $sum: 1 },
        avgAccuracy: { $avg: '$accuracy' },
        totalScore: { $sum: '$score' },
        totalTimeSpent: { $sum: '$totalTime' },
    } : {
        _id: '$user',
        totalAttempts: { $sum: 1 },
        avgAccuracy: { $avg: '$accuracy' },
        totalScore: { $sum: '$score' },
        totalTimeSpent: { $sum: '$totalTime' },
    };

    // The ranking is identical for every viewer and scans every completed attempt, so it is kept for 5 minutes
    // and only the position of this one user is looked up per request.
    const { ranked, totalStudents } = await cached(`air:${type}`, 300, async () => {
    const [rows, total] = await Promise.all([
        Model.aggregate([
            { $match: { status: 'Completed' } },
            { $group: groupStage },
            { $match: { totalAttempts: { $gte: 1 } } },
            { $sort: { totalTimeSpent: -1, totalAttempts: -1, avgAccuracy: -1, totalScore: -1, _id: 1 } },
            // Same "only active users" filter as the leaderboard.
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
            { $match: { 'user.status': 'active' } },
            { $project: { _id: 1, totalTimeSpent: 1 } }
        ]),
        User.countDocuments({ role: { $ne: 'admin' } })
    ]);
    return { ranked: rows.map((r) => ({ _id: String(r._id), totalTimeSpent: r.totalTimeSpent || 0 })), totalStudents: total };
    });

    const idx = ranked.findIndex((d) => d._id === userId.toString());
    if (idx === -1) return null;
    // totalTimeSpent is in the model's own unit: seconds for quizzes, milliseconds for exams
    // (format with formatTimeSpent(value, type)).
    return { rank: idx + 1, total: totalStudents, totalTimeSpent: ranked[idx].totalTimeSpent || 0 };
}

export const getExamAIR = (userId) => getUserAIR(userId, 'exam');
export const getQuizAIR = (userId) => getUserAIR(userId, 'quiz');
