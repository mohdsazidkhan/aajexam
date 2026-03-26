import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({ status: 'approved' }).lean();
        const data = await Promise.all(categories.map(async (cat) => {
            const subcats = await Subcategory.find({ category: cat._id, status: 'approved' }).limit(5).lean();
            const quizzes = await Quiz.countDocuments({ category: cat._id, isActive: true, status: 'approved' });
            return { ...cat, subcategories: subcats, totalQuizzes: quizzes };
        }));

        // Sort categories by totalQuizzes descending
        data.sort((a, b) => b.totalQuizzes - a.totalQuizzes);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
