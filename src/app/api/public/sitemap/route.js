import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Level from '@/models/Level';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import ExamCategory from '@/models/ExamCategory';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';

export async function GET() {
    try {
        await dbConnect();

        const [articles, levels, categories, subcategories, users, quizzes, examCategories, exams, patterns, tests] = await Promise.all([
            Article.find({ status: 'published' }).select('slug updatedAt').lean(),
            Level.find({ isActive: true }).select('levelNumber').lean(),
            Category.find({ status: 'approved' }).select('name').lean(),
            Subcategory.find({ status: 'approved' }).select('name').lean(),
            User.find({ role: 'student', status: 'active' }).select('username').limit(1000).sort({ 'level.totalScore': -1 }).lean(),
            Quiz.find({ isActive: true }).select('title updatedAt').lean(),
            ExamCategory.find({}).select('name type').lean(),
            Exam.find({ isActive: true }).select('name code').lean(),
            ExamPattern.find({}).select('title').lean(),
            PracticeTest.find({}).select('title isFree publishedAt').lean()
        ]);

        return NextResponse.json({
            success: true,
            data: { articles, levels, categories, subcategories, users, quizzes, examCategories, exams, patterns, tests }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
