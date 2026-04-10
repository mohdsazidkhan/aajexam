import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import ReelInteraction from '@/models/ReelInteraction';
import { protect } from '@/middleware/auth';

export async function POST(req, { params }) {
	try {
		await dbConnect();
		const { id } = await params;

		await Reel.findByIdAndUpdate(id, { $inc: { sharesCount: 1 } });

		const auth = await protect(req);
		if (auth.authenticated) {
			await ReelInteraction.findOneAndUpdate(
				{ userId: auth.user._id, reelId: id },
				{ $set: { shared: true }, $setOnInsert: { userId: auth.user._id, reelId: id } },
				{ upsert: true }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Share reel error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
