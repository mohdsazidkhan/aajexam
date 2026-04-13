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

		const query = (searchParams.get('query') || '').trim();
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const skip = (page - 1) * limit;

		if (!query) {
			return NextResponse.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } });
		}

		// Strip # prefix if present
		const cleanQuery = query.replace(/^#/, '').trim().toLowerCase();
		if (!cleanQuery) {
			return NextResponse.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } });
		}

		const baseFilter = { status: 'published' };

		// ── Step 1: Search in tags array first ──
		const tagFilter = {
			...baseFilter,
			tags: { $elemMatch: { $regex: cleanQuery, $options: 'i' } }
		};

		let [reels, total] = await Promise.all([
			Reel.find(tagFilter)
				.sort({ publishedAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('createdBy', 'name username profilePicture')
				.lean(),
			Reel.countDocuments(tagFilter)
		]);

		// ── Step 2: If no tag results, search across all content fields ──
		if (total === 0) {
			const regex = { $regex: cleanQuery, $options: 'i' };

			const fullSearchFilter = {
				...baseFilter,
				$or: [
					{ type: regex },
					{ title: regex },
					{ content: regex },
					{ caCategory: regex },
					{ keyTakeaway: regex },
					{ pollQuestion: regex },
					{ keyPoints: regex },
					{ steps: regex },
					{ tryYourself: regex },
					{ questionText: regex },
					{ explanation: regex },
					{ shortcutTrick: regex },
					{ formula: regex },
					{ subject: regex },
					{ topic: regex },
					{ examType: regex },
					{ difficulty: regex },
				]
			};

			[reels, total] = await Promise.all([
				Reel.find(fullSearchFilter)
					.sort({ publishedAt: -1 })
					.skip(skip)
					.limit(limit)
					.populate('createdBy', 'name username profilePicture')
					.lean(),
				Reel.countDocuments(fullSearchFilter)
			]);
		}

		// ── Attach user interaction if logged in ──
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
		console.error('Reels search error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
