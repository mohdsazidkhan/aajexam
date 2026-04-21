import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import QuestionDiscussion from '@/models/QuestionDiscussion';
import Question from '@/models/Question';
import MentorProfile from '@/models/MentorProfile';
import Notification from '@/models/Notification';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

const SOURCE_TYPES = ['quiz', 'practice_test', 'pyq', 'daily_challenge', 'govt_exam_test'];

// GET /api/discussions?questionId=&sort=top|new&page=&limit=
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');
    const sort = searchParams.get('sort') || 'top';
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(50, parseInt(searchParams.get('limit')) || 20);

    if (!questionId) return errorResponse('questionId is required', 400);

    const filter = {
      question: questionId,
      parent: null,
      status: 'approved',
      deletedAt: null
    };

    const sortOption = sort === 'new'
      ? { isPinned: -1, createdAt: -1 }
      : { isPinned: -1, upvotes: -1, createdAt: -1 };

    const [roots, total] = await Promise.all([
      QuestionDiscussion.find(filter)
        .populate('author', 'name username profilePicture')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      QuestionDiscussion.countDocuments(filter)
    ]);

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

    const repliesByRoot = replies.reduce((acc, r) => {
      const k = String(r.rootId);
      (acc[k] = acc[k] || []).push(r);
      return acc;
    }, {});

    const data = roots.map(r => ({
      ...r,
      replies: repliesByRoot[String(r._id)] || []
    }));

    return successResponse({
      discussions: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/discussions  { questionId, body, sourceType, sourceId?, parentId?, image? }
export async function POST(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { questionId, body, sourceType, sourceId, parentId, image } = await req.json();

    if (!questionId || !body || !sourceType) {
      return errorResponse('questionId, body and sourceType are required', 400);
    }
    if (!SOURCE_TYPES.includes(sourceType)) {
      return errorResponse('Invalid sourceType', 400);
    }
    if (String(body).trim().length < 2) {
      return errorResponse('Comment too short', 400);
    }

    const question = await Question.findById(questionId).select('_id');
    if (!question) return errorResponse('Question not found', 404);

    let parent = null;
    let rootId = null;
    if (parentId) {
      parent = await QuestionDiscussion.findById(parentId).select('_id rootId author question');
      if (!parent) return errorResponse('Parent comment not found', 404);
      if (String(parent.question) !== String(questionId)) {
        return errorResponse('Parent belongs to a different question', 400);
      }
      rootId = parent.rootId || parent._id;
    }

    // Resolve authorRole (denormalized for badge rendering)
    let authorRole = 'student';
    if (auth.user.role === 'admin') authorRole = 'admin';
    else {
      const mentor = await MentorProfile.findOne({ user: auth.user._id, isVerified: true }).select('_id').lean();
      if (mentor) authorRole = 'mentor';
    }

    const doc = await QuestionDiscussion.create({
      question: questionId,
      author: auth.user._id,
      authorRole,
      sourceType,
      sourceId: sourceId || null,
      parent: parent ? parent._id : null,
      rootId,
      body: String(body).trim(),
      image: image || null
    });

    if (parent) {
      await QuestionDiscussion.updateOne({ _id: parent._id }, { $inc: { replyCount: 1 } });

      if (String(parent.author) !== String(auth.user._id)) {
        await Notification.create({
          userId: parent.author,
          type: 'discussion_reply',
          title: `${auth.user.name} replied to your comment`,
          description: String(body).slice(0, 140),
          meta: { discussionId: doc._id, questionId, sourceType, sourceId: sourceId || null }
        });
      }
    }

    const populated = await QuestionDiscussion.findById(doc._id)
      .populate('author', 'name username profilePicture')
      .lean();

    return successResponse({ discussion: populated }, 'Comment posted', 201);
  } catch (err) {
    return errorResponse(err);
  }
}
