import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const search = searchParams.get('search') || '';
        const subscriptionStatus = searchParams.get('subscriptionStatus') || '';

        // Build match filter
        const matchFilter = { role: 'student' };

        if (search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            matchFilter.$or = [{ name: regex }, { email: regex }];
        }

        if (subscriptionStatus) {
            matchFilter.subscriptionStatus = subscriptionStatus.toUpperCase();
        }

        const skip = (page - 1) * limit;

        // Aggregate users with their total earnings from referralRewards
        const pipeline = [
            { $match: matchFilter },
            {
                $addFields: {
                    totalEarnings: {
                        $cond: {
                            if: { $isArray: '$referralRewards' },
                            then: { $sum: '$referralRewards.amount' },
                            else: 0
                        }
                    }
                }
            },
            { $sort: { totalEarnings: -1, createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                subscriptionStatus: 1,
                                walletBalance: 1,
                                totalEarnings: 1,
                                referralCount: 1,
                                createdAt: 1,
                                profilePicture: 1,
                                status: 1
                            }
                        }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ];

        const result = await User.aggregate(pipeline);
        const students = result[0]?.data || [];
        const totalUsers = result[0]?.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalUsers / limit);

        return NextResponse.json({
            success: true,
            students,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages
            }
        });

    } catch (error) {
        console.error('Users with earnings analytics error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
