import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import { protect } from '@/middleware/auth';

export async function GET(req) {
	try {
		await dbConnect();
		const auth = await protect(req);
		if (!auth.authenticated) {
			return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const status = searchParams.get('status');
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const skip = (page - 1) * limit;

		const filter = { createdBy: auth.user._id };
		if (status) filter.status = status;

		const [reels, total] = await Promise.all([
			Reel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
			Reel.countDocuments(filter)
		]);

		return NextResponse.json({
			success: true,
			data: reels,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
		});
	} catch (error) {
		console.error('My reels error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
