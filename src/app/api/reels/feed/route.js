import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import ReelInteraction from '@/models/ReelInteraction';
import { protect } from '@/middleware/auth';

export async function GET(req) {
	try {
		await dbConnect();
		const { searchParams } = new URL(req.url);

		const type = searchParams.get('type');
		const subject = searchParams.get('subject');
		const topic = searchParams.get('topic');
		const examType = searchParams.get('examType');
		const difficulty = searchParams.get('difficulty');
		const tag = searchParams.get('tag');
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const skip = (page - 1) * limit;

		// Build filter — only published reels
		const filter = { status: 'published' };
		if (type) filter.type = type;
		if (subject && subject !== 'all') filter.subject = { $regex: subject, $options: 'i' };
		if (topic) filter.topic = { $regex: topic, $options: 'i' };
		if (examType && examType !== 'all') filter.examType = { $regex: examType, $options: 'i' };
		if (difficulty) filter.difficulty = difficulty;
		if (tag) filter.tags = { $in: [tag.toLowerCase()] };

		const [reels, total] = await Promise.all([
			Reel.find(filter)
				.sort({ publishedAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('createdBy', 'name username profilePicture')
				.lean(),
			Reel.countDocuments(filter)
		]);

		// If user is logged in, attach their interaction data
		const auth = await protect(req);
		let reelsWithInteraction = reels;

		if (auth.authenticated) {
			const reelIds = reels.map(r => r._id);
			const interactions = await ReelInteraction.find({
				userId: auth.user._id,
				reelId: { $in: reelIds }
			}).lean();

			const interactionMap = {};
			interactions.forEach(i => { interactionMap[i.reelId.toString()] = i; });

			reelsWithInteraction = reels.map(r => ({
				...r,
				userInteraction: interactionMap[r._id.toString()] || null
			}));
		}

		return NextResponse.json({
			success: true,
			data: reelsWithInteraction,
			pagination: {
				page, limit, total,
				totalPages: Math.ceil(total / limit),
				hasMore: skip + reels.length < total
			}
		});
	} catch (error) {
		console.error('Reels feed error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
