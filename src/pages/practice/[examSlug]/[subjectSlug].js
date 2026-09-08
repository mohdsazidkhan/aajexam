import Link from 'next/link';
import Seo from '../../../components/Seo';
import QuestionList from '../../../components/seo/QuestionList';
import LinkIndexSection from '../../../components/seo/LinkIndexSection';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
} from '../../../utils/schema';

// A series page needs enough real content to deserve indexing on its own.
const MIN_QUESTIONS_TO_INDEX = 50;
const QUESTIONS_ON_PAGE = 30;
const SERIES_LINKS_ON_PAGE = 40;

/**
 * Consolidated subject-wise PYQ practice page.
 *
 * The `subject_test` quizzes are auto-sliced into "… PYQ Quiz 1 … 612" sets of
 * ten questions each. Individually they are near-duplicates (identical
 * descriptions, titles differing by a number) and carry `noindexOverride`.
 * This page is where that content is meant to rank: one strong URL per
 * exam × subject, with the questions actually rendered.
 */
export default function SubjectPractice({
  exam,
  subject,
  questions = [],
  totalQuestions = 0,
  quizCount = 0,
  seriesQuizzes = [],
  topics = [],
  hasPyq = false,
  aboutText = '',
  faqs = [],
  indexable = true,
}) {
  const examName = exam?.name || 'Government exam';
  const subjectName = subject?.name || 'Subject';
  const heading = `${examName} ${subjectName} — Previous Year Questions`;
  const canonical = `/practice/${exam?.slug}/${subject?.slug}`;

  const seoTitle = `${examName} ${subjectName} PYQ – ${totalQuestions}+ Questions with Solutions`.slice(0, 65);
  const seoDescription = `Practise ${totalQuestions}+ ${examName} ${subjectName} previous year questions free on AajExam, each with the correct answer and a detailed explanation. Topic-wise sets, no login needed to read.`.slice(0, 158);

  const schemas = [
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Quizzes', url: '/quizzes' },
      ...(exam?.slug ? [{ name: examName, url: `/govt-exams/exam/${exam.slug}` }] : []),
      { name: `${subjectName} PYQ`, url: canonical },
    ]),
    faqs.length > 0 && generateFAQSchema(faqs),
    seriesQuizzes.length > 0 && generateItemListSchema({
      name: `${examName} ${subjectName} practice sets`,
      items: seriesQuizzes.map((q) => ({ name: q.title, url: `/quiz/${q.slug}` })),
    }),
  ].filter(Boolean);

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        noIndex={!indexable}
        keywords={[
          `${examName} ${subjectName} previous year questions`,
          `${examName} ${subjectName} pyq`,
          `${examName} ${subjectName} mcq`,
          `${subjectName} questions with answers`,
          `${examName} practice questions`,
        ]}
        schemas={schemas}
      />

      <div className="min-h-screen pb-12 px-4 font-outfit">
        <div className="container mx-auto px-0 lg:px-4 py-4 lg:py-6 space-y-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest flex-wrap">
            <Link href="/" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Home</Link>
            <span className="text-slate-400">/</span>
            <Link href="/quizzes" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Quizzes</Link>
            {exam?.slug && (
              <>
                <span className="text-slate-400">/</span>
                <Link href={`/govt-exams/exam/${exam.slug}`} className="text-primary-700 dark:text-primary-400 hover:text-primary-500">{examName}</Link>
              </>
            )}
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400">{subjectName} PYQ</span>
          </nav>

          <header className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <span className="block text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
              Previous year questions · {examName}
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">
              {heading}
            </h1>
            <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mb-5">
              {totalQuestions} {subjectName} questions asked in past {examName} papers, split into {quizCount} timed practice sets — every question with its answer and explanation.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                <div className="text-lg font-black text-slate-900 dark:text-white">{totalQuestions}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Questions</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                <div className="text-lg font-black text-slate-900 dark:text-white">{quizCount}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Practice sets</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                <div className="text-lg font-black text-emerald-600">FREE</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access</div>
              </div>
            </div>
          </header>

          {aboutText && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                About {examName} {subjectName} previous year questions
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-base lg:text-lg whitespace-pre-line">
                {aboutText}
              </div>
            </section>
          )}

          <QuestionList
            questions={questions}
            title={`${subjectName} PYQs asked in ${examName}`}
            intro={`A sample of ${questions.length} questions from the full bank of ${totalQuestions}. Try each one before opening the solution — the remaining questions are in the timed practice sets below.`}
          />

          <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
              Keep going
            </h2>
            <div className="flex flex-wrap gap-3">
              {exam?.slug && (
                <Link href={`/govt-exams/exam/${exam.slug}`} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors">
                  {examName} syllabus &amp; pattern
                </Link>
              )}
              {hasPyq && exam?.slug && (
                <Link href={`/pyq/${exam.slug}`} className="bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-800 px-4 py-2.5 rounded-xl font-bold text-sm hover:border-primary-400 transition-colors">
                  Full {examName} question papers
                </Link>
              )}
              {subject?.slug && (
                <Link href={`/subjects/${subject.slug}`} className="bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-800 px-4 py-2.5 rounded-xl font-bold text-sm hover:border-primary-400 transition-colors">
                  All {subjectName} practice
                </Link>
              )}
            </div>
          </section>

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

          <LinkIndexSection
            title={`${examName} ${subjectName} practice sets`}
            intro={`Each set is a timed ${quizCount > 0 ? '10-question' : ''} drill drawn from the same question bank.`}
            groups={[{ items: seriesQuizzes.map((q) => ({ href: `/quiz/${q.slug}`, name: q.title })) }]}
            columns="sm:grid-cols-2 lg:grid-cols-3"
          />

          {topics.length > 0 && (
            <LinkIndexSection
              title={`Related ${subjectName} topics`}
              groups={[{ items: topics.map((t) => ({ href: `/topics/${t.slug}`, name: t.name })) }]}
              columns="sm:grid-cols-2 lg:grid-cols-4"
            />
          )}
        </div>
      </div>
    </>
  );
}

