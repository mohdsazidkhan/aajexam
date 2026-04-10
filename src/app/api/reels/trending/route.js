import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';

export async function GET(req) {
	try {
		await dbConnect();
		const { searchParams } = new URL(req.url);
		const limit = parseInt(searchParams.get('limit') || '20');

		// Trending = most liked in last 7 days
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const reels = await Reel.find({
			status: 'published',
			publishedAt: { $gte: sevenDaysAgo }
		})
			.sort({ likesCount: -1, viewsCount: -1 })
			.limit(limit)
			.populate('createdBy', 'name username profilePicture')
			.lean();

		return NextResponse.json({ success: true, data: reels });
	} catch (error) {
		console.error('Trending reels error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
