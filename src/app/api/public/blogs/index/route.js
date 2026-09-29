import { NextResponse } from 'next/server';
import { buildBlogIndex } from '@/lib/blogIndex';
import { parseExamIds } from '@/lib/utils/targetExams';

// GET /api/public/blogs/index?examIds=a,b - grouped article index for the /blog page
export async function GET(req) {
    try {
        const examIds = parseExamIds(new URL(req.url).searchParams.get('examIds'));
        const data = await buildBlogIndex(examIds);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
