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
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });

        const test = await PracticeTest.findById(testId).populate('examPattern', 'title duration totalMarks sections negativeMarking').lean();
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });

        const user = auth.user;

        // TIERED ACCESS CHECK — driven by the PracticeTest's own accessLevel
        // field (FREE/PRO), set per document (latest-year PYQ per exam pattern,
        // and the most recently added practice test per exam pattern, are FREE;
        // everything else is PRO). PRO users and admins always pass.
        const currentStatus = (user.subscriptionStatus || 'FREE').toUpperCase();
        const isPro = currentStatus === 'PRO' || user.role === 'admin';

        if (!isPro && test.accessLevel === 'PRO') {
            const message = test.isPYQ
                ? 'Only the latest year\'s PYQ is FREE. Upgrade to PRO to unlock all previous year papers!'
                : 'This practice test is PRO-only. Upgrade to PRO for unlimited mocks!';
            return NextResponse.json({ success: false, message }, { status: 403 });
        }

        let attempt = await UserTestAttempt.findOne({ user: user.id, practiceTest: testId, status: 'InProgress' });
        if (!attempt) {
            attempt = await UserTestAttempt.create({ user: user.id, practiceTest: testId, startedAt: new Date(), status: 'InProgress' });

            // Increment count for first attempt of a mock.
            // subscriptionStatus is stored uppercase ('FREE'/'PRO'), so this must
            // compare against 'PRO' — 'pro' never matched and inflated the counter
            // for PRO users too.
            if (!test.isPYQ && (user.subscriptionStatus !== 'PRO')) {
                user.fullMockAttemptCount = (user.fullMockAttemptCount || 0) + 1;
                await user.save();
            }
        }

        // NOTE: `explanation` and `correctAnswerIndex` are deliberately NOT sent
        // during an in-progress attempt. Explanations name the correct option, so
        // shipping them here would let a user read answers straight off the network
        // response. The review screen fetches them separately from the attempt-detail
        // route (tests/[id]/attempts/[attemptId]) only AFTER submission.
        const safeQuestions = test.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            questionImage: q.questionImage || '',
            options: q.options,
            optionImages: q.optionImages || [],
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
