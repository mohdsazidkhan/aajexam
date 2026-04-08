import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Question from '@/models/Question';
import Exam from '@/models/ExamCategory';

export async function GET() {
    try {
        await dbConnect();
        const [totalUsers, totalCategories, totalSubcategories, totalQuestions, paidSubscriptions, totalExams] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Category.countDocuments(), Subcategory.countDocuments(), Question.countDocuments(),
            User.countDocuments({ role: 'student', subscriptionStatus: { $nin: ['free'] } }),
            Exam.countDocuments()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                activeStudents: totalUsers, quizCategories: totalCategories, subcategories: totalSubcategories, totalQuestions,
                totalExams, paidSubscriptions
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
