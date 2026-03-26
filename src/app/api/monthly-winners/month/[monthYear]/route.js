import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlyWinners from '@/models/MonthlyWinners';
import MonthlyUserReferral from '@/models/MonthlyUserReferral';

export async function GET(request, { params }) {
    try {
        const { monthYear } = await params;

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const competitionType = searchParams.get('competitionType') || searchParams.get('type') || 'monthly';

        // Build query for backward compatibility and multi-record support
        let query = {
            $or: [
                { monthYear },
                { monthYear: new RegExp(`^${competitionType}-${monthYear}`) }
            ],
            competitionType
        };

        if (competitionType === 'monthly') {
            query = {
                $and: [
                    { monthYear },
                    {
                        $or: [
                            { competitionType: 'monthly' },
                            { competitionType: { $exists: false } }
                        ]
                    }
                ]
            };
        }

        const winnersRecords = await MonthlyWinners.find(query)
            .sort({ monthYear: -1 })
            .populate('winners.userId', 'name username profilePicture email');

        if (!winnersRecords || winnersRecords.length === 0) {
            // Return success with empty array instead of 404 for better UI handling
            return NextResponse.json({ success: true, data: [] });
        }

        const allRecordsData = [];

        for (const record of winnersRecords) {
            // Convert to plain object to modify
            const winnersData = record.toObject();

            // Fetch live referral counts for each winner
            const winnerIds = winnersData.winners.map(w => w.userId?._id).filter(Boolean);

            const referrals = await MonthlyUserReferral.find({
                userId: { $in: winnerIds },
                monthYear: winnersData.monthYear
            });

            // Create a map for quick lookup
            const referralMap = referrals.reduce((acc, ref) => {
                acc[ref.userId.toString()] = ref.referralCount;
                return acc;
            }, {});

            // Update each winner's referral count
            winnersData.winners = winnersData.winners.map(winner => ({
                ...winner,
                monthlyReferralCount: referralMap[winner.userId?._id?.toString()] || 0
            }));

            allRecordsData.push(winnersData);
        }

        // Return the first record for monthly (to stay as close to previous API as possible)
        // or the full array for daily/weekly
        return NextResponse.json({
            success: true,
            data: competitionType === 'monthly' ? allRecordsData[0] : allRecordsData,
            count: allRecordsData.length
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
