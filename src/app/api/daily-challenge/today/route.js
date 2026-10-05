import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';
import { hydrateDailyChallenge } from '@/lib/utils/hydrateTestQuestions';
import DailyChallengeAttempt from '@/models/DailyChallengeAttempt';
import { protect } from '@/middleware/auth';
import { istDayRange } from '@/lib/utils/istDay';

// GET - Get today's challenge
export async function GET(req) {
    try {
        await dbConnect();
        // "Today" is the IST calendar day (the server runs in UTC).
        const { start, end } = istDayRange();

        const challenge = await DailyChallenge.findOne({
            date: { $gte: start, $lt: end },
            status: 'published'
        }).lean();

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
            }).lean();
            if (attempt) {
                attempted = true;
                attemptData = attempt;
            }
        }

        await hydrateDailyChallenge(challenge);

        // Hide correct answers if not attempted
        const challengeData = { ...challenge };
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
