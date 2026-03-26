import { NextResponse } from 'next/server';
import { getCompetitionLeaderboard } from '@/lib/leaderboard-utils';
import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const week = searchParams.get('week');
        const filters = week ? { week } : {};

        const data = await getCompetitionLeaderboard('weekly', page, limit, filters, auth.user.id);

        return NextResponse.json({
            success: true,
            ...data
        });
    } catch (err) {
        console.error('Weekly Leaderboard fetch error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
