import { NextResponse } from 'next/server';
import { escapeRegex } from '@/lib/utils/pagination';
import dbConnect from '@/lib/db';
import WithdrawRequest from '@/models/WithdrawRequest';
import User from '@/models/User';
import { protect, adminOnly } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        if (!adminOnly(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });

        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 1000);
        const skip = (page - 1) * limit;

        const filter = {};
        if (status) filter.status = status;
        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        if (search) {
            const rx = new RegExp(escapeRegex(search), 'i');
            const users = await User.find({ $or: [{ name: rx }, { email: rx }, { username: rx }, { phone: rx }] }).select('_id').limit(500).lean();
            filter.userId = { $in: users.map(u => u._id) };
        }

        const [items, total] = await Promise.all([
            WithdrawRequest.find(filter)
                .populate('userId', 'name email username phone')
                .sort({ requestedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WithdrawRequest.countDocuments(filter)
        ]);

        return NextResponse.json({
            success: true,
            data: items,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GET /api/admin/referral-withdraw-requests error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
