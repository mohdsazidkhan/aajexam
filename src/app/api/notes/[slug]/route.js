import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyNote from '@/models/StudyNote';

// GET - Single note by slug
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;
        const note = await StudyNote.findOne({ slug, status: 'published' })
            .populate('subject', 'name')
            .populate('topic', 'name')
            .populate('exam', 'name code')
            .populate('contributor', 'name username')
            .lean();

        if (!note) return NextResponse.json({ message: 'Note not found' }, { status: 404 });

        note.views += 1;
        // Fire-and-forget: the response already reflects the incremented count,
        // no need to block the response on the write completing.
        StudyNote.updateOne({ _id: note._id }, { $inc: { views: 1 } }).catch((e) => console.error('View increment failed:', e));

        return NextResponse.json({ success: true, data: note });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
