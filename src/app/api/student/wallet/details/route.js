import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.MIN_WITHDRAW_AMOUNT || '1000', 10);

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const userId = auth.user.id;
        const user = await User.findById(userId).select('walletBalance referralCode referredBy referralRewards subscriptionStatus');

        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        const transactions = await WalletTransaction.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .select('type amount balance description category status createdAt metadata');

        const pendingRequest = await WithdrawRequest.findOne({ userId: userId, status: 'pending' })
            .select('amount requestedAt status');

        const withdrawalRequests = await WithdrawRequest.find({ userId: userId })
            .sort({ requestedAt: -1 })
            .limit(20)
            .select('amount status requestedAt processedAt upi bankDetails')
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                walletBalance: user.walletBalance || 0,
                referralCode: user.referralCode,
                referredBy: user.referredBy,
                referralRewards: user.referralRewards || [],
                transactions,
                canWithdraw: (user.walletBalance || 0) >= MIN_WITHDRAW_AMOUNT && user.subscriptionStatus === 'pro',
                hasPendingRequest: !!pendingRequest,
                pendingRequest: pendingRequest ? {
                    amount: pendingRequest.amount,
                    requestedAt: pendingRequest.requestedAt,
                    status: pendingRequest.status
                } : null,
                withdrawalRequests: withdrawalRequests || []
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
