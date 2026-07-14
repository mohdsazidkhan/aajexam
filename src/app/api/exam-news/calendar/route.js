import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamNews from '@/models/ExamNews';

// GET /api/exam-news/calendar?month=7&year=2026
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        const now = new Date();
        const month = parseInt(searchParams.get('month')) || (now.getMonth() + 1); // 1-12
        const year = parseInt(searchParams.get('year')) || now.getFullYear();

        // Build start and end of the requested month
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        // Fetch exam news that have important dates falling in this month
        const news = await ExamNews.find({
            status: 'published',
            'importantDates.date': {
                $gte: startOfMonth,
                $lte: endOfMonth,
            }
        })
            .populate('exam', 'name code')
            .select('title slug type examName exam importantDates isPinned')
            .sort({ isPinned: -1, 'importantDates.date': 1 })
            .limit(200);

        // Flatten importantDates into individual calendar events, filter to this month only
        const events = [];
        for (const item of news) {
            for (const d of (item.importantDates || [])) {
                const eventDate = new Date(d.date);
                if (eventDate >= startOfMonth && eventDate <= endOfMonth) {
                    events.push({
                        date: eventDate.toISOString().split('T')[0], // YYYY-MM-DD
                        dateObj: eventDate,
                        label: d.label,
                        examNewsTitle: item.title,
                        examNewsSlug: item.slug,
                        type: item.type,
                        examName: item.examName || item.exam?.name || null,
                        isPinned: item.isPinned,
                    });
                }
            }
        }

        // Sort events by date
        events.sort((a, b) => a.dateObj - b.dateObj);

        // Group events by date string (YYYY-MM-DD)
        const grouped = {};
        for (const ev of events) {
            if (!grouped[ev.date]) grouped[ev.date] = [];
            // eslint-disable-next-line no-unused-vars
            const { dateObj, ...rest } = ev;
            grouped[ev.date].push(rest);
        }

        // Also fetch upcoming events (next 30 days from today) for sidebar
        const upcomingStart = new Date();
        upcomingStart.setHours(0, 0, 0, 0);
        const upcomingEnd = new Date();
        upcomingEnd.setDate(upcomingEnd.getDate() + 30);

        const upcomingNews = await ExamNews.find({
            status: 'published',
            'importantDates.date': {
                $gte: upcomingStart,
                $lte: upcomingEnd,
            }
        })
            .populate('exam', 'name code')
            .select('title slug type examName exam importantDates isPinned')
            .sort({ 'importantDates.date': 1 })
            .limit(50);

        const upcoming = [];
        for (const item of upcomingNews) {
            for (const d of (item.importantDates || [])) {
                const eventDate = new Date(d.date);
                if (eventDate >= upcomingStart && eventDate <= upcomingEnd) {
                    upcoming.push({
                        date: eventDate.toISOString().split('T')[0],
                        label: d.label,
                        examNewsTitle: item.title,
                        examNewsSlug: item.slug,
                        type: item.type,
                        examName: item.examName || item.exam?.name || null,
                        isPinned: item.isPinned,
                    });
                }
            }
        }
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

        return NextResponse.json({
            success: true,
            month,
            year,
            events: grouped,
            upcoming: upcoming.slice(0, 20),
            totalEvents: events.length,
        });
    } catch (error) {
        console.error('Calendar API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
