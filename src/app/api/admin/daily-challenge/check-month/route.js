import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get('year'));
        const month = parseInt(searchParams.get('month')); // 0-indexed

        if (isNaN(year) || isNaN(month)) {
            return NextResponse.json({ message: 'Valid year and month required' }, { status: 400 });
        }

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const existingChallenges = await DailyChallenge.find({
            date: { $gte: startDate, $lte: endDate }
        }).select('date');

        // Extract just the day numbers (1-31)
        const existingDays = existingChallenges.map(c => new Date(c.date).getDate());

        return NextResponse.json({ success: true, data: existingDays }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
