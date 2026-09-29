import mongoose from 'mongoose';
import dbConnect from './db';
import Subject from '../models/Subject';
import Topic from '../models/Topic';

// Data behind the "All subjects" / "All topics by subject" indexes. examIds empty = full
// catalogue (static/ISR pages, what crawlers see); otherwise limited to those exams.
const toObjectIds = (ids) => ids.map((id) => new mongoose.Types.ObjectId(id));

export async function buildSubjectsIndex(examIds = []) {
  await dbConnect();
  const scoped = examIds.length > 0;
  const docs = await Subject.find(scoped ? { exams: { $in: examIds } } : {}).select('name slug').sort({ name: 1 }).limit(300).lean();
  const topicCounts = await Topic.aggregate([
    ...(scoped ? [{ $match: { exams: { $in: toObjectIds(examIds) } } }] : []),
    { $group: { _id: '$subject', n: { $sum: 1 } } }
  ]);
  const countBySubject = new Map(topicCounts.map((t) => [String(t._id), t.n]));

  const subjects = docs
    .filter((s) => s?.slug)
    .map((s) => ({ name: s.name || '', slug: s.slug, topicCount: countBySubject.get(String(s._id)) || 0 }));
  return { subjects };
}

export async function buildTopicsIndex(examIds = []) {
  await dbConnect();
  // Cap the page so the HTML stays a reasonable size; the remaining topics
  // stay reachable through their subject pages.
  const docs = await Topic.find(examIds.length ? { exams: { $in: examIds } } : {})
    .select('name slug subject')
    .populate('subject', 'name slug')
    .sort({ name: 1 })
    .limit(900)
    .lean();

  const bySubject = new Map();
  for (const t of docs) {
    if (!t?.slug) continue;
    const key = t.subject?.name || 'Other topics';
    if (!bySubject.has(key)) {
      bySubject.set(key, { heading: key, href: t.subject?.slug ? `/subjects/${t.subject.slug}` : null, items: [] });
    }
    bySubject.get(key).items.push({ href: `/topics/${t.slug}`, name: t.name || t.slug });
  }

  const groups = Array.from(bySubject.values()).sort((a, b) => b.items.length - a.items.length);
  return { groups };
}
