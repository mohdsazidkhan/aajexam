import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import PaymentOrder from '@/models/PaymentOrder';
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

        // 1. Calculate Blog Earnings
        const blogEarningsRes = await WalletTransaction.aggregate([
            { $match: { user: userIdObj, category: 'blog_reward', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const blogEarnings = blogEarningsRes[0]?.total || 0;

        // 2. Get User basic stats & Referral Rewards
        const user = await User.findById(userId).select('referralCount followersCount followingCount referralRewards');

        let referralRewardsTotal = 0;
        if (user && user.referralRewards && Array.isArray(user.referralRewards)) {
            referralRewardsTotal = user.referralRewards.reduce((sum, reward) => sum + (reward.amount || 0), 0);
        }

        // 3. Calculate Total Expenses
        const paymentOrders = await PaymentOrder.aggregate([
            { $match: { user: userIdObj, payuStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = paymentOrders[0]?.total || 0;

        // 4. Calculate Overall Total Earnings & Net Earnings
        const totalEarnings = referralRewardsTotal + blogEarnings;
        const netEarnings = totalEarnings - totalExpenses;

        // 5. Counts
        const testAttemptsCount = await UserTestAttempt.countDocuments({ user: userIdObj });

        return NextResponse.json({
            success: true,
            data: {
                totalEarnings,
                referralRewards: referralRewardsTotal,
                blogEarnings,
                totalExpenses,
                netEarnings,
                followersCount: user?.followersCount || 0,
                followingCount: user?.followingCount || 0,
                referralCount: user?.referralCount || 0,
                testAttemptsCount
            }
        });
    } catch (error) {
        console.error('getStudentAnalytics error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
