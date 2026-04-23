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

        // TIERED ACCESS CHECK
        const currentStatus = (user.subscriptionStatus || 'FREE').toUpperCase();
        
        if (test.isPYQ) {
            // Find max year for this pattern to check if it's "Last Year"
            const maxYearDoc = await PracticeTest.findOne({ examPattern: test.examPattern?._id || test.examPattern, isPYQ: true })
                .sort({ pyqYear: -1 })
                .select('pyqYear')
                .lean();
            
            const isLastYear = test.pyqYear && maxYearDoc && test.pyqYear === maxYearDoc.pyqYear;
            
            if (!isLastYear && currentStatus !== 'PRO' && user.role !== 'admin') {
                return NextResponse.json({
                    success: false,
                    message: 'Only last year\'s PYQs are FREE. Upgrade to PRO to unlock all previous year papers!'
                }, { status: 403 });
            }
        } else {
            // 2. Full Mocks (non-PYQ): First one is FREE, rest are PRO
            if (currentStatus !== 'PRO' && user.role !== 'admin') {
                if ((user.fullMockAttemptCount || 0) >= 1) {
                    return NextResponse.json({
                        success: false,
                        message: 'First Mock was free. Upgrade to PRO for unlimited mocks!'
                    }, { status: 403 });
                }
            }
        }

        let attempt = await UserTestAttempt.findOne({ user: user.id, practiceTest: testId, status: 'InProgress' });
        if (!attempt) {
            attempt = await UserTestAttempt.create({ user: user.id, practiceTest: testId, startedAt: new Date(), status: 'InProgress' });

            // Increment count for first attempt of a mock
            if (!test.isPYQ && (user.subscriptionStatus !== 'pro')) {
                user.fullMockAttemptCount = (user.fullMockAttemptCount || 0) + 1;
                await user.save();
            }
        }

        const safeQuestions = test.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            questionImage: q.questionImage || '',
            options: q.options,
            optionImages: q.optionImages || [],
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
