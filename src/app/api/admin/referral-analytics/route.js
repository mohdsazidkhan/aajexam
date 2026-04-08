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
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

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
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    email: 1,
                    referralCode: 1,
                    createdAt: 1,
                    totalReferrals: '$referralCount'
                }
            }
        ];

        const analytics = await User.aggregate(pipeline);
        const totalUsersWithReferrals = await User.countDocuments(userQuery);
        const totalOverallUsers = await User.countDocuments({});

        // Calculate summary
        const totalReferralsAggr = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$referralCount' } } }
        ]);
        const totalReferralsSum = totalReferralsAggr[0]?.total || 0;

        return NextResponse.json({
            success: true,
            analytics,
            summary: {
                totalUsers: totalOverallUsers,
                usersWithReferrals: totalUsersWithReferrals,
                totalReferralsSum
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
