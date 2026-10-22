import { NextResponse } from 'next/server';
import { readCache, writeCache } from '@/lib/utils/sharedCache';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, adminOnly } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !adminOnly(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const __ck = `analytics-dash:${new URL(req.url).searchParams.get('limit') || 20}`;
        const __hit = await readCache(__ck);
        if (__hit) return NextResponse.json(__hit);
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200);

        const totalUsers = await User.countDocuments({ role: 'student' });

        const now = new Date();
        const activeProUsers = await User.countDocuments({
            role: 'student', subscriptionStatus: 'PRO', subscriptionExpiry: { $gte: now }, status: 'active'
        });

        const totalRevenue = 0;
        const totalSubscriptions = await User.countDocuments({ role: 'student', subscriptionStatus: 'PRO' });

        const subscriptionDistribution = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
        ]);

        const topUsers = await User.find({ role: 'student' })
            .select('name subscriptionStatus')
            .sort({ createdAt: -1 })
            .limit(limit).lean();

        const __body = {
            success: true,
            data: {
                overview: {
                    totalUsers, totalNonAdminUsers: totalUsers, totalRevenue,
                    totalSubscriptions,
                    currentMonthActiveProUsers: activeProUsers
                },
                subscriptionDistribution, topUsers
            }
        };
        await writeCache(__ck, JSON.parse(JSON.stringify(__body)), 60);
        return NextResponse.json(__body);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
