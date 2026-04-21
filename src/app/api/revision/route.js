import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RevisionQueue from '@/models/RevisionQueue';
import { protect } from '@/middleware/auth';

// GET - Get user's revision queue (only items currently due for review)
// Once a user reviews an item, SM-2 pushes its nextReviewDate into the future,
// so it is automatically excluded from this list until it is due again.
// Query params:
//   status   - active | mastered | suspended (default: active)
//   source   - quiz | practice_test | daily_challenge | reel (optional)
//   all      - 'true' to include not-yet-due items (debug/admin use)
//   limit    - max items (default 50)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 50;
        const status = searchParams.get('status') || 'active';
        const source = searchParams.get('source');
        const includeAll = searchParams.get('all') === 'true';

        const now = new Date();
        const filter = { user: auth.user._id, status };
        if (source) filter.source = source;
        if (!includeAll) filter.nextReviewDate = { $lte: now };

        const items = await RevisionQueue.find(filter)
            .sort({ nextReviewDate: 1, createdAt: -1 })
            .limit(limit)
            .lean();

        const [totalDue, totalItems, mastered, countsBySource] = await Promise.all([
            RevisionQueue.countDocuments({ user: auth.user._id, status: 'active', nextReviewDate: { $lte: now } }),
            RevisionQueue.countDocuments({ user: auth.user._id, status: 'active' }),
            RevisionQueue.countDocuments({ user: auth.user._id, status: 'mastered' }),
            RevisionQueue.aggregate([
                { $match: { user: auth.user._id, status: 'active', nextReviewDate: { $lte: now } } },
                { $group: { _id: '$source', count: { $sum: 1 } } }
            ])
        ]);

        const bySource = { quiz: 0, practice_test: 0, daily_challenge: 0, reel: 0 };
        countsBySource.forEach(c => { bySource[c._id] = c.count; });

        return NextResponse.json({
            success: true,
            data: {
                dueItems: items,
                stats: { totalDue, totalItems, mastered, bySource }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
