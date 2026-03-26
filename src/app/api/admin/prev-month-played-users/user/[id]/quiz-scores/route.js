import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrevMonthPlayedUsers from '@/models/PrevMonthPlayedUsers';
import Quiz from '@/models/Quiz';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const { id } = params; // Was userId before folder rename
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const user = await PrevMonthPlayedUsers.findOne({ originalUserId: id }).sort({ savedAt: -1 }).lean();
        if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        const quizBestScores = user.quizBestScores || [];
        const sorted = [...quizBestScores].sort((a, b) => new Date(b.lastAttemptDate || 0) - new Date(a.lastAttemptDate || 0));
        const paginated = sorted.slice(skip, skip + limit);

        const populated = await Promise.all(paginated.map(async (score) => {
            const q = await Quiz.findById(score.quizId).lean();
            return { ...score, quiz: q || null };
        }));

        return NextResponse.json({
            success: true,
            data: populated,
            user: {
                ...user,
                getScore: (user.quizBestScores || []).reduce((sum, s) => sum + (s.bestScore || 0), 0),
                totalScore: (user.quizBestScores?.length || 0) * 5
            },
            pagination: { page, limit, total: quizBestScores.length, totalPages: Math.ceil(quizBestScores.length / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
