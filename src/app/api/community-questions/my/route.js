import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityQuestion from '@/models/CommunityQuestion';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// GET /api/community-questions/my - Get logged-in user's questions
export async function GET(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) {
      return errorResponse('Not authorized', 401);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const filter = { author: auth.user._id };

    const [questions, total] = await Promise.all([
      CommunityQuestion.find(filter)
        .populate('exam', 'name code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CommunityQuestion.countDocuments(filter)
    ]);

    return successResponse({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}
