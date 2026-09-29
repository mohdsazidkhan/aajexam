import { NextResponse } from 'next/server';
import { buildQuizzesIndex } from '@/lib/quizzesIndex';
import { parseExamIds } from '@/lib/utils/targetExams';

// GET /api/quiz/index?examIds=a,b - subjects, latest quizzes and PYQ banks for the /quizzes page
export async function GET(req) {
    try {
        const examIds = parseExamIds(new URL(req.url).searchParams.get('examIds'));
        const data = await buildQuizzesIndex(examIds);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
