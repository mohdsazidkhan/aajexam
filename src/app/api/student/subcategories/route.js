import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';
import Quiz from '@/models/Quiz';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let query = {};
        if (category) {
            query.category = category;
        }

        const subs = await Subcategory.find(query).populate('category', 'name');

        if (!subs || subs.length === 0) {
            return NextResponse.json([]);
        }

        const subcategoryIds = subs.map((s) => s._id);
        const quizCounts = await Quiz.aggregate([
            { $match: { subcategory: { $in: subcategoryIds }, isActive: true } },
            { $group: { _id: '$subcategory', count: { $sum: 1 } } },
        ]);

        const idToCount = quizCounts.reduce((acc, curr) => {
            acc[String(curr._id)] = curr.count;
            return acc;
        }, {});

        const subsWithCounts = subs.map((s) => ({
            ...s.toObject(),
            quizCount: idToCount[String(s._id)] || 0,
        }));

        return NextResponse.json(subsWithCounts);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch subcategories' }, { status: 500 });
    }
}
