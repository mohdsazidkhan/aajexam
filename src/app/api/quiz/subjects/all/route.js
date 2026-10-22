import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Question from '@/models/Question';
import Quiz from '@/models/Quiz';
import Topic from '@/models/Topic';
import { parseExamIds } from '@/lib/utils/targetExams';
import { parsePaging, pagingMeta, escapeRegex } from '@/lib/utils/pagination';

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const examIds = parseExamIds(searchParams.get('examIds'));
        const paging = parsePaging(searchParams, { defaultLimit: 24, maxLimit: 100, legacyCap: 2000 });
        const filter = { isActive: true, ...(examIds.length ? { exams: { $in: examIds } } : {}) };
        if (paging.search) filter.name = new RegExp(escapeRegex(paging.search), 'i');
        const has = searchParams.get('has'); // 'quiz' | 'topic' -> only subjects that have quizzes / topics
        if (has === 'quiz') filter._id = { $in: await Quiz.distinct('subject', { status: 'published' }) };
        else if (has === 'topic') filter._id = { $in: await Topic.distinct('subject', { isActive: true }) };

        const [subjects, totalCount] = await Promise.all([
            Subject.find(filter).sort({ order: 1, name: 1 }).skip(paging.skip).limit(paging.limit).lean(),
            paging.paged ? Subject.countDocuments(filter) : Promise.resolve(0),
        ]);

        const subjectIds = subjects.map(s => s._id);
        if (!subjectIds.length) return NextResponse.json({ success: true, data: [], count: 0, ...(paging.paged ? { pagination: pagingMeta(paging, totalCount) } : {}) });

        const [quizCounts, questionCounts, topicCounts] = await Promise.all([
            Quiz.aggregate([
                { $match: { status: 'published', subject: { $in: subjectIds } } },
                { $group: { _id: '$subject', total: { $sum: 1 } } }
            ]),
            Question.aggregate([
                { $match: { isActive: true, subject: { $in: subjectIds } } },
                { $group: { _id: '$subject', total: { $sum: 1 } } }
            ]),
            Topic.aggregate([
                { $match: { isActive: true, subject: { $in: subjectIds } } },
                { $group: { _id: '$subject', total: { $sum: 1 } } }
            ])
        ]);

        const qzMap = Object.fromEntries(quizCounts.map(i => [i._id?.toString(), i.total]));
        const questMap = Object.fromEntries(questionCounts.map(i => [i._id?.toString(), i.total]));
        const topicMap = Object.fromEntries(topicCounts.map(i => [i._id?.toString(), i.total]));

        const data = subjects.map(s => ({
            ...s,
            quizCount: qzMap[s._id.toString()] || 0,
            questionCount: questMap[s._id.toString()] || 0,
            topicCount: topicMap[s._id.toString()] || 0,
        }));

        return NextResponse.json({ success: true, data, count: data.length, ...(paging.paged ? { pagination: pagingMeta(paging, totalCount) } : {}) });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
