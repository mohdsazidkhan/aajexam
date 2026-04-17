import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserStreak from '@/models/UserStreak';
import { protect } from '@/middleware/auth';

// GET - Get user's streak info
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        let streak = await UserStreak.findOne({ user: auth.user._id });

        if (!streak) {
            streak = await UserStreak.create({ user: auth.user._id });
        }

        // Check if streak is broken (missed yesterday and no freeze)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (streak.lastActiveDate) {
            const lastActive = new Date(streak.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                // Streak broken
                streak.currentStreak = 0;
                await streak.save();
            }
        }

        const todayEntry = streak.streakHistory.find(h => {
            const d = new Date(h.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });

        return NextResponse.json({
            success: true,
            data: {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                totalActiveDays: streak.totalActiveDays,
                freezesAvailable: streak.freezesAvailable,
                todayCompleted: todayEntry?.challengeCompleted || false,
                todayStats: todayEntry || null
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
