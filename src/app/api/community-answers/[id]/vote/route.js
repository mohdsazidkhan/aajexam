import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityAnswer from '@/models/CommunityAnswer';
import Notification from '@/models/Notification';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// POST /api/community-answers/[id]/vote  { action: 'up' | 'down' }
export async function POST(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { id } = await params;
    const { action } = await req.json();

    if (!['up', 'down'].includes(action)) return errorResponse('Invalid action', 400);

    const doc = await CommunityAnswer.findById(id).select('author upvotedBy downvotedBy upvotes downvotes question');
    if (!doc) return errorResponse('Answer not found', 404);
    if (String(doc.author) === String(auth.user._id)) {
      return errorResponse('Cannot vote on your own answer', 400);
    }

    const userId = auth.user._id;
    const hasUp = doc.upvotedBy.some(u => String(u) === String(userId));
    const hasDown = doc.downvotedBy.some(u => String(u) === String(userId));

    const update = { $pull: {}, $addToSet: {}, $inc: {} };

    if (action === 'up') {
      if (hasUp) {
        update.$pull.upvotedBy = userId;
        update.$inc.upvotes = -1;
      } else {
        update.$addToSet.upvotedBy = userId;
        update.$inc.upvotes = 1;
        if (hasDown) {
          update.$pull.downvotedBy = userId;
          update.$inc.downvotes = -1;
        }
      }
    } else {
      if (hasDown) {
        update.$pull.downvotedBy = userId;
        update.$inc.downvotes = -1;
      } else {
        update.$addToSet.downvotedBy = userId;
        update.$inc.downvotes = 1;
        if (hasUp) {
          update.$pull.upvotedBy = userId;
          update.$inc.upvotes = -1;
        }
      }
    }

    if (Object.keys(update.$pull).length === 0) delete update.$pull;
    if (Object.keys(update.$addToSet).length === 0) delete update.$addToSet;

    await CommunityAnswer.updateOne({ _id: id }, update);

    if (action === 'up' && !hasUp) {
      await Notification.create({
        userId: doc.author,
        type: 'discussion_upvote',
        title: `${auth.user.name} upvoted your answer`,
        description: '',
        meta: { questionId: doc.question, answerId: id }
      });
    }

    const fresh = await CommunityAnswer.findById(id).select('upvotes downvotes upvotedBy downvotedBy').lean();
    const myVote = fresh.upvotedBy.some(u => String(u) === String(userId))
      ? 'up'
      : fresh.downvotedBy.some(u => String(u) === String(userId)) ? 'down' : null;

    return successResponse({
      upvotes: fresh.upvotes,
      downvotes: fresh.downvotes,
      myVote
    });
  } catch (err) {
    return errorResponse(err);
  }
}
