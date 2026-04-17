import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RevisionQueue from '@/models/RevisionQueue';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const now = new Date();

    const [dueToday, totalItems, mastered] = await Promise.all([
      RevisionQueue.countDocuments({ status: 'active', nextReviewDate: { $lte: now } }),
      RevisionQueue.countDocuments({ status: 'active' }),
      RevisionQueue.countDocuments({ status: 'mastered' })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dueToday,
        totalItems,
        mastered
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
