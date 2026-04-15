import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import PaymentOrder from '@/models/PaymentOrder';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import ReelInteraction from '@/models/ReelInteraction';
import Reel from '@/models/Reel';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const userId = auth.user.id;
        const userIdObj = new mongoose.Types.ObjectId(userId);

        // Run all queries in parallel
        const [
            user,
            blogEarningsRes,
            paymentOrders,
            quizStats,
            quizSubjectWise,
            quizTopicWise,
            examStats,
            reelStats,
            reelSubjectWise,
            myReelsStats,
            walletBreakdown
        ] = await Promise.all([
            // 1. User basic info
            User.findById(userId).select('referralCode referralCount followersCount followingCount referralRewards walletBalance performanceMetrics'),

            // 2. Blog Earnings
            WalletTransaction.aggregate([
                { $match: { user: userIdObj, category: 'blog_reward', status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // 3. Total Expenses
            PaymentOrder.aggregate([
                { $match: { user: userIdObj, payuStatus: 'success' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // 4. Overall Quiz Stats
            QuizAttempt.aggregate([
                { $match: { user: userIdObj, status: 'Completed' } },
                {
                    $group: {
                        _id: null,
                        totalAttempts: { $sum: 1 },
                        avgAccuracy: { $avg: '$accuracy' },
                        avgScore: { $avg: '$percentage' },
                        totalCorrect: { $sum: '$correctCount' },
                        totalWrong: { $sum: '$wrongCount' },
                        totalSkipped: { $sum: '$skippedCount' },
                        totalTime: { $sum: '$totalTime' },
                        bestAccuracy: { $max: '$accuracy' },
                        bestScore: { $max: '$percentage' }
                    }
                }
            ]),

            // 5. Quiz Subject-wise performance
            QuizAttempt.aggregate([
                { $match: { user: userIdObj, status: 'Completed' } },
                {
                    $lookup: {
                        from: 'quizzes',
                        localField: 'quiz',
                        foreignField: '_id',
                        as: 'quizData'
                    }
                },
                { $unwind: '$quizData' },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'quizData.subject',
                        foreignField: '_id',
                        as: 'subjectData'
                    }
                },
                { $unwind: '$subjectData' },
                {
                    $group: {
                        _id: '$subjectData._id',
                        subjectName: { $first: '$subjectData.name' },
                        attempts: { $sum: 1 },
                        avgAccuracy: { $avg: '$accuracy' },
                        avgScore: { $avg: '$percentage' },
                        totalCorrect: { $sum: '$correctCount' },
                        totalWrong: { $sum: '$wrongCount' },
                        bestAccuracy: { $max: '$accuracy' }
                    }
                },
                { $sort: { attempts: -1 } }
            ]),

            // 6. Quiz Topic-wise performance
            QuizAttempt.aggregate([
                { $match: { user: userIdObj, status: 'Completed' } },
                {
                    $lookup: {
                        from: 'quizzes',
                        localField: 'quiz',
                        foreignField: '_id',
                        as: 'quizData'
                    }
                },
                { $unwind: '$quizData' },
                { $match: { 'quizData.topic': { $ne: null } } },
                {
                    $lookup: {
                        from: 'topics',
                        localField: 'quizData.topic',
                        foreignField: '_id',
                        as: 'topicData'
                    }
                },
                { $unwind: '$topicData' },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'quizData.subject',
                        foreignField: '_id',
                        as: 'subjectData'
                    }
                },
                { $unwind: '$subjectData' },
                {
                    $group: {
                        _id: '$topicData._id',
                        topicName: { $first: '$topicData.name' },
                        subjectName: { $first: '$subjectData.name' },
                        attempts: { $sum: 1 },
                        avgAccuracy: { $avg: '$accuracy' },
                        avgScore: { $avg: '$percentage' },
                        totalCorrect: { $sum: '$correctCount' },
                        totalWrong: { $sum: '$wrongCount' }
                    }
                },
                { $sort: { attempts: -1 } },
                { $limit: 20 }
            ]),

            // 7. Exam (PracticeTest) Stats
            UserTestAttempt.aggregate([
                { $match: { user: userIdObj, status: 'Completed' } },
                {
                    $group: {
                        _id: null,
                        totalAttempts: { $sum: 1 },
                        avgAccuracy: { $avg: '$accuracy' },
                        avgScore: { $avg: '$score' },
                        totalCorrect: { $sum: '$correctCount' },
                        totalWrong: { $sum: '$wrongCount' },
                        bestAccuracy: { $max: '$accuracy' }
                    }
                }
            ]),

            // 8. Reel Stats
            ReelInteraction.aggregate([
                { $match: { userId: userIdObj } },
                {
                    $group: {
                        _id: null,
                        totalViewed: { $sum: 1 },
                        totalLiked: { $sum: { $cond: ['$liked', 1, 0] } },
                        totalBookmarked: { $sum: { $cond: ['$bookmarked', 1, 0] } },
                        totalShared: { $sum: { $cond: ['$shared', 1, 0] } },
                        totalAnswered: { $sum: { $cond: ['$answered', 1, 0] } },
                        totalCorrect: { $sum: { $cond: [{ $and: ['$answered', '$isCorrect'] }, 1, 0] } },
                        totalTimeSpent: { $sum: '$timeSpentSeconds' }
                    }
                }
            ]),

            // 9. Reel Subject-wise
            ReelInteraction.aggregate([
                { $match: { userId: userIdObj, answered: true } },
                {
                    $lookup: {
                        from: 'reels',
                        localField: 'reelId',
                        foreignField: '_id',
                        as: 'reelData'
                    }
                },
                { $unwind: '$reelData' },
                { $match: { 'reelData.type': 'question' } },
                {
                    $group: {
                        _id: '$reelData.subject',
                        attempted: { $sum: 1 },
                        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
                    }
                },
                {
                    $project: {
                        subject: '$_id',
                        attempted: 1,
                        correct: 1,
                        accuracy: {
                            $round: [{ $multiply: [{ $divide: ['$correct', { $max: ['$attempted', 1] }] }, 100] }, 1]
                        }
                    }
                },
                { $sort: { attempted: -1 } }
            ]),

            // 10. User's created reels stats
            Reel.aggregate([
                { $match: { createdBy: userIdObj } },
                {
                    $group: {
                        _id: null,
                        totalPosted: { $sum: 1 },
                        totalViews: { $sum: '$viewsCount' },
                        totalLikes: { $sum: '$likesCount' },
                        totalBookmarks: { $sum: '$bookmarksCount' },
                        totalShares: { $sum: '$sharesCount' },
                        totalAnswered: { $sum: '$answeredCount' },
                        totalCorrect: { $sum: '$correctCount' },
                        published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
                        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
                        draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } }
                    }
                }
            ]),

            // 11. Wallet category breakdown
            WalletTransaction.aggregate([
                { $match: { user: userIdObj, status: 'completed' } },
                {
                    $group: {
                        _id: { type: '$type', category: '$category' },
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Process results
        const blogEarnings = blogEarningsRes[0]?.total || 0;
        const totalExpenses = paymentOrders[0]?.total || 0;

        let referralRewardsTotal = 0;
        if (user?.referralRewards?.length) {
            referralRewardsTotal = user.referralRewards.reduce((sum, r) => sum + (r.amount || 0), 0);
        }
        const totalEarnings = referralRewardsTotal + blogEarnings;
        const netEarnings = totalEarnings - totalExpenses;

        // Process wallet breakdown
        const walletSummary = {};
        walletBreakdown.forEach(item => {
            const key = `${item._id.type}_${item._id.category}`;
            walletSummary[key] = { total: item.total, count: item.count };
        });

        const quiz = quizStats[0] || { totalAttempts: 0, avgAccuracy: 0, avgScore: 0, totalCorrect: 0, totalWrong: 0, totalSkipped: 0, totalTime: 0, bestAccuracy: 0, bestScore: 0 };
        const exam = examStats[0] || { totalAttempts: 0, avgAccuracy: 0, avgScore: 0, totalCorrect: 0, totalWrong: 0, bestAccuracy: 0 };
        const reel = reelStats[0] || { totalViewed: 0, totalLiked: 0, totalBookmarked: 0, totalShared: 0, totalAnswered: 0, totalCorrect: 0, totalTimeSpent: 0 };
        const myReels = myReelsStats[0] || { totalPosted: 0, totalViews: 0, totalLikes: 0, totalBookmarks: 0, totalShares: 0, totalAnswered: 0, totalCorrect: 0, published: 0, pending: 0, rejected: 0, draft: 0 };

        return NextResponse.json({
            success: true,
            data: {
                // Overall
                followersCount: user?.followersCount || 0,
                followingCount: user?.followingCount || 0,

                // Quiz Performance
                quiz: {
                    totalAttempts: quiz.totalAttempts,
                    avgAccuracy: Math.round(quiz.avgAccuracy * 10) / 10,
                    avgScore: Math.round(quiz.avgScore * 10) / 10,
                    totalCorrect: quiz.totalCorrect,
                    totalWrong: quiz.totalWrong,
                    totalSkipped: quiz.totalSkipped,
                    totalTime: quiz.totalTime,
                    bestAccuracy: Math.round(quiz.bestAccuracy * 10) / 10,
                    bestScore: Math.round(quiz.bestScore * 10) / 10,
                    subjectWise: quizSubjectWise.map(s => ({
                        subjectId: s._id,
                        name: s.subjectName,
                        attempts: s.attempts,
                        avgAccuracy: Math.round(s.avgAccuracy * 10) / 10,
                        avgScore: Math.round(s.avgScore * 10) / 10,
                        totalCorrect: s.totalCorrect,
                        totalWrong: s.totalWrong,
                        bestAccuracy: Math.round(s.bestAccuracy * 10) / 10
                    })),
                    topicWise: quizTopicWise.map(t => ({
                        topicId: t._id,
                        name: t.topicName,
                        subjectName: t.subjectName,
                        attempts: t.attempts,
                        avgAccuracy: Math.round(t.avgAccuracy * 10) / 10,
                        avgScore: Math.round(t.avgScore * 10) / 10,
                        totalCorrect: t.totalCorrect,
                        totalWrong: t.totalWrong
                    }))
                },

                // Exam Performance
                exam: {
                    totalAttempts: exam.totalAttempts,
                    avgAccuracy: Math.round(exam.avgAccuracy * 10) / 10,
                    avgScore: Math.round(exam.avgScore * 10) / 10,
                    totalCorrect: exam.totalCorrect,
                    totalWrong: exam.totalWrong,
                    bestAccuracy: Math.round(exam.bestAccuracy * 10) / 10
                },

                // Reel Performance
                reel: {
                    totalViewed: reel.totalViewed,
                    totalLiked: reel.totalLiked,
                    totalBookmarked: reel.totalBookmarked,
                    totalShared: reel.totalShared,
                    totalAnswered: reel.totalAnswered,
                    totalCorrect: reel.totalCorrect,
                    accuracy: reel.totalAnswered > 0 ? Math.round((reel.totalCorrect / reel.totalAnswered) * 1000) / 10 : 0,
                    totalTimeSpent: reel.totalTimeSpent,
                    subjectWise: reelSubjectWise.map(s => ({
                        subject: s._id || 'General',
                        attempted: s.attempted,
                        correct: s.correct,
                        accuracy: s.accuracy
                    }))
                },

                // My Reels (user's created reels)
                myReels: {
                    totalPosted: myReels.totalPosted,
                    totalViews: myReels.totalViews,
                    totalLikes: myReels.totalLikes,
                    totalBookmarks: myReels.totalBookmarks,
                    totalShares: myReels.totalShares,
                    totalAnswered: myReels.totalAnswered,
                    totalCorrect: myReels.totalCorrect,
                    published: myReels.published,
                    pending: myReels.pending,
                    rejected: myReels.rejected,
                    draft: myReels.draft
                },

                // Wallet
                wallet: {
                    balance: user?.walletBalance || 0,
                    totalEarnings,
                    totalExpenses,
                    netEarnings,
                    blogEarnings,
                    referralRewards: referralRewardsTotal
                },

                // Referral
                referral: {
                    code: user?.referralCode || '',
                    count: user?.referralCount || 0,
                    totalRewards: referralRewardsTotal,
                    rewards: user?.referralRewards || []
                }
            }
        });
    } catch (error) {
        console.error('getStudentAnalytics error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
