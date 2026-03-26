import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import MonthlyWinners from '@/models/MonthlyWinners';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'this-month';

        // Simplistic period handling for migration
        const now = new Date();
        let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        if (period === 'last-7-days') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalRevenueResult = await PaymentOrder.aggregate([
            { $match: { payuStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const periodRevenueResult = await PaymentOrder.aggregate([
            { $match: { payuStatus: 'success', createdAt: { $gte: startDate } } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const revenueTrend = await PaymentOrder.aggregate([
            { $match: { payuStatus: 'success', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalRevenue: totalRevenueResult[0]?.total || 0,
                    periodRevenue: periodRevenueResult[0]?.total || 0
                },
                revenueTrend
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
