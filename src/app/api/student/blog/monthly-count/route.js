import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentCount = await Article.countDocuments({
            author: auth.user.id,
            createdAt: { $gte: startOfMonth }
        });

        const limit = parseInt(process.env.MONTHLY_USER_MAX_BLOG_LIMIT) || 10;

        return NextResponse.json({
            success: true,
            data: { currentCount, limit, remaining: Math.max(0, limit - currentCount), canAddMore: currentCount < limit }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
