import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamNews from '@/models/ExamNews';

// GET - List exam news (public)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const examId = searchParams.get('examId');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        let query = { status: 'published' };
        if (type) query.type = type;
        if (examId) query.exam = examId;
        if (search) query.$text = { $search: search };

        const [news, total] = await Promise.all([
            ExamNews.find(query)
                .populate('exam', 'name code')
                .sort({ isPinned: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            ExamNews.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: news,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
