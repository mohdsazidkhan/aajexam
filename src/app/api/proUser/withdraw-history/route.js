import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [requests, totalCount, summary] = await Promise.all([
            WithdrawRequest.find({ userId: auth.user.id })
                .sort({ requestedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WithdrawRequest.countDocuments({ userId: auth.user.id }),
            WithdrawRequest.aggregate([
                { $match: { userId: auth.user.id } },
                {
                    $group: {
                        _id: null,
                        totalRequested: { $sum: '$amount' },
                        totalPaid: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        return NextResponse.json({
            success: true,
            data: requests,
            summary: summary[0] || { totalRequested: 0, totalPaid: 0, count: 0 },
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
