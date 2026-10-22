import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Topic from '@/models/Topic';
import Subject from '@/models/Subject';
import Question from '@/models/Question';
import Quiz from '@/models/Quiz';
import { parseExamIds } from '@/lib/utils/targetExams';
import { parsePaging, pagingMeta, escapeRegex } from '@/lib/utils/pagination';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const subject = searchParams.get('subject');

        const filter = { isActive: true };
        if (subject) filter.subject = subject;
        const examIds = parseExamIds(searchParams.get('examIds'));
        if (examIds.length) filter.exams = { $in: examIds };

        const paging = parsePaging(searchParams, { defaultLimit: 24, maxLimit: 100, legacyCap: 5000 });
        if (paging.search) {
            const rx = new RegExp(escapeRegex(paging.search), 'i');
            const subjIds = await Subject.find({ name: rx }).select('_id').limit(100).lean();
            filter.$or = [{ name: rx }, ...(subjIds.length ? [{ subject: { $in: subjIds.map(x => x._id) } }] : [])];
        }
        const has = searchParams.get('has'); // 'quiz' | 'question' -> only topics that have quizzes / questions
        if (has === 'quiz') filter._id = { $in: await Quiz.distinct('topic', { status: 'published' }) };
        else if (has === 'question') filter._id = { $in: await Question.distinct('topic', { isActive: true }) };

        const [topics, totalCount] = await Promise.all([
            Topic.find(filter)
                .populate('subject', 'name')
                .populate('exams', 'name code')
                .sort({ order: 1, name: 1 })
                .skip(paging.skip)
                .limit(paging.limit)
                .lean(),
            paging.paged ? Topic.countDocuments(filter) : Promise.resolve(0),
        ]);

        const topicIds = topics.map(t => t._id);
        if (!topicIds.length) return NextResponse.json({ success: true, data: [], count: 0, ...(paging.paged ? { pagination: pagingMeta(paging, totalCount) } : {}) });

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

        const response = NextResponse.json({ success: true, data, count: data.length, ...(paging.paged ? { pagination: pagingMeta(paging, totalCount) } : {}) });
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
        return response;
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
