import dynamic from 'next/dynamic';
import Link from 'next/link';
import Seo from '../../components/Seo';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
} from '../../utils/schema';

const SubjectDetailPage = dynamic(() => import('../../components/pages/SubjectDetailPage'), {
  ssr: false,
  loading: () => <div className="py-10 text-center text-sm font-bold text-slate-400">Loading subject content…</div>,
});

export default function SubjectDetail({
  resolvedId,
  subject,
  topics = [],
  quizCount = 0,
  aboutText = '',
  faqs = [],
  robotsMeta = 'index, follow',
}) {
  const subjectName = subject?.name || 'Subject';
  const canonical = `/subjects/${subject?.slug || resolvedId}`;

  const seoTitle = `${subjectName} – Topic-wise Quizzes, Notes & Practice Tests | AajExam`;
  const seoDescription = (subject?.description || `Master ${subjectName} for SSC, UPSC, Banking, Railway and State PSC exams on AajExam — ${topics.length} topic-wise drill quizzes, study notes and previous-year question highlights with detailed solutions.`).slice(0, 160);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Subjects', url: '/subjects' },
    { name: subjectName, url: canonical },
  ];

  const schemas = [
    generateBreadcrumbSchema(breadcrumbItems),
    faqs.length > 0 && generateFAQSchema(faqs),
    topics.length > 0 && generateItemListSchema({
      name: `${subjectName} Topics`,
      items: topics.map((t) => ({ name: t.name, url: `/topics/${t.slug}` })),
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
          `${subjectName} quiz`,
          `${subjectName} mcq`,
          `${subjectName} practice`,
          `${subjectName} notes`,
          `${subjectName} for SSC`,
          `${subjectName} for UPSC`,
          'topic wise mcq',
          'government exam practice',
          'aajexam',
        ]}
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
            <Link href="/subjects" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Subjects</Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[60%]">{subjectName}</span>
          </nav>

          {/* Hero — server-rendered */}
          <header className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <span className="block text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">Subject</span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">
              {subjectName}
            </h1>
            <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mb-6">
              {subject?.description ? subject.description.slice(0, 220) : `Master ${subjectName} for government competitive exams with topic-wise drills, study notes and exam-replicating practice tests on AajExam.`}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border-2 border-slate-100 dark:border-slate-800">
                <div className="text-xl font-black text-slate-900 dark:text-white">{topics.length}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topics</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border-2 border-slate-100 dark:border-slate-800">
                <div className="text-xl font-black text-slate-900 dark:text-white">{quizCount}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quizzes</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border-2 border-slate-100 dark:border-slate-800">
                <div className="text-xl font-black text-emerald-600">FREE</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access</div>
              </div>
            </div>
          </header>

          {/* About — long-form intro */}
          {aboutText && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                About {subjectName}
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-base lg:text-lg whitespace-pre-line">
                {aboutText}
              </div>
            </section>
          )}

          {/* Topics under this subject */}
          {topics.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                Topics in {subjectName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {topics.map((t) => (
                  <Link key={t.slug} href={`/topics/${t.slug}`} className="group block bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition">
                    <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition leading-tight">{t.name}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Interactive content (client-rendered) */}
          <SubjectDetailPage resolvedId={resolvedId} initialSubject={subject} />

          {/* FAQ */}
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
        </div>
      </div>
    </>
  );
}

function buildSubjectAbout({ subject, topicCount, quizCount }) {
  const subjectName = subject.name || 'this subject';
  const dbDescription = subject.description ? subject.description.trim() + '\n\n' : '';

  return `${dbDescription}${subjectName} is one of the core subject sections appearing in nearly every major government competitive exam in India — SSC CGL, CHSL, MTS, GD; IBPS PO, Clerk; SBI PO, Clerk; RRB NTPC, Group D; UPSC prelims; and most State PSC exams. AajExam organises ${subjectName} preparation into ${topicCount > 0 ? `${topicCount} topic-wise practice modules` : 'topic-wise practice modules'} that mirror the exact question patterns, difficulty distribution and time pressures of the actual exams, so candidates can build genuine exam-ready competence rather than passive textbook familiarity.

Why ${subjectName} deserves a dedicated preparation strategy: government exam paper-setters consistently draw ${subjectName} questions from a stable, recurring set of high-frequency topics — meaning targeted topic-wise drilling delivers disproportionately high score gains relative to the time invested. Toppers consistently report that 40-50% of their exam-day score gains came from focused ${subjectName} drilling rather than full-syllabus revision. The trick isn't to "learn everything" but to identify the 8-12 topics that appear in every shift and master them through high-volume, exam-replicating MCQ practice. This page is your structured entry point to exactly that strategy.

How to prepare ${subjectName} effectively using AajExam: start by browsing the topic list below and identifying your two weakest sub-areas (a quick 10-question diagnostic quiz on each will reveal these). Spend the next 7-10 days revising the underlying chapters from your notes, then attempt 3-5 quizzes on each weak topic back-to-back over a weekend to lock in speed and accuracy. From there, alternate one quiz per day across rotating ${subjectName} topics until you've covered the full topic tree. The week before your target exam, re-attempt your 4-5 weakest quizzes — second attempts should be 15-20% faster with measurably better accuracy. This compounding-practice loop is the proven recipe for cracking ${subjectName} sections of competitive exams.

What makes AajExam's ${subjectName} content different: every quiz is built by subject experts using the actual question formats, difficulty distributions and time pressures of the target exams. ${quizCount > 0 ? `${quizCount} ${subjectName} quizzes` : 'New quizzes'} are added regularly, with each question carrying a step-by-step solution, concept tag and difficulty rating so you can self-diagnose your weak sub-areas with surgical precision. Performance analytics after every attempt show your accuracy, time per question and a comparison against the all-platform average — so you know exactly where you stand against other candidates.

All ${subjectName} content on AajExam is mobile-friendly, free to start, and supports both English and Hindi explanations where applicable. New quizzes, notes and previous-year question highlights are added every week — bookmark this page and revisit it weekly to keep your ${subjectName} edge sharp through your exam preparation cycle.`;
}

function buildSubjectFaqs({ subject, topicCount, quizCount }) {
  const subjectName = subject.name || 'this subject';
  return [
    {
      question: `Is ${subjectName} practice on AajExam free?`,
      answer: `Yes. All topic-wise ${subjectName} quizzes on AajExam are free to attempt. You only need a free AajExam account to track your performance, view detailed solutions and unlock the analytics dashboard.`,
    },
    {
      question: `How many ${subjectName} topics and quizzes are available?`,
      answer: topicCount > 0
        ? `${topicCount} ${subjectName} topics with ${quizCount} practice quizzes are currently available, with new content added weekly. Each quiz is timed, mobile-friendly and shipped with detailed answer explanations.`
        : `New ${subjectName} topics and quizzes are added to AajExam every week. Bookmark this page and revisit it weekly.`,
    },
    {
      question: `Which exams does ${subjectName} appear in?`,
      answer: `${subjectName} forms a core scoring section in SSC CGL, CHSL, MTS, GD; IBPS PO, Clerk; SBI PO, Clerk; RRB NTPC, Group D; UPSC prelims and most State PSC exams. The specific weightage varies by exam — check the exam pattern on the corresponding AajExam exam page for details.`,
    },
    {
      question: `Should I solve topic-wise quizzes or full-length tests for ${subjectName}?`,
      answer: `Both, in sequence. Start with topic-wise drilling to identify and fix your sub-topic weaknesses with precision. Then move to full-length sectional tests once you're consistently scoring 80%+ on individual topic quizzes. Topic-wise alone won't build exam stamina; full-length tests alone won't reveal where you're weak. The combination is the topper formula.`,
    },
    {
      question: `Are detailed solutions provided for ${subjectName} questions?`,
      answer: `Yes. Every question on every ${subjectName} quiz ships with a complete step-by-step solution, the underlying concept, difficulty rating and (where applicable) shortcut tricks used by toppers. You can also discuss any question with the AajExam community.`,
    },
  ];
}

export async function getServerSideProps({ params, res }) {
  const dbConnect = (await import('../../lib/db')).default;
  const Subject = (await import('../../models/Subject')).default;
  const Topic = (await import('../../models/Topic')).default;
  const Quiz = (await import('../../models/Quiz')).default;
  const { isObjectId, slugRedirect } = await import('../../lib/web/slugRouting');
  const segment = params?.id;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await Subject.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/subjects/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
    }

    const subject = await Subject.findOne(isObjectId(segment) ? { _id: segment } : { slug: segment })
      .select('_id name slug description icon')
      .lean();

    if (!subject) return { notFound: true };

    // Topics under this subject
    const topicDocs = await Topic.find({ subject: subject._id, isActive: true, slug: { $exists: true, $ne: null } })
      .select('name slug')
      .sort({ order: 1, name: 1 })
      .limit(40)
      .lean();
    const topics = topicDocs.map((t) => ({ name: t.name, slug: t.slug }));

    // Quiz count for this subject
    const quizCount = await Quiz.countDocuments({ subject: subject._id, status: 'published' });

    const aboutText = buildSubjectAbout({ subject, topicCount: topics.length, quizCount });
    const faqs = buildSubjectFaqs({ subject, topicCount: topics.length, quizCount });

    const { getRobotsMeta } = require('../../utils/robotsMeta');
    const robots = getRobotsMeta(
      { ...JSON.parse(JSON.stringify(subject)), description: aboutText },
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
        resolvedId: String(subject._id),
        subject: JSON.parse(JSON.stringify(subject)),
        topics,
        quizCount,
        aboutText,
        faqs,
        robotsMeta: robots.robots,
      },
    };
  } catch (e) {
    console.error('subject ssr error', e);
    return { notFound: true };
  }
}
