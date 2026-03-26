import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, adminOnly } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !adminOnly(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 50;
        const currentMonth = new Date().toISOString().slice(0, 7);

        const topUsers = await User.find({ role: 'student', 'monthlyProgress.month': currentMonth })
            .select('name level monthlyProgress subscriptionStatus')
            .sort({ 'monthlyProgress.highScoreWins': -1, 'monthlyProgress.accuracy': -1 })
            .limit(limit);

        const totalEligible = await User.countDocuments({
            role: 'student', 'monthlyProgress.month': currentMonth, 'monthlyProgress.rewardEligible': true
        });

        return NextResponse.json({
            success: true,
            data: { month: currentMonth, topUsers, totalEligible }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
