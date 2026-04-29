import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { buildExamContent } from '@/lib/web/examContent';

// Web-only endpoint (ID-based). Slug-based equivalent lives at
// /api/real-exams/web/exams/by-slug/[slug]/content. Mobile app continues
// using the legacy /api/real-exams/exams/[id]/practice-tests route.
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const data = await buildExamContent(id, req);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
