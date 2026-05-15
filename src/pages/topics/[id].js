import dynamic from 'next/dynamic';
import Link from 'next/link';
import Seo from '../../components/Seo';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
} from '../../utils/schema';

const TopicDetailPage = dynamic(() => import('../../components/pages/TopicDetailPage'), {
  ssr: false,
  loading: () => <div className="py-10 text-center text-sm font-bold text-slate-400">Loading topic content…</div>,
});

export default function TopicDetail({
  resolvedId,
  topic,
  relatedQuizzes = [],
  siblingTopics = [],
  aboutText = '',
  faqs = [],
  robotsMeta = 'index, follow',
}) {
  const topicName = topic?.name || 'Topic';
  const subjectName = topic?.subject?.name || '';
  const canonical = `/topics/${topic?.slug || resolvedId}`;

  const seoTitle = `${topicName} ${subjectName ? `– ${subjectName}` : ''} – Free MCQs, Notes & Practice Quizzes | AajExam`.replace(/\s+/g, ' ');
  const seoDescription = (topic?.description || `Practise ${topicName}${subjectName ? ` (${subjectName})` : ''} MCQs free on AajExam. Topic-wise quizzes, study notes and previous-year question highlights for SSC, UPSC, Banking, Railway and State PSC exam aspirants.`).slice(0, 160);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Topics', url: '/topics' },
    ...(subjectName && topic?.subject?.slug ? [{ name: subjectName, url: `/subjects/${topic.subject.slug}` }] : []),
    { name: topicName, url: canonical },
  ];

  const schemas = [
    generateBreadcrumbSchema(breadcrumbItems),
    faqs.length > 0 && generateFAQSchema(faqs),
    relatedQuizzes.length > 0 && generateItemListSchema({
      name: `${topicName} Practice Quizzes`,
      items: relatedQuizzes.map((q) => ({ name: q.title, url: `/quiz/${q.slug}` })),
    }),
  ].filter(Boolean);

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        noIndex={robotsMeta?.includes('noindex')}
        keywords={[
          `${topicName} quiz`,
          `${topicName} mcq`,
          `${topicName} notes`,
          `${topicName} practice`,
          subjectName && `${subjectName} ${topicName}`,
          'topic wise quiz',
          'government exam topic',
          'aajexam topic',
        ].filter(Boolean)}
        schemas={schemas}
      />

      <div className="min-h-screen pb-12 px-4 font-outfit relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-0 lg:px-4 py-4 lg:py-6 relative space-y-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest flex-wrap">
            <Link href="/" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Home</Link>
            <span className="text-slate-400">/</span>
            <Link href="/topics" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Topics</Link>
            {subjectName && topic?.subject?.slug && (
              <>
                <span className="text-slate-400">/</span>
                <Link href={`/subjects/${topic.subject.slug}`} className="text-primary-700 dark:text-primary-400 hover:text-primary-500">{subjectName}</Link>
              </>
            )}
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[60%]">{topicName}</span>
          </nav>

          {/* Hero — server-rendered for crawlers */}
          <header className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <span className="block text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">{subjectName ? `Topic · ${subjectName}` : 'Topic'}</span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">
              {topicName}
            </h1>
            <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {topic?.description ? topic.description.slice(0, 220) : `Free ${topicName} practice MCQs and study notes for government competitive exams.`}
            </p>
          </header>

          {/* About — long-form intro server-side */}
          {aboutText && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                About {topicName}
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-base lg:text-lg whitespace-pre-line">
                {aboutText}
              </div>
            </section>
          )}

          {/* Interactive content (client-rendered) */}
          <TopicDetailPage resolvedId={resolvedId} initialTopic={topic} />

          {/* FAQ — server-rendered for SEO + schema */}
          {faqs.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((f, i) => (
                  <details key={i} className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-5 cursor-pointer">
                    <summary className="font-black text-slate-900 dark:text-white text-base lg:text-lg uppercase tracking-tight">{f.question}</summary>
                    <p className="mt-3 text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Sibling topics — internal linking */}
          {siblingTopics.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                More {subjectName || 'Related'} Topics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {siblingTopics.map((t) => (
                  <Link key={t.slug} href={`/topics/${t.slug}`} className="group block bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition">
                    <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition leading-tight">{t.name}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function buildTopicAbout({ topic, subjectName, relatedQuizCount, siblingTopicCount }) {
  const topicName = topic.name || 'this topic';
  const dbDescription = topic.description ? topic.description.trim() + '\n\n' : '';
  const subjectClause = subjectName ? ` under ${subjectName}` : '';

  return `${dbDescription}${topicName}${subjectClause} is a core preparation topic on AajExam for candidates targeting SSC, UPSC, Banking, Railway, Defence and State PSC government competitive exams. This page collects every ${topicName} resource we host — topic-wise practice quizzes, multiple-choice questions with detailed solutions, study notes, and previous-year question highlights — so you can sharpen this single weak area before sitting the actual exam.

Why ${topicName} matters for government exam aspirants: exam-conducting bodies like SSC, RRB, IBPS, SBI and UPSC reuse a stable set of high-frequency topics across recruitment cycles. ${topicName} consistently appears in objective-type sections${subjectName ? ` of ${subjectName}` : ''} year after year, which means systematic practice on this topic pays disproportionately high returns versus passive reading. Toppers consistently report that 40-50% of their exam-day score gains came from focused topic-wise drilling rather than full-syllabus revision, and ${topicName} is one of the topics where targeted practice moves the needle the fastest.

How to use this page effectively: start by attempting one ${topicName} quiz cold (without notes) to establish your baseline accuracy. After submission, review every wrong and skipped question with the detailed explanation, paying attention to the underlying concept rather than memorising the specific answer. Then revise the relevant chapter from your notes and re-attempt a different quiz on the same topic 2-3 days later — your second attempt should show 15-20% better accuracy and noticeably faster solve time. Repeat this drill across all available ${topicName} quizzes (${relatedQuizCount > 0 ? `${relatedQuizCount} are currently available on this page` : 'new quizzes are added every week'}) and your topic mastery will compound rapidly.

AajExam's ${topicName} resource design: every quiz on this topic is built by subject experts using the exact question formats and difficulty distributions of the target government exams. Each question carries a step-by-step solution, concept tag, and difficulty rating so you can self-diagnose your weak sub-areas. Performance analytics after every attempt show your accuracy, time per question, and a comparison against the all-platform average so you know exactly where you stand. The platform is mobile-friendly, free to start, and supports both English and Hindi for question content and explanations where the source material was bilingual.

Beyond ${topicName} alone: if you find this topic interesting or particularly weak, explore the related topics${subjectName ? ` within ${subjectName}` : ''}${siblingTopicCount > 0 ? ` (${siblingTopicCount} more topics linked below)` : ''}, full-length practice tests, and the complete previous-year-paper archive on AajExam — combining topic-wise drilling with full-mock practice is the proven recipe for cracking competitive exams.`;
}

function buildTopicFaqs({ topic, subjectName, relatedQuizCount }) {
  const topicName = topic.name || 'this topic';
  return [
    {
      question: `Is ${topicName} practice free on AajExam?`,
      answer: `Yes. All topic-wise ${topicName} quizzes on AajExam are free to attempt. You only need a free AajExam account to track your performance, view detailed solutions and unlock the platform-wide analytics dashboard.`,
    },
    {
      question: `How many ${topicName} quizzes are available?`,
      answer: relatedQuizCount > 0
        ? `${relatedQuizCount} ${topicName} practice quizzes are currently available on AajExam, with new ones added every week. Each quiz is timed, mobile-friendly and shipped with detailed answer explanations.`
        : `New ${topicName} quizzes are added to AajExam every week. Bookmark this page and revisit it weekly to attempt the latest sets.`,
    },
    {
      question: `Why should I solve ${topicName} MCQs separately?`,
      answer: `Topic-wise drilling is the highest-leverage form of practice for government exam aspirants. Solving 5-10 ${topicName} quizzes back-to-back lets you spot patterns in question types, identify your sub-topic weaknesses with precision, and build the speed needed to clear sectional cut-offs. Full-length mocks alone don't give you this resolution.`,
    },
    {
      question: `Are detailed solutions provided for every ${topicName} question?`,
      answer: `Yes. Every question on AajExam ships with a complete step-by-step solution, the underlying concept, difficulty rating and (where applicable) shortcut tricks used by toppers. You can also discuss any question with the AajExam community.`,
    },
    {
      question: `Which government exams does ${topicName} appear in?`,
      answer: `${topicName} questions appear in SSC CGL, CHSL, MTS, GD; IBPS PO, Clerk; SBI PO, Clerk; RRB NTPC, Group D; UPSC prelims; and most State PSC exams${subjectName ? ` as part of the ${subjectName} section` : ''}. The specific weightage varies by exam — review the exam pattern on the corresponding AajExam exam page for details.`,
    },
  ];
}

export async function getServerSideProps({ params, res }) {
  const dbConnect = (await import('../../lib/db')).default;
  const Topic = (await import('../../models/Topic')).default;
  const Quiz = (await import('../../models/Quiz')).default;
  const { isObjectId, slugRedirect } = await import('../../lib/web/slugRouting');
  const segment = params?.id;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await Topic.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/topics/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
    }

    const topic = await Topic.findOne(isObjectId(segment) ? { _id: segment } : { slug: segment })
      .select('_id name slug description subject')
      .populate('subject', 'name slug')
      .lean();

    if (!topic) return { notFound: true };

    // Related quizzes for this topic
    const relatedQuizDocs = await Quiz.find({ topic: topic._id, status: 'published', slug: { $exists: true, $ne: null } })
      .select('title slug')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(12)
      .lean();
    const relatedQuizzes = relatedQuizDocs.map((q) => ({ title: q.title, slug: q.slug }));

    // Sibling topics from the same subject
    const siblingDocs = topic.subject?._id
      ? await Topic.find({ subject: topic.subject._id, _id: { $ne: topic._id }, isActive: true, slug: { $exists: true, $ne: null } })
          .select('name slug')
          .sort({ order: 1, name: 1 })
          .limit(12)
          .lean()
      : [];
    const siblingTopics = siblingDocs.map((t) => ({ name: t.name, slug: t.slug }));

    const subjectName = topic.subject?.name || '';
    const aboutText = buildTopicAbout({
      topic,
      subjectName,
      relatedQuizCount: relatedQuizzes.length,
      siblingTopicCount: siblingTopics.length,
    });
    const faqs = buildTopicFaqs({ topic, subjectName, relatedQuizCount: relatedQuizzes.length });

    // Robots gate
    const { getRobotsMeta } = require('../../utils/robotsMeta');
    const robots = getRobotsMeta(
      { ...JSON.parse(JSON.stringify(topic)), description: aboutText },
      {
        threshold: process.env.QUIZ_CONTENT_SCORE_THRESHOLD ? parseFloat(process.env.QUIZ_CONTENT_SCORE_THRESHOLD) : undefined,
        minIntroWords: process.env.QUIZ_MIN_INTRO_WORDS ? parseInt(process.env.QUIZ_MIN_INTRO_WORDS, 10) : undefined,
        enabled: process.env.QUIZ_NOINDEX_ENABLED ? (process.env.QUIZ_NOINDEX_ENABLED === 'true') : undefined,
        safeMode: process.env.QUIZ_SAFE_MODE ? (process.env.QUIZ_SAFE_MODE === 'true') : undefined,
      }
    );

    if (res) {
      res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    }

    return {
      props: {
        resolvedId: String(topic._id),
        topic: JSON.parse(JSON.stringify(topic)),
        relatedQuizzes,
        siblingTopics,
        aboutText,
        faqs,
        robotsMeta: robots.robots,
      },
    };
  } catch (e) {
    console.error('topic ssr error', e);
    return { notFound: true };
  }
}
