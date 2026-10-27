import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect, admin } from '@/middleware/auth';
import { rankPlace, listPlaces } from '@/lib/utils/regionRank';

// GET /api/admin/city-rank?examId=optional&value=<place>&limit=10 — admin mirror of /api/city-rank. Admins have no
// city of their own, so they pick one; defaults to the city with the most students.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit'), 10) || 10, 1), 100);
        const examId = searchParams.get('examId') || null;
        const options = await listPlaces('city');
        const value = (searchParams.get('value') || '').trim() || options[0]?.value || '';

        const result = value ? await rankPlace({ field: 'city', value, limit, examId }) : { place: '', totalUsers: 0, data: [] };
        return NextResponse.json({ success: true, options, value, ...result });
    } catch (error) {
        console.error('Admin city rank API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
