import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityQuestion from '@/models/CommunityQuestion';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// GET /api/community-questions/[id] - Get single question
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const question = await CommunityQuestion.findById(id)
      .populate('author', 'name username profilePicture')
      .populate('exam', 'name code');

    if (!question) {
      return errorResponse('Question not found', 404);
    }

    // Increment views
    await CommunityQuestion.updateOne({ _id: id }, { $inc: { views: 1 } });

    return successResponse({ question });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/community-questions/[id] - Delete own question
export async function DELETE(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) {
      return errorResponse('Not authorized', 401);
    }

    await dbConnect();
    const { id } = await params;

    const question = await CommunityQuestion.findById(id);
    if (!question) {
      return errorResponse('Question not found', 404);
    }

    // Only author or admin can delete
    if (question.author.toString() !== auth.user._id.toString() && auth.user.role !== 'admin') {
      return errorResponse('Not authorized to delete this question', 403);
    }

    await CommunityQuestion.findByIdAndDelete(id);
    return successResponse({}, 'Question deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
