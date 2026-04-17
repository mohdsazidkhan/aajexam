import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';
import DailyChallengeAttempt from '@/models/DailyChallengeAttempt';

// GET - Today's challenge leaderboard
export async function GET(req) {
    try {
        await dbConnect();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const challenge = await DailyChallenge.findOne({ date: { $gte: today, $lt: tomorrow }, status: 'published' });
        if (!challenge) return NextResponse.json({ success: true, data: [] });

        const leaderboard = await DailyChallengeAttempt.find({ challenge: challenge._id })
            .populate('user', 'name username profilePicture')
            .select('score accuracy totalTime correctCount')
            .sort({ score: -1, totalTime: 1 })
            .limit(50);

        return NextResponse.json({ success: true, data: leaderboard });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
