import mongoose from 'mongoose';
import dbConnect from './db';
import Subject from '../models/Subject';
import Topic from '../models/Topic';
import Quiz from '../models/Quiz';
import Exam from '../models/Exam';

// Data behind the three link-index sections on /quizzes. examIds empty = full catalogue
// (static/ISR page, what crawlers see); otherwise limited to those exams (logged-in users).
export async function buildQuizzesIndex(examIds = []) {
  const scoped = examIds.length > 0;
  await dbConnect();

  const [subjectDocs, topicCounts, quizDocs, seriesGroups] = await Promise.all([
    Subject.find(scoped ? { exams: { $in: examIds } } : {}).select('name slug').sort({ name: 1 }).limit(300).lean(),
    Topic.aggregate([
      ...(scoped ? [{ $match: { exams: { $in: examIds.map((id) => new mongoose.Types.ObjectId(id)) } } }] : []),
      { $group: { _id: '$subject', n: { $sum: 1 } } }
    ]),
    // The full-catalogue list skips noindex quizzes (crawler links); a logged-in user's own exams show them all.
    Quiz.find({ status: 'published', ...(scoped ? { applicableExams: { $in: examIds } } : { noindexOverride: { $ne: true } }) })
      .select('title slug difficulty publishedAt createdAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(120)
      .lean(),
    // Consolidated /practice/<exam>/<subject> question banks.
    Quiz.aggregate([
      { $match: { type: 'subject_test', status: 'published' } },
      { $unwind: '$applicableExams' },
      ...(scoped ? [{ $match: { applicableExams: { $in: examIds.map((id) => new mongoose.Types.ObjectId(id)) } } }] : []),
      { $group: { _id: { exam: '$applicableExams', subject: '$subject' }, questions: { $sum: { $size: { $ifNull: ['$questions', []] } } } } },
      { $match: { questions: { $gte: 50 } } },
      { $sort: { questions: -1 } }
    ])
  ]);

  const [seriesExams, seriesSubjects] = await Promise.all([
    Exam.find({ _id: { $in: seriesGroups.map((g) => g._id.exam) } }).select('name slug').lean(),
    Subject.find({ _id: { $in: seriesGroups.map((g) => g._id.subject) } }).select('name slug').lean()
  ]);
  const examById = new Map(seriesExams.map((e) => [String(e._id), e]));
  const subjectById = new Map(seriesSubjects.map((x) => [String(x._id), x]));

  const groupedByExam = new Map();
  for (const g of seriesGroups) {
    const ex = examById.get(String(g._id.exam));
    const sub = subjectById.get(String(g._id.subject));
    if (!ex?.slug || !sub?.slug) continue;
    if (!groupedByExam.has(ex.slug)) {
      groupedByExam.set(ex.slug, { heading: ex.name || ex.slug, href: `/govt-exams/exam/${ex.slug}`, items: [] });
    }
    groupedByExam.get(ex.slug).items.push({
      href: `/practice/${ex.slug}/${sub.slug}`,
      name: `${sub.name} previous year questions`,
      meta: `${g.questions} questions`
    });
  }
  const practiceGroups = Array.from(groupedByExam.values()).sort((a, b) => b.items.length - a.items.length);

  const countBySubject = new Map(topicCounts.map((t) => [String(t._id), t.n]));

  return {
    subjects: subjectDocs.filter((s) => s?.slug).map((s) => ({
      name: s.name || '',
      slug: s.slug,
      topicCount: countBySubject.get(String(s._id)) || 0
    })),
    latestQuizzes: quizDocs.filter((q) => q?.slug).map((q) => ({
      title: q.title || q.slug,
      slug: q.slug,
      meta: q.difficulty || null
    })),
    practiceGroups
  };
}
