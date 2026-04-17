import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyPlan from '@/models/StudyPlan';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const limit = parseInt(searchParams.get('limit'), 10) || 20;
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      StudyPlan.find()
        .populate('user', 'name username')
        .populate('exam', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StudyPlan.countDocuments()
    ]);

    return NextResponse.json({
      success: true,
      data: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
