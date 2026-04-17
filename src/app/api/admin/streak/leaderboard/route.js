import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserStreak from '@/models/UserStreak';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'current';
    const limit = parseInt(searchParams.get('limit'), 10) || 20;
    const sortField = type === 'longest' ? 'longestStreak' : 'currentStreak';

    const leaderboard = await UserStreak.find({ [sortField]: { $gt: 0 } })
      .populate('user', 'name username profilePicture')
      .select(`${sortField} totalActiveDays freezesAvailable longestStreak`)
      .sort({ [sortField]: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
