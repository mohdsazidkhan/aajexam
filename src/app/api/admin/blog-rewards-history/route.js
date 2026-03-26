import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Article from '@/models/Article';
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
        const skip = (page - 1) * limit;
        const rewardTier = searchParams.get('rewardTier') || 'all';
        const search = searchParams.get('search') || '';

        // Build base query
        let query = { category: 'blog_reward', status: 'completed' };

        if (rewardTier !== 'all') {
            query['metadata.rewardTier'] = rewardTier;
        }

        // Search logic
        if (search) {
            const [users, articles] = await Promise.all([
                User.find({
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }).select('_id'),
                Article.find({
                    title: { $regex: search, $options: 'i' }
                }).select('_id')
            ]);

            const userIds = users.map(u => u._id);
            const articleIds = articles.map(a => a._id);

            query.$or = [
                { user: { $in: userIds } },
                { 'metadata.articleId': { $in: articleIds } },
                { 'metadata.articleTitle': { $regex: search, $options: 'i' } }
            ];
        }

        const [transactionsRaw, total] = await Promise.all([
            WalletTransaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email')
                .lean(),
            WalletTransaction.countDocuments(query)
        ]);

        // Manually populate articles to get category and featured image
        const articleIds = transactionsRaw
            .map(tx => tx.metadata?.articleId)
            .filter(id => id);

        const articlesMap = {};
        if (articleIds.length > 0) {
            const articles = await Article.find({ _id: { $in: articleIds } })
                .select('title category featuredImage')
                .populate('category', 'name')
                .lean();

            articles.forEach(a => {
                articlesMap[a._id.toString()] = {
                    ...a,
                    category: a.category?.name || 'Uncategorized'
                };
            });
        }

        const transactions = transactionsRaw.map(tx => ({
            _id: tx._id,
            date: tx.createdAt,
            user: tx.user,
            amount: tx.amount,
            balance: tx.balance,
            rewardTier: tx.metadata?.rewardTier || 'unknown',
            description: tx.description,
            article: tx.metadata?.articleId ? (articlesMap[tx.metadata.articleId.toString()] || {
                _id: tx.metadata.articleId,
                title: tx.metadata.articleTitle || 'Deleted Article',
                category: 'N/A'
            }) : null
        }));

        // Calculate summary for all transactions matching current filters (or all if filters empty)
        // Usually summary shows global stats or current month
        const summaryAggr = await WalletTransaction.aggregate([
            { $match: { category: 'blog_reward', status: 'completed' } },
            {
                $group: {
                    _id: '$metadata.rewardTier',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const summary = {
            totalBlogs: summaryAggr.reduce((sum, item) => sum + item.count, 0), // Assuming 1 tx per blog
            totalRewards: summaryAggr.reduce((sum, item) => sum + item.totalAmount, 0),
            totalTransactions: summaryAggr.reduce((sum, item) => sum + item.count, 0),
            normalRewards: summaryAggr.find(s => s._id === 'normal')?.totalAmount || 0,
            goodRewards: summaryAggr.find(s => s._id === 'good')?.totalAmount || 0,
            highRewards: summaryAggr.find(s => s._id === 'high')?.totalAmount || 0,
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
        console.error('Blog rewards history error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
