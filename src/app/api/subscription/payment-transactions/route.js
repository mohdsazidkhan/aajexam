import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';

import { protect } from '@/middleware/auth';
import { parsePaging, escapeRegex } from '@/lib/utils/pagination';

// Status buckets (success / failed / pending / refunded) are derived inside the
// aggregation below: PayU's `payuStatus` wins once the gateway has answered,
// otherwise the internal `status` is used.
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
        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        const { page, limit, skip } = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 20 });

        const query = { user: userId };
        if (month && year) {
            query.createdAt = {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 0, 23, 59, 59)
            };
        }
        if (type && type !== 'all') query.planId = type;
        if (search) {
            const rx = new RegExp(escapeRegex(search), 'i');
            query.$or = [{ orderId: rx }, { payuTransactionId: rx }, { planId: rx }];
        }

        // Derived-status bucket computed in the DB so status filter, count, paging and
        // summary all run server-side (PayU status first, then internal status).
        const derivedExpr = {
            $switch: {
                branches: [
                    { case: { $eq: ['$status', 'refunded'] }, then: 'refunded' },
                    { case: { $eq: [{ $toLower: { $ifNull: ['$payuStatus', ''] } }, 'success'] }, then: 'success' },
                    { case: { $in: [{ $toLower: { $ifNull: ['$payuStatus', ''] } }, ['failure', 'failed']] }, then: 'failed' },
                    { case: { $eq: [{ $toLower: { $ifNull: ['$payuStatus', ''] } }, 'pending'] }, then: 'pending' },
                    { case: { $in: ['$status', ['paid', 'authorized']] }, then: 'success' },
                    { case: { $eq: ['$status', 'failed'] }, then: 'failed' },
                ],
                default: 'pending',
            },
        };
        const baseMatch = { ...query, user: new mongoose.Types.ObjectId(userId) };
        const wantStatus = (status && status !== 'all') ? status : null;

        const [agg] = await PaymentOrder.aggregate([
            { $match: baseMatch },
            { $addFields: { derivedStatus: derivedExpr } },
            ...(wantStatus ? [{ $match: { derivedStatus: wantStatus } }] : []),
            {
                $facet: {
                    page: [
                        { $sort: { createdAt: -1, _id: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    stats: [
                        {
                            $group: {
                                _id: '$derivedStatus',
                                count: { $sum: 1 },
                                amount: { $sum: { $ifNull: ['$amount', 0] } },
                                refunded: { $sum: { $ifNull: ['$refundAmount', 0] } },
                            },
                        },
                    ],
                },
            },
        ]);

        const pageOrders = await PaymentOrder.populate(agg?.page || [], { path: 'subscriptionId', select: 'plan status startDate endDate amount' });
        const stat = (k) => (agg?.stats || []).find(x => x._id === k) || { count: 0, amount: 0 };
        const total = (agg?.stats || []).reduce((n, x) => n + x.count, 0);
        const paged = pageOrders;

        const transactions = paged.map(order => {
            const pr = order.payuResponse || {};
            const paymentMode = pr.mode || null;
            const isUpi = paymentMode === 'UPI';
            const upiId = isUpi && pr.field3 && pr.field3.includes('@') ? pr.field3 : null;
            const upiChannel = isUpi ? [pr.bankcode, pr.field8].filter(Boolean).join(' · ') : null;
            const bankCode = !isUpi ? (pr.bankcode || null) : null;

            return {
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
                refundReason: order.refundReason,
                paymentMode,
                bankRefNum: pr.bank_ref_num || null,
                upiId,
                upiChannel,
                bankCode,
                productInfo: pr.productinfo || null
            };
        });

        // Summary across the FILTERED set so summary cards reflect what the
        // user is actually viewing.
        const summary = {
            totalTransactions: total,
            successCount: stat('success').count,
            failedCount: stat('failed').count,
            pendingCount: stat('pending').count,
            refundedCount: stat('refunded').count,
            totalSpent: stat('success').amount,
            pendingAmount: stat('pending').amount,
            totalRefunded: (agg?.stats || []).reduce((n, x) => n + (x.refunded || 0), 0)
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
