import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import ExamPattern from '@/models/ExamPattern';
import { protect } from '@/middleware/auth';
import { evaluateAnswers } from '../../../../helpers';
import { loadHydratedTest } from '@/lib/utils/hydrateTestQuestions';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id: testId, attemptId } = await params;
        const auth = await protect(req);

        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const [attempt, test] = await Promise.all([
            UserTestAttempt.findOne({ _id: attemptId, practiceTest: testId, user: auth.user.id }).lean(),
            loadHydratedTest(testId),
        ]);
        if (!attempt) return NextResponse.json({ success: false, message: 'Attempt not found' }, { status: 404 });
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });

        const answerMap = Object.fromEntries(attempt.answers.map(a => [a.questionId?.toString(), a.selectedIndex]));
        const submittedAnswers = test.questions.map(q => answerMap[q._id?.toString()] ?? null);

        const evaluation = evaluateAnswers(test.questions, submittedAnswers, test.examPattern.sections);

        return NextResponse.json({
            success: true,
            data: {
                attempt: { ...attempt, answers: evaluation.answerDetails },
                test: { ...test, questions: test.questions.map(q => ({ ...q, correctAnswerIndex: q.correctAnswerIndex })) },
                sectionWiseScore: evaluation.sectionWiseScore
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
