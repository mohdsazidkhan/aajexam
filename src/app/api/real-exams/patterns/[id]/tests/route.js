import { escapeRegex } from '@/lib/utils/pagination';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import UserTestAttempt from '@/models/UserTestAttempt';
import { markPyqAccess } from '@/lib/subscription';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200);
        const skip = (page - 1) * limit;

        const auth = await protect(req);

        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        const testFilter = { examPattern: id };
        if (search) testFilter.title = new RegExp(escapeRegex(search), 'i');
        if (searchParams.get('pyq') === 'true') testFilter.isPYQ = true;
        if (searchParams.get('pyq') === 'false') testFilter.isPYQ = { $ne: true };
        const yr = parseInt(searchParams.get('year'));
        if (yr) testFilter.pyqYear = yr;

        const [testsRaw, total, pattern] = await Promise.all([
            PracticeTest.find(testFilter)
                .populate('examPattern', 'title duration totalMarks sections')
                .select('-questions.correctAnswerIndex')
                .sort({ publishedAt: -1 }).skip(skip).limit(limit),
            PracticeTest.countDocuments(testFilter),
            ExamPattern.findById(id).populate({ path: 'exam', populate: { path: 'category', select: 'name type' } }).lean()
        ]);

        const tests = await markPyqAccess(testsRaw);
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
