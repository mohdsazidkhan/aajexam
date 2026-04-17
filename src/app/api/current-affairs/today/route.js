import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CurrentAffair from '@/models/CurrentAffair';

// GET - Today's current affairs
export async function GET() {
    try {
        await dbConnect();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const affairs = await CurrentAffair.find({
            date: { $gte: today, $lt: tomorrow },
            status: 'published'
        }).sort({ category: 1 });

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
