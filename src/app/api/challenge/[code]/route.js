import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import QuizChallenge from '@/models/QuizChallenge';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { code } = params;
        const auth = await protect(req);
        const user = auth.authenticated ? auth.user : null; // Optional auth, but helpful to know if current user played

        const challenge = await QuizChallenge.findOne({ code })
            .populate('host', 'name profilePicture')
            .populate('quiz', 'title slug totalMarks duration')
            .populate('hostAttempt', 'score percentage correctCount wrongCount totalTime')
            .populate({
                path: 'challengers.user',
                select: 'name profilePicture'
            })
            .populate({
                path: 'challengers.attempt',
                select: 'score percentage correctCount wrongCount totalTime'
            })
            .lean();

        if (!challenge) {
            return NextResponse.json({ success: false, message: 'Challenge not found' }, { status: 404 });
        }

        // Build Leaderboard
        let leaderboard = [
            {
                user: challenge.host,
                score: challenge.hostAttempt?.score || 0,
                percentage: challenge.hostAttempt?.percentage || 0,
                totalTime: challenge.hostAttempt?.totalTime || 0,
                isHost: true
            }
        ];

        challenge.challengers.forEach(ch => {
            leaderboard.push({
                user: ch.user,
                score: ch.attempt?.score || 0,
                percentage: ch.attempt?.percentage || 0,
                totalTime: ch.attempt?.totalTime || 0,
                isHost: false
            });
        });

        // Sort by score DESC, then time ASC
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.totalTime - b.totalTime;
        });

        // Check if current user has already played this challenge
        const hasPlayed = user ? challenge.challengers.some(ch => ch.user._id.toString() === user.id) || challenge.host._id.toString() === user.id : false;

        return NextResponse.json({
            success: true,
            challenge: {
                _id: challenge._id,
                code: challenge.code,
                quiz: challenge.quiz,
                host: challenge.host,
                hasPlayed
            },
            leaderboard
        });

    } catch (error) {
        console.error('Fetch challenge error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
