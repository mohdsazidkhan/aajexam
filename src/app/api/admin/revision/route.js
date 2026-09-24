import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RevisionQueue from '@/models/RevisionQueue';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page'), 10) || 1;
    const limit = parseInt(searchParams.get('limit'), 10) || 20;
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    const pipeline = [
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
    ];

    const match = {};
    if (status) match.status = status;
    if (source) match.source = source;
    if (Object.keys(match).length) pipeline.push({ $match: match });

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.username': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { 'questionSnapshot.questionText': { $regex: search, $options: 'i' } },
            { sourceTitle: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push({ $sort: { nextReviewDate: 1 } });

    const [items, totalResult] = await Promise.all([
      RevisionQueue.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            source: 1,
            sourceTitle: 1,
            nextReviewDate: 1,
            interval: 1,
            repetitions: 1,
            lastReviewedAt: 1,
            lastAnswer: 1,
            totalReviews: 1,
            correctReviews: 1,
            status: 1,
            createdAt: 1,
            'questionSnapshot.questionText': 1,
            'questionSnapshot.subject': 1,
            'questionSnapshot.topic': 1,
            'questionSnapshot.difficulty': 1,
            'user._id': 1,
            'user.name': 1,
            'user.username': 1,
            'user.email': 1
          }
        }
      ]),
      RevisionQueue.aggregate([...pipeline, { $count: 'total' }])
    ]);

    const total = totalResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
