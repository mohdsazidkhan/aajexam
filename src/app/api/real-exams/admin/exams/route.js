import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const exams = await Exam.find()
            .populate('category', 'name type')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: exams, count: exams.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const { category, name, code, description, logo, isActive } = await req.json();
        const exam = await Exam.create({ category, name, code: code?.toUpperCase(), description, logo, isActive: isActive ?? true });
        return NextResponse.json({ success: true, data: exam }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
