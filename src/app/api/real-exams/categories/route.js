import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamCategory from '@/models/ExamCategory';
import Exam from '@/models/Exam';
import PracticeTest from '@/models/PracticeTest';

export async function GET() {
    try {
        await dbConnect();
        const [categories, examCounts, testCounts] = await Promise.all([
            ExamCategory.find().sort({ type: 1, name: 1 }).lean(),
            Exam.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$category', total: { $sum: 1 } } }
            ]),
            PracticeTest.aggregate([
                { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
                { $unwind: '$pattern' },
                { $lookup: { from: 'exams', localField: 'pattern.exam', foreignField: '_id', as: 'exam' } },
                { $unwind: '$exam' },
                { $match: { 'exam.isActive': true } },
                { $group: { _id: '$exam.category', total: { $sum: 1 } } }
            ])
        ]);

        const examCountMap = Object.fromEntries(examCounts.map(i => [i._id?.toString(), i.total]));
        const testCountMap = Object.fromEntries(testCounts.map(i => [i._id?.toString(), i.total]));

        const data = categories.map(c => ({
            ...c,
            examCount: examCountMap[c._id.toString()] || 0,
            testCount: testCountMap[c._id.toString()] || 0
        }));

        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
