import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CurrentAffair from '@/models/CurrentAffair';

// GET - List current affairs (public)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search');

        let query = { status: 'published' };
        if (category) query.category = category;
        if (search) query.$text = { $search: search };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const [affairs, total] = await Promise.all([
            CurrentAffair.find(query)
                .select('title category date keyPoints tags views questions.length')
                .sort({ date: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            CurrentAffair.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: affairs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
