import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlyWinners from '@/models/MonthlyWinners';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const competitionType = searchParams.get('competitionType') || searchParams.get('type') || 'monthly';
        const date = searchParams.get('date');
        const week = searchParams.get('week');
        
        let query = {};
        
        // Build query based on competitionType and filters
        if (competitionType === 'daily' || (date && competitionType !== 'monthly')) {
            query.monthYear = `daily-${date}`;
            query.competitionType = 'daily';
        } else if (competitionType === 'weekly' || (week && competitionType !== 'monthly')) {
            query.monthYear = `weekly-${week}`;
            query.competitionType = 'weekly';
        } else if (competitionType === 'monthly') {
            if (date) query.monthYear = date;
            query.$or = [
                { competitionType: 'monthly' },
                { competitionType: { $exists: false } }
            ];
        } else {
            query.competitionType = competitionType;
        }

        const winners = await MonthlyWinners.find(query)
            .sort({ monthYear: -1 })
            .limit(1)
            .populate('winners.userId', 'name username profilePicture');

        return NextResponse.json({ success: true, data: winners[0] || null });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
