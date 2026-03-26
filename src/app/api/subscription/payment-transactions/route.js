import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import PaymentOrder from '@/models/PaymentOrder';

import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const userId = auth.user.id;
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;

        const skip = (page - 1) * limit;

        let dateFilter = {};
        if (month && year) {
            dateFilter = { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0, 23, 59, 59) };
        }

        const query = { user: userId, payuStatus: 'success' };
        if (Object.keys(dateFilter).length > 0) query.createdAt = dateFilter;
        if (status && status !== 'all') query.status = status;

        const [orders, total] = await Promise.all([
            PaymentOrder.find(query)
                .populate('subscriptionId', 'plan status startDate endDate amount')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            PaymentOrder.countDocuments(query)
        ]);

        const transactions = orders.map(order => ({
            id: order._id,
            amount: order.amount,
            description: `Payment for ${order.planId} plan`,
            status: order.status,
            date: order.createdAt,
            transactionId: order.payuTransactionId,
            subscription: order.subscriptionId
        }));

        return NextResponse.json({
            success: true,
            data: {
                transactions,
                pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalCount: total }
            }
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
