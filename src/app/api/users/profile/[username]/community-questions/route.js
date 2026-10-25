import dbConnect from '@/lib/db';
import User from '@/models/User';
import CommunityQuestion from '@/models/CommunityQuestion';
import Exam from '@/models/Exam';
import { protect } from '@/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';

// GET /api/users/profile/:username/community-questions?page=1&limit=5
// The approved community questions this user asked. Private profiles only show them to the owner.
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { username } = await params;
        const user = await User.findOne({ username: username.toLowerCase() }).select('_id isPublicProfile').lean();
        if (!user) return errorResponse('User not found', 404);

        const auth = await protect(req);
        const isOwn = auth.authenticated && String(auth.user._id) === String(user._id);
        if (!user.isPublicProfile && !isOwn) {
            return successResponse({ questions: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 0 } });
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit'), 10) || 5, 1), 20);
        const filter = { author: user._id, status: 'approved' };

        void Exam; // registers the model for populate('exam')
        const [questions, total] = await Promise.all([
            CommunityQuestion.find(filter)
                .select('question exam answerCount views likes createdAt')
                .populate('exam', 'name')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            CommunityQuestion.countDocuments(filter),
        ]);

        return successResponse({
            questions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
