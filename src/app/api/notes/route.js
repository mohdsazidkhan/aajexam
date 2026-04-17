import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyNote from '@/models/StudyNote';

// GET - List study notes (public)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const exam = searchParams.get('exam');
        const noteType = searchParams.get('type');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        let query = { status: 'published' };
        if (subject) query.subject = subject;
        if (topic) query.topic = topic;
        if (exam) query.exam = exam;
        if (noteType) query.noteType = noteType;
        if (search) query.$text = { $search: search };

        const [notes, total] = await Promise.all([
            StudyNote.find(query)
                .populate('subject', 'name')
                .populate('topic', 'name')
                .select('title slug noteType subject topic difficulty views bookmarks tags createdAt')
                .sort({ views: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            StudyNote.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: notes,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
