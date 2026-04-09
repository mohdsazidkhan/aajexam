import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit')) || 10;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        if (!q) {
            return NextResponse.json({ success: false, error: 'Search query is required' }, { status: 400 });
        }

        const query = {
            status: 'published',
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        };

        const blogs = await Blog.find(query)
            .populate('author', 'name email')
            .populate('exam', 'name code')
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Blog.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: { blogs, total, page, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
