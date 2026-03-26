import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentOrder from '@/models/PaymentOrder';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');

        // Build filter query for period-based stats
        const filterQuery = {};
        if (year && year !== 'all' && year !== '') {
            const currentYear = parseInt(year);
            if (month && month !== 'all' && month !== '0' && month !== '') {
                const currentMonth = parseInt(month);
                const startDate = new Date(currentYear, currentMonth - 1, 1);
                const endDate = new Date(currentYear, currentMonth, 1);
                filterQuery.createdAt = { $gte: startDate, $lt: endDate };
            } else {
                const startDate = new Date(currentYear, 0, 1);
                const endDate = new Date(currentYear + 1, 0, 1);
                filterQuery.createdAt = { $gte: startDate, $lt: endDate };
            }
        }

        // 1. Total Subscriptions (all users)
        const totalSubscriptions = await User.countDocuments({});

        // 2. Active Subscriptions
        const activeSubscriptions = await User.countDocuments({
            subscriptionExpiry: { $exists: true, $ne: null, $gt: new Date() }
        });

        // 3. Free vs Paid
        const freeSubscriptions = await User.countDocuments({
            subscriptionStatus: { $in: ['free', null] }
        });
        const paidSubscriptions = await User.countDocuments({
            subscriptionStatus: { $nin: ['free', null] }
        });

        // 4. Revenue Stats from PaymentOrder
        const revenueQuery = { payuStatus: 'success' };

        const totalRevenueResult = await PaymentOrder.aggregate([
            { $match: revenueQuery },
            { $group: { _id: null, amount: { $sum: '$amount' } } }
        ]);

        const periodRevenueResult = await PaymentOrder.aggregate([
            { $match: { ...revenueQuery, ...filterQuery } },
            { $group: { _id: null, amount: { $sum: '$amount' } } }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalSubscriptions,
                activeSubscriptions,
                freeSubscriptions,
                paidSubscriptions,
                totalRevenue: totalRevenueResult[0]?.amount || 0,
                periodRevenue: periodRevenueResult[0]?.amount || 0
            }
        });
    } catch (error) {
        console.error('Error getting subscription summary:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch summary',
            error: error.message
        }, { status: 500 });
    }
}
