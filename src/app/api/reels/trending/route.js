import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';

export async function GET(req) {
	try {
		await dbConnect();
		const { searchParams } = new URL(req.url);
		const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200);
		// sort=latest returns the newest published reels instead of the 30-day trending set
		if (searchParams.get('sort') === 'latest') {
			const latest = await Reel.find({ status: 'published' })
				.sort({ publishedAt: -1, createdAt: -1 })
				.limit(limit)
				.populate('createdBy', 'name username profilePicture')
				.lean();
			return NextResponse.json({ success: true, data: latest });
		}

		// Try last 30 days first, fall back to all-time if fewer than 3 results
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		let reels = await Reel.find({
			status: 'published',
			publishedAt: { $gte: thirtyDaysAgo }
		})
			.sort({ likesCount: -1, viewsCount: -1 })
			.limit(limit)
			.populate('createdBy', 'name username profilePicture')
			.lean();

		// Fallback: if not enough recent reels, fetch all-time trending
		if (reels.length < 3) {
			reels = await Reel.find({ status: 'published' })
				.sort({ likesCount: -1, viewsCount: -1, createdAt: -1 })
				.limit(limit)
				.populate('createdBy', 'name username profilePicture')
				.lean();
		}

		return NextResponse.json({ success: true, data: reels });
	} catch (error) {
		console.error('Trending reels error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
