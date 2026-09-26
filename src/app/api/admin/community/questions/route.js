import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityQuestion from '@/models/CommunityQuestion';
import { protect, admin } from '@/middleware/auth';
import { escapeRegex } from '@/lib/utils/regex';

// GET - Admin list all community questions (moderation queue)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const filter = {};
        if (status) filter.status = status;
        if (search) filter.question = { $regex: escapeRegex(search), $options: 'i' };

        const [questions, total, statusCountsAgg] = await Promise.all([
            CommunityQuestion.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('author', 'name username email')
                .populate('exam', 'name')
                .lean(),
            CommunityQuestion.countDocuments(filter),
            CommunityQuestion.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const statusCounts = statusCountsAgg.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

        return NextResponse.json({
            success: true,
            data: questions,
            statusCounts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
