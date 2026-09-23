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
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const limit = parseInt(searchParams.get('limit'), 10) || 20;
    const search = searchParams.get('search');
    const sortField = type === 'longest' ? 'longestStreak' : 'currentStreak';

    const pipeline = [
      { $match: { [sortField]: { $gt: 0 } } },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.username': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push({ $sort: { [sortField]: -1 } });

    const [leaderboard, totalResult] = await Promise.all([
      UserStreak.aggregate([
        ...pipeline,
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            [sortField]: 1,
            totalActiveDays: 1,
            freezesAvailable: 1,
            longestStreak: 1,
            currentStreak: 1,
            'user._id': 1,
            'user.name': 1,
            'user.username': 1,
            'user.email': 1,
            'user.profilePicture': 1
          }
        }
      ]),
      UserStreak.aggregate([...pipeline, { $count: 'total' }])
    ]);

    const total = totalResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: leaderboard,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
