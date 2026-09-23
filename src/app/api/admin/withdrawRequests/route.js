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
        const search = (searchParams.get('search') || '').trim();
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(250, Math.max(1, parseInt(searchParams.get('limit') || '25')));
        const skip = (page - 1) * limit;

        const filter = {};
        if (status) filter.status = status;
        if (userId) filter.userId = userId;

        if (search) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            const [matchingUsers, matchingBankDetails] = await Promise.all([
                User.find({ $or: [{ name: regex }, { email: regex }] }).select('_id').lean(),
                BankDetail.find({ accountNumber: regex }).select('user').lean()
            ]);
            const userIds = [
                ...matchingUsers.map((u) => u._id),
                ...matchingBankDetails.map((b) => b.user)
            ];
            filter.$or = [{ userId: { $in: userIds } }, { upi: regex }];
        }

        const [items, total, statusCountsAgg] = await Promise.all([
            WithdrawRequest.find(filter)
                .sort({ requestedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email phone')
                .lean(),
            WithdrawRequest.countDocuments(filter),
            WithdrawRequest.aggregate([
                { $match: search ? { $or: filter.$or } : {} },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const statusCounts = statusCountsAgg.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
        statusCounts.all = statusCountsAgg.reduce((sum, s) => sum + s.count, 0);

        // Optimization: Collect user IDs and bulk fetch bank details/wallet info
        const userIds = items.map(item => item.userId?._id).filter(Boolean);
        
        const [bankDetails, userStates] = await Promise.all([
            BankDetail.find({ user: { $in: userIds } }).lean(),
            User.find({ _id: { $in: userIds } }).select('walletBalance subscriptionStatus').lean()
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
            return {
                ...item,
                bankDetail,
                userWalletBalance: userState?.walletBalance || 0,
                userIsPro: userState?.subscriptionStatus === 'PRO'
            };
        });

        return NextResponse.json({
            success: true,
            data: enrichedItems,
            statusCounts,
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
