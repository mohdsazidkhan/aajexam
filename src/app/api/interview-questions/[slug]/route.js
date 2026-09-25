import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewQuestion from '@/models/InterviewQuestion';

// GET - Single interview question by slug
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;
        const question = await InterviewQuestion.findOne({ slug, status: 'published' })
            .populate('category', 'name slug type')
            .lean();

        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });

        question.views += 1;
        // Fire-and-forget: the response already reflects the incremented count,
        // no need to block the response on the write completing.
        InterviewQuestion.updateOne({ _id: question._id }, { $inc: { views: 1 } }).catch((e) => console.error('View increment failed:', e));

        return NextResponse.json({ success: true, data: question });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
