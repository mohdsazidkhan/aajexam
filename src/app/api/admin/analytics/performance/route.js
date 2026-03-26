import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '30';
        const limit = parseInt(searchParams.get('limit')) || 20;

        // Handle different period formats
        let days;
        if (period === 'week') days = 7;
        else if (period === 'month') days = 30;
        else if (period === 'quarter') days = 90;
        else if (period === 'year') days = 365;
        else days = parseInt(period) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Overall performance metrics
        const performanceStatsResult = await QuizAttempt.aggregate([
            { $match: { attemptedAt: { $gte: startDate } } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: '$scorePercentage' },
                    highScoreAttempts: {
                        $sum: { $cond: [{ $gte: ['$scorePercentage', 70] }, 1, 0] }
                    },
                    perfectScores: {
                        $sum: { $cond: [{ $eq: ['$scorePercentage', 100] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    totalAttempts: 1,
                    averageScore: { $round: ['$averageScore', 2] },
                    highScoreAttempts: 1,
                    highScoreRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$highScoreAttempts', { $max: [1, '$totalAttempts'] }] }, 100] },
                            2
                        ]
                    },
                    perfectScores: 1,
                    perfectScoreRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$perfectScores', { $max: [1, '$totalAttempts'] }] }, 100] },
                            2
                        ]
                    }
                }
            }
        ]);
        const performanceStats = performanceStatsResult[0] || {};

        // Helper function for user accuracy
        const calculateAccuracyFromBestScores = (quizBestScores) => {
            if (!quizBestScores || quizBestScores.length === 0) return 0;
            const totalPercentage = quizBestScores.reduce((sum, quiz) => sum + (quiz.bestScorePercentage || 0), 0);
            return Math.round(totalPercentage / quizBestScores.length);
        };

        // Top performers
        let topPerformers = [];
        if (period === 'month' || period === '30') {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const foundPerformers = await User.find({
                role: 'student',
                'monthlyProgress.month': currentMonth
            })
                .select('name email level monthlyProgress quizBestScores subscriptionStatus')
                .sort({ 'monthlyProgress.highScoreWins': -1, 'monthlyProgress.accuracy': -1 })
                .limit(limit)
                .lean();

            // Calculate and update accuracy
            foundPerformers.forEach(u => {
                const calculatedAccuracy = calculateAccuracyFromBestScores(u.quizBestScores);
                if (!u.monthlyProgress) u.monthlyProgress = {};
                u.monthlyProgress.accuracy = calculatedAccuracy;
            });

            // Calculate total scores
            const userIds = foundPerformers.map(u => u._id);
            const totalScores = await QuizAttempt.aggregate([
                { $match: { user: { $in: userIds } } },
                {
                    $group: {
                        _id: '$user',
                        totalScore: { $sum: '$score' },
                        totalCorrectAnswers: { $sum: '$correctAnswers' }
                    }
                }
            ]);

            const scoreMap = {};
            totalScores.forEach(score => {
                scoreMap[score._id.toString()] = {
                    totalScore: score.totalScore,
                    totalCorrectAnswers: score.totalCorrectAnswers
                };
            });

            topPerformers = foundPerformers.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                subscriptionStatus: u.subscriptionStatus,
                level: {
                    currentLevel: u.level?.currentLevel || 0,
                    levelName: `Level ${u.level?.currentLevel || 0}`,
                    highScoreQuizzes: u.monthlyProgress?.highScoreWins || 0,
                    quizzesPlayed: u.monthlyProgress?.totalQuizAttempts || 0,
                    accuracy: u.monthlyProgress?.accuracy || 0,
                    averageScore: u.monthlyProgress?.accuracy || 0,
                    totalScore: scoreMap[u._id.toString()]?.totalScore || 0
                },
                monthlyProgress: {
                    highScoreWins: u.monthlyProgress?.highScoreWins || 0,
                    accuracy: u.monthlyProgress?.accuracy || 0,
                    totalQuizAttempts: u.monthlyProgress?.totalQuizAttempts || 0,
                    month: u.monthlyProgress?.month,
                    currentLevel: u.monthlyProgress?.currentLevel || u.level?.currentLevel || 0,
                    rewardEligible: u.monthlyProgress?.rewardEligible || false
                },
                totalScore: scoreMap[u._id.toString()]?.totalScore || 0,
                totalCorrectAnswers: scoreMap[u._id.toString()]?.totalCorrectAnswers || 0
            }));
        } else {
            topPerformers = await User.aggregate([
                { $match: { role: 'student' } },
                {
                    $lookup: {
                        from: 'quizattempts',
                        localField: '_id',
                        foreignField: 'user',
                        as: 'quizAttempts'
                    }
                },
                {
                    $project: {
                        name: 1,
                        email: 1,
                        subscriptionStatus: 1,
                        level: 1,
                        monthlyProgress: {
                            highScoreWins: '$level.highScoreQuizzes',
                            accuracy: '$level.averageScore',
                            totalQuizAttempts: { $size: { $ifNull: ['$quizBestScores', []] } }
                        },
                        highScoreQuizzes: '$level.highScoreQuizzes',
                        accuracy: '$level.averageScore',
                        totalQuizzes: { $size: { $ifNull: ['$quizBestScores', []] } },
                        totalScore: { $sum: '$quizAttempts.score' },
                        totalCorrectAnswers: { $sum: '$quizAttempts.correctAnswers' }
                    }
                },
                { $sort: { highScoreQuizzes: -1, accuracy: -1 } },
                { $limit: limit }
            ]);

            // Map topPerformers level property to match monthly shape
            topPerformers = topPerformers.map(p => {
                if (!p.level) p.level = {};
                p.level.highScoreQuizzes = p.highScoreQuizzes;
                p.level.accuracy = p.accuracy;
                p.level.quizzesPlayed = p.totalQuizzes;
                p.level.totalScore = p.totalScore;
                return p;
            });
        }

        // Level performance data
        const levelPerformance = await QuizAttempt.aggregate([
            { $match: { attemptedAt: { $gte: startDate } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $group: {
                    _id: '$userInfo.level.currentLevel',
                    avgScore: { $avg: '$scorePercentage' },
                    userCount: { $addToSet: '$user' }
                }
            },
            {
                $project: {
                    avgScore: { $round: ['$avgScore', 2] },
                    userCount: { $size: '$userCount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Score distribution data
        const scoreDistribution = await QuizAttempt.aggregate([
            { $match: { attemptedAt: { $gte: startDate } } },
            {
                $bucket: {
                    groupBy: '$scorePercentage',
                    boundaries: [0, 25, 50, 70, 90, 100],
                    default: 'Other',
                    output: {
                        count: { $sum: 1 },
                        avgScore: { $avg: '$scorePercentage' }
                    }
                }
            },
            {
                $project: {
                    _id: { $concat: [{ $toString: '$_id.min' }, '-', { $toString: '$_id.max' }, '%'] },
                    count: 1,
                    avgScore: { $round: ['$avgScore', 2] }
                }
            }
        ]);

        // Category performance data
        const categoryPerformance = await QuizAttempt.aggregate([
            { $match: { attemptedAt: { $gte: startDate } } },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: 'quiz',
                    foreignField: '_id',
                    as: 'quizInfo'
                }
            },
            { $unwind: { path: '$quizInfo', preserveNullAndEmptyArrays: false } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'quizInfo.category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: false } },
            {
                $group: {
                    _id: '$categoryInfo._id',
                    categoryName: { $first: '$categoryInfo.name' },
                    attemptCount: { $sum: 1 },
                    avgScore: { $avg: '$scorePercentage' },
                    completionRate: {
                        $avg: {
                            $cond: [{ $gte: ['$scorePercentage', 70] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    categoryName: 1,
                    attemptCount: 1,
                    avgScore: { $round: ['$avgScore', 2] },
                    completionRate: { $round: ['$completionRate', 4] }
                }
            },
            { $sort: { attemptCount: -1 } }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                period: `${days} days`,
                performanceStats,
                topPerformers,
                levelPerformance,
                scoreDistribution,
                categoryPerformance
            }
        });
    } catch (error) {
        console.error('Performance Analytics Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
