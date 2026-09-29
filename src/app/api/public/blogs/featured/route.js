import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { parseExamIds, applyExamScope } from '@/lib/utils/targetExams';

export async function GET(req) {
    try {
        await dbConnect();
        const query = applyExamScope({ status: 'published', isFeatured: true }, parseExamIds(new URL(req.url).searchParams.get('examIds')));
        const blogs = await Blog.find(query)
            .populate('author', 'name email')
            .populate('exam', 'name code')
            .sort({ publishedAt: -1 })
            .limit(5)
            .lean();
        return NextResponse.json({ success: true, data: blogs });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
