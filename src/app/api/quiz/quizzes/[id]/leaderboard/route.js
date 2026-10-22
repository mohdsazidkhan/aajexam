import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';

// GET - quiz leaderboard
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200), 100);

        const isObjectId = mongoose.Types.ObjectId.isValid(id) && (new String(id).length === 24);
        const query = isObjectId ? { _id: id } : { slug: id };
        const quiz = await Quiz.findOne(query).select('_id').lean();
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        const leaderboard = await QuizAttempt.find({ quiz: quiz._id, status: 'Completed' })
            .populate('user', 'name username profilePicture')
            .select('user score accuracy totalTime rank percentile percentage submittedAt')
            .sort({ score: -1, accuracy: -1, totalTime: 1 })
            .limit(limit)
            .lean();

        // Live ranks (ties share a rank): stored ranks are only "rank at submission" now.
        const total = await QuizAttempt.countDocuments({ quiz: quiz._id, status: 'Completed' });
        let prev = null, prevRank = 1;
        leaderboard.forEach((row, i) => {
            const same = prev && prev.score === row.score && prev.accuracy === row.accuracy && prev.totalTime === row.totalTime;
            const rank = i === 0 ? 1 : (same ? prevRank : i + 1);
            row.rank = rank;
            row.percentile = total > 1 ? Number((((total - rank) / (total - 1)) * 100).toFixed(2)) : 100;
            prev = row; prevRank = rank;
        });

        return NextResponse.json({ success: true, data: leaderboard });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
