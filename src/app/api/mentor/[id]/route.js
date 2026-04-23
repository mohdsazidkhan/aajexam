import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect } from '@/middleware/auth';
import { hasAccess } from '@/lib/subscription';

// GET - Single mentor profile (PRO ONLY)
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });

        const user = auth.user;
        if (!hasAccess(user, 'PRO', 'mentor')) {
            return NextResponse.json({
                success: false,
                message: 'Mentors are a PRO feature. Upgrade to connect with experts!'
            }, { status: 403 });
        }

        const { id } = await params;
        const mentor = await MentorProfile.findOne({ _id: id, status: 'active' })
            .populate('user', 'name username profilePicture bio followersCount')
            .populate('amaThreads.askedBy', 'name username');

        if (!mentor) return NextResponse.json({ message: 'Mentor not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: mentor });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
