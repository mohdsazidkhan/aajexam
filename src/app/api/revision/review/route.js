import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RevisionQueue from '@/models/RevisionQueue';
import { protect } from '@/middleware/auth';

// POST - Submit review answer (SM-2 spaced repetition algorithm)
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { itemId, quality } = await req.json();
        // quality: 0-5 (0=wrong, 3=correct with difficulty, 5=perfect)

        const item = await RevisionQueue.findOne({ _id: itemId, user: auth.user._id });
        if (!item) return NextResponse.json({ message: 'Item not found' }, { status: 404 });

        const q = Math.min(5, Math.max(0, quality));

        // SM-2 Algorithm
        if (q >= 3) {
            // Correct answer
            if (item.repetitions === 0) {
                item.interval = 1;
            } else if (item.repetitions === 1) {
                item.interval = 3;
            } else {
                item.interval = Math.round(item.interval * item.easeFactor);
            }
            item.repetitions += 1;
            item.lastAnswer = 'correct';
            item.correctReviews += 1;
        } else {
            // Wrong answer - reset
            item.repetitions = 0;
            item.interval = 1;
            item.lastAnswer = 'wrong';
        }

        // Update ease factor
        item.easeFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

        item.totalReviews += 1;
        item.lastReviewedAt = new Date();
        item.nextReviewDate = new Date(Date.now() + item.interval * 24 * 60 * 60 * 1000);

        // User's rule: once an item is reviewed, don't show it again in the revision queue.
        // We mark it 'suspended' so it is permanently excluded from the active due list.
        item.status = 'suspended';

        await item.save();

        return NextResponse.json({
            success: true,
            data: {
                nextReviewDate: item.nextReviewDate,
                interval: item.interval,
                status: item.status,
                repetitions: item.repetitions
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
