import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Exam from '@/models/ExamCategory';

export async function GET() {
    try {
        await dbConnect();
        const [totalUsers, paidSubscriptions, totalExams] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'student', subscriptionStatus: { $nin: ['free'] } }),
            Exam.countDocuments()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                activeStudents: totalUsers,
                totalExams, paidSubscriptions
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
