import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const type = searchParams.get('type') || 'all';
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        // Build query for WalletTransactions
        // We look for 'bonus' category and referral metadata
        let query = {
            category: 'bonus',
            'metadata.referralType': { $exists: true }
        };

        if (type !== 'all') {
            query['metadata.referralType'] = type;
        }

        // Search logic - if search is provided, we might need to filter by user name/email
        // This is complex with aggregation, so we'll handle basic search if possible or just filter by inviter
        if (search) {
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = users.map(u => u._id);
            query.user = { $in: userIds };
        }

        const [transactionsRaw, total] = await Promise.all([
            WalletTransaction.find(query)
                .sort({ processedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email referralCode'),
            WalletTransaction.countDocuments(query)
        ]);

        // Manually populate invitees from metadata
        const inviteeIds = transactionsRaw
            .map(tx => tx.metadata?.inviteeUserId)
            .filter(id => id);

        const invitees = await User.find({ _id: { $in: inviteeIds } })
            .select('name email');

        const inviteeMap = invitees.reduce((acc, user) => {
            acc[user._id.toString()] = user;
            return acc;
        }, {});

        const transactions = transactionsRaw.map(tx => ({
            _id: tx._id,
            date: tx.processedAt || tx.createdAt,
            inviter: tx.user,
            invitee: tx.metadata?.inviteeUserId ? inviteeMap[tx.metadata.inviteeUserId.toString()] : null,
            rewardType: tx.metadata?.referralType || 'unknown',
            amount: tx.amount,
            balance: tx.balance,
            description: tx.description
        }));

        // Calculate summary
        const summaryAggr = await WalletTransaction.aggregate([
            { $match: { category: 'bonus', 'metadata.referralType': { $exists: true } } },
            {
                $group: {
                    _id: '$metadata.referralType',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const summary = {
            totalRewards: summaryAggr.reduce((sum, item) => sum + item.totalAmount, 0),
            totalTransactions: summaryAggr.reduce((sum, item) => sum + item.count, 0),
            registrationRewards: summaryAggr.find(s => s._id === 'registration')?.totalAmount || 0,
            plan9Rewards: summaryAggr.find(s => s._id === 'plan9')?.totalAmount || 0,
            plan49Rewards: summaryAggr.find(s => s._id === 'plan49')?.totalAmount || 0,
            plan99Rewards: summaryAggr.find(s => s._id === 'plan99')?.totalAmount || 0,
        };

        return NextResponse.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit)
                },
                summary
            }
        });
    } catch (error) {
        console.error('Referral history error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
