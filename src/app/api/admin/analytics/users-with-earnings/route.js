import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import MonthlyWinners from '@/models/MonthlyWinners';
import WalletTransaction from '@/models/WalletTransaction';
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
        const limit = parseInt(searchParams.get('limit')) || 100;
        const search = searchParams.get('search') || '';
        const subscriptionStatus = searchParams.get('subscriptionStatus') || '';

        const skip = (page - 1) * limit;

        const matchFilter = { role: 'student' };
        if (search.trim()) {
            const re = new RegExp(search.trim(), 'i');
            matchFilter.$or = [{ name: re }, { email: re }];
        }
        if (subscriptionStatus) matchFilter.subscriptionStatus = subscriptionStatus;

        // Step 1: Get all matching user IDs
        const allUsers = await User.find(matchFilter)
            .select('_id name email level subscriptionStatus createdAt referralRewards dailyProgress weeklyProgress monthlyProgress')
            .lean();

        const userIds = allUsers.map(u => u._id);
        const total = allUsers.length;

        // Step 2: Monthly winner prizes per user
        const monthlyAgg = await MonthlyWinners.aggregate([
            { $unwind: '$winners' },
            { $match: { 'winners.userId': { $in: userIds } } },
            { $group: { _id: '$winners.userId', total: { $sum: '$winners.rewardAmount' } } }
        ]);
        const monthlyMap = {};
        monthlyAgg.forEach(r => { monthlyMap[r._id.toString()] = r.total; });

        // Step 3: Blog + Quiz wallet earnings per user
        const walletAgg = await WalletTransaction.aggregate([
            {
                $match: {
                    user: { $in: userIds },
                    category: { $in: ['blog_reward', 'quiz_reward', 'question_reward'] },
                    status: 'completed'
                }
            },
            { $group: { _id: '$user', total: { $sum: '$amount' } } }
        ]);
        const walletMap = {};
        walletAgg.forEach(r => { walletMap[r._id.toString()] = r.total; });

        // Step 4: Compute total earnings for each user
        const usersWithEarnings = allUsers.map(u => {
            const uid = u._id.toString();
            const monthlyPrizes = monthlyMap[uid] || 0;
            const referralEarnings = Array.isArray(u.referralRewards)
                ? u.referralRewards.reduce((s, r) => s + (r.amount || 0), 0)
                : 0;
            const walletEarnings = walletMap[uid] || 0;
            const totalEarnings = monthlyPrizes + referralEarnings + walletEarnings;

            // Format for frontend compatibility
            return {
                id: u._id,
                _id: u._id,
                name: u.name,
                email: u.email,
                level: u.level?.currentLevel !== undefined ? `Lv ${u.level.currentLevel}` : 'Lv 0',
                levelObj: u.level,
                plan: u.subscriptionStatus === 'free' ? 'Free' : (u.subscriptionStatus ? u.subscriptionStatus.charAt(0).toUpperCase() + u.subscriptionStatus.slice(1) : 'Free'),
                subscriptionStatus: u.subscriptionStatus,
                joinedAt: u.createdAt,
                createdAt: u.createdAt,
                totalEarnings,
                earningsBreakdown: { monthlyPrizes, referralEarnings, walletEarnings }
            };
        });

        // Step 5: Sort by totalEarnings descending, then paginate
        usersWithEarnings.sort((a, b) => b.totalEarnings - a.totalEarnings);
        const paginated = usersWithEarnings.slice(skip, skip + limit);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: paginated,
            pagination: {
                page,
                limit,
                totalUsers: total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
