import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 10;
        const page = parseInt(searchParams.get('page')) || 1;
        const search = searchParams.get('search');
        const exam = searchParams.get('exam');
        const featured = searchParams.get('featured');
        const skip = (page - 1) * limit;

        const query = { status: 'published' };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (exam) query.exam = exam;
        if (featured === 'true') query.isFeatured = true;

        const blogs = await Blog.find(query)
            .populate('author', 'name email')
            .populate('exam', 'name code')
            .sort({ isPinned: -1, publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Blog.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                blogs,
                pagination: { total, totalPages, page, limit, hasPrev: page > 1, hasNext: page < totalPages }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
