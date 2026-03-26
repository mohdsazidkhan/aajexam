import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlyWinners from '@/models/MonthlyWinners';

export async function GET() {
    try {
        await dbConnect();
        
        const stats = await MonthlyWinners.aggregate([
            {
                $facet: {
                    monthly: [
                        { $match: { $or: [{ competitionType: 'monthly' }, { competitionType: { $exists: false } }] } },
                        { $sort: { year: -1, month: -1 } },
                        {
                            $group: {
                                _id: null,
                                totalMonths: { $sum: 1 },
                                totalWinners: { $sum: '$totalWinners' },
                                totalPrizeDistributed: { $sum: '$totalPrizePool' },
                                lastPrize: { $first: '$totalPrizePool' }
                            }
                        }
                    ],
                    daily: [
                        { $match: { competitionType: 'daily' } },
                        { $sort: { monthYear: -1 } },
                        {
                            $group: {
                                _id: null,
                                totalDays: { $sum: 1 },
                                totalWinners: { $sum: '$totalWinners' },
                                totalPrizeDistributed: { $sum: '$totalPrizePool' },
                                lastPrize: { $first: '$totalPrizePool' }
                            }
                        }
                    ],
                    weekly: [
                        { $match: { competitionType: 'weekly' } },
                        { $sort: { monthYear: -1 } },
                        {
                            $group: {
                                _id: null,
                                totalWeeks: { $sum: 1 },
                                totalWinners: { $sum: '$totalWinners' },
                                totalPrizeDistributed: { $sum: '$totalPrizePool' },
                                lastPrize: { $first: '$totalPrizePool' }
                            }
                        }
                    ]
                }
            }
        ]);

        const m = stats[0].monthly[0] || { totalMonths: 0, totalWinners: 0, totalPrizeDistributed: 0, lastPrize: 0 };
        const d = stats[0].daily[0] || { totalDays: 0, totalWinners: 0, totalPrizeDistributed: 0, lastPrize: 0 };
        const w = stats[0].weekly[0] || { totalWeeks: 0, totalWinners: 0, totalPrizeDistributed: 0, lastPrize: 0 };

        const result = {
            totalMonths: m.totalMonths,
            totalWinners: m.totalWinners,
            totalAmountDistributed: m.totalPrizeDistributed,
            prevAmountDistributedMonthly: m.lastPrize,
            avgWinnersPerMonth: m.totalMonths > 0 ? Math.round(m.totalWinners / m.totalMonths) : 0,

            totalDays: d.totalDays,
            totalWinnersDaily: d.totalWinners,
            totalDistributedDaily: d.totalPrizeDistributed,
            prevAmountDistributedDaily: d.lastPrize,
            avgWinnersPerDay: d.totalDays > 0 ? Math.round(d.totalWinners / d.totalDays) : 0,

            totalWeeks: w.totalWeeks,
            totalWinnersWeekly: w.totalWinners,
            totalDistributedWeekly: w.totalPrizeDistributed,
            prevAmountDistributedWeekly: w.lastPrize,
            avgWinnersPerWeek: w.totalWeeks > 0 ? Math.round(w.totalWinners / w.totalWeeks) : 0
        };

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
