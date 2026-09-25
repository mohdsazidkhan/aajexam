import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewCategory from '@/models/InterviewCategory';

// GET - Single interview category by slug (public). Falls back to
// previousSlugs so old/renamed links keep resolving.
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;
        const category = await InterviewCategory.findOne({
            $or: [{ slug }, { previousSlugs: slug }],
            isActive: true
        }).select('name slug type order').lean();

        if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
