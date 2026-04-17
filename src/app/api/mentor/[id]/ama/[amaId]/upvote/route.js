import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect } from '@/middleware/auth';

// POST - Upvote an AMA answer
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { id, amaId } = await params;
        const userId = auth.user._id;

        const mentor = await MentorProfile.findById(id);
        if (!mentor) return NextResponse.json({ message: 'Mentor not found' }, { status: 404 });

        const thread = mentor.amaThreads.id(amaId);
        if (!thread) return NextResponse.json({ message: 'AMA not found' }, { status: 404 });

        const alreadyUpvoted = thread.upvotedBy.includes(userId);
        if (alreadyUpvoted) {
            thread.upvotedBy.pull(userId);
            thread.upvotes -= 1;
        } else {
            thread.upvotedBy.push(userId);
            thread.upvotes += 1;
        }

        await mentor.save();
        return NextResponse.json({ success: true, data: { upvotes: thread.upvotes, upvoted: !alreadyUpvoted } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
