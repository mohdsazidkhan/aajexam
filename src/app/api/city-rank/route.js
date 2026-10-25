import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect, proOnly } from '@/middleware/auth';
import { rankPlace } from '@/lib/utils/regionRank';

// GET /api/city-rank — top 10 students (by total exam time, same order as All India Rank) in the
// logged-in student's own city, plus their own row when they sit outside the top 10.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message || 'Not authorized' }, { status: 401 });
        }
        if (!proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Only PRO users can access this' }, { status: 403 });
        }
        await dbConnect();
        const mine = String(auth.user.city || '').trim();
        if (!mine) return NextResponse.json({ success: true, needsPlace: true, place: '', totalUsers: 0, data: [], me: null });

        const result = await rankPlace({ field: 'city', value: mine, limit: 10, userId: auth.user._id });
        return NextResponse.json({ success: true, needsPlace: false, ...result });
    } catch (error) {
        console.error('city rank API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
