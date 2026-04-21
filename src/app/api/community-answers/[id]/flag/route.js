import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityAnswer from '@/models/CommunityAnswer';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

const AUTO_HIDE_THRESHOLD = 5;

// POST /api/community-answers/[id]/flag  { reason }
export async function POST(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) return errorResponse('Not authorized', 401);

    await dbConnect();
    const { id } = await params;
    const { reason } = await req.json();

    const doc = await CommunityAnswer.findById(id);
    if (!doc || doc.deletedAt) return errorResponse('Answer not found', 404);

    const already = doc.flaggedBy.some(f => String(f.user) === String(auth.user._id));
    if (already) return errorResponse('Already reported', 400);

    doc.flaggedBy.push({ user: auth.user._id, reason: (reason || '').slice(0, 200), at: new Date() });
    doc.flagCount = doc.flaggedBy.length;

    if (doc.flagCount >= AUTO_HIDE_THRESHOLD && doc.status === 'approved') {
      doc.status = 'pending';
    }

    await doc.save();
    return successResponse({ flagCount: doc.flagCount }, 'Reported');
  } catch (err) {
    return errorResponse(err);
  }
}
