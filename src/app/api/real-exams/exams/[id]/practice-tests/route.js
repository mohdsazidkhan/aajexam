import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        // Get all patterns for this exam
        const patternIds = (await ExamPattern.find({ exam: id }).select('_id').lean()).map(p => p._id);

        if (!patternIds.length) {
            return NextResponse.json({ success: true, data: [], pagination: { page, limit, total: 0, pages: 0 } });
        }

        const [tests, total] = await Promise.all([
            PracticeTest.find({ examPattern: { $in: patternIds } })
                .populate({ path: 'examPattern', select: 'title duration totalMarks sections negativeMarking' })
                .select('-questions.correctAnswerIndex')
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            PracticeTest.countDocuments({ examPattern: { $in: patternIds } })
        ]);

        // Attach user attempt if logged in
        let data = tests;
        const auth = await protect(req);
        if (auth.authenticated && tests.length) {
            const attempts = await UserTestAttempt.find({
                user: auth.user._id,
                practiceTest: { $in: tests.map(t => t._id) },
                status: { $in: ['Completed', 'InProgress'] }
            }).select('practiceTest status score correctCount wrongCount accuracy rank percentile').lean();

            const attemptMap = Object.fromEntries(attempts.map(a => [a.practiceTest.toString(), a]));
            data = tests.map(t => ({
                ...t,
                questionCount: t.questions?.length || 0,
                userAttempt: attemptMap[t._id.toString()] || null
            }));
        } else {
            data = tests.map(t => ({ ...t, questionCount: t.questions?.length || 0 }));
        }

        return NextResponse.json({
            success: true,
            data,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
