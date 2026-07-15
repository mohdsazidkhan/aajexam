import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentOrder from '@/models/PaymentOrder';
import { protect, admin } from '@/middleware/auth';

const calculateTotalRevenue = async () => {
    const revenueSummary = await PaymentOrder.aggregate([
        { $match: { payuStatus: 'success' } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' }
            }
        }
    ]);
    return revenueSummary[0]?.totalRevenue || 0;
};

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const totalUsers = await User.countDocuments({ role: 'student' });

        const now = new Date();
        const activeProUsers = await User.countDocuments({
            role: 'student',
            subscriptionStatus: 'PRO',
            subscriptionExpiry: { $gte: now },
            status: 'active'
        });

        const totalRevenue = await calculateTotalRevenue();

        const totalSubscriptions = await User.countDocuments({
            role: 'student',
            subscriptionStatus: 'PRO'
        });

        const subscriptionDistribution = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
        ]);

        const topUsers = await User.find({ role: 'student' })
            .select('name subscriptionStatus')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalNonAdminUsers: totalUsers,
                    totalRevenue,
                    totalSubscriptions,
                    currentMonthActiveProUsers: activeProUsers
                },
                subscriptionDistribution,
                topUsers
            }
        });

    } catch (error) {
        console.error('Dashboard analytics error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
