import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrevMonthPlayedUsers from '@/models/PrevMonthPlayedUsers';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const { monthYear } = params;
        if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) return NextResponse.json({ message: 'Invalid format' }, { status: 400 });

        const users = await PrevMonthPlayedUsers.find({ monthYear }).sort({ savedAt: -1 }).lean();
        const data = users.map(u => ({
            ...u,
            getScore: (u.quizBestScores || []).reduce((sum, s) => sum + (s.bestScore || 0), 0),
            totalScore: (u.quizBestScores?.length || 0) * 5
        }));

        return NextResponse.json({ success: true, data, total: data.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
