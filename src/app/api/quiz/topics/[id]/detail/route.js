import { NextResponse } from 'next/server';
import { parsePaging, pagingMeta, escapeRegex } from '@/lib/utils/pagination';
import dbConnect from '@/lib/db';
import Topic from '@/models/Topic';
import Quiz from '@/models/Quiz';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const topic = await Topic.findById(id)
            .populate('subject', 'name')
            .populate('exams', 'name code')
            .lean();
        if (!topic) return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });
        // Merged/deactivated duplicate — its quizzes were repointed to mergedInto.
        if (topic.isActive === false) {
            return NextResponse.json({
                success: false,
                message: 'Topic not found',
                mergedInto: topic.mergedInto ? String(topic.mergedInto) : undefined,
            }, { status: 404 });
        }

        // Quizzes for this topic
        const { searchParams } = new URL(req.url);
        const paging = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 500 });
        const quizFilter = { topic: id, status: 'published' };
        if (paging.search) quizFilter.title = new RegExp(escapeRegex(paging.search), 'i');
        const difficulty = searchParams.get('difficulty');
        if (difficulty) quizFilter.difficulty = difficulty;

        const [quizzes, quizTotal] = await Promise.all([
        Quiz.find(quizFilter)
            .populate('subject', 'name')
            .populate('applicableExams', 'name code')
            .select('-questions')
            .sort({ publishedAt: -1 })
            .skip(paging.skip)
            .limit(paging.limit)
            .lean(),
        paging.paged ? Quiz.countDocuments(quizFilter) : Promise.resolve(0),
        ]);

        return NextResponse.json({
            success: true,
            topic,
            quizzes,
            ...(paging.paged ? { pagination: pagingMeta(paging, quizTotal) } : {}),
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
