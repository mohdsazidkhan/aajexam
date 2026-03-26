import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { calculatePrizePool } from '@/lib/cron-tasks';

export async function GET(req) {
    try {
        await dbConnect();

        const daily = await calculatePrizePool('daily');
        const weekly = await calculatePrizePool('weekly');
        const monthly = await calculatePrizePool('monthly');

        return NextResponse.json({
            success: true,
            prizepools: {
                daily: {
                    total: daily.totalPrizePool,
                    distribution: daily.distribution
                },
                weekly: {
                    total: weekly.totalPrizePool,
                    distribution: weekly.distribution
                },
                monthly: {
                    total: monthly.totalPrizePool,
                    distribution: monthly.distribution
                }
            },
            activeProUsers: daily.activeProUsers // Shared for all formulas
        });
    } catch (err) {
        console.error('Prize pool fetch error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
