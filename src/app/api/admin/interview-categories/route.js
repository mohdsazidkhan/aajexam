import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewCategory from '@/models/InterviewCategory';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search');

        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        const [categories, total] = await Promise.all([
            InterviewCategory.find(query)
                .sort({ type: 1, order: 1, name: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            InterviewCategory.countDocuments(query)
        ]);

        return NextResponse.json({ success: true, data: categories, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const body = await req.json();

        const category = await InterviewCategory.create(body);
        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
