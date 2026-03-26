import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import User from '@/models/User';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        const attempt = await UserTestAttempt.findById(id).populate('user', 'name email').populate({ path: 'practiceTest', populate: { path: 'examPattern', populate: { path: 'exam', populate: { path: 'category' } } } });
        if (!attempt) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: attempt });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
