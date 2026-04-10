import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';

export async function GET() {
	try {
		await dbConnect();

		// Get distinct values for filters
		const [subjects, topics, examTypes, tags] = await Promise.all([
			Reel.distinct('subject', { status: 'published' }),
			Reel.distinct('topic', { status: 'published', topic: { $ne: '' } }),
			Reel.distinct('examType', { status: 'published' }),
			Reel.distinct('tags', { status: 'published' })
		]);

		return NextResponse.json({
			success: true,
			data: {
				subjects: subjects.filter(Boolean).sort(),
				topics: topics.filter(Boolean).sort(),
				examTypes: examTypes.filter(Boolean).sort(),
				tags: tags.filter(Boolean).sort()
			}
		});
	} catch (error) {
		console.error('Reels stats error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
