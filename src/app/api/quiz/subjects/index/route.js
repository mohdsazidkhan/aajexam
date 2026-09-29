import { NextResponse } from 'next/server';
import { buildSubjectsIndex } from '@/lib/catalogIndex';
import { parseExamIds } from '@/lib/utils/targetExams';

// GET /api/quiz/subjects/index?examIds=a,b - grouped index for the /subjects page
export async function GET(req) {
    try {
        const examIds = parseExamIds(new URL(req.url).searchParams.get('examIds'));
        const data = await buildSubjectsIndex(examIds);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
