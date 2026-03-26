import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();
        
        // Use the static method already defined in User model
        const { distribution, totalPrizePool, activeProUsers, prizePerPro } = await User.getRewardDistribution();

        return NextResponse.json({
            success: true,
            data: {
                totalPrizePool,
                activeProUsers,
                prizePerUser: prizePerPro,
                rewardDistribution: distribution
            }
        });
    } catch (error) {
        console.error('GET /api/public/monthly-reward-info error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
