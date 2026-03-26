import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import Article from '@/models/Article';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const userId = auth.user.id;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const query = { user: userId, category: 'blog_reward', status: 'completed' };

        const [transactions, total, summaryResult] = await Promise.all([
            WalletTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            WalletTransaction.countDocuments(query),
            WalletTransaction.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId), category: 'blog_reward', status: 'completed' } },
                { $group: { _id: null, totalEarnings: { $sum: '$amount' }, totalBlogs: { $sum: 1 } } }
            ])
        ]);

        const summary = summaryResult[0] || { totalEarnings: 0, totalBlogs: 0 };

        const transactionsWithDetails = await Promise.all(
            transactions.map(async (tx) => {
                const article = tx.metadata?.articleId ? await Article.findById(tx.metadata.articleId).select('title status rewardTier rewardAmount').lean() : null;
                return {
                    ...tx,
                    article,
                    articleTitle: tx.metadata?.articleTitle || article?.title || 'Unknown'
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: {
                transactions: transactionsWithDetails,
                pagination: { currentPage: page, limit, total, totalPages: Math.ceil(total / limit) },
                summary: { totalEarnings: summary.totalEarnings || 0, totalBlogs: summary.totalBlogs || 0 }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
