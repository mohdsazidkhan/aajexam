import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityAnswer from '@/models/CommunityAnswer';
import CommunityQuestion from '@/models/CommunityQuestion';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// PATCH /api/community-answers/[id]  { body?, image? }
export async function PATCH(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { id } = await params;
    const { body, image } = await req.json();

    const doc = await CommunityAnswer.findById(id);
    if (!doc || doc.deletedAt) return errorResponse('Answer not found', 404);

    const isOwner = String(doc.author) === String(auth.user._id);
    const isAdmin = auth.user.role === 'admin';
    if (!isOwner && !isAdmin) return errorResponse('Not authorized', 403);

    if (typeof body === 'string') {
      const trimmed = body.trim();
      if (trimmed.length < 2 || trimmed.length > 5000) {
        return errorResponse('Answer length invalid', 400);
      }
      doc.body = trimmed;
      doc.isEdited = true;
      doc.editedAt = new Date();
    }
    if (typeof image !== 'undefined') doc.image = image || null;

    await doc.save();
    return successResponse({ answer: doc }, 'Answer updated');
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/community-answers/[id] — soft delete
export async function DELETE(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { id } = await params;

    const doc = await CommunityAnswer.findById(id);
    if (!doc || doc.deletedAt) return errorResponse('Answer not found', 404);

    const isOwner = String(doc.author) === String(auth.user._id);
    const isAdmin = auth.user.role === 'admin';
    if (!isOwner && !isAdmin) return errorResponse('Not authorized', 403);

    doc.deletedAt = new Date();
    doc.status = 'hidden';
    await doc.save();

    if (!doc.parent) {
      await CommunityQuestion.updateOne(
        { _id: doc.question, answerCount: { $gt: 0 } },
        { $inc: { answerCount: -1 } }
      );
    } else {
      await CommunityAnswer.updateOne(
        { _id: doc.parent, replyCount: { $gt: 0 } },
        { $inc: { replyCount: -1 } }
      );
    }

    return successResponse({}, 'Answer deleted');
  } catch (err) {
    return errorResponse(err);
  }
}
