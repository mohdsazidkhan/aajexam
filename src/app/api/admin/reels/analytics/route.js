import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import ReelInteraction from '@/models/ReelInteraction';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
	try {
		const auth = await protect(req);
		if (!auth.authenticated || !admin(auth.user)) {
			return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
		}

		await dbConnect();

		const [
			totalReels,
			publishedReels,
			pendingReels,
			totalViews,
			totalLikes,
			totalAnswers,
			typeBreakdown,
			subjectBreakdown,
			topReels
		] = await Promise.all([
			Reel.countDocuments(),
			Reel.countDocuments({ status: 'published' }),
			Reel.countDocuments({ status: 'pending' }),
			Reel.aggregate([{ $group: { _id: null, total: { $sum: '$viewsCount' } } }]),
			Reel.aggregate([{ $group: { _id: null, total: { $sum: '$likesCount' } } }]),
			Reel.aggregate([{ $group: { _id: null, total: { $sum: '$answeredCount' } } }]),
			Reel.aggregate([
				{ $match: { status: 'published' } },
				{ $group: { _id: '$type', count: { $sum: 1 }, views: { $sum: '$viewsCount' }, likes: { $sum: '$likesCount' } } },
				{ $sort: { count: -1 } }
			]),
			Reel.aggregate([
				{ $match: { status: 'published' } },
				{ $group: { _id: '$subject', count: { $sum: 1 }, views: { $sum: '$viewsCount' } } },
				{ $sort: { count: -1 } }
			]),
			Reel.find({ status: 'published' })
				.sort({ likesCount: -1 })
				.limit(10)
				.select('type title questionText subject likesCount viewsCount answeredCount correctCount')
				.lean()
		]);

		return NextResponse.json({
			success: true,
			data: {
				overview: {
					totalReels,
					publishedReels,
					pendingReels,
					totalViews: totalViews[0]?.total || 0,
					totalLikes: totalLikes[0]?.total || 0,
					totalAnswers: totalAnswers[0]?.total || 0
				},
				typeBreakdown,
				subjectBreakdown,
				topReels
			}
		});
	} catch (error) {
		console.error('Reels analytics error:', error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
