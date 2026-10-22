import { NextResponse } from 'next/server';
import { parsePaging, pagingMeta, escapeRegex } from '@/lib/utils/pagination';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Quiz from '@/models/Quiz';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const subject = await Subject.findById(id).lean();
        if (!subject) return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
        // A merged/deactivated duplicate (data-cleanup artifact) has no live
        // content of its own anymore — its quizzes were repointed to
        // mergedInto, so treat it as not-found here too rather than returning
        // a stale name with an empty quiz list.
        if (subject.isActive === false) {
            return NextResponse.json({
                success: false,
                message: 'Subject not found',
                mergedInto: subject.mergedInto ? String(subject.mergedInto) : undefined,
            }, { status: 404 });
        }

        // Quizzes for this subject
        const { searchParams } = new URL(req.url);
        const paging = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 500 });
        const quizFilter = { subject: id, status: 'published' };
        if (paging.search) quizFilter.title = new RegExp(escapeRegex(paging.search), 'i');
        const difficulty = searchParams.get('difficulty');
        if (difficulty) quizFilter.difficulty = difficulty;

        const [quizzes, quizTotal] = await Promise.all([
        Quiz.find(quizFilter)
            .populate('topic', 'name')
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
            subject,
            quizzes,
            ...(paging.paged ? { pagination: pagingMeta(paging, quizTotal) } : {}),
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
