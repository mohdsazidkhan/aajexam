import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.MIN_WITHDRAW_AMOUNT || '1000', 10);

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const userId = auth.user.id;
        const user = await User.findById(userId).select('walletBalance referralRewards referralCode referredBy referralCount subscriptionStatus');

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Get wallet transactions
        const transactions = await WalletTransaction.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Check for pending withdrawal request
        const pendingRequest = await WithdrawRequest.findOne({
            userId: userId,
            status: 'pending'
        }).select('amount requestedAt status').lean();

        // Get recent withdrawal requests
        const withdrawalRequests = await WithdrawRequest.find({
            userId: userId
        })
            .sort({ requestedAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                walletBalance: user.walletBalance || 0,
                referralCode: user.referralCode,
                referredBy: user.referredBy,
                referralRewards: user.referralRewards || [],
                referralCount: user.referralCount || 0,
                transactions: transactions,
                canWithdraw: (user.walletBalance || 0) >= MIN_WITHDRAW_AMOUNT && user.subscriptionStatus === 'PRO',
                hasPendingRequest: !!pendingRequest,
                pendingRequest: pendingRequest,
                withdrawalRequests: withdrawalRequests || []
            }
        });
    } catch (error) {
        console.error('getWalletDetails error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
