import { NextResponse } from 'next/server';
import { escapeRegex } from '@/lib/utils/pagination';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, adminOnly } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        if (!adminOnly(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 1000);
        const skip = (page - 1) * limit;

        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        const filter = { referralCount: { $gt: 0 } };
        if (search) {
            const rx = new RegExp(escapeRegex(search), 'i');
            filter.$or = [{ name: rx }, { email: rx }, { username: rx }, { phone: rx }, { referralCode: rx }];
        }

        const [items, total] = await Promise.all([
            User.find(filter)
                .select('name email username phone referralCode referralCount')
                .sort({ referralCount: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(filter)
        ]);

        return NextResponse.json({
            success: true,
            data: items,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GET /api/admin/referrals error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
