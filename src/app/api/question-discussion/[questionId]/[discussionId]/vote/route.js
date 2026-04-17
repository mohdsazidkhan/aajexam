import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuestionDiscussion from '@/models/QuestionDiscussion';
import { protect } from '@/middleware/auth';

// POST - Upvote/downvote a discussion
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { discussionId } = await params;
        const { type } = await req.json(); // 'upvote' or 'downvote'
        const userId = auth.user._id;

        const discussion = await QuestionDiscussion.findById(discussionId);
        if (!discussion) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        if (type === 'upvote') {
            const alreadyUpvoted = discussion.upvotedBy.includes(userId);
            if (alreadyUpvoted) {
                discussion.upvotedBy.pull(userId);
                discussion.upvotes -= 1;
            } else {
                discussion.upvotedBy.push(userId);
                discussion.upvotes += 1;
                // Remove downvote if exists
                if (discussion.downvotedBy.includes(userId)) {
                    discussion.downvotedBy.pull(userId);
                    discussion.downvotes -= 1;
                }
            }
        } else if (type === 'downvote') {
            const alreadyDownvoted = discussion.downvotedBy.includes(userId);
            if (alreadyDownvoted) {
                discussion.downvotedBy.pull(userId);
                discussion.downvotes -= 1;
            } else {
                discussion.downvotedBy.push(userId);
                discussion.downvotes += 1;
                if (discussion.upvotedBy.includes(userId)) {
                    discussion.upvotedBy.pull(userId);
                    discussion.upvotes -= 1;
                }
            }
        }

        await discussion.save();
        return NextResponse.json({
            success: true,
            data: { upvotes: discussion.upvotes, downvotes: discussion.downvotes }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
