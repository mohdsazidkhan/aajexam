import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserStreak from '@/models/UserStreak';

// GET - Streak leaderboard
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'current'; // current or longest
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200);

        const sortField = type === 'longest' ? 'longestStreak' : 'currentStreak';

        const leaderboard = await UserStreak.find({ [sortField]: { $gt: 0 } })
            .populate('user', 'name username profilePicture')
            .select(`${sortField} totalActiveDays`)
            .sort({ [sortField]: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, data: leaderboard });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
