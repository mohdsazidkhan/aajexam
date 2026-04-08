import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ExamCategory from '@/models/ExamCategory';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        const regex = new RegExp(query, 'i');

        // users
        const users = await User.find({ $or: [{ name: regex }, { username: regex }, { email: regex }] }).select('_id name username profilePicture level').lean();

        // govt exams
        const [govtExamCategories, govtExams, examPatterns, practiceTests] = await Promise.all([
            ExamCategory.find({ $or: [{ name: regex }, { description: regex }] }).lean(),
            Exam.find({ isActive: true, $or: [{ name: regex }, { code: regex }] }).populate('category', 'name').lean(),
            ExamPattern.find({ $or: [{ title: regex }] }).populate('exam', 'name').lean(),
            PracticeTest.find({ $or: [{ title: regex }] }).populate('examPattern', 'title').lean()
        ]);

        return NextResponse.json({
            success: true,
            page, limit,
            users: users.map(u => ({ ...u, type: 'user' })),
            govtExamCategories: govtExamCategories.map(c => ({ ...c, type: 'examCategory' })),
            govtExams: govtExams.map(e => ({ ...e, type: 'exam' })),
            examPatterns: examPatterns.map(p => ({ ...p, type: 'pattern' })),
            practiceTests: practiceTests.map(t => ({ ...t, type: 'test' }))
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
