import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const auth = await protect(req);

        const [tests, total, pattern] = await Promise.all([
            PracticeTest.find({ examPattern: id })
                .populate('examPattern', 'title duration totalMarks sections')
                .select('-questions.correctAnswerIndex')
                .sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
            PracticeTest.countDocuments({ examPattern: id }),
            ExamPattern.findById(id).populate({ path: 'exam', populate: { path: 'category', select: 'name type' } }).lean()
        ]);

        let data = tests;
        if (auth.authenticated && tests.length) {
            const attempts = await UserTestAttempt.find({
                user: auth.user.id,
                practiceTest: { $in: tests.map(t => t._id) },
                status: { $in: ['Completed', 'InProgress'] }
            }).select('practiceTest status score correctCount wrongCount submittedAt accuracy rank percentile').lean();

            const attemptMap = Object.fromEntries(attempts.map(a => [a.practiceTest.toString(), a]));
            data = tests.map(t => ({
                ...t,
                userAttempt: attemptMap[t._id.toString()] ? {
                    attemptId: attemptMap[t._id.toString()]._id,
                    ...attemptMap[t._id.toString()]
                } : null
            }));
        }

        return NextResponse.json({
            success: true,
            data,
            pattern,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
