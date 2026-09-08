import dynamic from 'next/dynamic';
import Seo from '../components/Seo';
import LinkIndexSection from '../components/seo/LinkIndexSection';
import { generateBreadcrumbSchema, generateItemListSchema } from '../utils/schema';
import { PageLoadingFallback } from '../components/skeletons/PublicSkeletons';

const QuizListPage = dynamic(() => import('../components/pages/QuizListPage'), { ssr: false, loading: () => <PageLoadingFallback /> });

export default function Quizzes({ subjects = [], latestQuizzes = [], practiceGroups = [] }) {
  return (
    <>
      <Seo
        title="Free Quizzes – Topic-wise Government Exam Practice | AajExam"
        description="Practise 1000+ topic-wise free quizzes on AajExam: Reasoning, Quantitative Aptitude, English, General Awareness and Current Affairs for SSC, UPSC, Banking and Railway exams."
        canonical="/quizzes"
        keywords={[
          'free online quiz',
          'government exam quiz',
          'topic wise quiz',
          'reasoning quiz',
          'quantitative aptitude mcq',
          'english quiz',
          'current affairs quiz',
          'aajexam quizzes'
        ]}
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Quizzes', url: '/quizzes' }
          ]),
          latestQuizzes.length > 0 && generateItemListSchema({
            name: 'Latest quizzes on AajExam',
            items: latestQuizzes.map((q) => ({ name: q.title, url: `/quiz/${q.slug}` }))
          })
        ].filter(Boolean)}
      />
      <QuizListPage />

      <div className="px-3 lg:px-0 pb-10 space-y-6">
        <LinkIndexSection
          title="Browse quizzes by subject"
          intro="Start with a subject, drill into a topic, then attempt the quizzes under it. Every quiz is free, timed and shipped with step-by-step solutions."
          groups={[{ items: subjects.map((s) => ({ href: `/subjects/${s.slug}`, name: s.name, meta: s.topicCount ? `${s.topicCount} topics` : null })) }]}
          columns="sm:grid-cols-2 lg:grid-cols-4"
        />
        <LinkIndexSection
          title="Subject-wise previous year questions"
          intro="Every question asked in past papers, grouped by exam and subject, with answers and explanations. These pages carry the full question bank; the individual sets below are ten-question slices of it."
          groups={practiceGroups}
          columns="sm:grid-cols-2 lg:grid-cols-3"
        />
        <LinkIndexSection
          title="Latest quizzes"
          groups={[{ items: latestQuizzes.map((q) => ({ href: `/quiz/${q.slug}`, name: q.title, meta: q.meta })) }]}
          columns="sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const dbConnect = (await import('../lib/db')).default;
    const Subject = (await import('../models/Subject')).default;
    const Topic = (await import('../models/Topic')).default;
    const Quiz = (await import('../models/Quiz')).default;

    await dbConnect();

    const Exam = (await import('../models/Exam')).default;

    const [subjectDocs, topicCounts, quizDocs, seriesGroups] = await Promise.all([
      Subject.find({}).select('name slug').sort({ name: 1 }).limit(300).lean(),
      Topic.aggregate([{ $group: { _id: '$subject', n: { $sum: 1 } } }]),
      Quiz.find({ status: 'published', noindexOverride: { $ne: true } })
        .select('title slug difficulty publishedAt createdAt')
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(120)
        .lean(),
      // Consolidated /practice/<exam>/<subject> question banks.
      Quiz.aggregate([
        { $match: { type: 'subject_test', status: 'published' } },
        { $unwind: '$applicableExams' },
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
      props: {
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
      },
      revalidate: 1800
    };
  } catch (e) {
    console.error('Error in quizzes getStaticProps:', e);
    return { props: { subjects: [], latestQuizzes: [], practiceGroups: [] }, revalidate: 300 };
  }
}
