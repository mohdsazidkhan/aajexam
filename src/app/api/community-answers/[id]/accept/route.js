import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityAnswer from '@/models/CommunityAnswer';
import CommunityQuestion from '@/models/CommunityQuestion';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// POST /api/community-answers/[id]/accept — question author or admin marks as accepted
export async function POST(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { id } = await params;

    const answer = await CommunityAnswer.findById(id);
    if (!answer || answer.deletedAt) return errorResponse('Answer not found', 404);
    if (answer.parent) return errorResponse('Only top-level answers can be accepted', 400);

    const question = await CommunityQuestion.findById(answer.question);
    if (!question) return errorResponse('Question not found', 404);

    const isQuestionAuthor = String(question.author) === String(auth.user._id);
    const isAdmin = auth.user.role === 'admin';
    if (!isQuestionAuthor && !isAdmin) return errorResponse('Not authorized', 403);

    // Unset previous accepted
    if (question.acceptedAnswer) {
      await CommunityAnswer.updateOne(
        { _id: question.acceptedAnswer },
        { $set: { isAcceptedAnswer: false } }
      );
    }

    const isSame = String(question.acceptedAnswer) === String(answer._id);
    if (isSame) {
      question.acceptedAnswer = null;
      await question.save();
      return successResponse({ accepted: false });
    }

    answer.isAcceptedAnswer = true;
    await answer.save();
    question.acceptedAnswer = answer._id;
    await question.save();

    return successResponse({ accepted: true });
  } catch (err) {
    return errorResponse(err);
  }
}
