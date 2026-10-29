import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CurrentAffair from '@/models/CurrentAffair';
import { parseExamIds, applyExamScope } from '@/lib/utils/targetExams';

// GET - List current affairs (public)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const day = searchParams.get('day');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200);
        const search = searchParams.get('search');
        // The monthly digest screen shows each item's text; plain lists stay light.
        const digest = searchParams.get('digest') === '1';

        let query = { status: 'published' };
        if (category) query.category = category;
        applyExamScope(query, parseExamIds(searchParams.get('examIds')), { includeGeneric: true });
        if (search) query.$text = { $search: search };

        if (day && month && year) {
            const startDate = new Date(year, month - 1, day);
            const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        } else if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const [affairs, total] = await Promise.all([
            CurrentAffair.find(query)
                .select(digest ? 'title slug category date content keyPoints' : 'title slug category date keyPoints tags views questions.length')
                .sort({ date: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
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
