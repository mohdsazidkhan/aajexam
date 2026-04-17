import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';
import { protect, admin } from '@/middleware/auth';

// GET - Admin list challenges
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const [challenges, total] = await Promise.all([
            DailyChallenge.find().sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
            DailyChallenge.countDocuments()
        ]);

        return NextResponse.json({
            success: true,
            data: challenges,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Create challenge
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const body = await req.json();

        const challenge = await DailyChallenge.create(body);
        return NextResponse.json({ success: true, data: challenge }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
