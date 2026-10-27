import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect, admin } from '@/middleware/auth';
import { rankPlace, listPlaces } from '@/lib/utils/regionRank';
import { normalizeRankSort } from '@/lib/utils/rankSort';

// GET /api/admin/state-rank?examId=optional&value=<place>&limit=100 — admin mirror of /api/state-rank. Admins have no
// state of their own, so they pick one; defaults to the state with the most students.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit'), 10) || 100, 1), 100);
        const examId = searchParams.get('examId') || null;
        const sort = normalizeRankSort(searchParams.get('sort'));
        const options = await listPlaces('state');
        const value = (searchParams.get('value') || '').trim() || options[0]?.value || '';

        const result = value ? await rankPlace({ field: 'state', value, limit, examId, sort }) : { place: '', totalUsers: 0, data: [] };
        return NextResponse.json({ success: true, options, value, ...result });
    } catch (error) {
        console.error('Admin state rank API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
