import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Topic from '@/models/Topic';
import Question from '@/models/Question';
import Quiz from '@/models/Quiz';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const subject = searchParams.get('subject');

        const filter = { isActive: true };
        if (subject) filter.subject = subject;

        const topics = await Topic.find(filter)
            .populate('subject', 'name')
            .sort({ order: 1, name: 1 })
            .lean();

        const topicIds = topics.map(t => t._id);
        if (!topicIds.length) return NextResponse.json({ success: true, data: [], count: 0 });

        const [quizCounts, questionCounts] = await Promise.all([
            Quiz.aggregate([
                { $match: { status: 'published', topic: { $in: topicIds } } },
                { $group: { _id: '$topic', total: { $sum: 1 } } }
            ]),
            Question.aggregate([
                { $match: { isActive: true, topic: { $in: topicIds } } },
                { $group: { _id: '$topic', total: { $sum: 1 } } }
            ])
        ]);

        const qzMap = Object.fromEntries(quizCounts.map(i => [i._id?.toString(), i.total]));
        const questMap = Object.fromEntries(questionCounts.map(i => [i._id?.toString(), i.total]));

        const data = topics.map(t => ({
            ...t,
            quizCount: qzMap[t._id.toString()] || 0,
            questionCount: questMap[t._id.toString()] || 0,
        }));

        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
