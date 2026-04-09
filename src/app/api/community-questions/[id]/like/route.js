import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityQuestion from '@/models/CommunityQuestion';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// POST /api/community-questions/[id]/like - Toggle like
export async function POST(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) {
      return errorResponse('Not authorized', 401);
    }

    await dbConnect();
    const { id } = await params;
    const userId = auth.user._id;

    const question = await CommunityQuestion.findById(id);
    if (!question) {
      return errorResponse('Question not found', 404);
    }

    const alreadyLiked = question.likedBy.some(uid => uid.toString() === userId.toString());

    if (alreadyLiked) {
      await CommunityQuestion.updateOne(
        { _id: id },
        { $pull: { likedBy: userId }, $inc: { likes: -1 } }
      );
      return successResponse({ liked: false }, 'Like removed');
    } else {
      await CommunityQuestion.updateOne(
        { _id: id },
        { $addToSet: { likedBy: userId }, $inc: { likes: 1 } }
      );
      return successResponse({ liked: true }, 'Question liked');
    }
  } catch (error) {
    return errorResponse(error);
  }
}
