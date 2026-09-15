import { NextResponse } from 'next/server';
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
        const quizzes = await Quiz.find({ subject: id, status: 'published' })
            .populate('topic', 'name')
            .populate('applicableExams', 'name code')
            .select('-questions')
            .sort({ publishedAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            subject,
            quizzes,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
