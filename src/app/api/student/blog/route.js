import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import { protect } from '@/middleware/auth';
import { stripHtml, generateExcerpt } from '@/utils/text';
import { createNotification } from '@/utils/notifications';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const query = { author: auth.user.id };
        if (status) query.status = status;

        const [blogs, total] = await Promise.all([
            Article.find(query).populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Article.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: blogs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const data = await req.json();
        const { title, content, category, featuredImage } = data;

        if (!title || !content || !category) return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const limit = parseInt(process.env.MONTHLY_USER_MAX_BLOG_LIMIT) || 10;

        const currentCount = await Article.countDocuments({
            author: auth.user.id,
            createdAt: { $gte: startOfMonth }
        });

        if (currentCount >= limit) return NextResponse.json({ success: false, message: 'Monthly limit reached' }, { status: 403 });

        const cleanContent = stripHtml(content);
        const article = new Article({
            ...data,
            author: auth.user.id,
            excerpt: data.excerpt || generateExcerpt(cleanContent),
            metaTitle: data.metaTitle || title.substring(0, 60),
            metaDescription: data.metaDescription || generateExcerpt(cleanContent),
            status: 'pending'
        });

        await article.save();

        await createNotification({
            userId: auth.user.id,
            type: 'blog',
            title: 'New blog submission',
            description: `${title} - Pending review`,
            meta: { articleId: article._id, status: 'pending' }
        });

        return NextResponse.json({ success: true, article }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
