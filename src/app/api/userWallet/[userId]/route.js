import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserWallet from '@/models/UserWallet';
import UserQuestions from '@/models/UserQuestions';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Extract userId from URL if needed, but usually we use the logged in user's ID
        // The route is /api/userWallet/[userId]/route.js, so we get it from params
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const userId = pathParts[pathParts.length - 1]; // /api/userWallet/USER_ID

        if (auth.user.id !== userId && auth.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const wallet = await UserWallet.findOneAndUpdate(
            { userId },
            { $setOnInsert: { balance: 0, totalEarned: 0 } },
            { upsert: true, new: true }
        );

        const approvedCount = await UserQuestions.countDocuments({ userId, status: 'approved' });

        const pendingRequest = await WithdrawRequest.findOne({
            userId,
            status: 'pending'
        });

        return NextResponse.json({
            success: true,
            data: {
                balance: wallet.balance,
                totalEarned: wallet.totalEarned,
                approvedCount,
                hasPendingRequest: !!pendingRequest,
                pendingRequest: pendingRequest ? {
                    amount: pendingRequest.amount,
                    requestedAt: pendingRequest.requestedAt,
                    status: pendingRequest.status
                } : null,
                totalQuestions: await UserQuestions.countDocuments({ userId })
            }
        });
    } catch (error) {
        console.error('getProUserWallet error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
