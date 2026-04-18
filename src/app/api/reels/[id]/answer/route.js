import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import ReelInteraction from '@/models/ReelInteraction';
import { protect } from '@/middleware/auth';
import { addWrongAnswerToRevision, snapshotFromReel } from '@/utils/revision';

export async function POST(req, { params }) {
	try {
		await dbConnect();
		const auth = await protect(req);
		if (!auth.authenticated) {
			return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
		}

		const { id } = await params;
		const { selectedOptionIndex } = await req.json();

		if (selectedOptionIndex === undefined || selectedOptionIndex < 0 || selectedOptionIndex > 3) {
			return NextResponse.json({ success: false, message: 'Valid option index required (0-3)' }, { status: 400 });
		}

		const reel = await Reel.findById(id);
		if (!reel || reel.type !== 'question') {
			return NextResponse.json({ success: false, message: 'Question reel not found' }, { status: 404 });
		}

		const isCorrect = selectedOptionIndex === reel.correctAnswerIndex;

		let interaction = await ReelInteraction.findOne({ userId: auth.user._id, reelId: id });

		if (interaction?.answered) {
			return NextResponse.json({
				success: true,
				alreadyAnswered: true,
				isCorrect: interaction.isCorrect,
				correctAnswerIndex: reel.correctAnswerIndex,
				explanation: reel.explanation,
				shortcutTrick: reel.shortcutTrick,
				message: 'Already answered'
			});
		}

		if (interaction) {
			interaction.answered = true;
			interaction.selectedOptionIndex = selectedOptionIndex;
			interaction.isCorrect = isCorrect;
			await interaction.save();
		} else {
			interaction = await ReelInteraction.create({
				userId: auth.user._id,
				reelId: id,
				answered: true,
				selectedOptionIndex,
				isCorrect
			});
		}

		// Update reel counters
		await Reel.findByIdAndUpdate(id, {
			$inc: { answeredCount: 1, ...(isCorrect ? { correctCount: 1 } : {}) }
		});

		if (!isCorrect) {
			addWrongAnswerToRevision({
				userId: auth.user._id,
				source: 'reel',
				sourceId: reel._id,
				sourceTitle: reel.title || '',
				sourceQuestionId: reel._id,
				snapshot: snapshotFromReel(reel)
			}).catch((e) => console.error('Revision (reel) error:', e?.message));
		}

		return NextResponse.json({
			success: true,
			isCorrect,
			correctAnswerIndex: reel.correctAnswerIndex,
			explanation: reel.explanation,
			shortcutTrick: reel.shortcutTrick,
			stats: {
				answeredCount: reel.answeredCount + 1,
				correctCount: reel.correctCount + (isCorrect ? 1 : 0)
			}
		});
	} catch (error) {
		console.error('Answer reel error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
