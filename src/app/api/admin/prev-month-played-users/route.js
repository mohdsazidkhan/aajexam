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
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const monthYear = searchParams.get('monthYear');
        const type = searchParams.get('type') || 'monthly';
        const skip = (page - 1) * limit;

        let Model;
        let query = {};
        let progressField = 'monthlyProgress';
        let periodField = 'monthYear';

        if (type === 'daily') {
            Model = PrevDailyPlayedUsers;
            progressField = 'dailyProgress';
            periodField = 'date';
            if (monthYear) query.date = monthYear; // Using monthYear var name for consistency in query
        } else if (type === 'weekly') {
            Model = PrevWeeklyPlayedUsers;
            progressField = 'weeklyProgress';
            periodField = 'week';
            if (monthYear) query.week = monthYear;
        } else {
            Model = PrevMonthPlayedUsers;
            progressField = 'monthlyProgress';
            periodField = 'monthYear';
            if (monthYear) query.monthYear = monthYear;
        }

        const [users, total] = await Promise.all([
            Model.find(query).sort({ savedAt: -1, [periodField]: -1 }).skip(skip).limit(limit).lean(),
            Model.countDocuments(query)
        ]);

        const data = users.map(u => ({
            ...u,
            // Map type-specific progress to a unified monthlyProgress for frontend compatibility
            monthlyProgress: u[progressField] || {},
            getScore: (u.quizBestScores || []).reduce((sum, s) => sum + (s.bestScore || 0), 0),
            totalScore: (u.quizBestScores?.length || 0) * 5,
            monthYear: u[periodField], // Map period to monthYear for frontend compatibility
        }));

        return NextResponse.json({
            success: true,
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
