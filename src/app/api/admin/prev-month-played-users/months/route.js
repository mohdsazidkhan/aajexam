import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrevMonthPlayedUsers from '@/models/PrevMonthPlayedUsers';
import PrevDailyPlayedUsers from '@/models/PrevDailyPlayedUsers';
import PrevWeeklyPlayedUsers from '@/models/PrevWeeklyPlayedUsers';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'monthly';

        let Model;
        let periodField = 'monthYear';

        if (type === 'daily') {
            Model = PrevDailyPlayedUsers;
            periodField = 'date';
        } else if (type === 'weekly') {
            Model = PrevWeeklyPlayedUsers;
            periodField = 'week';
        } else {
            Model = PrevMonthPlayedUsers;
            periodField = 'monthYear';
        }

        const periods = await Model.distinct(periodField);
        return NextResponse.json({ success: true, data: periods.sort().reverse() });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
