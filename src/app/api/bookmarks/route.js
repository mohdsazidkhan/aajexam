import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bookmark, { BOOKMARK_TYPES } from '@/models/Bookmark';
import StudyNote from '@/models/StudyNote';
import { protect } from '@/middleware/auth';
import { BOOKMARK_REGISTRY, resolveRefId } from '@/lib/utils/bookmarkTypes';

export const dynamic = 'force-dynamic';

const ALL_TYPES = [...BOOKMARK_TYPES, 'note'];

// GET /api/bookmarks?type=quiz&page=1&limit=12
// The signed-in student's saved items of one type, newest first, shaped as { id, title, meta, href }.
// (Reels are listed by /api/reels/bookmarked; everything else comes through here.)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit'), 10) || 12, 1), 50);
        if (!ALL_TYPES.includes(type)) return NextResponse.json({ success: false, message: 'Invalid type' }, { status: 400 });
        const userId = auth.user._id;

        if (type === 'note') {
            const filter = { bookmarkedBy: userId, status: 'published' };
            const [notes, total] = await Promise.all([
                StudyNote.find(filter).select('title slug noteType subject').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
                StudyNote.countDocuments(filter),
            ]);
            return NextResponse.json({
                success: true,
                data: notes.map((n) => ({ id: n.slug, title: n.title, meta: [n.noteType, n.subject].filter(Boolean).join(' · '), href: `/notes/${n.slug}` })),
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            });
        }

        const entry = BOOKMARK_REGISTRY[type];
        const filter = { user: userId, type };
        const [rows, total] = await Promise.all([
            Bookmark.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Bookmark.countDocuments(filter),
        ]);
        const docs = await entry.Model.find({ _id: { $in: rows.map((r) => r.refId) } }).select(entry.select).lean();
        const byId = new Map(docs.map((d) => [String(d._id), d]));
        // Content that has since been deleted simply drops out of the list.
        const data = rows
            .map((r) => {
                const d = byId.get(String(r.refId));
                return d ? { id: String(d._id), savedAt: r.createdAt, ...entry.card(d) } : null;
            })
            .filter(Boolean);

        return NextResponse.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/bookmarks  { type, id }  — toggles. `id` is the content's _id or slug.
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
        await dbConnect();

        const body = await req.json().catch(() => ({}));
        const { type, id } = body || {};
        if (!ALL_TYPES.includes(type) || !id) return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
        const userId = auth.user._id;

        if (type === 'note') {
            const note = await StudyNote.findOne({ slug: String(id).toLowerCase() });
            if (!note) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
            const had = note.bookmarkedBy.some((u) => String(u) === String(userId));
            if (had) { note.bookmarkedBy.pull(userId); note.bookmarks = Math.max(0, (note.bookmarks || 0) - 1); }
            else { note.bookmarkedBy.push(userId); note.bookmarks = (note.bookmarks || 0) + 1; }
            await note.save();
            return NextResponse.json({ success: true, data: { bookmarked: !had } });
        }

        const refId = await resolveRefId(type, id);
        if (!refId) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

        const removed = await Bookmark.findOneAndDelete({ user: userId, type, refId });
        if (removed) return NextResponse.json({ success: true, data: { bookmarked: false } });
        try {
            await Bookmark.create({ user: userId, type, refId });
        } catch (e) {
            if (e?.code !== 11000) throw e; // a double click raced us: it is already saved
        }
        return NextResponse.json({ success: true, data: { bookmarked: true } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