function buildAbout({ examName, subjectName, totalQuestions, quizCount }) {
  return `This page collects every ${subjectName} question that has appeared in past ${examName} papers on AajExam — ${totalQuestions} questions in total, organised into ${quizCount} short, timed practice sets. Each question is shown with its four options, the correct answer, and an explanation of the reasoning, so you can use the page either as a self-test or as a revision reference.

Why previous year questions are the highest-value ${subjectName} preparation you can do for ${examName}: recruitment boards reuse a stable pool of concepts across cycles. The wording changes, the underlying idea rarely does. Working through a few hundred genuine past ${subjectName} questions teaches you which sub-topics the paper actually rewards, how the examiner likes to frame distractors, and roughly how long each question type should take — none of which a syllabus document can tell you.

How to use this page: attempt questions in blocks of ten without looking at the answers, then review every question you got wrong or guessed. Read the explanation for the concept, not just the answer letter. When a concept keeps catching you out, open the related topic page linked below and drill that single area before returning here. Repeat across the full bank, and track how your accuracy on the second pass compares with your first — a 15-20% improvement is normal and is the clearest sign your preparation is working.

What is in this bank: the questions are transcribed from actual ${examName} question papers, kept in the original order and wording, with solutions written by subject specialists. Sets are free to attempt, work on mobile, and need no login to read. If you would rather practise a complete paper end to end under exam conditions, the full ${examName} previous-year papers are linked below as well.`;
}

function buildFaqs({ examName, subjectName, totalQuestions, quizCount }) {
  return [
    {
      question: `How many ${examName} ${subjectName} previous year questions are available?`,
      answer: `${totalQuestions} ${subjectName} questions from past ${examName} papers are available on AajExam, split into ${quizCount} practice sets. New questions are added as fresh papers are released.`,
    },
    {
      question: `Are the answers and explanations free?`,
      answer: `Yes. Every question on this page shows its correct answer and explanation free of charge, and you do not need an account to read them. A free account only adds attempt tracking and performance analytics.`,
    },
    {
      question: `Do ${examName} repeat questions from previous years?`,
      answer: `Exact repeats do occur, but the more reliable pattern is conceptual: the same ${subjectName} sub-topics reappear cycle after cycle with reworded questions. That is why working through past questions raises your score more reliably than reading theory alone.`,
    },
    {
      question: `How should I use these questions in my ${examName} preparation?`,
      answer: `Attempt a set of ten cold, review every wrong and guessed question with its explanation, then drill the weak sub-topic on its topic page before moving on. Revisit the same set after a few days — your second-attempt accuracy is the honest measure of whether the concept stuck.`,
    },
  ];
}

async function loadSeries(examSlug, subjectSlug) {
  const dbConnect = (await import('../../../lib/db')).default;
  const Exam = (await import('../../../models/Exam')).default;
  const Subject = (await import('../../../models/Subject')).default;
  const Quiz = (await import('../../../models/Quiz')).default;

  await dbConnect();

  const [exam, subject] = await Promise.all([
    Exam.findOne({ slug: examSlug }).select('_id name slug').lean(),
    Subject.findOne({ slug: subjectSlug }).select('_id name slug').lean(),
  ]);
  if (!exam || !subject) return null;

  const quizDocs = await Quiz.find({
    type: 'subject_test',
    status: 'published',
    applicableExams: exam._id,
    subject: subject._id,
    slug: { $exists: true, $nin: [null, ''] },
  })
    .select('title slug questions topic')
    .sort({ createdAt: 1 })
    .lean();

  if (quizDocs.length === 0) return null;

  return { exam, subject, quizDocs };
}

