import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import { buildExamContent } from '@/lib/web/examContent';

// Slug-based web endpoint (canonical for SEO).
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;
        const exam = await Exam.findOne({ slug }).select('_id name slug code').lean();
        if (!exam) {
            return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 });
        }
        const data = await buildExamContent(exam._id, req);
        return NextResponse.json({ ...data, exam });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
