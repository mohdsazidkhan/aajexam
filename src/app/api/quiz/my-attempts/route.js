import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';

// GET - user's quiz attempt history
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const filter = { user: auth.user._id };
        if (status) filter.status = status;

        const [attempts, total] = await Promise.all([
            QuizAttempt.find(filter)
                .populate({
                    path: 'quiz',
                    select: 'title applicableExams subject topic type difficulty duration totalMarks',
                    populate: [
                        { path: 'applicableExams', select: 'name code' },
                        { path: 'subject', select: 'name' },
                        { path: 'topic', select: 'name' }
                    ]
                })
                .select('-answers')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            QuizAttempt.countDocuments(filter)
        ]);

        return NextResponse.json({
            success: true,
            data: attempts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
