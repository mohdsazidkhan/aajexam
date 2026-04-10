import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import ReelInteraction from '@/models/ReelInteraction';
import { protect } from '@/middleware/auth';

export async function POST(req, { params }) {
	try {
		await dbConnect();
		const auth = await protect(req);
		if (!auth.authenticated) {
			return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
		}

		const { id } = await params;

		let interaction = await ReelInteraction.findOne({ userId: auth.user._id, reelId: id });

		if (interaction) {
			interaction.bookmarked = !interaction.bookmarked;
			await interaction.save();
		} else {
			interaction = await ReelInteraction.create({ userId: auth.user._id, reelId: id, bookmarked: true });
		}

		const bookmarkCount = await ReelInteraction.countDocuments({ reelId: id, bookmarked: true });
		await Reel.findByIdAndUpdate(id, { bookmarksCount: bookmarkCount });

		return NextResponse.json({
			success: true,
			bookmarked: interaction.bookmarked,
			bookmarksCount: bookmarkCount
		});
	} catch (error) {
		console.error('Bookmark reel error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
