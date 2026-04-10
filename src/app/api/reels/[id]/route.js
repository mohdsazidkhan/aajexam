import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';

export async function GET(req, { params }) {
	try {
		await dbConnect();
		const { id } = await params;

		const reel = await Reel.findById(id)
			.populate('createdBy', 'name username profilePicture')
			.lean();

		if (!reel) {
			return NextResponse.json({ success: false, message: 'Reel not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true, data: reel });
	} catch (error) {
		console.error('Get reel error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
