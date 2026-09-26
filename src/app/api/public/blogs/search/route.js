import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { escapeRegex } from '@/lib/utils/regex';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get('q') || '').slice(0, 100);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        if (!q) {
            return NextResponse.json({ success: false, error: 'Search query is required' }, { status: 400 });
        }

        const safeQ = escapeRegex(q);
        const query = {
            status: 'published',
            $or: [
                { title: { $regex: safeQ, $options: 'i' } },
                { content: { $regex: safeQ, $options: 'i' } },
                { tags: { $in: [new RegExp(safeQ, 'i')] } }
            ]
        };

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate('author', 'name email')
                .populate('exam', 'name code')
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Blog.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: { blogs, total, page, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
