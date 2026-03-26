import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WithdrawRequest from '@/models/WithdrawRequest';
import BankDetail from '@/models/BankDetail';
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
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const filter = {};
        if (status) filter.status = status;
        if (userId) filter.userId = userId;

        const [items, total] = await Promise.all([
            WithdrawRequest.find(filter)
                .sort({ requestedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email phone')
                .lean(),
            WithdrawRequest.countDocuments(filter)
        ]);

        // Enrich with bank details and wallet info
        const enrichedItems = await Promise.all(items.map(async (item) => {
            if (item.userId) {
                const bankDetail = await BankDetail.findOne({ user: item.userId._id }).lean();
                const user = await User.findById(item.userId._id).select('walletBalance isTopPerformer').lean();
                const isReferralWithdrawal = item.metadata?.isTopPerformer !== undefined;
                return {
                    ...item,
                    bankDetail,
                    userWalletBalance: user?.walletBalance || 0,
                    userIsTopPerformer: user?.isTopPerformer || false,
                    requestType: isReferralWithdrawal ? 'referral' : 'pro'
                };
            }
            const isReferralWithdrawal = item.metadata?.isTopPerformer !== undefined;
            return {
                ...item,
                requestType: isReferralWithdrawal ? 'referral' : 'pro'
            };
        }));

        return NextResponse.json({
            success: true,
            data: enrichedItems,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('List withdraw requests error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
