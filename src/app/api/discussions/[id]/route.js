import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import QuestionDiscussion from '@/models/QuestionDiscussion';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// PATCH /api/discussions/[id]  { body?, image?, isAlternateSolution? }
export async function PATCH(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { id } = await params;
    const { body, image, isAlternateSolution } = await req.json();

    const doc = await QuestionDiscussion.findById(id);
    if (!doc || doc.deletedAt) return errorResponse('Comment not found', 404);

    const isOwner = String(doc.author) === String(auth.user._id);
    const isAdmin = auth.user.role === 'admin';
    if (!isOwner && !isAdmin) return errorResponse('Not authorized', 403);

    if (typeof body === 'string') {
      const trimmed = body.trim();
      if (trimmed.length < 2 || trimmed.length > 3000) {
        return errorResponse('Comment length invalid', 400);
      }
      doc.body = trimmed;
      doc.isEdited = true;
      doc.editedAt = new Date();
    }
    if (typeof image !== 'undefined') doc.image = image || null;
    if (typeof isAlternateSolution === 'boolean') doc.isAlternateSolution = isAlternateSolution;

    await doc.save();
    return successResponse({ discussion: doc }, 'Comment updated');
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/discussions/[id] — soft delete
export async function DELETE(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { id } = await params;

    const doc = await QuestionDiscussion.findById(id);
    if (!doc || doc.deletedAt) return errorResponse('Comment not found', 404);

    const isOwner = String(doc.author) === String(auth.user._id);
    const isAdmin = auth.user.role === 'admin';
    if (!isOwner && !isAdmin) return errorResponse('Not authorized', 403);

    doc.deletedAt = new Date();
    doc.status = 'hidden';
    await doc.save();

    if (doc.parent) {
      await QuestionDiscussion.updateOne(
        { _id: doc.parent, replyCount: { $gt: 0 } },
        { $inc: { replyCount: -1 } }
      );
    }

    return successResponse({}, 'Comment deleted');
  } catch (err) {
    return errorResponse(err);
  }
}
