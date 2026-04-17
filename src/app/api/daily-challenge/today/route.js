import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';
import DailyChallengeAttempt from '@/models/DailyChallengeAttempt';
import { protect } from '@/middleware/auth';

// GET - Get today's challenge
export async function GET(req) {
    try {
        await dbConnect();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const challenge = await DailyChallenge.findOne({
            date: { $gte: today, $lt: tomorrow },
            status: 'published'
        });

        if (!challenge) {
            return NextResponse.json({ success: true, data: null, message: 'No challenge today' });
        }

        // Check if user already attempted
        let attempted = false;
        let attemptData = null;
        const auth = await protect(req).catch(() => ({ authenticated: false }));

        if (auth.authenticated) {
            const attempt = await DailyChallengeAttempt.findOne({
                user: auth.user._id,
                challenge: challenge._id
            });
            if (attempt) {
                attempted = true;
                attemptData = attempt;
            }
        }

        // Hide correct answers if not attempted
        const challengeData = challenge.toObject();
        if (!attempted) {
            challengeData.questions = challengeData.questions.map(q => ({
                ...q,
                options: q.options.map(o => ({ text: o.text })),
                explanation: undefined
            }));
        }

        return NextResponse.json({
            success: true,
            data: { challenge: challengeData, attempted, attemptData }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
