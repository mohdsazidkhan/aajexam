import dynamic from 'next/dynamic';
import Link from 'next/link';
import Seo from '../../components/Seo';
import {
  generateBreadcrumbSchema,
  generateQuizSchema,
  generateFAQSchema,
  generateItemListSchema,
} from '../../utils/schema';

const QuizPreviewPage = dynamic(() => import('../../components/pages/QuizPreviewPage'), {
  ssr: false,
  loading: () => <div className="py-10 text-center text-sm font-bold text-slate-400">Loading quiz preview…</div>,
});

export default function QuizPreview({
  resolvedId,
  quiz,
  relatedQuizzes = [],
  aboutText = '',
  faqs = [],
  robotsMeta = 'index, follow',
}) {
  const quizTitle = quiz?.title || 'Quiz';
  const subjectName = quiz?.subject?.name || '';
  const topicName = quiz?.topic?.name || '';
  const canonical = `/quiz/${quiz?.slug || resolvedId}`;

  const seoTitle = `${quizTitle} – Free Online Quiz with Solutions | AajExam`;
  const seoDescription = (quiz?.description ||
    `Attempt the ${quizTitle} quiz on AajExam. ${quiz?.totalQuestions || ''} MCQs with detailed step-by-step solutions for SSC, UPSC, Banking, Railway and State PSC exam preparation.`).slice(0, 160);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Quizzes', url: '/quizzes' },
    ...(subjectName && quiz?.subject?.slug ? [{ name: subjectName, url: `/subjects/${quiz.subject.slug}` }] : []),
    ...(topicName && quiz?.topic?.slug ? [{ name: topicName, url: `/topics/${quiz.topic.slug}` }] : []),
    { name: quizTitle, url: canonical },
  ];

  const schemas = [
    generateQuizSchema({
      title: quizTitle,
      description: aboutText || quiz?.description,
      educationalDescription: quiz?.description,
      categoryName: subjectName,
      timeLimit: quiz?.duration,
    }),
    generateBreadcrumbSchema(breadcrumbItems),
    faqs.length > 0 && generateFAQSchema(faqs),
    relatedQuizzes.length > 0 && generateItemListSchema({
      name: `Related ${topicName || subjectName || 'Practice'} Quizzes`,
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
          `${quizTitle} quiz`,
          `${quizTitle} mcq`,
          subjectName && `${subjectName} quiz`,
          topicName && `${topicName} mcq`,
          'free online quiz',
          'government exam quiz',
          'aajexam quiz',
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
            <Link href="/quizzes" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Quizzes</Link>
            {subjectName && quiz?.subject?.slug && (
              <>
                <span className="text-slate-400">/</span>
                <Link href={`/subjects/${quiz.subject.slug}`} className="text-primary-700 dark:text-primary-400 hover:text-primary-500">{subjectName}</Link>
              </>
            )}
            {topicName && quiz?.topic?.slug && (
              <>
                <span className="text-slate-400">/</span>
                <Link href={`/topics/${quiz.topic.slug}`} className="text-primary-700 dark:text-primary-400 hover:text-primary-500">{topicName}</Link>
              </>
            )}
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[60%]">{quizTitle}</span>
          </nav>

          {/* Hero — server-rendered */}
          <header className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {subjectName && <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-[10px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">{subjectName}</span>}
              {topicName && <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{topicName}</span>}
              {quiz?.difficulty && <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest">{quiz.difficulty}</span>}
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">
              {quizTitle}
            </h1>
            <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mb-5">
              {quiz?.description ? quiz.description.slice(0, 220) : `Free practice quiz on ${quizTitle} with detailed solutions for government exam preparation.`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
              {quiz?.duration && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{quiz.duration}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Minutes</div>
                </div>
              )}
              {quiz?.totalMarks && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{quiz.totalMarks}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marks</div>
                </div>
              )}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                <div className="text-lg font-black text-emerald-600">FREE</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access</div>
              </div>
            </div>
          </header>

          {/* About — long-form intro */}
          {aboutText && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                About This Quiz
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-base lg:text-lg whitespace-pre-line">
                {aboutText}
              </div>
            </section>
          )}

          {/* Interactive preview */}
          <QuizPreviewPage resolvedId={resolvedId} initialQuiz={quiz} />

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

          {/* Related quizzes */}
          {relatedQuizzes.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                Related {topicName || subjectName || ''} Quizzes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {relatedQuizzes.map((q) => (
                  <Link key={q.slug} href={`/quiz/${q.slug}`} className="group block bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition">
                    <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition leading-tight">{q.title}</div>
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

function buildQuizAbout({ quiz, subjectName, topicName, relatedCount }) {
  const quizTitle = quiz.title || 'this quiz';
  const dbDescription = quiz.description ? quiz.description.trim() + '\n\n' : '';
  const scopeClause = topicName ? `${topicName}${subjectName ? ` (${subjectName})` : ''}` : (subjectName || 'the topic covered');
  const durationClause = quiz.duration ? `${quiz.duration}-minute` : 'timed';
  const marksClause = quiz.totalMarks ? `${quiz.totalMarks}-mark` : 'scored';
  const difficultyClause = quiz.difficulty ? ` rated at ${quiz.difficulty} difficulty` : '';

  return `${dbDescription}${quizTitle} is a free, ${durationClause}, ${marksClause} practice quiz on AajExam${difficultyClause}, designed to help candidates preparing for SSC, UPSC, Banking, Railway and State PSC government competitive exams sharpen their command of ${scopeClause}. Every question on this quiz ships with a detailed step-by-step solution so you don't just learn the right answer — you learn the reasoning and shortcuts top scorers use to crack similar questions faster on the actual exam day.

Why ${quizTitle} matters in your preparation: government exam-conducting bodies repeatedly draw questions from the same chapters and the same skill-clusters across recruitment cycles. By attempting focused topic-wise quizzes like this one, you build pattern recognition — the ability to spot which formula, rule or trick applies the moment you see a question. Toppers consistently report that 5-10 quizzes on a single topic delivers more exam-day score gain than 20+ unfocused full-length mocks, because targeted drilling exposes your specific sub-topic weaknesses with surgical precision.

How to use this quiz effectively: attempt it in one sitting under the ${durationClause} timer, without referring to notes or external resources — simulate exam-day conditions exactly. After submission, review the auto-generated analytics to see your accuracy, time per question and section-wise performance. Then go through every wrong and skipped question with the explanation, mentally tagging the underlying concept rather than just memorising the answer. Revisit this quiz after 7-10 days; your second attempt should be 15-20% faster with noticeably better accuracy. ${relatedCount > 0 ? `After mastering this quiz, explore the ${relatedCount} related quizzes linked below to broaden your topic coverage.` : 'Bookmark this page and revisit weekly as we add new quizzes on related topics.'}

AajExam quiz design principles: every quiz on the platform is curated by subject experts using the actual question formats, difficulty distributions and time pressures of the target government exams. We deliberately avoid generic "textbook" questions in favour of exam-replicating ones. Solutions are written in plain English (and Hindi where source material was bilingual), with step-by-step working for quantitative problems, grammar rules for English questions, and direct reference statements for general awareness items. Performance analytics after each attempt include accuracy, attempt rate, time spent per question, and an estimated all-India percentile so you know exactly where you stand against other candidates.

This quiz is completely free to attempt. You only need a free AajExam account to track your performance across attempts, view detailed solutions and unlock the platform-wide analytics dashboard. The platform is mobile-friendly and works seamlessly on smartphones, tablets and desktops — so you can sharpen your ${scopeClause} skills in any spare 15-minute window.`;
}

function buildQuizFaqs({ quiz, subjectName, topicName }) {
  const quizTitle = quiz.title || 'this quiz';
  return [
    {
      question: `Is ${quizTitle} free to attempt on AajExam?`,
      answer: `Yes. ${quizTitle} is completely free. You only need a free AajExam account to track your score, view detailed solutions and unlock cross-attempt analytics.`,
    },
    {
      question: `How long does it take to complete ${quizTitle}?`,
      answer: quiz.duration
        ? `${quizTitle} runs on a ${quiz.duration}-minute timer in real exam-style conditions. The clock starts the moment you click Start, mirroring the time pressure of the actual exam.`
        : `${quizTitle} is delivered in real exam-style timed conditions. The duration matches the question count so you experience genuine exam pace.`,
    },
    {
      question: `Are detailed solutions provided?`,
      answer: `Yes. Every question on ${quizTitle} ships with a complete step-by-step solution, the underlying concept, and (where applicable) shortcut tricks. You can also discuss any question with the AajExam community.`,
    },
    {
      question: `Can I attempt ${quizTitle} multiple times?`,
      answer: `Yes. You can attempt this quiz as many times as you like. Each attempt is recorded separately so you can track improvement in score, accuracy and time-management.`,
    },
    {
      question: `Which government exams does this quiz prepare me for?`,
      answer: `${topicName || subjectName || 'This topic'} questions appear regularly in SSC CGL, CHSL, MTS, GD; IBPS PO, Clerk; SBI PO, Clerk; RRB NTPC, Group D; UPSC prelims and most State PSC exams. The specific weightage varies by exam — check the exam pattern on the corresponding AajExam exam page for details.`,
    },
  ];
}

export async function getServerSideProps({ params, res }) {
  const dbConnect = (await import('../../lib/db')).default;
  const Quiz = (await import('../../models/Quiz')).default;
  const { isObjectId, slugRedirect } = await import('../../lib/web/slugRouting');
  const segment = params?.id;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await Quiz.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/quiz/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
    }

    const quiz = await Quiz.findOne(isObjectId(segment) ? { _id: segment } : { slug: segment })
      .select('_id title slug description duration totalMarks difficulty subject topic')
      .populate('subject', 'name slug')
      .populate('topic', 'name slug')
      .lean();

    if (!quiz) return { notFound: true };

    // Related quizzes from same topic (preferred) or subject
    const relatedQuery = quiz.topic
      ? { topic: quiz.topic._id, _id: { $ne: quiz._id }, status: 'published', slug: { $exists: true, $ne: null } }
      : quiz.subject
        ? { subject: quiz.subject._id, _id: { $ne: quiz._id }, status: 'published', slug: { $exists: true, $ne: null } }
        : null;

    const relatedDocs = relatedQuery
      ? await Quiz.find(relatedQuery)
          .select('title slug')
          .sort({ publishedAt: -1, createdAt: -1 })
          .limit(6)
          .lean()
      : [];
    const relatedQuizzes = relatedDocs.map((q) => ({ title: q.title, slug: q.slug }));

    const subjectName = quiz.subject?.name || '';
    const topicName = quiz.topic?.name || '';
    const aboutText = buildQuizAbout({ quiz, subjectName, topicName, relatedCount: relatedQuizzes.length });
    const faqs = buildQuizFaqs({ quiz, subjectName, topicName });

    const { getRobotsMeta } = require('../../utils/robotsMeta');
    const robots = getRobotsMeta(
      { ...JSON.parse(JSON.stringify(quiz)), description: aboutText },
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
        resolvedId: String(quiz._id),
        quiz: JSON.parse(JSON.stringify(quiz)),
        relatedQuizzes,
        aboutText,
        faqs,
        robotsMeta: robots.robots,
      },
    };
  } catch (e) {
    console.error('quiz ssr error', e);
    return { notFound: true };
  }
}
