import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import MonthlyWinners from '@/models/MonthlyWinners';
import WalletTransaction from '@/models/WalletTransaction';
import Article from '@/models/Article';
import Quiz from '@/models/Quiz';
import UserQuestions from '@/models/UserQuestions';
import PaymentOrder from '@/models/PaymentOrder';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const userId = auth.user.id;
        const userIdObj = new mongoose.Types.ObjectId(userId);

        // 1. Calculate Monthly Winners Rewards (Rewards for playing)
        const monthlyWinners = await MonthlyWinners.find({ 'winners.userId': userIdObj });
        let monthlyWinnerRewards = 0;
        let totalHighScoreWins = 0;
        let totalAccuracy = 0;
        let monthsWon = 0;

        monthlyWinners.forEach(month => {
            const winner = month.winners.find(w => w.userId.toString() === userId);
            if (winner) {
                if (winner.rewardAmount) monthlyWinnerRewards += winner.rewardAmount;
                if (winner.highScoreWins) totalHighScoreWins += winner.highScoreWins;
                if (winner.accuracy !== undefined && winner.accuracy !== null) {
                    totalAccuracy += winner.accuracy;
                    monthsWon++;
                }
            }
        });

        const averageAccuracy = monthsWon > 0 ? totalAccuracy / monthsWon : 0;

        // 2. Calculate Quiz Earnings (Rewards for CREATING quizzes)
        const quizRewardsResult = await WalletTransaction.aggregate([
            { $match: { user: userIdObj, category: 'quiz_reward', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const quizEarnings = quizRewardsResult[0]?.total || 0;

        // 3. Calculate Blog Earnings
        const blogEarningsRes = await WalletTransaction.aggregate([
            { $match: { user: userIdObj, category: 'blog_reward', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const blogEarnings = blogEarningsRes[0]?.total || 0;

        // 4. Get User basic stats & Referral Rewards
        const user = await User.findById(userId).select('referralCount followersCount followingCount referralRewards');

        let referralRewardsTotal = 0;
        if (user && user.referralRewards && Array.isArray(user.referralRewards)) {
            referralRewardsTotal = user.referralRewards.reduce((sum, reward) => sum + (reward.amount || 0), 0);
        }

        // 5. Calculate Total Expenses
        const paymentOrders = await PaymentOrder.aggregate([
            { $match: { user: userIdObj, payuStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = paymentOrders[0]?.total || 0;

        // 6. Calculate Overall Total Earnings & Net Earnings
        // Formula: (Monthly Winners + Referral Rewards + Blog Rewards + Quiz Rewards)
        const totalEarnings = monthlyWinnerRewards + referralRewardsTotal + blogEarnings + quizEarnings;
        const netEarnings = totalEarnings - totalExpenses;

        // 7. Counts
        const blogsCreatedCount = await Article.countDocuments({ author: userIdObj });
        const blogsApprovedCount = await Article.countDocuments({
            author: userIdObj,
            status: 'approved',
            rewardCredited: true
        });

        const quizzesCreatedCount = await Quiz.countDocuments({ createdBy: userIdObj });
        const quizzesApprovedCount = await Quiz.countDocuments({
            createdBy: userIdObj,
            status: 'approved',
            rewardCredited: true
        });

        const testAttemptsCount = await UserTestAttempt.countDocuments({ user: userIdObj });
        const questionsPostedCount = await UserQuestions.countDocuments({ userId: userIdObj });
        const categoriesCreatedCount = await Category.countDocuments({ createdBy: userIdObj });
        const subcategoriesCreatedCount = await Subcategory.countDocuments({ createdBy: userIdObj });

        return NextResponse.json({
            success: true,
            data: {
                totalEarnings,
                referralRewards: referralRewardsTotal,
                blogEarnings,
                quizEarnings,
                totalExpenses,
                netEarnings,
                totalHighScoreWins,
                averageAccuracy: Math.round(averageAccuracy * 100) / 100,
                followersCount: user?.followersCount || 0,
                followingCount: user?.followingCount || 0,
                referralCount: user?.referralCount || 0,
                testAttemptsCount,
                questionsPostedCount,
                categoriesCreatedCount,
                subcategoriesCreatedCount,
                quizzesCreatedCount,
                blogsCreatedCount,
                blogsApprovedCount,
                quizzesApprovedCount
            }
        });
    } catch (error) {
        console.error('getStudentAnalytics error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
