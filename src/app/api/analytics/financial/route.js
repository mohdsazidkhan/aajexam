import { NextResponse } from 'next/server';
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
        const PRIZE_PER_PRO = Number(process.env.NEXT_PUBLIC_PRIZE_PER_PRO || process.env.PRIZE_PER_PRO || 90);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalPaidUsers, monthlyPaidUsers, subscriptionBreakdown] = await Promise.all([
            User.countDocuments({ role: 'student', subscriptionStatus: { $in: ['basic', 'premium', 'pro'] } }),
            User.countDocuments({ role: 'student', subscriptionStatus: { $in: ['basic', 'premium', 'pro'] }, subscriptionExpiry: { $gte: startOfMonth } }),
            User.aggregate([
                { $match: { role: 'student', subscriptionStatus: { $in: ['basic', 'premium', 'pro'] } } },
                { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
            ])
        ]);

        const activeProUsers = await User.countDocuments({
            role: 'student', subscriptionStatus: 'pro', subscriptionExpiry: { $gte: now }, status: 'active'
        });

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalPaidUsers, monthlyPaidUsers,
                    currentMonthPrizePool: activeProUsers * PRIZE_PER_PRO,
                    activeProUsers, prizePerPro: PRIZE_PER_PRO
                },
                subscriptionBreakdown
            }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
