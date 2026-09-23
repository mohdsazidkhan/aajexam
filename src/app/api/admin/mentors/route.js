import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect, admin } from '@/middleware/auth';

// GET - Admin list all mentor applications
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search');

        let match = {};
        if (status) match.status = status;

        const pipeline = [
            { $match: match },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'user.name': { $regex: search, $options: 'i' } },
                        { 'user.username': { $regex: search, $options: 'i' } },
                        { 'user.email': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        pipeline.push({ $sort: { createdAt: -1 } });

        const [mentors, totalResult] = await Promise.all([
            MentorProfile.aggregate([
                ...pipeline,
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $project: {
                        examsCleared: 1,
                        strategy: 1,
                        rating: 1,
                        isVerified: 1,
                        status: 1,
                        createdAt: 1,
                        'user._id': 1,
                        'user.name': 1,
                        'user.email': 1,
                        'user.username': 1
                    }
                }
            ]),
            MentorProfile.aggregate([...pipeline, { $count: 'total' }])
        ]);

        const total = totalResult[0]?.total || 0;

        return NextResponse.json({ success: true, data: mentors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
