import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewQuestion from '@/models/InterviewQuestion';
import InterviewCategory from '@/models/InterviewCategory';

// GET - List interview questions (public)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        let query = { status: 'published' };
        if (category) {
            // A specific category already implies its type, so it takes precedence
            // over the broader type filter (which would otherwise overwrite it).
            query.category = category;
        } else if (type) {
            const categoryIds = await InterviewCategory.find({ type }).select('_id').lean();
            query.category = { $in: categoryIds.map(c => c._id) };
        }
        if (search) query.$text = { $search: search };

        const [questions, total] = await Promise.all([
            InterviewQuestion.find(query)
                .populate('category', 'name slug type')
                .select('question questionHi slug category views tags createdAt')
                .sort({ views: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            InterviewQuestion.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: questions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
