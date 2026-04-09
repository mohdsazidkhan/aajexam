import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { examId } = await params;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 12;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        const query = { status: 'published', exam: examId };

        const blogs = await Blog.find(query)
            .populate('author', 'name email')
            .populate('exam', 'name code')
            .sort({ publishedAt: -1 })
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
