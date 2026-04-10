import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import { protect, admin } from '@/middleware/auth';

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

		// Update all provided fields
		const allowedFields = [
			'type', 'title', 'content', 'backgroundColor',
			'questionText', 'options', 'correctAnswerIndex', 'explanation', 'shortcutTrick',
			'keyPoints', 'highlightText',
			'steps', 'tryYourself', 'formula',
			'caDate', 'caCategory', 'tableData', 'keyTakeaway',
			'pollQuestion', 'pollOptions',
			'subject', 'topic', 'examType', 'difficulty', 'tags',
			'status', 'adminNotes'
		];

		allowedFields.forEach(field => {
			if (body[field] !== undefined) {
				reel[field] = body[field];
			}
		});

		await reel.save();

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

		return NextResponse.json({ success: true, message: 'Reel deleted successfully' });
	} catch (error) {
		console.error('Delete reel error:', error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
