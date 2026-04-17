import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';

// GET - Single mentor profile
export async function GET(req, { params }) {
    try {
        await dbConnect();
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
