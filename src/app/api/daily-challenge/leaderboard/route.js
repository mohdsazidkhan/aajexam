import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';
import DailyChallengeAttempt from '@/models/DailyChallengeAttempt';
import { istDayRange } from '@/lib/utils/istDay';

// GET - Today's challenge leaderboard
export async function GET(req) {
    try {
        await dbConnect();
        // "Today" is the IST calendar day (the server runs in UTC).
        const { start, end } = istDayRange();

        const challenge = await DailyChallenge.findOne({ date: { $gte: start, $lt: end }, status: 'published' }).select('_id').lean();
        if (!challenge) return NextResponse.json({ success: true, data: [] });

        const leaderboard = await DailyChallengeAttempt.find({ challenge: challenge._id })
            .populate('user', 'name username profilePicture')
            .select('score accuracy totalTime correctCount')
            .sort({ score: -1, totalTime: 1 })
            .limit(50)
            .lean();

        return NextResponse.json({ success: true, data: leaderboard });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
