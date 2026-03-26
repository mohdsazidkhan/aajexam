import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();

        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const userId = auth.user._id || auth.user.id;

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limitParam = parseInt(searchParams.get('limit')) || 20;

        const limitNum = Math.min(limitParam, 100);
        const skip = (page - 1) * limitNum;

        const filter = { userId };
        if (status) {
            filter.status = status;
        }

        const [items, total] = await Promise.all([
            UserQuestions.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            UserQuestions.countDocuments(filter)
        ]);

        return NextResponse.json({
            success: true,
            data: items,
            pagination: { page, limit: limitNum, total, totalPages: Math.max(1, Math.ceil(total / limitNum)) }
        });
    } catch (err) {
        console.error('listMyQuestions error:', err);
        return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
    }
}
