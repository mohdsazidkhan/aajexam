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
			interaction.liked = !interaction.liked;
			await interaction.save();
		} else {
			interaction = await ReelInteraction.create({ userId: auth.user._id, reelId: id, liked: true });
		}

		// Update reel like count
		const likeCount = await ReelInteraction.countDocuments({ reelId: id, liked: true });
		await Reel.findByIdAndUpdate(id, { likesCount: likeCount });

		return NextResponse.json({
			success: true,
			liked: interaction.liked,
			likesCount: likeCount
		});
	} catch (error) {
		console.error('Like reel error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
