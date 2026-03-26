import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import { protect } from '@/middleware/auth';

export async function POST(req, context) {
    try {
        await dbConnect();

        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const params = await context.params;
        const id = params.id;

        await UserQuestions.updateOne({ _id: id }, { $inc: { sharesCount: 1 } });
        return NextResponse.json({ success: true, data: { shared: true } });
    } catch (err) {
        console.error('shareQuestion error:', err);
        return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
    }
}
