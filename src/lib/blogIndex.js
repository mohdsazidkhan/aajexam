import dbConnect from './db';
import Blog from '../models/Blog';
import '../models/Exam';

// Data behind the "All articles" index on /blog. examIds empty = every published article
// (static/ISR page, what crawlers see); otherwise only articles for those exams.
export async function buildBlogIndex(examIds = []) {
  await dbConnect();
  const docs = await Blog.find({ status: 'published', ...(examIds.length ? { exam: { $in: examIds } } : {}) })
    .select('slug title readingTime publishedAt createdAt exam')
    .populate('exam', 'name slug')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  const allPosts = docs.filter((d) => d?.slug).map((d) => ({ slug: d.slug, title: d.title || '' }));

  // Group by exam so the index doubles as a per-exam hub for crawlers.
  const byExam = new Map();
  for (const d of docs) {
    if (!d?.slug) continue;
    const key = d.exam?.name || 'General exam updates';
    if (!byExam.has(key)) {
      byExam.set(key, { heading: key, href: d.exam?.slug ? `/govt-exams/exam/${d.exam.slug}` : null, items: [] });
    }
    byExam.get(key).items.push({
      href: `/blog/${d.slug}`,
      name: d.title || d.slug,
      meta: `${d.readingTime || 5} min read`
    });
  }

  const groups = Array.from(byExam.values()).sort((a, b) => b.items.length - a.items.length);
  return { groups, allPosts };
}
