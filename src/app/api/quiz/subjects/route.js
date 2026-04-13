import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';

// GET - public: list active subjects for an exam
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const exam = searchParams.get('exam');
        if (!exam) return NextResponse.json({ message: 'exam query param is required' }, { status: 400 });

        const subjects = await Subject.find({ exam, isActive: true })
            .select('name description icon order')
            .sort({ order: 1, name: 1 });

        return NextResponse.json({ success: true, data: subjects });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
