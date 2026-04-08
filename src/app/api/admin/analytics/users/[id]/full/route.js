import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentOrder from '@/models/PaymentOrder';
import WalletTransaction from '@/models/WalletTransaction';
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

        const userDoc = await User.findById(userIdObj).select('name email referralRewards followersCount followingCount referralCount level subscriptionStatus createdAt');
        if (!userDoc) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Referral Rewards
        let referralRewardsTotal = 0;
        if (userDoc.referralRewards && Array.isArray(userDoc.referralRewards)) {
            referralRewardsTotal = userDoc.referralRewards.reduce((sum, r) => sum + (r.amount || 0), 0);
        }

        // Wallet Earnings (Blog)
        const walletAgg = await WalletTransaction.aggregate([
            {
                $match: {
                    user: userIdObj,
                    category: { $in: ['blog_reward', 'question_reward'] },
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

        walletAgg.forEach(item => {
            if (item._id === 'blog_reward') blogEarnings += item.total;
        });

        const totalEarnings = referralRewardsTotal + blogEarnings;

        // User Expenses
        const paymentAgg = await PaymentOrder.aggregate([
            { $match: { user: userIdObj, payuStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = paymentAgg[0]?.total || 0;
        const netEarnings = totalEarnings - totalExpenses;

        // Content & Activity stats
        const UserTestAttemptModel = mongoose.models.UserTestAttempt;

        const testAttemptsCount = UserTestAttemptModel ? await UserTestAttemptModel.countDocuments({ user: userIdObj }) : 0;

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    _id: userDoc._id,
                    name: userDoc.name,
                    email: userDoc.email,
                    subscriptionStatus: userDoc.subscriptionStatus,
                    createdAt: userDoc.createdAt
                },
                totalEarnings: totalEarnings || 0,
                referralRewards: referralRewardsTotal || 0,
                blogEarnings: blogEarnings || 0,
                totalExpenses: totalExpenses || 0,
                netEarnings: netEarnings || 0,
                followersCount: userDoc.followersCount || 0,
                followingCount: userDoc.followingCount || 0,
                referralCount: userDoc.referralCount || 0,
                testAttemptsCount: testAttemptsCount || 0
            }
        });

    } catch (error) {
        console.error('Get admin user full analytics error:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch user analytics', error: error.message }, { status: 500 });
    }
}
