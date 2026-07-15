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

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalPaidUsers, monthlyPaidUsers, subscriptionBreakdown] = await Promise.all([
            User.countDocuments({ role: 'student', subscriptionStatus: 'PRO' }),
            User.countDocuments({ role: 'student', subscriptionStatus: 'PRO', subscriptionExpiry: { $gte: startOfMonth } }),
            User.aggregate([
                { $match: { role: 'student', subscriptionStatus: 'PRO' } },
                { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
            ])
        ]);

        const activeProUsers = await User.countDocuments({
            role: 'student', subscriptionStatus: 'PRO', subscriptionExpiry: { $gte: now }, status: 'active'
        });

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalPaidUsers, monthlyPaidUsers,
                    activeProUsers
                },
                subscriptionBreakdown
            }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
