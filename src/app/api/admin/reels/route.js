import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
	try {
		const auth = await protect(req);
		if (!auth.authenticated || !admin(auth.user)) {
			return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
		}

		await dbConnect();
		const { searchParams } = new URL(req.url);

		const status = searchParams.get('status');
		const type = searchParams.get('type');
		const subject = searchParams.get('subject');
		const examType = searchParams.get('examType');
		const creatorRole = searchParams.get('creatorRole');
		const search = searchParams.get('search');
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const skip = (page - 1) * limit;

		const filter = {};
		if (status) filter.status = status;
		if (type) filter.type = type;
		if (subject) filter.subject = { $regex: subject, $options: 'i' };
		if (examType) filter.examType = { $regex: examType, $options: 'i' };
		if (creatorRole) filter.creatorRole = creatorRole;
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ content: { $regex: search, $options: 'i' } },
				{ questionText: { $regex: search, $options: 'i' } },
				{ pollQuestion: { $regex: search, $options: 'i' } }
			];
		}

		const [items, total, statusCounts] = await Promise.all([
			Reel.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('createdBy', 'name email')
				.lean(),
			Reel.countDocuments(filter),
			Reel.aggregate([
				{ $group: { _id: '$status', count: { $sum: 1 } } }
			])
		]);

		const counts = {};
		statusCounts.forEach(s => { counts[s._id] = s.count; });

		return NextResponse.json({
			success: true,
			data: items,
			statusCounts: counts,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
		});
	} catch (error) {
		console.error('Admin list reels error:', error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
