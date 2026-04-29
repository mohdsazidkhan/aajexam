import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';

import { protect } from '@/middleware/auth';

// Map raw PaymentOrder.status / payuStatus into the four UX buckets the
// frontend renders (success / failed / pending / refunded). PayU's
// `payuStatus` ("success" / "failure" / "pending") is the authoritative
// signal once the gateway has responded; until then we fall back to the
// internal `status` column.
const deriveStatus = (order) => {
    if (order.status === 'refunded') return 'refunded';
    if (order.payuStatus) {
        const s = String(order.payuStatus).toLowerCase();
        if (s === 'success') return 'success';
        if (s === 'failure' || s === 'failed') return 'failed';
        if (s === 'pending') return 'pending';
    }
    if (order.status === 'paid' || order.status === 'authorized') return 'success';
    if (order.status === 'failed') return 'failed';
    return 'pending';
};

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
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;

        const skip = (page - 1) * limit;

        const query = { user: userId };
        if (month && year) {
            query.createdAt = {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 0, 23, 59, 59)
            };
        }
        if (type && type !== 'all') query.planId = type;

        const orders = await PaymentOrder.find(query)
            .populate('subscriptionId', 'plan status startDate endDate amount')
            .sort({ createdAt: -1 })
            .lean();

        // Bucket every order, then apply the optional status filter on the
        // derived bucket so the frontend filter UI works the way users
        // expect (e.g. "Failed" returns both PayU failure callbacks and
        // internal failed orders).
        const allWithDerived = orders.map(o => ({ ...o, derivedStatus: deriveStatus(o) }));
        const filtered = (status && status !== 'all')
            ? allWithDerived.filter(o => o.derivedStatus === status)
            : allWithDerived;

        const total = filtered.length;
        const paged = filtered.slice(skip, skip + limit);

        const transactions = paged.map(order => ({
            id: order._id,
            amount: order.amount,
            currency: order.currency || 'INR',
            description: `Payment for ${order.planId || 'plan'} subscription`,
            type: order.planId || 'subscription',
            status: order.derivedStatus,
            payuStatus: order.payuStatus || null,
            internalStatus: order.status,
            date: order.createdAt,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            orderId: order.orderId,
            transactionId: order.payuTransactionId || order.orderId,
            paymentMethod: order.paymentMethod || 'payu',
            subscription: order.subscriptionId,
            refundAmount: order.refundAmount,
            refundReason: order.refundReason
        }));

        // Summary across the FILTERED set so summary cards reflect what the
        // user is actually viewing.
        const summary = {
            totalTransactions: filtered.length,
            successCount: filtered.filter(o => o.derivedStatus === 'success').length,
            failedCount: filtered.filter(o => o.derivedStatus === 'failed').length,
            pendingCount: filtered.filter(o => o.derivedStatus === 'pending').length,
            refundedCount: filtered.filter(o => o.derivedStatus === 'refunded').length,
            totalSpent: filtered
                .filter(o => o.derivedStatus === 'success')
                .reduce((sum, o) => sum + (o.amount || 0), 0),
            totalRefunded: filtered.reduce((sum, o) => sum + (o.refundAmount || 0), 0)
        };

        return NextResponse.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalCount: total,
                    limit
                },
                summary
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
