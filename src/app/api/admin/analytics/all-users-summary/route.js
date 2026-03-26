import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentOrder from '@/models/PaymentOrder';
import MonthlyWinners from '@/models/MonthlyWinners';
import Expense from '@/models/Expense';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        // Basic stats
        const totalUsers = await User.countDocuments({ role: 'student' });

        // Total Revenue (Subscriptions)
        const revenue = await PaymentOrder.aggregate([
            { $match: { payuStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenue[0]?.total || 0;

        // User Payouts (Monthly Winners Prizes actual rewards)
        const monthlyWinnerAgg = await MonthlyWinners.aggregate([
            { $unwind: '$winners' },
            { $group: { _id: null, total: { $sum: '$winners.rewardAmount' } } }
        ]);
        const totalMonthlyPrizes = monthlyWinnerAgg[0]?.total || 0;

        // Referral Earnings
        const referralAgg = await User.aggregate([
            { $unwind: { path: '$referralRewards', preserveNullAndEmptyArrays: false } },
            { $group: { _id: null, total: { $sum: '$referralRewards.amount' } } }
        ]);
        const totalReferralEarnings = referralAgg[0]?.total || 0;

        // Total earnings paid out to users
        const totalEarnings = totalMonthlyPrizes + totalReferralEarnings;

        // Other Expenses (Manual Entries)
        const expensesSummary = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalCustomExpenses = expensesSummary[0]?.total || 0;

        const activeSubscriptions = await User.countDocuments({
            role: 'student',
            subscriptionStatus: { $in: ['basic', 'premium', 'pro'] },
            subscriptionExpiry: { $gte: new Date() }
        });

        // Net Platform Profit
        const netPlatform = totalRevenue - totalEarnings - totalCustomExpenses;

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                totalRevenue,
                totalEarnings,
                totalCustomExpenses, // Other Expenses
                netPlatform,
                activeSubscriptions
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
