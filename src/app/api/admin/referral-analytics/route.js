import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import { readCache, writeCache } from '@/lib/utils/sharedCache';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        // Full-collection ranking: identical for every admin tab, so serve a two-minute copy per query string.
        const __ck = `admin-referral-analytics:${new URL(req.url).search}`;
        const __hit = await readCache(__ck);
        if (__hit) return NextResponse.json(__hit);
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 1000);
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
        const totalOverallUsers = await User.countDocuments({ role: { $ne: 'admin' } }); // every non-admin account, whatever its status

        // Calculate summary
        const totalReferralsAggr = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$referralCount' } } }
        ]);
        const totalReferralsSum = totalReferralsAggr[0]?.total || 0;

        const __body = {
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
        };
        await writeCache(__ck, JSON.parse(JSON.stringify(__body)), 120);
        return NextResponse.json(__body);
    } catch (error) {
        console.error('Referral analytics error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
