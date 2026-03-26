import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { id: testId } = await params;
        const { attemptId, answers } = await req.json();
        const auth = await protect(req);

        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const attempt = await UserTestAttempt.findOne({
            _id: attemptId,
            user: auth.user.id,
            practiceTest: testId,
            status: 'InProgress'
        });

        if (!attempt) return NextResponse.json({ success: false, message: 'Attempt not found' }, { status: 404 });

        attempt.answers = answers;
        await attempt.save();

        return NextResponse.json({ success: true, message: 'Answers saved', data: { attemptId: attempt._id, answersCount: answers.length } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
