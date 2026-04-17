import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuestionDiscussion from '@/models/QuestionDiscussion';
import { protect } from '@/middleware/auth';

// GET - Get discussions for a question
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { questionId } = await params;
        const { searchParams } = new URL(req.url);
        const sort = searchParams.get('sort') || 'upvotes'; // upvotes or recent
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const sortOption = sort === 'recent' ? { createdAt: -1 } : { upvotes: -1, createdAt: -1 };

        // Get top-level comments
        const [discussions, total] = await Promise.all([
            QuestionDiscussion.find({ question: questionId, parentId: null, status: 'active' })
                .populate('user', 'name username profilePicture')
                .sort(sortOption)
                .skip((page - 1) * limit)
                .limit(limit),
            QuestionDiscussion.countDocuments({ question: questionId, parentId: null, status: 'active' })
        ]);

        // Get replies for each discussion
        const discussionIds = discussions.map(d => d._id);
        const replies = await QuestionDiscussion.find({
            parentId: { $in: discussionIds },
            status: 'active'
        })
            .populate('user', 'name username profilePicture')
            .sort({ createdAt: 1 });

        const repliesMap = {};
        replies.forEach(r => {
            const parentId = r.parentId.toString();
            if (!repliesMap[parentId]) repliesMap[parentId] = [];
            repliesMap[parentId].push(r);
        });

        const result = discussions.map(d => ({
            ...d.toObject(),
            replies: repliesMap[d._id.toString()] || []
        }));

        return NextResponse.json({
            success: true,
            data: result,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Add discussion/comment
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { questionId } = await params;
        const { content, parentId, isShortcut } = await req.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ message: 'Content required' }, { status: 400 });
        }

        const discussion = await QuestionDiscussion.create({
            question: questionId,
            user: auth.user._id,
            content: content.trim(),
            parentId: parentId || null,
            isShortcut: isShortcut || false
        });

        const populated = await QuestionDiscussion.findById(discussion._id)
            .populate('user', 'name username profilePicture');

        return NextResponse.json({ success: true, data: populated }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
