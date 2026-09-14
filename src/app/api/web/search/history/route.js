import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SearchHistory from '@/models/SearchHistory';
import { protect } from '@/middleware/auth';

// Web-only: per-user recent search keywords, shown as suggestions on search-input focus.
export const dynamic = 'force-dynamic';

const MAX_TERMS = 10;

export async function GET(req) {
	try {
		await dbConnect();
		const auth = await protect(req);
		if (!auth.authenticated) return NextResponse.json({ success: true, terms: [] });

		const doc = await SearchHistory.findOne({ user: auth.user._id }).select('terms').lean();
		return NextResponse.json({ success: true, terms: doc?.terms || [] });
	} catch (error) {
		console.error('Search history GET error:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		await dbConnect();
		const auth = await protect(req);
		if (!auth.authenticated) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

		const body = await req.json();
		const term = (body?.term || '').trim();
		if (!term) return NextResponse.json({ success: false, error: 'term is required' }, { status: 400 });

		// De-dupe then push to front, capped — two steps since Mongo can't $pull and $push the same field at once.
		await SearchHistory.updateOne({ user: auth.user._id }, { $pull: { terms: term } }, { upsert: true });
		await SearchHistory.updateOne(
			{ user: auth.user._id },
			{ $push: { terms: { $each: [term], $position: 0, $slice: MAX_TERMS } } }
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Search history POST error:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
