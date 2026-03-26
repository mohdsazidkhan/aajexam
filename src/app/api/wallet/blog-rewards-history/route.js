import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import Article from '@/models/Article';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const query = { user: auth.user.id, category: 'blog_reward', status: 'completed' };

        const [transactions, total, summaryResult] = await Promise.all([
            WalletTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            WalletTransaction.countDocuments(query),
            WalletTransaction.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(auth.user.id), category: 'blog_reward', status: 'completed' } },
                { $group: { _id: null, totalEarnings: { $sum: '$amount' }, totalBlogs: { $sum: 1 } } }
            ])
        ]);

        const txWithDetails = await Promise.all(transactions.map(async (tx) => {
            let article = null;
            if (tx.metadata?.articleId) {
                article = await Article.findById(tx.metadata.articleId).select('title status rewardTier rewardAmount featuredImage').lean();
            }
            return { ...tx, article, articleTitle: tx.metadata?.articleTitle || article?.title || 'Unknown' };
        }));

        const summary = summaryResult[0] || { totalEarnings: 0, totalBlogs: 0 };

        return NextResponse.json({
            success: true,
            data: {
                transactions: txWithDetails,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
                summary: { totalEarnings: summary.totalEarnings || 0, totalBlogs: summary.totalBlogs || 0 }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
