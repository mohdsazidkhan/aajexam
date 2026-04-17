import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyNote from '@/models/StudyNote';
import { protect } from '@/middleware/auth';

// POST - Toggle bookmark on note
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { slug } = await params;
        const userId = auth.user._id;

        const note = await StudyNote.findOne({ slug });
        if (!note) return NextResponse.json({ message: 'Note not found' }, { status: 404 });

        const isBookmarked = note.bookmarkedBy.includes(userId);
        if (isBookmarked) {
            note.bookmarkedBy.pull(userId);
            note.bookmarks -= 1;
        } else {
            note.bookmarkedBy.push(userId);
            note.bookmarks += 1;
        }
        await note.save();

        return NextResponse.json({
            success: true,
            data: { bookmarked: !isBookmarked, bookmarks: note.bookmarks }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
