import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrevMonthPlayedUsers from '@/models/PrevMonthPlayedUsers';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const user = await PrevMonthPlayedUsers.findById(params.id).lean();
        if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        const data = {
            ...user,
            getScore: (user.quizBestScores || []).reduce((sum, s) => sum + (s.bestScore || 0), 0),
            totalScore: (user.quizBestScores?.length || 0) * 5
        };

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
