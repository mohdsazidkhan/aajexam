import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect } from '@/middleware/auth';

// POST - Apply to become a mentor
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        // Check if already applied
        const existing = await MentorProfile.findOne({ user: auth.user._id });
        if (existing) {
            return NextResponse.json({ message: 'Already applied', data: existing }, { status: 400 });
        }

        const body = await req.json();
        const profile = await MentorProfile.create({
            user: auth.user._id,
            examsCleared: body.examsCleared,
            strategy: body.strategy,
            tips: body.tips || [],
            dailyRoutine: body.dailyRoutine || '',
            booksRecommended: body.booksRecommended || [],
            preparationMonths: body.preparationMonths || 0,
            specialization: body.specialization || [],
            status: 'pending'
        });

        return NextResponse.json({ success: true, data: profile }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
