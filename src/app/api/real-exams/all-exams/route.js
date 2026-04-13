import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import Quiz from '@/models/Quiz';

export async function GET() {
    try {
        await dbConnect();

        const [exams, practiceTestCounts, quizCounts] = await Promise.all([
            Exam.find({ isActive: true })
                .populate('category', 'name type')
                .sort({ name: 1 })
                .lean(),

            // Practice test count per exam (through patterns)
            PracticeTest.aggregate([
                { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
                { $unwind: '$pattern' },
                { $group: { _id: '$pattern.exam', total: { $sum: 1 } } }
            ]),

            // Quiz count per exam
            Quiz.aggregate([
                { $match: { status: 'published' } },
                { $group: { _id: '$exam', total: { $sum: 1 } } }
            ])
        ]);

        const ptMap = Object.fromEntries(practiceTestCounts.map(i => [i._id?.toString(), i.total]));
        const qzMap = Object.fromEntries(quizCounts.map(i => [i._id?.toString(), i.total]));

        const data = exams.map(e => ({
            ...e,
            practiceTestCount: ptMap[e._id.toString()] || 0,
            quizCount: qzMap[e._id.toString()] || 0,
        }));

        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
