import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id: testId } = await params;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 10;

        const leaderboard = await UserTestAttempt.find({ practiceTest: testId, status: 'Completed' })
            .populate('user', 'name username email')
            .sort({ score: -1, totalTime: 1 })
            .limit(limit)
            .select('user score correctCount accuracy rank percentile totalTime submittedAt');

        return NextResponse.json({ success: true, data: leaderboard, count: leaderboard.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
