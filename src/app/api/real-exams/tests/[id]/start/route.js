import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id: testId } = await params;
        const auth = await protect(req);

        const test = await PracticeTest.findById(testId).populate('examPattern', 'title duration totalMarks sections').lean();
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });

        let attempt = null;
        if (auth.authenticated) {
            attempt = await UserTestAttempt.findOne({ user: auth.user.id, practiceTest: testId, status: 'InProgress' });
            if (!attempt) {
                attempt = await UserTestAttempt.create({ user: auth.user.id, practiceTest: testId, startedAt: new Date(), status: 'InProgress' });
            }
        }

        const safeQuestions = test.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            explanation: q.explanation,
            section: q.section,
            tags: q.tags,
            difficulty: q.difficulty
        }));

        return NextResponse.json({
            success: true,
            data: {
                _id: test._id,
                title: test.title,
                totalMarks: test.totalMarks,
                duration: test.duration,
                examPattern: test.examPattern,
                questions: safeQuestions,
                attemptId: attempt?._id || null,
                startedAt: attempt?.startedAt || null
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
