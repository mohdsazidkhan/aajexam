import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CurrentAffair from '@/models/CurrentAffair';
import { parseExamIds, applyExamScope } from '@/lib/utils/targetExams';

// GET - Today's current affairs
export async function GET(req) {
    try {
        await dbConnect();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const query = applyExamScope(
            { date: { $gte: today, $lt: tomorrow }, status: 'published' },
            parseExamIds(new URL(req.url).searchParams.get('examIds')),
            { includeGeneric: true }
        );
        const affairs = await CurrentAffair.find(query).sort({ category: 1 }).lean();

        // Group by category
        const grouped = {};
        affairs.forEach(a => {
            if (!grouped[a.category]) grouped[a.category] = [];
            grouped[a.category].push(a);
        });

        return NextResponse.json({ success: true, data: { affairs, grouped, total: affairs.length } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
