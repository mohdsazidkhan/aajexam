import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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

        // Build filter query - only include successful PayU transactions
        const filterQuery = {
            payuStatus: 'success'
        };

        if (year && year !== 'all') {
            const currentYear = parseInt(year);
            if (month && month !== 'all' && month !== '0') {
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

        // Get summary statistics using aggregation
        const summary = await PaymentOrder.aggregate([
            { $match: filterQuery },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalTransactions: { $sum: 1 },
                    activeUsers: { $addToSet: '$user' },
                    completedTransactions: { $sum: 1 }
                }
            }
        ]);

        const totalRevenueResult = await PaymentOrder.aggregate([
            { $match: { payuStatus: 'success' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]);

        const result = summary[0] || {
            totalRevenue: 0,
            totalTransactions: 0,
            activeUsers: [],
            completedTransactions: 0
        };

        const overallTotalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

        return NextResponse.json({
            success: true,
            data: {
                totalRevenue: overallTotalRevenue,
                periodRevenue: result.totalRevenue || 0,
                totalTransactions: result.totalTransactions || 0,
                activeUsers: result.activeUsers ? result.activeUsers.length : 0,
                completedTransactions: result.completedTransactions || 0
            }
        });
    } catch (error) {
        console.error('Error getting payment transaction summary:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch summary',
            error: error.message
        }, { status: 500 });
    }
}
