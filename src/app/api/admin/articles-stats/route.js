import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const [
            totalArticles,
            publishedArticles,
            draftArticles,
            pinnedArticles,
            featuredArticles,
            statsResult
        ] = await Promise.all([
            Article.countDocuments(),
            Article.countDocuments({ status: 'published' }),
            Article.countDocuments({ status: 'draft' }),
            Article.countDocuments({ isPinned: true }),
            Article.countDocuments({ isFeatured: true }),
            Article.aggregate([
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: '$views' },
                        totalLikes: { $sum: '$likes' }
                    }
                }
            ])
        ]);

        const totalViews = statsResult[0]?.totalViews || 0;
        const totalLikes = statsResult[0]?.totalLikes || 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalArticles,
                publishedArticles,
                draftArticles,
                pinnedArticles,
                featuredArticles,
                totalViews,
                totalLikes
            }
        });
    } catch (error) {
        console.error('Article stats error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
