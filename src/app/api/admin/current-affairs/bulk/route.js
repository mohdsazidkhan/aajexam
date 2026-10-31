import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CurrentAffair from '@/models/CurrentAffair';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import { CA_CATEGORIES } from '@/lib/utils/currentAffairsParser';

const AAJEXAM_ADMIN_EMAIL = 'aajexam.com@gmail.com';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ITEMS = 200;

const toDay = (s) => new Date(`${s}T00:00:00.000Z`);
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

// GET - last inserted date + per-day counts for the recent window (+ count for ?date=)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();

        const last = await CurrentAffair.findOne({}, { date: 1 }).sort({ date: -1 }).lean();
        if (!last) return NextResponse.json({ success: true, lastDate: null, lastDateCount: 0, recent: [], selectedCount: 0 });

        const since = new Date(last.date.getTime() - 35 * 24 * 60 * 60 * 1000);
        const grouped = await CurrentAffair.aggregate([
            { $match: { date: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);
        const recent = grouped.map(g => ({ date: g._id, count: g.count }));

        const { searchParams } = new URL(req.url);
        const sel = searchParams.get('date');
        const selectedCount = sel && DATE_RE.test(sel) ? await CurrentAffair.countDocuments({ date: toDay(sel) }) : 0;

        return NextResponse.json({ success: true, lastDate: dayKey(last.date), lastDateCount: recent[0]?.count || 0, recent, selectedCount });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - insert a parsed batch for one date. Skips entries whose (date, title) already exist.
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();

        const { date, items } = await req.json();
        if (!DATE_RE.test(String(date || ''))) return NextResponse.json({ success: false, error: 'Valid date (YYYY-MM-DD) required' }, { status: 400 });
        if (!Array.isArray(items) || !items.length) return NextResponse.json({ success: false, error: 'No items to insert' }, { status: 400 });
        if (items.length > MAX_ITEMS) return NextResponse.json({ success: false, error: `Max ${MAX_ITEMS} items per batch` }, { status: 400 });

        // createdBy is always the AajExam admin account
        const owner = await User.findOne({ email: AAJEXAM_ADMIN_EMAIL }, { _id: 1 }).lean();
        if (!owner) return NextResponse.json({ success: false, error: `${AAJEXAM_ADMIN_EMAIL} not found — cannot set createdBy` }, { status: 500 });

        const day = toDay(date);
        let created = 0;
        const skipped = [];
        const failed = [];

        // Sequential: the slug hook checks uniqueness against what is already saved
        for (const it of items) {
            const title = String(it?.title || '').trim();
            const content = String(it?.content || '').trim();
            if (!title || !content) { failed.push({ title: title || '(empty)', error: 'Title and content required' }); continue; }
            try {
                if (await CurrentAffair.exists({ date: day, title })) { skipped.push(title); continue; }
                await CurrentAffair.create({
                    date: day,
                    category: CA_CATEGORIES.includes(it.category) ? it.category : 'other',
                    title,
                    content,
                    keyPoints: (Array.isArray(it.keyPoints) ? it.keyPoints : []).map(k => String(k).trim()).filter(Boolean),
                    tags: (Array.isArray(it.tags) ? it.tags : []).map(t => String(t).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')).filter(Boolean),
                    createdBy: owner._id,
                    status: 'published'
                });
                created++;
            } catch (e) {
                failed.push({ title, error: e.message });
            }
        }

        return NextResponse.json({ success: true, created, skipped, failed }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
