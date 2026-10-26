import InterviewQuestion from '../models/InterviewQuestion';

// Adds `questionCount` (published questions) to each interview category, so the category cards can say how
// many questions each one holds. One grouped query for all categories.
export async function withQuestionCounts(categories) {
  if (!categories.length) return categories;
  const rows = await InterviewQuestion.aggregate([
    { $match: { status: 'published', category: { $in: categories.map((c) => c._id) } } },
    { $group: { _id: '$category', n: { $sum: 1 } } },
  ]);
  const byCategory = new Map(rows.map((r) => [String(r._id), r.n]));
  return categories.map((c) => ({ ...c, questionCount: byCategory.get(String(c._id)) || 0 }));
}
