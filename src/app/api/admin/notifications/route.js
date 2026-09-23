import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import PracticeTest from '@/models/PracticeTest';
import Quiz from '@/models/Quiz';
import Subject from '@/models/Subject';
import { protect, admin } from '@/middleware/auth';

// Referenced only so their schemas are registered for populate() below.
void User; void ExamCategory; void Subject;

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const [notifications, total, typeCountsAgg] = await Promise.all([
            Notification.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name username email')
                .lean(),
            Notification.countDocuments({}),
            Notification.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        // Enrich "exam_attempt" (govt exam test submitted) with Exam / Category / Test Title.
        const isValidObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v));
        const examAttemptNotifs = notifications.filter((n) => n.type === 'exam_attempt' && isValidObjectId(n.meta?.examId));
        if (examAttemptNotifs.length) {
            const examIds = [...new Set(examAttemptNotifs.map((n) => String(n.meta.examId)))];
            const testIds = [...new Set(examAttemptNotifs.filter((n) => isValidObjectId(n.meta?.testId)).map((n) => String(n.meta.testId)))];
            const [exams, tests] = await Promise.all([
                Exam.find({ _id: { $in: examIds } }).select('name category').populate('category', 'name').lean(),
                testIds.length ? PracticeTest.find({ _id: { $in: testIds } }).select('title').lean() : []
            ]);
            const examMap = new Map(exams.map((e) => [String(e._id), e]));
            const testMap = new Map(tests.map((t) => [String(t._id), t]));
            for (const n of examAttemptNotifs) {
                const exam = examMap.get(String(n.meta.examId));
                const test = n.meta.testId ? testMap.get(String(n.meta.testId)) : null;
                n.extra = {
                    examName: exam?.name || null,
                    categoryName: exam?.category?.name || null,
                    testTitle: test?.title || null
                };
            }
        }

        // Enrich "quiz_attempt" with Quiz Title / Subject (Subcategory) / Category.
        const quizAttemptNotifs = notifications.filter((n) => n.type === 'quiz_attempt' && n.meta?.quizId);
        if (quizAttemptNotifs.length) {
            const quizIds = [...new Set(quizAttemptNotifs.map((n) => String(n.meta.quizId)))];
            const quizzes = await Quiz.find({ _id: { $in: quizIds } })
                .select('title subject applicableExams')
                .populate('subject', 'name')
                .populate({ path: 'applicableExams', select: 'name category', populate: { path: 'category', select: 'name' } })
                .lean();
            const quizMap = new Map(quizzes.map((q) => [String(q._id), q]));
            for (const n of quizAttemptNotifs) {
                const quiz = quizMap.get(String(n.meta.quizId));
                n.extra = {
                    quizTitle: quiz?.title || null,
                    subCategoryName: quiz?.subject?.name || null,
                    categoryName: quiz?.applicableExams?.[0]?.category?.name || null
                };
            }
        }

        const typeCounts = typeCountsAgg.map((t) => ({ type: t._id, count: t.count }));

        return NextResponse.json({
            notifications,
            typeCounts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        await Notification.deleteMany({});
        return NextResponse.json({ message: 'All notifications cleared' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
