import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';

// GET - List all PYQ tests (public)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get('examId');
        const year = searchParams.get('year');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        let patternFilter = {};
        if (examId) {
            const patterns = await ExamPattern.find({ exam: examId }).select('_id');
            patternFilter.examPattern = { $in: patterns.map(p => p._id) };
        }

        let query = { isPYQ: true, ...patternFilter };
        if (year) query.pyqYear = parseInt(year);

        const [tests, total] = await Promise.all([
            PracticeTest.find(query)
                .populate({ path: 'examPattern', populate: { path: 'exam', select: 'name code' } })
                .select('title totalMarks duration isFree pyqYear pyqShift pyqExamName questions.length publishedAt')
                .sort({ pyqYear: -1, pyqShift: 1 })
                .skip(skip)
                .limit(limit),
            PracticeTest.countDocuments(query)
        ]);

        const testsWithCount = tests.map(t => {
            const obj = t.toObject();
            obj.questionCount = t.questions?.length || 0;
            delete obj.questions;
            return obj;
        });

        return NextResponse.json({
            success: true,
            data: testsWithCount,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
