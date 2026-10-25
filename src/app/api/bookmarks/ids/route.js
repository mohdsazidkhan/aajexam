import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bookmark, { BOOKMARK_TYPES } from '@/models/Bookmark';
import StudyNote from '@/models/StudyNote';
import { protect } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

// GET /api/bookmarks/ids?type=test — every content id (notes: slug) the student has saved of that
// type. One small request fills all the bookmark buttons on a page.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: true, data: [] });
        await dbConnect();
        const type = new URL(req.url).searchParams.get('type');

        if (type === 'note') {
            const notes = await StudyNote.find({ bookmarkedBy: auth.user._id }).select('slug').lean();
            return NextResponse.json({ success: true, data: notes.map((n) => n.slug) });
        }
        if (!BOOKMARK_TYPES.includes(type)) return NextResponse.json({ success: false, message: 'Invalid type' }, { status: 400 });

        const rows = await Bookmark.find({ user: auth.user._id, type }).select('refId').lean();
        return NextResponse.json({ success: true, data: rows.map((r) => String(r.refId)) });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
