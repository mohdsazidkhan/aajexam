import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';
import { hasAccess, canAttemptSubjectTest, canAttemptFullMock } from '@/lib/subscription';

// POST - start a quiz attempt
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { id } = await params;
        const quiz = await Quiz.findOne({ _id: id, status: 'published' })
            .populate({
                path: 'questions',
                match: { isActive: true },
                select: 'questionText options.text difficulty image'
            });

        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        const user = auth.user;

        // TIERED ACCESS CHECK
        const accessAllowed = hasAccess(user, quiz.accessLevel || 'free', quiz.type);
        if (!accessAllowed) {
            return NextResponse.json({
                success: false,
                message: quiz.type === 'full_mock'
                    ? 'First Mock was free. Upgrade to PRO for unlimited mocks!'
                    : 'This is a PRO feature. Upgrade to unlock!'
            }, { status: 403 });
        }

        // DAILY LIMIT CHECK FOR SUBJECT TESTS
        if (quiz.type === 'subject_test') {
            const canAttempt = await canAttemptSubjectTest(user);
            if (!canAttempt) {
                return NextResponse.json({
                    success: false,
                    message: 'Daily limit reached for Subject Tests (2/day). Upgrade to PRO for unlimited!'
                }, { status: 403 });
            }
        }

        // check if user already has an in-progress attempt
        const existing = await QuizAttempt.findOne({ user: user._id, quiz: id, status: 'InProgress' });
        if (existing) {
            return NextResponse.json({ success: true, data: existing, quiz, resumed: true });
        }

        // INCREMENT USAGE COUNTS
        const currentStatus = (user.subscriptionStatus || 'FREE').toUpperCase();
        if (currentStatus === 'FREE') {
            if (quiz.type === 'subject_test') {
                user.dailySubjectTestCount = (user.dailySubjectTestCount || 0) + 1;
                await user.save();
            } else if (quiz.type === 'full_mock') {
                user.fullMockAttemptCount = (user.fullMockAttemptCount || 0) + 1;
                await user.save();
            }
        }

        const attempt = await QuizAttempt.create({
            user: user._id,
            quiz: id,
            totalMarks: quiz.totalMarks,
            answers: quiz.questions.map(q => ({ question: q._id, selectedOptionIndex: -1, isCorrect: false, timeTaken: 0 }))
        });

        return NextResponse.json({ success: true, data: attempt, quiz }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
