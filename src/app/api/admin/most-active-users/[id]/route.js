import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import Quiz from '@/models/Quiz';
import PracticeTest from '@/models/PracticeTest';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import { getISTRange } from '@/lib/istRange';

const MAX_ROWS = 300;

// GET /api/admin/most-active-users/:id?period=...
// Drill-down for one student: every completed quiz attempt and exam (practice test)
// attempt inside the selected IST period. QuizAttempt.totalTime is seconds,
// UserTestAttempt.totalTime is milliseconds, so exam time is normalised to seconds.
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Valid user ID is required' }, { status: 400 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'all-time';
        const range = getISTRange(period);

        const filter = { user: id, status: 'Completed', ...(range ? { createdAt: range } : {}) };

        const [user, quizDocs, examDocs] = await Promise.all([
            User.findById(id).select('name email').lean(),
            QuizAttempt.find(filter)
                .sort({ createdAt: -1 })
                .limit(MAX_ROWS)
                .populate({ path: 'quiz', model: Quiz, select: 'title totalMarks' })
                .select('quiz score totalMarks totalTime createdAt')
                .lean(),
            UserTestAttempt.find(filter)
                .sort({ createdAt: -1 })
                .limit(MAX_ROWS)
                .populate({ path: 'practiceTest', model: PracticeTest, select: 'title totalMarks' })
                .select('practiceTest score totalTime createdAt')
                .lean(),
        ]);

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const quizzes = quizDocs.map((a) => ({
            id: a._id,
            title: a.quiz?.title || 'Deleted quiz',
            totalMarks: a.totalMarks || a.quiz?.totalMarks || 0,
            score: a.score || 0,
            timeSpent: Math.round(a.totalTime || 0),
            date: a.createdAt,
        }));

        const exams = examDocs.map((a) => ({
            id: a._id,
            title: a.practiceTest?.title || 'Deleted test',
            totalMarks: a.practiceTest?.totalMarks || 0,
            score: a.score || 0,
            timeSpent: Math.round((a.totalTime || 0) / 1000),
            date: a.createdAt,
        }));

        return NextResponse.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
            quizzes,
            exams,
            capped: quizDocs.length >= MAX_ROWS || examDocs.length >= MAX_ROWS,
            period,
        });
    } catch (error) {
        console.error('Admin most-active-users drill-down error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
