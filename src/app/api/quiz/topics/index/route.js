import { NextResponse } from 'next/server';
import { buildTopicsIndex } from '@/lib/catalogIndex';
import { parseExamIds } from '@/lib/utils/targetExams';

// GET /api/quiz/topics/index?examIds=a,b - grouped index for the /topics page
export async function GET(req) {
    try {
        const examIds = parseExamIds(new URL(req.url).searchParams.get('examIds'));
        const data = await buildTopicsIndex(examIds);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
