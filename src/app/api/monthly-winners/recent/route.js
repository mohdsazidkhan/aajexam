import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlyWinners from '@/models/MonthlyWinners';
import MonthlyUserReferral from '@/models/MonthlyUserReferral';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const monthYearQuery = searchParams.get('monthYear');
        const competitionType = searchParams.get('competitionType') || searchParams.get('type');
        const date = searchParams.get('date');
        const week = searchParams.get('week');
        const limit = parseInt(searchParams.get('limit')) || 12;

        let query = {};
        
        // Build query based on competitionType and filters
        if (competitionType === 'daily' || (date && competitionType !== 'monthly')) {
            query.monthYear = `daily-${date || monthYearQuery}`;
            query.competitionType = 'daily';
        } else if (competitionType === 'weekly' || (week && competitionType !== 'monthly')) {
            query.monthYear = `weekly-${week || monthYearQuery}`;
            query.competitionType = 'weekly';
        } else if (competitionType === 'monthly') {
            if (monthYearQuery || date) {
                query.monthYear = monthYearQuery || date;
            }
            query.$or = [
                { competitionType: 'monthly' },
                { competitionType: { $exists: false } }
            ];
        } else if (monthYearQuery) {
            query.monthYear = monthYearQuery;
        }

        const winnersRecords = await MonthlyWinners.find(query)
            .sort({ monthYear: -1 })
            .limit(limit)
            .populate('winners.userId', 'name username profilePicture email');

        // Convert to plain objects
        const records = winnersRecords.map(r => r.toObject());

        // For each record, fetch live referral counts
        for (const record of records) {
            const winnerIds = record.winners.map(w => w.userId?._id).filter(Boolean);
            const referrals = await MonthlyUserReferral.find({
                userId: { $in: winnerIds },
                monthYear: record.monthYear
            });

            const referralMap = referrals.reduce((acc, ref) => {
                acc[ref.userId.toString()] = ref.referralCount;
                return acc;
            }, {});

            record.winners = record.winners.map(winner => ({
                ...winner,
                monthlyReferralCount: referralMap[winner.userId?._id?.toString()] || 0
            }));
        }

        return NextResponse.json({ success: true, data: records });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
