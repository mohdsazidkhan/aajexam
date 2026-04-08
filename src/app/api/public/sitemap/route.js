import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ExamCategory from '@/models/ExamCategory';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';

export async function GET() {
    try {
        await dbConnect();

        const [users, examCategories, exams, patterns, tests] = await Promise.all([
            User.find({ role: 'student', status: 'active' }).select('username').limit(1000).sort({ createdAt: -1 }).lean(),
            ExamCategory.find({}).select('name type').lean(),
            Exam.find({ isActive: true }).select('name code').lean(),
            ExamPattern.find({}).select('title').lean(),
            PracticeTest.find({}).select('title isFree publishedAt').lean()
        ]);

        return NextResponse.json({
            success: true,
            data: { users, examCategories, exams, patterns, tests }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
