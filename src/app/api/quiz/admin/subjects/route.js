import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { protect, admin } from '@/middleware/auth';

// GET - list all subjects (optionally filter by exam)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const exam = searchParams.get('exam');
        const filter = {};
        if (exam) filter.exam = exam;

        const subjects = await Subject.find(filter).populate('exam', 'name code').sort({ order: 1, name: 1 });
        return NextResponse.json({ success: true, data: subjects });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - create a new subject
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { exam, name, description, icon, order } = await req.json();
        if (!exam || !name) return NextResponse.json({ message: 'exam and name are required' }, { status: 400 });

        const subject = await Subject.create({ exam, name, description, icon, order });
        return NextResponse.json({ success: true, data: subject }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'This subject already exists for this exam' }, { status: 409 });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
