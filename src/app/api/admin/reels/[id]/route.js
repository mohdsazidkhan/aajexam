import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import { protect, admin } from '@/middleware/auth';
import { createNotification } from '@/utils/notifications';

// Update reel
export async function PUT(req, { params }) {
	try {
		const auth = await protect(req);
		if (!auth.authenticated || !admin(auth.user)) {
			return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
		}

		await dbConnect();
		const { id } = await params;
		const body = await req.json();

		const reel = await Reel.findById(id);
		if (!reel) {
			return NextResponse.json({ success: false, message: 'Reel not found' }, { status: 404 });
		}
		const previousStatus = reel.status;

		// Update all provided fields
		const allowedFields = [
			'type', 'title', 'content', 'backgroundColor',
			'questionText', 'options', 'correctAnswerIndex', 'explanation', 'shortcutTrick',
			'keyPoints', 'highlightText',
			'steps', 'tryYourself', 'formula',
			'caDate', 'caCategory', 'tableData', 'keyTakeaway',
			'pollQuestion', 'pollOptions',
			'subject', 'topic', 'examType', 'difficulty', 'tags',
			'audioFile', 'duration',
			'status', 'adminNotes'
		];

		allowedFields.forEach(field => {
			if (body[field] !== undefined) {
				reel[field] = body[field];
			}
		});

		await reel.save();

		if (reel.createdBy && reel.status !== previousStatus && (reel.status === 'published' || reel.status === 'rejected')) {
			const preview = (reel.title || reel.questionText || reel.content || 'your reel').slice(0, 80);
			createNotification({
				userId: reel.createdBy,
				type: 'announcement',
				title: reel.status === 'published' ? 'Your reel was approved' : 'Your reel was rejected',
				description: reel.status === 'published'
					? `Your reel "${preview}" is now live for everyone to see.`
					: `Your reel "${preview}" didn't meet our guidelines and was rejected.${reel.adminNotes ? ` Reason: ${reel.adminNotes}` : ''}`,
				meta: { reelId: reel._id }
			});
		}

		return NextResponse.json({ success: true, data: reel, message: 'Reel updated successfully' });
	} catch (error) {
		console.error('Update reel error:', error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}

// Delete reel
export async function DELETE(req, { params }) {
	try {
		const auth = await protect(req);
		if (!auth.authenticated || !admin(auth.user)) {
			return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
		}

		await dbConnect();
		const { id } = await params;

		const reel = await Reel.findByIdAndDelete(id);
		if (!reel) {
			return NextResponse.json({ success: false, message: 'Reel not found' }, { status: 404 });
		}

		if (reel.createdBy) {
			const preview = (reel.title || reel.questionText || reel.content || 'your reel').slice(0, 80);
			createNotification({
				userId: reel.createdBy,
				type: 'announcement',
				title: 'Your reel was removed',
				description: `Your reel "${preview}" was removed by an admin for not meeting our guidelines.`,
				meta: { reelId: reel._id }
			});
		}

		return NextResponse.json({ success: true, message: 'Reel deleted successfully' });
	} catch (error) {
		console.error('Delete reel error:', error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
