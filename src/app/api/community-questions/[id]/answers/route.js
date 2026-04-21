import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityQuestion from '@/models/CommunityQuestion';
import CommunityAnswer from '@/models/CommunityAnswer';
import MentorProfile from '@/models/MentorProfile';
import Notification from '@/models/Notification';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// GET /api/community-questions/[id]/answers?sort=top|new&page=&limit=
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'top';
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(50, parseInt(searchParams.get('limit')) || 20);

    const filter = {
      question: id,
      parent: null,
      status: 'approved',
      deletedAt: null
    };

    const sortOption = sort === 'new'
      ? { isPinned: -1, isAcceptedAnswer: -1, createdAt: -1 }
      : { isPinned: -1, isAcceptedAnswer: -1, upvotes: -1, createdAt: -1 };

    const [roots, total] = await Promise.all([
      CommunityAnswer.find(filter)
        .populate('author', 'name username profilePicture')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CommunityAnswer.countDocuments(filter)
    ]);

    const rootIds = roots.map(r => r._id);
    const replies = rootIds.length
      ? await CommunityAnswer.find({
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

    const answers = roots.map(r => ({ ...r, replies: byRoot[String(r._id)] || [] }));

    return successResponse({
      answers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/community-questions/[id]/answers  { body, parentId?, image? }
export async function POST(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { id } = await params;
    const { body, parentId, image } = await req.json();

    if (!body || String(body).trim().length < 2) {
      return errorResponse('Answer too short', 400);
    }

    const question = await CommunityQuestion.findById(id).select('_id author');
    if (!question) return errorResponse('Question not found', 404);

    let parent = null;
    let rootId = null;
    if (parentId) {
      parent = await CommunityAnswer.findById(parentId).select('_id rootId author question');
      if (!parent) return errorResponse('Parent answer not found', 404);
      if (String(parent.question) !== String(id)) {
        return errorResponse('Parent belongs to a different question', 400);
      }
      rootId = parent.rootId || parent._id;
    }

    let authorRole = 'student';
    if (auth.user.role === 'admin') authorRole = 'admin';
    else {
      const mentor = await MentorProfile.findOne({ user: auth.user._id, isVerified: true }).select('_id').lean();
      if (mentor) authorRole = 'mentor';
    }

    const answer = await CommunityAnswer.create({
      question: id,
      author: auth.user._id,
      authorRole,
      parent: parent ? parent._id : null,
      rootId,
      body: String(body).trim(),
      image: image || null
    });

    // Denormalize on CommunityQuestion (only for top-level answers)
    if (!parent) {
      await CommunityQuestion.updateOne(
        { _id: id },
        { $inc: { answerCount: 1 }, $set: { lastAnswerAt: new Date() } }
      );
    } else {
      await CommunityAnswer.updateOne({ _id: parent._id }, { $inc: { replyCount: 1 } });
    }

    // Notifications
    if (parent && String(parent.author) !== String(auth.user._id)) {
      await Notification.create({
        userId: parent.author,
        type: 'discussion_reply',
        title: `${auth.user.name} replied to your answer`,
        description: String(body).slice(0, 140),
        meta: { questionId: id, answerId: answer._id }
      });
    } else if (!parent && String(question.author) !== String(auth.user._id)) {
      await Notification.create({
        userId: question.author,
        type: 'question',
        title: `${auth.user.name} answered your question`,
        description: String(body).slice(0, 140),
        meta: { questionId: id, answerId: answer._id }
      });
    }

    const populated = await CommunityAnswer.findById(answer._id)
      .populate('author', 'name username profilePicture')
      .lean();

    return successResponse({ answer: populated }, 'Answer posted', 201);
  } catch (err) {
    return errorResponse(err);
  }
}
