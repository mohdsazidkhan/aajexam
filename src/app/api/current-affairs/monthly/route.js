import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CurrentAffair from '@/models/CurrentAffair';

// GET - Monthly compilation (text-based, no PDF)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;
        const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const affairs = await CurrentAffair.find({
            date: { $gte: startDate, $lte: endDate },
            status: 'published'
        }).sort({ date: 1, category: 1 });

        // Group by date then category
        const byDate = {};
        affairs.forEach(a => {
            const dateKey = a.date.toISOString().split('T')[0];
            if (!byDate[dateKey]) byDate[dateKey] = {};
            if (!byDate[dateKey][a.category]) byDate[dateKey][a.category] = [];
            byDate[dateKey][a.category].push({
                title: a.title,
                keyPoints: a.keyPoints,
                content: a.content
            });
        });

        // Collect all questions for monthly quiz
        const allQuestions = affairs.flatMap(a => a.questions || []);

        return NextResponse.json({
            success: true,
            data: {
                month, year,
                totalAffairs: affairs.length,
                totalQuestions: allQuestions.length,
                byDate,
                questions: allQuestions.slice(0, 50) // max 50 questions for monthly quiz
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
