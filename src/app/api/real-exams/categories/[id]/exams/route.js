import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const exams = await Exam.find({ category: id, isActive: true })
            .populate('category', 'name type')
            .sort({ name: 1 })
            .lean();

        const examIds = exams.map(e => e._id);
        if (!examIds.length) return NextResponse.json({ success: true, data: [], count: 0 });

        const [patterns, tests] = await Promise.all([
            ExamPattern.aggregate([
                { $match: { exam: { $in: examIds } } },
                { $group: { _id: '$exam', total: { $sum: 1 } } }
            ]),
            PracticeTest.aggregate([
                { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
                { $unwind: '$pattern' },
                { $match: { 'pattern.exam': { $in: examIds } } },
                { $group: { _id: '$pattern.exam', total: { $sum: 1 } } }
            ])
        ]);

        const patternMap = Object.fromEntries(patterns.map(i => [i._id.toString(), i.total]));
        const testMap = Object.fromEntries(tests.map(i => [i._id.toString(), i.total]));

        const data = exams.map(e => ({
            ...e,
            patternCount: patternMap[e._id.toString()] || 0,
            testCount: testMap[e._id.toString()] || 0
        }));

        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
