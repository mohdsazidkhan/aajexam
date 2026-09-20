import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';

// Mirrors the grouping/sort criteria used by /api/leaderboard and /api/air
// (all-time, type=exam|quiz) so a user's AIR badge always matches their
// actual position on the public leaderboard/rank pages.
async function getUserAIR(userId, type) {
    const Model = type === 'exam' ? UserTestAttempt : QuizAttempt;

    const groupStage = type === 'exam' ? {
        _id: '$user',
        totalAttempts: { $sum: 1 },
        avgPercentage: { $avg: '$accuracy' },
        avgAccuracy: { $avg: '$accuracy' },
    } : {
        _id: '$user',
        totalAttempts: { $sum: 1 },
        avgPercentage: { $avg: '$percentage' },
        avgAccuracy: { $avg: '$accuracy' },
    };

    const ranked = await Model.aggregate([
        { $match: { status: 'Completed' } },
        { $group: groupStage },
        { $match: { totalAttempts: { $gte: 1 } } },
        { $sort: { avgAccuracy: -1, avgPercentage: -1, totalAttempts: -1 } },
        { $project: { _id: 1 } }
    ]);

    const idx = ranked.findIndex((d) => d._id.toString() === userId.toString());
    if (idx === -1) return null;
    return { rank: idx + 1, total: ranked.length };
}

export const getExamAIR = (userId) => getUserAIR(userId, 'exam');
export const getQuizAIR = (userId) => getUserAIR(userId, 'quiz');
