import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import UserQuestions from '@/models/UserQuestions';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { username } = await params;
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const [categories, subcategories, userQuestions] = await Promise.all([
            Category.find({ createdBy: user._id, status: 'approved' }).select('name description createdAt').sort({ createdAt: -1 }).limit(10),
            Subcategory.find({ createdBy: user._id, status: 'approved' }).select('name category description createdAt').populate('category', 'name').sort({ createdAt: -1 }).limit(10),
            UserQuestions.find({ userId: user._id, status: 'approved' }).select('questionText options viewsCount likesCount sharesCount createdAt').sort({ createdAt: -1 }).limit(10)
        ]);

        return NextResponse.json({
            success: true,
            contributions: {
                categories: { items: categories, total: await Category.countDocuments({ createdBy: user._id, status: 'approved' }) },
                subcategories: { items: subcategories, total: await Subcategory.countDocuments({ createdBy: user._id, status: 'approved' }) },
                userQuestions: { items: userQuestions, total: await UserQuestions.countDocuments({ userId: user._id, status: 'approved' }) }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
