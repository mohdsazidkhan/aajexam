import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'quiz'; // quiz, category, subcategory
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const filter = { createdType: 'user', status: 'pending' };
        let items = [], total = 0;

        if (type === 'category') {
            [items, total] = await Promise.all([
                Category.find(filter).populate('createdBy', 'name email').sort({ createdAt: 1 }).skip(skip).limit(limit),
                Category.countDocuments(filter)
            ]);
        } else if (type === 'subcategory') {
            [items, total] = await Promise.all([
                Subcategory.find(filter).populate('createdBy', 'name email').populate('category', 'name').sort({ createdAt: 1 }).skip(skip).limit(limit),
                Subcategory.countDocuments(filter)
            ]);
        } else {
            [items, total] = await Promise.all([
                Quiz.find(filter).populate('createdBy', 'name email').populate('category', 'name').populate('subcategory', 'name').sort({ createdAt: 1 }).skip(skip).limit(limit),
                Quiz.countDocuments(filter)
            ]);

            // Add question counts for quizzes
            const quizIds = items.map(q => q._id);
            const qCounts = await Question.aggregate([{ $match: { quiz: { $in: quizIds } } }, { $group: { _id: '$quiz', count: { $sum: 1 } } }]);
            const countMap = Object.fromEntries(qCounts.map(c => [c._id.toString(), c.count]));
            items = items.map(q => ({ ...q.toObject(), questionCount: countMap[q._id.toString()] || 0 }));
        }

        return NextResponse.json({
            success: true,
            data: items,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
