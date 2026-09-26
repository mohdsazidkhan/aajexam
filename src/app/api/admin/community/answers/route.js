import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityAnswer from '@/models/CommunityAnswer';
import { protect, admin } from '@/middleware/auth';
import { escapeRegex } from '@/lib/utils/regex';

// GET - Admin list all community answers (moderation queue)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const flaggedOnly = searchParams.get('flaggedOnly') === '1';
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const filter = {};
        if (status) filter.status = status;
        if (flaggedOnly) filter.flagCount = { $gt: 0 };
        if (search) filter.body = { $regex: escapeRegex(search), $options: 'i' };

        const [answers, total, statusCountsAgg] = await Promise.all([
            CommunityAnswer.find(filter)
                .sort({ flagCount: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('author', 'name username email')
                .populate('question', 'question')
                .populate('flaggedBy.user', 'name username')
                .lean(),
            CommunityAnswer.countDocuments(filter),
            CommunityAnswer.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const statusCounts = statusCountsAgg.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

        return NextResponse.json({
            success: true,
            data: answers,
            statusCounts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
