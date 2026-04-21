import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import QuestionDiscussion from '@/models/QuestionDiscussion';
import Exam from '@/models/Exam';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// GET /api/discussions/question/[questionId]
// Returns the full question + its discussions (for the public /discussions/[questionId] page)
export async function GET(req, { params }) {
  try {
    await dbConnect();
    void Exam; void Subject; void Topic;

    const { questionId } = await params;

    const question = await Question.findById(questionId)
      .populate('exam', 'name code')
      .populate('subject', 'name')
      .populate('topic', 'name')
      .lean();

    if (!question || !question.isActive) {
      return errorResponse('Question not found', 404);
    }

    const roots = await QuestionDiscussion.find({
      question: questionId,
      parent: null,
      status: 'approved',
      deletedAt: null
    })
      .populate('author', 'name username profilePicture')
      .sort({ isPinned: -1, upvotes: -1, createdAt: -1 })
      .lean();

    const rootIds = roots.map(r => r._id);
    const replies = rootIds.length
      ? await QuestionDiscussion.find({
          rootId: { $in: rootIds },
          status: 'approved',
          deletedAt: null
        })
          .populate('author', 'name username profilePicture')
          .sort({ createdAt: 1 })
          .lean()
      : [];

    const byRoot = replies.reduce((acc, r) => {
      const k = String(r.rootId);
      (acc[k] = acc[k] || []).push(r);
      return acc;
    }, {});

    const discussions = roots.map(r => ({
      ...r,
      replies: byRoot[String(r._id)] || []
    }));

    return successResponse({ question, discussions, total: roots.length });
  } catch (err) {
    return errorResponse(err);
  }
}
