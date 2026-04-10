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
		const { optionIndex } = await req.json();

		const reel = await Reel.findById(id);
		if (!reel || reel.type !== 'poll') {
			return NextResponse.json({ success: false, message: 'Poll reel not found' }, { status: 404 });
		}

		if (optionIndex < 0 || optionIndex >= reel.pollOptions.length) {
			return NextResponse.json({ success: false, message: 'Invalid option index' }, { status: 400 });
		}

		// Check if already voted
		const existing = await ReelInteraction.findOne({ userId: auth.user._id, reelId: id });
		if (existing?.votedOptionIndex >= 0) {
			return NextResponse.json({
				success: true,
				alreadyVoted: true,
				votedOptionIndex: existing.votedOptionIndex,
				pollOptions: reel.pollOptions,
				message: 'Already voted'
			});
		}

		// Record vote
		if (existing) {
			existing.votedOptionIndex = optionIndex;
			await existing.save();
		} else {
			await ReelInteraction.create({ userId: auth.user._id, reelId: id, votedOptionIndex: optionIndex });
		}

		// Increment poll option votes
		reel.pollOptions[optionIndex].votes += 1;
		await reel.save();

		return NextResponse.json({
			success: true,
			votedOptionIndex: optionIndex,
			pollOptions: reel.pollOptions
		});
	} catch (error) {
		console.error('Vote reel error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
