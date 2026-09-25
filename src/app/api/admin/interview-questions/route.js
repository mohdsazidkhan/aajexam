import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewQuestion from '@/models/InterviewQuestion';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search');

        const query = search
            ? { $or: [{ question: { $regex: search, $options: 'i' } }, { answer: { $regex: search, $options: 'i' } }, { questionHi: { $regex: search, $options: 'i' } }, { answerHi: { $regex: search, $options: 'i' } }] }
            : {};

        const [questions, total] = await Promise.all([
            InterviewQuestion.find(query)
                .populate('category', 'name type')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            InterviewQuestion.countDocuments(query)
        ]);

        return NextResponse.json({ success: true, data: questions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
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

        const question = await InterviewQuestion.create(body);
        return NextResponse.json({ success: true, data: question }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
