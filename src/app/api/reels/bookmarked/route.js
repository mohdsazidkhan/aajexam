import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import ReelInteraction from '@/models/ReelInteraction';
import { protect } from '@/middleware/auth';

export async function GET(req) {
	try {
		await dbConnect();
		const auth = await protect(req);
		if (!auth.authenticated) {
			return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const skip = (page - 1) * limit;

		const [interactions, total] = await Promise.all([
			ReelInteraction.find({ userId: auth.user._id, bookmarked: true })
				.sort({ updatedAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate({
					path: 'reelId',
					populate: { path: 'createdBy', select: 'name username profilePicture' }
				})
				.lean(),
			ReelInteraction.countDocuments({ userId: auth.user._id, bookmarked: true })
		]);

		const reels = interactions
			.filter(i => i.reelId)
			.map(i => ({ ...i.reelId, userInteraction: { liked: i.liked, bookmarked: i.bookmarked, answered: i.answered, isCorrect: i.isCorrect } }));

		return NextResponse.json({
			success: true,
			data: reels,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + reels.length < total }
		});
	} catch (error) {
		console.error('Bookmarked reels error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
