import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import MonthlyUserReferral from '@/models/MonthlyUserReferral';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search') || '';
        const year = searchParams.get('year') || 'all';
        const month = searchParams.get('month') || 'all';
        const skip = (page - 1) * limit;

        const monthYear = (year !== 'all' && month !== 'all') ? `${year}-${month}` : null;

        // Build query for users
        let userQuery = { referralCount: { $gt: 0 } };
        if (search) {
            userQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Aggregate analytics
        const pipeline = [
            { $match: userQuery },
            { $sort: { referralCount: -1 } },
            { $skip: skip },
            { $limit: limit }
        ];

        // If specific monthYear is filtered, lookup the monthly count
        if (monthYear) {
            pipeline.push({
                $lookup: {
                    from: 'monthlyuserreferrals',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$userId'] },
                                        { $eq: ['$monthYear', monthYear] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'monthlyData'
                }
            });
        } else if (year !== 'all') {
            // Filter by year only
            pipeline.push({
                $lookup: {
                    from: 'monthlyuserreferrals',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$userId'] },
                                        { $regexMatch: { input: '$monthYear', regex: `^${year}-` } }
                                    ]
                                }
                            }
                        },
                        { $group: { _id: null, total: { $sum: '$referralCount' } } }
                    ],
                    as: 'yearData'
                }
            });
        }

        pipeline.push({
            $project: {
                name: 1,
                email: 1,
                referralCode: 1,
                createdAt: 1,
                totalReferrals: '$referralCount',
                monthlyReferrals: monthYear
                    ? { $ifNull: [{ $arrayElemAt: ['$monthlyData.referralCount', 0] }, 0] }
                    : (year !== 'all'
                        ? { $ifNull: [{ $arrayElemAt: ['$yearData.total', 0] }, 0] }
                        : '$referralCount') // If all time, monthlyReferrals is same as total
            }
        });

        const analytics = await User.aggregate(pipeline);
        const totalUsersWithReferrals = await User.countDocuments(userQuery);
        const totalOverallUsers = await User.countDocuments({});

        // Calculate summary
        const totalReferralsAggr = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$referralCount' } } }
        ]);
        const totalReferralsSum = totalReferralsAggr[0]?.total || 0;

        let monthlyReferralsSum = 0;
        if (monthYear) {
            const monthlySumAggr = await MonthlyUserReferral.aggregate([
                { $match: { monthYear } },
                { $group: { _id: null, total: { $sum: '$referralCount' } } }
            ]);
            monthlyReferralsSum = monthlySumAggr[0]?.total || 0;
        } else if (year !== 'all') {
            const yearSumAggr = await MonthlyUserReferral.aggregate([
                { $match: { monthYear: { $regex: `^${year}-` } } },
                { $group: { _id: null, total: { $sum: '$referralCount' } } }
            ]);
            monthlyReferralsSum = yearSumAggr[0]?.total || 0;
        } else {
            monthlyReferralsSum = totalReferralsSum;
        }

        return NextResponse.json({
            success: true,
            analytics,
            summary: {
                totalUsers: totalOverallUsers,
                usersWithReferrals: totalUsersWithReferrals,
                totalReferralsSum,
                monthlyReferralsSum
            },
            pagination: {
                total: totalUsersWithReferrals,
                totalPages: Math.ceil(totalUsersWithReferrals / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error('Referral analytics error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
