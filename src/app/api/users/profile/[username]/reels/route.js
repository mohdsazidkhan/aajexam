import dbConnect from '@/lib/db';
import User from '@/models/User';
import Reel from '@/models/Reel';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { username } = await params;

        const user = await User.findOne({ username: username.toLowerCase() }).select('_id').lean();
        if (!user) return errorResponse('User not found', 404);

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const skip = (page - 1) * limit;

        const filter = { createdBy: user._id, status: 'published' };

        const [reels, total] = await Promise.all([
            Reel.find(filter)
                .select('type title questionText pollQuestion viewsCount likesCount publishedAt tags subject')
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Reel.countDocuments(filter)
        ]);

        return successResponse({
            reels,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return errorResponse(error);
    }
}
