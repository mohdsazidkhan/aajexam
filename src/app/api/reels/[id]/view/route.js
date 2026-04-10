import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import ReelInteraction from '@/models/ReelInteraction';
import { protect } from '@/middleware/auth';

export async function POST(req, { params }) {
	try {
		await dbConnect();
		const { id } = await params;
		const body = await req.json().catch(() => ({}));
		const timeSpentSeconds = body.timeSpentSeconds || 0;

		// Always increment view count
		await Reel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

		// Track per-user interaction if logged in
		const auth = await protect(req);
		if (auth.authenticated) {
			await ReelInteraction.findOneAndUpdate(
				{ userId: auth.user._id, reelId: id },
				{
					$set: { viewedAt: new Date() },
					$inc: { timeSpentSeconds },
					$setOnInsert: { userId: auth.user._id, reelId: id }
				},
				{ upsert: true }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('View reel error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
