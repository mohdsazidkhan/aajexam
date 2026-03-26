import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const authResult = await protect(req);
        if (!authResult.authenticated) {
            return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
        }
        const userId = authResult.user.id;

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const query = {
            user: userId,
            category: 'quiz_reward',
            status: 'completed'
        };

        const [transactions, total] = await Promise.all([
            WalletTransaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            WalletTransaction.countDocuments(query)
        ]);

        const summaryQuery = { ...query };
        if (summaryQuery.user) {
            summaryQuery.user = new mongoose.Types.ObjectId(summaryQuery.user);
        }

        const summary = await WalletTransaction.aggregate([
            { $match: summaryQuery },
            {
                $group: {
                    _id: null,
                    totalRewards: { $sum: '$amount' },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        const stats = summary[0] || { totalRewards: 0, totalTransactions: 0 };

        return NextResponse.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                summary: stats
            }
        });

    } catch (error) {
        console.error('getQuizRewardsHistory error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
