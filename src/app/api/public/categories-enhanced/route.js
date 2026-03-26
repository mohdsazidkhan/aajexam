import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Quiz from '@/models/Quiz';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({}).lean();
        const quizCounts = await Quiz.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
        const countMap = Object.fromEntries(quizCounts.map(i => [i._id?.toString(), i.count]));

        const data = categories.map(c => ({
            ...c,
            quizCount: countMap[c._id.toString()] || 0
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
