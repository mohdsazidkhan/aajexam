import mongoose from 'mongoose';
import dbConnect from './db';
import Subject from '../models/Subject';
import Topic from '../models/Topic';
import Quiz from '../models/Quiz';
import { notEmbedded } from './utils/embeddedSource';

// Data behind the "All subjects" / "All topics by subject" indexes. examIds empty = full
// catalogue (static/ISR pages, what crawlers see); otherwise limited to those exams.
const toObjectIds = (ids) => ids.map((id) => new mongoose.Types.ObjectId(id));

export async function buildSubjectsIndex(examIds = []) {
  await dbConnect();
  const scoped = examIds.length > 0;
  const docs = await Subject.find(scoped ? { exams: { $in: examIds } } : {}).select('name slug').sort({ name: 1 }).limit(300).lean();
  const topicCounts = await Topic.aggregate([
    { $match: { ...notEmbedded, ...(scoped ? { exams: { $in: toObjectIds(examIds) } } : {}) } },
    { $group: { _id: '$subject', n: { $sum: 1 } } }
  ]);
  const countBySubject = new Map(topicCounts.map((t) => [String(t._id), t.n]));

  // Published quizzes per subject, so the card's "Quizzes" chip is there from the first paint.
  const quizCounts = await Quiz.aggregate([
    { $match: { status: 'published', ...(scoped ? { applicableExams: { $in: toObjectIds(examIds) } } : {}) } },
    { $group: { _id: '$subject', n: { $sum: 1 } } }
  ]);
  const quizzesBySubject = new Map(quizCounts.map((q) => [String(q._id), q.n]));

  const subjects = docs
    .filter((s) => s?.slug)
    .map((s) => ({
      name: s.name || '',
      slug: s.slug,
      topicCount: countBySubject.get(String(s._id)) || 0,
      quizCount: quizzesBySubject.get(String(s._id)) || 0,
    }));
  return { subjects };
}

export async function buildTopicsIndex(examIds = []) {
  await dbConnect();
  // Cap the page so the HTML stays a reasonable size; the remaining topics
  // stay reachable through their subject pages.
  const docs = await Topic.find({ ...notEmbedded, ...(examIds.length ? { exams: { $in: examIds } } : {}) })
    .select('name slug subject')
    .populate('subject', 'name slug')
    .sort({ name: 1 })
    .limit(900)
    .lean();

  // Published quizzes per topic, so each topic card's "Quizzes" chip is there from the first paint.
  const topicQuizCounts = await Quiz.aggregate([
    { $match: { status: 'published', topic: { $ne: null }, ...(examIds.length ? { applicableExams: { $in: toObjectIds(examIds) } } : {}) } },
    { $group: { _id: '$topic', n: { $sum: 1 } } }
  ]);
  const quizzesByTopic = new Map(topicQuizCounts.map((q) => [String(q._id), q.n]));

  const bySubject = new Map();
  for (const t of docs) {
    if (!t?.slug) continue;
    const key = t.subject?.name || 'Other topics';
    if (!bySubject.has(key)) {
      bySubject.set(key, { heading: key, href: t.subject?.slug ? `/subjects/${t.subject.slug}` : null, items: [] });
    }
    bySubject.get(key).items.push({ href: `/topics/${t.slug}`, name: t.name || t.slug, quizCount: quizzesByTopic.get(String(t._id)) || 0 });
  }

  const groups = Array.from(bySubject.values()).sort((a, b) => b.items.length - a.items.length);
  return { groups };
}
