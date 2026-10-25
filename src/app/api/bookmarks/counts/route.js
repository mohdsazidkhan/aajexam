import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bookmark, { BOOKMARK_TYPES } from '@/models/Bookmark';
import StudyNote from '@/models/StudyNote';
import ReelInteraction from '@/models/ReelInteraction';
import { protect } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

// GET /api/bookmarks/counts — saved items per type, for the tab badges.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
        await dbConnect();
        const userId = auth.user._id;

        const [grouped, notes, reels] = await Promise.all([
            Bookmark.aggregate([{ $match: { user: userId } }, { $group: { _id: '$type', n: { $sum: 1 } } }]),
            StudyNote.countDocuments({ bookmarkedBy: userId, status: 'published' }),
            ReelInteraction.countDocuments({ userId, bookmarked: true }),
        ]);

        const counts = Object.fromEntries(BOOKMARK_TYPES.map((t) => [t, 0]));
        for (const g of grouped) counts[g._id] = g.n;
        counts.note = notes;
        counts.reel = reels;
        return NextResponse.json({ success: true, data: counts });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
