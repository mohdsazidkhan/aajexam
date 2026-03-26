import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import { createNotification } from '@/utils/notifications';
export async function POST(req) {
    try {
        await dbConnect();

        // Manual extraction since we need to handle FormData possibly or JSON
        const contentType = req.headers.get('content-type');
        let body;
        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle via formidable or similar if needed for images
            // For now, simpler JSON or base64 logic if possible, or skip image part for simplicity here
            return NextResponse.json({ success: false, message: 'Multipart not supported in this sync step yet' }, { status: 400 });
        } else {
            body = await req.json();
        }

        const { title, content, excerpt, category, tags, featuredImageAlt, metaTitle, metaDescription, userId } = body;

        if (!title || !content || !category) {
            return NextResponse.json({ success: false, message: 'Title, content, and category are required' }, { status: 400 });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const limit = parseInt(process.env.MONTHLY_USER_MAX_BLOG_LIMIT) || 10;

        const blogsThisMonth = await Article.countDocuments({
            author: userId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        if (blogsThisMonth >= limit) {
            return NextResponse.json({
                success: false,
                message: `You have reached the monthly limit of ${limit} blogs.`
            }, { status: 403 });
        }

        const article = new Article({
            title, content, excerpt, author: userId, category, tags,
            featuredImageAlt, metaTitle, metaDescription, status: 'pending'
        });

        await article.save();

        createNotification({
            userId: userId,
            type: 'blog',
            title: 'New blog submission',
            description: `${title} - Submitted for review`,
            meta: { articleId: article._id, status: 'pending' }
        });

        return NextResponse.json({ success: true, message: 'Blog submitted successfully!', article }, { status: 201 });

    } catch (error) {
        console.error('Blog creation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId'); // In production, get from session
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const query = { author: userId };
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const blogs = await Article.find(query)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: blogs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
