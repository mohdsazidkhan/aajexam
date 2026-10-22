import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import { protect } from '@/middleware/auth';
import { parsePaging, escapeRegex } from '@/lib/utils/pagination';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const { page, limit, skip, search } = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 20 });

        const filter = { user: auth.user.id, status: 'Completed' };

        // Search runs in the DB: resolve matching tests (title / pattern / exam / category)
        // first, then restrict the attempts to those tests instead of loading every attempt.
        if (search) {
            const rx = new RegExp(escapeRegex(search), 'i');
            const [cats, exams0] = await Promise.all([
                ExamCategory.find({ name: rx }).select('_id').limit(50).lean(),
                Exam.find({ name: rx }).select('_id').limit(200).lean(),
            ]);
            const catExams = cats.length ? await Exam.find({ category: { $in: cats.map(c => c._id) } }).select('_id').limit(500).lean() : [];
            const examIds = [...exams0, ...catExams].map(e => e._id);
            const patterns = await ExamPattern.find({ $or: [{ title: rx }, ...(examIds.length ? [{ exam: { $in: examIds } }] : [])] }).select('_id').limit(1000).lean();
            const tests = await PracticeTest.find({ $or: [{ title: rx }, ...(patterns.length ? [{ examPattern: { $in: patterns.map(p => p._id) } }] : [])] }).select('_id').limit(5000).lean();
            filter.practiceTest = { $in: tests.map(t => t._id) };
        }

        const [total, pageDocs] = await Promise.all([
            UserTestAttempt.countDocuments(filter),
            UserTestAttempt.find(filter)
                .select('-answers')
                .populate({
                    path: 'practiceTest',
                    select: 'title totalMarks duration',
                    populate: { path: 'examPattern', select: 'title', populate: { path: 'exam', select: 'name', populate: { path: 'category', select: 'name type' } } }
                })
                .sort({ submittedAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        const attempts = pageDocs.map(a => ({
            _id: a._id,
            testTitle: a.practiceTest?.title || 'Unknown',
            examName: a.practiceTest?.examPattern?.exam?.name || 'Unknown',
            patternTitle: a.practiceTest?.examPattern?.title || 'Unknown',
            categoryName: a.practiceTest?.examPattern?.exam?.category?.name || 'Unknown',
            score: a.score || 0,
            totalMarks: a.practiceTest?.totalMarks || 0,
            correctCount: a.correctCount || 0,
            wrongCount: a.wrongCount || 0,
            accuracy: a.accuracy || 0,
            rank: a.rank,
            percentile: a.percentile,
            totalTime: a.totalTime || 0,
            submittedAt: a.submittedAt || a.createdAt,
            startedAt: a.startedAt,
            practiceTest: a.practiceTest?._id
        }));

        return NextResponse.json({
            success: true,
            data: {
                attempts,
                pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalAttempts: total }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
