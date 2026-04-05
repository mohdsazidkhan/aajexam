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

        // Optimization: Collect user IDs and bulk fetch bank details/wallet info
        const userIds = items.map(item => item.userId?._id).filter(Boolean);
        
        const [bankDetails, userStates] = await Promise.all([
            BankDetail.find({ user: { $in: userIds } }).lean(),
            User.find({ _id: { $in: userIds } }).select('walletBalance isTopPerformer').lean()
        ]);

        const bankDetailsMap = bankDetails.reduce((acc, bd) => {
            acc[bd.user.toString()] = bd;
            return acc;
        }, {});

        const usersMap = userStates.reduce((acc, u) => {
            acc[u._id.toString()] = u;
            return acc;
        }, {});

        const enrichedItems = items.map(item => {
            const userIdStr = item.userId?._id?.toString();
            const bankDetail = userIdStr ? bankDetailsMap[userIdStr] : null;
            const userState = userIdStr ? usersMap[userIdStr] : null;
            const isReferralWithdrawal = item.metadata?.isTopPerformer !== undefined;

            return {
                ...item,
                bankDetail,
                userWalletBalance: userState?.walletBalance || 0,
                userIsTopPerformer: userState?.isTopPerformer || false,
                requestType: isReferralWithdrawal ? 'referral' : 'pro'
            };
        });

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
