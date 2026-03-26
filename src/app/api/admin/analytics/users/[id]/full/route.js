import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import MonthlyWinners from '@/models/MonthlyWinners';
import PaymentOrder from '@/models/PaymentOrder';
import WalletTransaction from '@/models/WalletTransaction';
import UserQuestions from '@/models/UserQuestions';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';
import Article from '@/models/Article';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Valid user ID is required' }, { status: 400 });
        }

        await dbConnect();

        const userIdObj = new mongoose.Types.ObjectId(id);

        const userDoc = await User.findById(userIdObj).select('name email referralRewards followersCount followingCount referralCount level subscriptionStatus createdAt quizBestScores monthlyProgress');
        if (!userDoc) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Monthly winners earnings
        const monthlyWinnersData = await MonthlyWinners.find({ 'winners.userId': userIdObj });
        let monthlyEarnings = 0;
        let totalHighScoreWins = 0;
        let totalAccuracy = 0;
        let monthsWon = 0;

        monthlyWinnersData.forEach(month => {
            const userWinner = month.winners.find(w => w.userId.toString() === id.toString());
            if (userWinner) {
                if (userWinner.rewardAmount) monthlyEarnings += userWinner.rewardAmount;
                if (userWinner.highScoreWins) totalHighScoreWins += userWinner.highScoreWins;
                if (userWinner.accuracy !== undefined && userWinner.accuracy !== null) {
                    totalAccuracy += userWinner.accuracy;
                    monthsWon++;
                }
            }
        });

        // Use the cumulative accuracy from wins, or fall back to user's monthly/level accuracy
        let averageAccuracy = monthsWon > 0 ? totalAccuracy / monthsWon :
            (userDoc.monthlyProgress?.accuracy || userDoc.level?.averageScore || 0);

        // Fallback for high score wins
        if (totalHighScoreWins === 0 && userDoc.monthlyProgress?.highScoreWins) {
            totalHighScoreWins = userDoc.monthlyProgress.highScoreWins;
        }

        // Referral Rewards
        let referralRewardsTotal = 0;
        if (userDoc.referralRewards && Array.isArray(userDoc.referralRewards)) {
            referralRewardsTotal = userDoc.referralRewards.reduce((sum, r) => sum + (r.amount || 0), 0);
        }

        // Wallet Earnings (Blog/Quiz)
        const walletAgg = await WalletTransaction.aggregate([
            {
                $match: {
                    user: userIdObj,
                    category: { $in: ['blog_reward', 'quiz_reward', 'question_reward'] },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        let blogEarnings = 0;
        let quizEarnings = 0;

        walletAgg.forEach(item => {
            if (item._id === 'blog_reward') blogEarnings += item.total;
            if (item._id === 'quiz_reward' || item._id === 'question_reward') quizEarnings += item.total;
        });

        const totalEarnings = monthlyEarnings + referralRewardsTotal + blogEarnings + quizEarnings;

        // User Expenses
        const paymentAgg = await PaymentOrder.aggregate([
            { $match: { user: userIdObj, payuStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = paymentAgg[0]?.total || 0;
        const netEarnings = totalEarnings - totalExpenses;

        // Content & Activity stats
        const UserTestAttemptModel = mongoose.models.UserTestAttempt;

        const [testAttemptsCount, questionsPostedCount, categoriesCreatedCount, subcategoriesCreatedCount, quizzesCreatedCount, blogsCreatedCount] = await Promise.all([
            UserTestAttemptModel ? UserTestAttemptModel.countDocuments({ user: userIdObj }) : Promise.resolve(0),
            UserQuestions.countDocuments({ userId: userIdObj }),
            Category.countDocuments({ createdBy: userIdObj }),
            Subcategory.countDocuments({ createdBy: userIdObj }),
            Quiz.countDocuments({ createdBy: userIdObj }),
            Article.countDocuments({ author: userIdObj })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    _id: userDoc._id,
                    name: userDoc.name,
                    email: userDoc.email,
                    level: userDoc.level,
                    subscriptionStatus: userDoc.subscriptionStatus,
                    createdAt: userDoc.createdAt
                },
                totalEarnings: totalEarnings || 0,
                referralRewards: referralRewardsTotal || 0,
                blogEarnings: blogEarnings || 0,
                quizEarnings: quizEarnings || 0,
                totalExpenses: totalExpenses || 0,
                netEarnings: netEarnings || 0,
                totalHighScoreWins: totalHighScoreWins || 0,
                averageAccuracy: Math.round(averageAccuracy * 100) / 100 || 0,
                followersCount: userDoc.followersCount || 0,
                followingCount: userDoc.followingCount || 0,
                referralCount: userDoc.referralCount || 0,
                testAttemptsCount: testAttemptsCount || 0,
                questionsPostedCount: questionsPostedCount || 0,
                categoriesCreatedCount: categoriesCreatedCount || 0,
                subcategoriesCreatedCount: subcategoriesCreatedCount || 0,
                quizzesCreatedCount: quizzesCreatedCount || 0,
                blogsCreatedCount: blogsCreatedCount || 0
            }
        });

    } catch (error) {
        console.error('Get admin user full analytics error:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch user analytics', error: error.message }, { status: 500 });
    }
}
