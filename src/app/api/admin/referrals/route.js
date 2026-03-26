import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import MonthlyUserReferral from '@/models/MonthlyUserReferral';
import { protect, adminOnly } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        if (!adminOnly(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });

        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const monthYear = searchParams.get('monthYear') || new Date().toISOString().slice(0, 7);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            MonthlyUserReferral.find({ monthYear })
                .populate('userId', 'name email username phone')
                .sort({ referralCount: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            MonthlyUserReferral.countDocuments({ monthYear })
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
