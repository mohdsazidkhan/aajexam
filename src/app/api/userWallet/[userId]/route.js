import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserWallet from '@/models/UserWallet';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;

        if (auth.user.id !== userId && auth.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const wallet = await UserWallet.findOneAndUpdate(
            { userId },
            { $setOnInsert: { balance: 0, totalEarned: 0 } },
            { upsert: true, new: true }
        );

        const pendingRequest = await WithdrawRequest.findOne({
            userId,
            status: 'pending'
        });

        return NextResponse.json({
            success: true,
            data: {
                balance: wallet.balance,
                totalEarned: wallet.totalEarned,
                hasPendingRequest: !!pendingRequest,
                pendingRequest: pendingRequest ? {
                    amount: pendingRequest.amount,
                    requestedAt: pendingRequest.requestedAt,
                    status: pendingRequest.status
                } : null
            }
        });
    } catch (error) {
        console.error('getProUserWallet error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
