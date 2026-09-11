import { protect, proOnly } from '@/middleware/auth';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import QuizChallenge from '@/models/QuizChallenge';
import QuizAttempt from '@/models/QuizAttempt'; // needed for population
import Quiz from '@/models/Quiz'; // needed for population
import User from '@/models/User'; // needed for population

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        
        const user = auth.user;
        
        if (!proOnly(user)) {
            return NextResponse.json({ success: false, message: 'Only PRO users can access challenges' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        // Find challenges hosted by the user
        const [challenges, total] = await Promise.all([
            QuizChallenge.find({ host: user._id })
                .populate({
                    path: 'quiz',
                    select: 'title subject',
                    populate: {
                        path: 'subject',
                        select: 'name'
                    }
                })
                .populate({
                    path: 'hostAttempt',
                    select: 'score percentage totalTime correctCount wrongCount'
                })
                .populate({
                    path: 'challengers.user',
                    select: 'name email profilePic'
                })
                .populate({
                    path: 'challengers.attempt',
                    select: 'score percentage totalTime correctCount wrongCount createdAt'
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            QuizChallenge.countDocuments({ host: user._id })
        ]);

        return NextResponse.json({
            success: true,
            data: challenges,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Fetch my challenges error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
