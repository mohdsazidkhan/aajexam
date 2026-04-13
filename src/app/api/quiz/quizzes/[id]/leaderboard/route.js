import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';

// GET - quiz leaderboard
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 20;

        const leaderboard = await QuizAttempt.find({ quiz: id, status: 'Completed' })
            .populate('user', 'name username profilePicture')
            .select('user score accuracy totalTime rank percentile percentage submittedAt')
            .sort({ score: -1, accuracy: -1, totalTime: 1 })
            .limit(limit);

        return NextResponse.json({ success: true, data: leaderboard });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
