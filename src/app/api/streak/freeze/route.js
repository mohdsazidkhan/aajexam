import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserStreak from '@/models/UserStreak';
import { protect, proOnly } from '@/middleware/auth';

// POST - Use streak freeze (Pro only)
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        if (!proOnly(auth.user)) {
            return NextResponse.json({ message: 'Pro subscription required for streak freeze' }, { status: 403 });
        }
        await dbConnect();

        const streak = await UserStreak.findOne({ user: auth.user._id });
        if (!streak) return NextResponse.json({ message: 'No streak found' }, { status: 404 });

        if (streak.freezesAvailable <= 0) {
            return NextResponse.json({ message: 'No freezes available' }, { status: 400 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already froze today
        if (streak.lastFreezeDate) {
            const lastFreeze = new Date(streak.lastFreezeDate);
            lastFreeze.setHours(0, 0, 0, 0);
            if (lastFreeze.getTime() === today.getTime()) {
                return NextResponse.json({ message: 'Already used freeze today' }, { status: 400 });
            }
        }

        streak.freezesAvailable -= 1;
        streak.freezesUsed += 1;
        streak.lastFreezeDate = today;
        streak.lastActiveDate = today;

        streak.streakHistory.push({
            date: today,
            challengeCompleted: false,
            questionsAttempted: 0,
            correctAnswers: 0,
            frozeStreak: true
        });

        await streak.save();
        return NextResponse.json({ success: true, data: { freezesAvailable: streak.freezesAvailable, currentStreak: streak.currentStreak } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
