import { escapeRegex } from '@/lib/utils/pagination';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';
import { markPyqAccess } from '@/lib/subscription';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200);
        const skip = (page - 1) * limit;

        // Get all patterns for this exam
        const patternIds = (await ExamPattern.find({ exam: id }).select('_id').lean()).map(p => p._id);

        if (!patternIds.length) {
            return NextResponse.json({ success: true, data: [], pagination: { page, limit, total: 0, pages: 0 } });
        }

        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        const testFilter = { examPattern: { $in: patternIds } };
        if (search) testFilter.title = new RegExp(escapeRegex(search), 'i');
        if (searchParams.get('pyq') === 'true') testFilter.isPYQ = true;
        if (searchParams.get('pyq') === 'false') testFilter.isPYQ = { $ne: true };
        const yr = parseInt(searchParams.get('year'));
        if (yr) testFilter.pyqYear = yr;

        const [testsRaw, total] = await Promise.all([
            PracticeTest.find(testFilter)
                .populate({ path: 'examPattern', select: 'title duration totalMarks sections negativeMarking' })
                .select('-questions.correctAnswerIndex')
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(limit),
            PracticeTest.countDocuments(testFilter)
        ]);

        const tests = await markPyqAccess(testsRaw);

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
