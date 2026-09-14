import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Follow from '@/models/Follow';
import { protect } from '@/middleware/auth';

// Web-only: batched follow-status lookup — one query for N user ids instead of the
// mobile-facing /api/users/follow-status/[id] being called once per id (N+1 problem).
export const dynamic = 'force-dynamic';

const MAX_IDS = 200;

export async function POST(req) {
	try {
		await dbConnect();
		const auth = await protect(req);
		if (!auth.authenticated) return NextResponse.json({ success: true, statuses: {} });

		const body = await req.json();
		const ids = [...new Set((body?.ids || []).filter(Boolean).map(String))].slice(0, MAX_IDS);
		if (ids.length === 0) return NextResponse.json({ success: true, statuses: {} });

		const follows = await Follow.find({
			follower: auth.user.id,
			following: { $in: ids },
			status: 'active',
		}).select('following').lean();

		const followingSet = new Set(follows.map((f) => f.following.toString()));
		const statuses = {};
		ids.forEach((id) => { statuses[id] = followingSet.has(id); });

		return NextResponse.json({ success: true, statuses });
	} catch (error) {
		console.error('Batched follow-status error:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
