import dbConnect from '@/lib/db';
import QuestionDiscussion from '@/models/QuestionDiscussion';
import Question from '@/models/Question';
import Exam from '@/models/Exam';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// GET /api/discussions/feed?sort=trending|latest|top&exam=&page=&limit=
// Public — returns top-level comments with question snippet populated.
export async function GET(req) {
  try {
    await dbConnect();
    // Ensure refs are registered before populate
    void Question; void Exam; void Subject; void Topic;

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'trending';
    const examId = searchParams.get('exam');
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(50, parseInt(searchParams.get('limit')) || 20);

    const filter = { parent: null, status: 'approved', deletedAt: null };

    // Trending = last 7 days, sorted by (upvotes + replies*2) desc
    let pipeline = null;
    if (sort === 'trending') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: sevenDaysAgo };
    }

    const sortOption =
      sort === 'latest' ? { createdAt: -1 }
      : sort === 'top' ? { upvotes: -1, replyCount: -1, createdAt: -1 }
      : { upvotes: -1, replyCount: -1, createdAt: -1 }; // trending

    // If exam filter, need to filter by question.exam — do a join
    let matchQuestionIds = null;
    if (examId) {
      const qIds = await Question.find({ exam: examId, isActive: true }).select('_id').lean();
      matchQuestionIds = qIds.map(q => q._id);
      filter.question = { $in: matchQuestionIds };
    }

    const [discussions, total] = await Promise.all([
      QuestionDiscussion.find(filter)
        .populate('author', 'name username profilePicture')
        .populate({
          path: 'question',
          select: 'questionText options exam subject topic difficulty',
          populate: [
            { path: 'exam', select: 'name code' },
            { path: 'subject', select: 'name' },
            { path: 'topic', select: 'name' }
          ]
        })
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      QuestionDiscussion.countDocuments(filter)
    ]);

    // Filter out discussions whose question is null (deleted/inactive)
    const clean = discussions.filter(d => d.question);

    return successResponse({
      discussions: clean,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return errorResponse(err);
  }
}
