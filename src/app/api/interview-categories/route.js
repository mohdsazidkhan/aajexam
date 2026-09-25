import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewCategory from '@/models/InterviewCategory';

// GET - List interview categories (public)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        const query = { isActive: true };
        if (type) query.type = type;

        const categories = await InterviewCategory.find(query)
            .select('name slug type order')
            .sort({ order: 1, name: 1 })
            .lean();

        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
