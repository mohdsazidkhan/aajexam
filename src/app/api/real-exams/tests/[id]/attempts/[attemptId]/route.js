import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import { protect } from '@/middleware/auth';
import { evaluateAnswers } from '../../../../helpers';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id: testId, attemptId } = await params;
        const auth = await protect(req);

        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const attempt = await UserTestAttempt.findOne({ _id: attemptId, practiceTest: testId, user: auth.user.id }).lean();
        if (!attempt) return NextResponse.json({ success: false, message: 'Attempt not found' }, { status: 404 });

        const test = await PracticeTest.findById(testId).populate('examPattern', 'title duration totalMarks sections negativeMarking').lean();
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });

        const answerMap = Object.fromEntries(attempt.answers.map(a => [a.questionId?.toString(), a.selectedIndex]));
        const submittedAnswers = test.questions.map(q => answerMap[q._id.toString()] ?? null);

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
