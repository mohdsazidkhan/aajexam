import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamCategory from '@/models/ExamCategory';
import { protect, admin } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const { name, type, description } = await req.json();
        if (!name || !type || !['Central', 'State'].includes(type)) return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
        const category = await ExamCategory.create({ name, type, description });
        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const { id } = params;
        const body = await req.json();
        const category = await ExamCategory.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!category) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
