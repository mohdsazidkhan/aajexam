import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamPattern from '@/models/ExamPattern';
import { protect, admin } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const body = await req.json();
        const pattern = await ExamPattern.create(body);
        return NextResponse.json({ success: true, data: pattern }, { status: 201 });
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
        const pattern = await ExamPattern.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ success: true, data: pattern });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
