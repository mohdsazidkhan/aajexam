import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Question from '@/models/Question';
import Quiz from '@/models/Quiz';

export async function GET() {
    try {
        await dbConnect();

        const subjects = await Subject.find({ isActive: true })
            .sort({ order: 1, name: 1 })
            .lean();

        const subjectIds = subjects.map(s => s._id);
        if (!subjectIds.length) return NextResponse.json({ success: true, data: [], count: 0 });

        const [quizCounts, questionCounts] = await Promise.all([
            Quiz.aggregate([
                { $match: { status: 'published', subject: { $in: subjectIds } } },
                { $group: { _id: '$subject', total: { $sum: 1 } } }
            ]),
            Question.aggregate([
                { $match: { isActive: true, subject: { $in: subjectIds } } },
                { $group: { _id: '$subject', total: { $sum: 1 } } }
            ])
        ]);

        const qzMap = Object.fromEntries(quizCounts.map(i => [i._id?.toString(), i.total]));
        const questMap = Object.fromEntries(questionCounts.map(i => [i._id?.toString(), i.total]));

        const data = subjects.map(s => ({
            ...s,
            quizCount: qzMap[s._id.toString()] || 0,
            questionCount: questMap[s._id.toString()] || 0,
        }));

        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
