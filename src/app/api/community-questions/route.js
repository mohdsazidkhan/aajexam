import { protect } from '@/middleware/auth';
import dbConnect from '@/lib/db';
import CommunityQuestion from '@/models/CommunityQuestion';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

// GET /api/community-questions - List all approved questions with filters
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const exam = searchParams.get('exam');
    const sort = searchParams.get('sort') || 'latest';

    const filter = { status: 'approved' };
    if (exam) filter.exam = exam;

    const sortOption = sort === 'popular' ? { likes: -1, createdAt: -1 } : { createdAt: -1 };

    const [questions, total] = await Promise.all([
      CommunityQuestion.find(filter)
        .populate('author', 'name username profilePicture')
        .populate('exam', 'name code')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CommunityQuestion.countDocuments(filter)
    ]);

    return successResponse({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/community-questions - Create a new question
export async function POST(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated) {
      return errorResponse('Not authorized', 401);
    }

    await dbConnect();
    const body = await req.json();
    const { question, exam, options, explanation, image } = body;

    if (!question || !exam) {
      return errorResponse('Question and exam are required', 400);
    }

    const newQuestion = await CommunityQuestion.create({
      author: auth.user._id,
      question,
      exam,
      options: options || [],
      explanation: explanation || '',
      image: image || null
    });

    const populated = await CommunityQuestion.findById(newQuestion._id)
      .populate('author', 'name username profilePicture')
      .populate('exam', 'name code');

    return successResponse({ question: populated }, 'Question posted successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
