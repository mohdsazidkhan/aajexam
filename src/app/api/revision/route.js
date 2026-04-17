import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RevisionQueue from '@/models/RevisionQueue';
import { protect } from '@/middleware/auth';

// GET - Get user's revision queue (due today)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status') || 'active';

        const now = new Date();

        const dueItems = await RevisionQueue.find({
            user: auth.user._id,
            status,
            nextReviewDate: { $lte: now }
        })
            .populate('question', 'questionText options explanation difficulty subject topic')
            .sort({ nextReviewDate: 1 })
            .limit(limit);

        const totalDue = await RevisionQueue.countDocuments({
            user: auth.user._id,
            status: 'active',
            nextReviewDate: { $lte: now }
        });

        const totalItems = await RevisionQueue.countDocuments({
            user: auth.user._id,
            status: 'active'
        });

        const mastered = await RevisionQueue.countDocuments({
            user: auth.user._id,
            status: 'mastered'
        });

        return NextResponse.json({
            success: true,
            data: {
                dueItems,
                stats: { totalDue, totalItems, mastered }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Add question to revision queue (called when user gets answer wrong)
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { questionId, source = 'quiz', sourceId } = await req.json();

        // Check if already in queue
        let item = await RevisionQueue.findOne({ user: auth.user._id, question: questionId });

        if (item) {
            // Reset if re-added (got wrong again)
            item.interval = 1;
            item.easeFactor = Math.max(1.3, item.easeFactor - 0.2);
            item.nextReviewDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
            item.lastAnswer = 'wrong';
            item.status = 'active';
            await item.save();
        } else {
            item = await RevisionQueue.create({
                user: auth.user._id,
                question: questionId,
                source,
                sourceId,
                nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
                interval: 1,
                easeFactor: 2.5,
                lastAnswer: 'wrong'
            });
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