export async function getStaticPaths() {
  try {
    const dbConnect = (await import('../../../lib/db')).default;
    const Quiz = (await import('../../../models/Quiz')).default;
    await dbConnect();

    const groups = await Quiz.aggregate([
      { $match: { type: 'subject_test', status: 'published' } },
      { $unwind: '$applicableExams' },
      {
        $group: {
          _id: { exam: '$applicableExams', subject: '$subject' },
          questions: { $sum: { $size: { $ifNull: ['$questions', []] } } },
        },
      },
      { $match: { questions: { $gte: MIN_QUESTIONS_TO_INDEX } } },
    ]);

    const Exam = (await import('../../../models/Exam')).default;
    const Subject = (await import('../../../models/Subject')).default;
    const [exams, subjects] = await Promise.all([
      Exam.find({ _id: { $in: groups.map((g) => g._id.exam) } }).select('slug').lean(),
      Subject.find({ _id: { $in: groups.map((g) => g._id.subject) } }).select('slug').lean(),
    ]);
    const examSlugs = new Map(exams.map((e) => [String(e._id), e.slug]));
    const subjectSlugs = new Map(subjects.map((s) => [String(s._id), s.slug]));

    const paths = groups
      .map((g) => ({
        examSlug: examSlugs.get(String(g._id.exam)),
        subjectSlug: subjectSlugs.get(String(g._id.subject)),
      }))
      .filter((p) => p.examSlug && p.subjectSlug)
      .map((params) => ({ params }));

    return { paths, fallback: 'blocking' };
  } catch (e) {
    console.error('practice getStaticPaths failed:', e);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const { examSlug, subjectSlug } = params || {};

  try {
    const series = await loadSeries(examSlug, subjectSlug);
    if (!series) return { notFound: true, revalidate: 600 };

    const { exam, subject, quizDocs } = series;

    const totalQuestions = quizDocs.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
    const questionIds = quizDocs.flatMap((q) => q.questions || []).slice(0, QUESTIONS_ON_PAGE);

    const Question = (await import('../../../models/Question')).default;
    const questionDocs = await Question.find({ _id: { $in: questionIds }, isActive: true })
      .select('questionText options explanation image')
      .lean();

    const order = new Map(questionIds.map((id, i) => [String(id), i]));
    const questions = questionDocs
      .sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0))
      .map((q) => ({
        _id: String(q._id),
        questionText: q.questionText || '',
        options: (q.options || []).map((o) => ({ text: o.text || '', isCorrect: !!o.isCorrect })),
        // Long explanations blow up the hydration payload for little SEO gain.
        explanation: (q.explanation || '').slice(0, 400),
        image: q.image || '',
      }));

    // Topic pages for the same subject give readers (and crawlers) a route into
    // focused drilling.
    const Topic = (await import('../../../models/Topic')).default;
    const topicDocs = await Topic.find({
      _id: { $in: [...new Set(quizDocs.map((q) => q.topic).filter(Boolean).map(String))] },
      slug: { $exists: true, $nin: [null, ''] },
    })
      .select('name slug')
      .limit(24)
      .lean();

    // Does the exam have full PYQ papers to link on to?
    let hasPyq = false;
    try {
      const ExamPattern = (await import('../../../models/ExamPattern')).default;
      const PracticeTest = (await import('../../../models/PracticeTest')).default;
      const patternIds = (await ExamPattern.find({ exam: exam._id }).select('_id').lean()).map((p) => p._id);
      if (patternIds.length > 0) {
        hasPyq = Boolean(await PracticeTest.exists({
          examPattern: { $in: patternIds },
          isPYQ: true,
          slug: { $exists: true, $nin: [null, ''] },
        }));
      }
    } catch (err) {
      hasPyq = false;
    }

    const examName = exam.name || '';
    const subjectName = subject.name || '';
    const quizCount = quizDocs.length;

    return {
      props: {
        exam: { name: examName, slug: exam.slug },
        subject: { name: subjectName, slug: subject.slug },
        questions,
        totalQuestions,
        quizCount,
        seriesQuizzes: quizDocs.slice(0, SERIES_LINKS_ON_PAGE).map((q) => ({ title: q.title || q.slug, slug: q.slug })),
        topics: topicDocs.map((t) => ({ name: t.name || t.slug, slug: t.slug })),
        hasPyq,
        aboutText: buildAbout({ examName, subjectName, totalQuestions, quizCount }),
        faqs: buildFaqs({ examName, subjectName, totalQuestions, quizCount }),
        // A series with barely any questions would just be another thin page.
        indexable: totalQuestions >= MIN_QUESTIONS_TO_INDEX && questions.length > 0,
      },
      revalidate: 3600,
    };
  } catch (e) {
    console.error('practice getStaticProps failed:', e);
    return { notFound: true, revalidate: 300 };
  }
}
