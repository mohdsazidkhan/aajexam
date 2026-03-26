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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        // Base query for quiz rewards
        let query = { category: 'quiz_reward', status: 'completed' };

        // Search logic
        if (search) {
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);

            query.$or = [
                { user: { $in: userIds } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [transactions, total, summaryResult] = await Promise.all([
            WalletTransaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email')
                .lean(),
            WalletTransaction.countDocuments(query),
            WalletTransaction.aggregate([
                { $match: { category: 'quiz_reward', status: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalRewards: { $sum: '$amount' },
                        totalTransactions: { $sum: 1 }
                    }
                }
            ])
        ]);

        const summary = summaryResult[0] || { totalRewards: 0, totalTransactions: 0 };

        return NextResponse.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    limit
                },
                summary: {
                    totalRewards: summary.totalRewards || 0,
                    totalTransactions: summary.totalTransactions || 0
                }
            }
        });
    } catch (error) {
        console.error('Quiz rewards history error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
