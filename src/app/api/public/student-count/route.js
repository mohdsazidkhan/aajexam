import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// GET /api/public/student-count -> { count } rounded DOWN to the nearest 10, for "960+ students joined" social proof.
// Cached at the CDN for an hour so it costs one count query per hour.
export async function GET() {
    try {
        await dbConnect();
        const total = await User.countDocuments({ role: 'student' });
        return NextResponse.json(
            { success: true, count: Math.floor(total / 10) * 10 },
            { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
        );
    } catch (error) {
        return NextResponse.json({ success: false, count: 0 }, { status: 200 });
    }
}
