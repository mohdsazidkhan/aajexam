import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RevisionQueue from '@/models/RevisionQueue';
import { protect } from '@/middleware/auth';

// GET - Get user's revision queue (due today)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status') || 'active';
        const source = searchParams.get('source');

        const now = new Date();
        const filter = {
            user: auth.user._id,
            status,
            nextReviewDate: { $lte: now }
        };
        if (source) filter.source = source;

        const dueItems = await RevisionQueue.find(filter)
            .sort({ nextReviewDate: 1 })
            .limit(limit)
            .lean();

        const totalDue = await RevisionQueue.countDocuments({
            user: auth.user._id,
            status: 'active',
            nextReviewDate: { $lte: now }
        });

        const totalItems = await RevisionQueue.countDocuments({
            user: auth.user._id,
            status: 'active'
        });

        const mastered = await RevisionQueue.countDocuments({
            user: auth.user._id,
            status: 'mastered'
        });

        return NextResponse.json({
            success: true,
            data: {
                dueItems,
                stats: { totalDue, totalItems, mastered }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
