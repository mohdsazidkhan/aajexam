import Link from 'next/link';
import Seo from '../../../../components/Seo';
import QuestionList from '../../../../components/seo/QuestionList';
import LinkIndexSection from '../../../../components/seo/LinkIndexSection';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
} from '../../../../utils/schema';

// A topic page needs enough real content to be worth a visit — below this,
// getStaticPaths never generates the page at all (proper 404, per the "empty
// page" rule), so no thin/junk topic (mislabelled metadata like "Tier-I" or
// "CGL" that occasionally exists as a Topic doc from an old import) ever gets
// a public URL. Any topic that clears the bar is public and indexable.
const MIN_QUESTIONS_TO_INDEX = 10;
const QUESTIONS_ON_PAGE = 20;
const SETS_ON_PAGE = 30;

export default function TopicPractice({
  exam,
  subject,
  topic,
  questions = [],
  totalQuestions = 0,
  quizCount = 0,
  seriesQuizzes = [],
  relatedTopics = [],
  relatedSubjects = [],
  hasPyq = false,
  aboutText = '',
  faqs = [],
}) {
  const examName = exam?.name || 'Government exam';
  const subjectName = subject?.name || 'Subject';
  const topicName = topic?.name || 'Topic';
  const heading = `${examName} ${topicName} Questions`;
  const canonical = `/practice/${exam?.slug}/${subject?.slug}/${topic?.slug}`;
  const subjectUrl = `/practice/${exam?.slug}/${subject?.slug}`;

  const seoTitle = `${examName} ${topicName} Questions & Practice | AajExam`.slice(0, 65);
  const seoDescription = `Practice ${examName} ${topicName} questions with answers${quizCount > 0 ? ', quizzes' : ''}${hasPyq ? ', PYQs' : ''} and topic-wise preparation on AajExam.`.slice(0, 158);

  const schemas = [
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Government Exams', url: '/govt-exams' },
      ...(exam?.slug ? [{ name: examName, url: `/govt-exams/exam/${exam.slug}` }] : []),
      { name: subjectName, url: subjectUrl },
      { name: topicName, url: canonical },
    ]),
    faqs.length > 0 && generateFAQSchema(faqs),
    seriesQuizzes.length > 0 && generateItemListSchema({
      name: `${examName} ${topicName} practice sets`,
      items: seriesQuizzes.map((q) => ({ name: q.title, url: `/quiz/${q.slug}` })),
    }),
  ].filter(Boolean);

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        keywords={[
          `${examName} ${topicName} questions`,
          `${examName} ${topicName} quiz`,
          `${topicName} questions with answers`,
          `${examName} ${subjectName} topic wise questions`,
        ]}
        schemas={schemas}
      />

      <div className="min-h-screen pb-12 px-4 font-outfit">
        <div className="container mx-auto px-0 lg:px-4 py-4 lg:py-6 space-y-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest flex-wrap">
            <Link href="/" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Home</Link>
            <span className="text-slate-400">/</span>
            <Link href="/govt-exams" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Government Exams</Link>
            {exam?.slug && (
              <>
                <span className="text-slate-400">/</span>
                <Link href={`/govt-exams/exam/${exam.slug}`} className="text-primary-700 dark:text-primary-400 hover:text-primary-500">{examName}</Link>
              </>
            )}
            <span className="text-slate-400">/</span>
            <Link href={subjectUrl} className="text-primary-700 dark:text-primary-400 hover:text-primary-500">{subjectName}</Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400">{topicName}</span>
          </nav>

          <header className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <span className="block text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
              {examName} · {subjectName}
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">
              {heading}
            </h1>
            <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mb-5">
              {totalQuestions} {topicName} questions for {examName}, split into {quizCount} timed practice set{quizCount === 1 ? '' : 's'} — every question with its answer and explanation.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg lg:rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                <div className="text-lg font-black text-slate-900 dark:text-white">{totalQuestions}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Questions</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg lg:rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                <div className="text-lg font-black text-slate-900 dark:text-white">{quizCount}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Practice sets</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg lg:rounded-xl p-3 border-2 border-slate-100 dark:border-slate-800">
                <div className="text-lg font-black text-primary-600">FREE</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access</div>
              </div>
            </div>
          </header>

          {aboutText && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                About {examName} {topicName}
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-base lg:text-lg whitespace-pre-line">
                {aboutText}
              </div>
            </section>
          )}

          <QuestionList
            questions={questions}
            title={`${examName} ${topicName} Practice Questions`}
            intro={`A sample of ${questions.length} questions from the full bank of ${totalQuestions}. Try each one before opening the solution.`}
          />

          {seriesQuizzes.length > 0 && (
            <LinkIndexSection
              title={`${examName} ${topicName} Quiz`}
              intro={`${quizCount} timed practice set${quizCount === 1 ? '' : 's'} for ${topicName} — attempt one now.`}
              groups={[{ items: seriesQuizzes.map((q) => ({ href: `/quiz/${q.slug}`, name: q.title })) }]}
              columns="sm:grid-cols-2 lg:grid-cols-3"
            />
          )}

          <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
              Keep going
            </h2>
            <div className="flex flex-wrap gap-3">
              {exam?.slug && (
                <Link href={`/govt-exams/exam/${exam.slug}`} className="bg-primary-600 text-white px-4 py-2.5 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors">
                  {examName} syllabus &amp; pattern
                </Link>
              )}
              {hasPyq && exam?.slug && (
                <Link href={`/pyq/${exam.slug}`} className="bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-800 px-4 py-2.5 rounded-lg lg:rounded-xl font-bold text-sm hover:border-primary-400 transition-colors">
                  Full {examName} question papers
                </Link>
              )}
              <Link href={subjectUrl} className="bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-800 px-4 py-2.5 rounded-lg lg:rounded-xl font-bold text-sm hover:border-primary-400 transition-colors">
                All {examName} {subjectName} practice
              </Link>
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

          {relatedTopics.length > 0 && (
            <LinkIndexSection
              title={`Related ${subjectName} Topics`}
              intro={`Practice other ${examName} ${subjectName} topics.`}
              groups={[{ items: relatedTopics.map((t) => ({ href: `/practice/${exam.slug}/${subject.slug}/${t.slug}`, name: `${t.name} Questions` })) }]}
              columns="sm:grid-cols-2 lg:grid-cols-3"
            />
          )}

          {relatedSubjects.length > 0 && (
            <LinkIndexSection
              title={`Other ${examName} Subjects`}
              groups={[{ items: relatedSubjects.map((s) => ({ href: `/practice/${exam.slug}/${s.slug}`, name: `${s.name} Questions` })) }]}
              columns="sm:grid-cols-2 lg:grid-cols-4"
            />
          )}
        </div>
      </div>
    </>
  );
}

function buildAbout({ examName, subjectName, topicName, totalQuestions, quizCount }) {
  return `This page collects ${topicName} questions relevant to ${examName} ${subjectName} on AajExam — ${totalQuestions} questions in total, organised into ${quizCount} short, timed practice set${quizCount === 1 ? '' : 's'}. Each question is shown with its options, the correct answer, and an explanation, so you can use the page either as a self-test or a revision reference.

How to use this page: attempt a set without looking at the answers, then review every question you got wrong or guessed. Read the explanation for the underlying concept, not just which option was correct. Once ${topicName} stops catching you out here, move on to a related topic below or attempt a full ${subjectName} practice set to see it mixed in with everything else.`;
}

function buildFaqs({ examName, subjectName, topicName, totalQuestions, quizCount }) {
  return [
    {
      question: `How many ${examName} ${topicName} questions are available on AajExam?`,
      answer: `${totalQuestions} ${topicName} questions for ${examName} are available, split into ${quizCount} practice set${quizCount === 1 ? '' : 's'}. New questions are added as more content is tagged.`,
    },
    {
      question: `Are the answers and explanations free?`,
      answer: `Yes. Every question on this page shows its correct answer and explanation free of charge, and you do not need an account to read them.`,
    },
    {
      question: `Is ${topicName} part of the ${examName} ${subjectName} syllabus?`,
      answer: `Yes — this page only shows topics that are actually tagged to ${examName} ${subjectName} in AajExam's question bank, not a generic list.`,
    },
  ];
}

async function loadTopicSeries(examSlug, subjectSlug, topicSlug) {
  const dbConnect = (await import('../../../../lib/db')).default;
  const Exam = (await import('../../../../models/Exam')).default;
  const Subject = (await import('../../../../models/Subject')).default;
  const Topic = (await import('../../../../models/Topic')).default;
  const Quiz = (await import('../../../../models/Quiz')).default;

  await dbConnect();

  const [exam, subject, topic] = await Promise.all([
    Exam.findOne({ slug: examSlug }).select('_id name slug').lean(),
    Subject.findOne({ slug: subjectSlug, isActive: { $ne: false } }).select('_id name slug').lean(),
    Topic.findOne({ slug: topicSlug, isActive: { $ne: false } }).select('_id name slug subject').lean(),
  ]);
  if (!exam || !subject || !topic) return null;
  // Safety check: the topic must genuinely belong to this subject — otherwise
  // this is an invalid combination (e.g. /ssc-cgl/reasoning/physics) and must
  // 404 rather than render a nonsensical page.
  if (String(topic.subject) !== String(subject._id)) return null;

  const quizDocs = await Quiz.find({
    type: 'subject_test',
    status: 'published',
    applicableExams: exam._id,
    subject: subject._id,
    topic: topic._id,
    slug: { $exists: true, $nin: [null, ''] },
  })
    .select('title slug questions')
    .sort({ createdAt: 1 })
    .lean();

  if (quizDocs.length === 0) return null;

  return { exam, subject, topic, quizDocs };
}

export async function getStaticPaths() {
  try {
    const dbConnect = (await import('../../../../lib/db')).default;
    const Quiz = (await import('../../../../models/Quiz')).default;
    await dbConnect();

    const groups = await Quiz.aggregate([
      { $match: { type: 'subject_test', status: 'published', topic: { $ne: null } } },
      { $unwind: '$applicableExams' },
      {
        $group: {
          _id: { exam: '$applicableExams', subject: '$subject', topic: '$topic' },
          questions: { $sum: { $size: { $ifNull: ['$questions', []] } } },
        },
      },
      { $match: { questions: { $gte: MIN_QUESTIONS_TO_INDEX } } },
    ]);

    // A topic page is only worth indexing when its subject genuinely has 2+
    // distinct qualifying topics for that exam — a subject with just one topic
    // bucket would make the topic page a near-duplicate of its parent subject
    // page, which is exactly what we don't want to index.
    const examSubjectTopicCounts = new Map();
    groups.forEach((g) => {
      const key = `${g._id.exam}::${g._id.subject}`;
      examSubjectTopicCounts.set(key, (examSubjectTopicCounts.get(key) || 0) + 1);
    });
    const qualifyingGroups = groups.filter((g) => examSubjectTopicCounts.get(`${g._id.exam}::${g._id.subject}`) >= 2);

    const Exam = (await import('../../../../models/Exam')).default;
    const Subject = (await import('../../../../models/Subject')).default;
    const Topic = (await import('../../../../models/Topic')).default;
    const [exams, subjects, topics] = await Promise.all([
      Exam.find({ _id: { $in: qualifyingGroups.map((g) => g._id.exam) } }).select('slug').lean(),
      Subject.find({ _id: { $in: qualifyingGroups.map((g) => g._id.subject) }, isActive: { $ne: false } }).select('slug').lean(),
      Topic.find({ _id: { $in: qualifyingGroups.map((g) => g._id.topic) }, isActive: { $ne: false } }).select('slug').lean(),
    ]);
    const examSlugs = new Map(exams.map((e) => [String(e._id), e.slug]));
    const subjectSlugs = new Map(subjects.map((s) => [String(s._id), s.slug]));
    const topicSlugs = new Map(topics.map((t) => [String(t._id), t.slug]));

    const paths = qualifyingGroups
      .map((g) => ({
        examSlug: examSlugs.get(String(g._id.exam)),
        subjectSlug: subjectSlugs.get(String(g._id.subject)),
        topicSlug: topicSlugs.get(String(g._id.topic)),
      }))
      .filter((p) => p.examSlug && p.subjectSlug && p.topicSlug)
      .map((params) => ({ params }));

    return { paths, fallback: 'blocking' };
  } catch (e) {
    console.error('topic practice getStaticPaths failed:', e);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const { examSlug, subjectSlug, topicSlug } = params || {};

  try {
    const series = await loadTopicSeries(examSlug, subjectSlug, topicSlug);
    if (!series) return { notFound: true, revalidate: 600 };

    const { exam, subject, topic, quizDocs } = series;

    const totalQuestions = quizDocs.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
    const questionIds = quizDocs.flatMap((q) => q.questions || []).slice(0, QUESTIONS_ON_PAGE);

    const Question = (await import('../../../../models/Question')).default;
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
        explanation: (q.explanation || '').slice(0, 400),
        image: q.image || '',
      }));

    // Sibling topics under the same exam+subject, for internal linking.
    const Topic = (await import('../../../../models/Topic')).default;
    const relatedTopics = await Topic.find({
      subject: subject._id,
      exams: { $in: [exam._id, String(exam._id)] },
      _id: { $ne: topic._id },
      isActive: { $ne: false },
      slug: { $exists: true, $nin: [null, ''] },
    }).select('name slug').limit(12).lean();

    // Sibling subjects under the same exam.
    const Subject = (await import('../../../../models/Subject')).default;
    const relatedSubjects = await Subject.find({
      exams: { $in: [exam._id, String(exam._id)] },
      _id: { $ne: subject._id },
      isActive: { $ne: false },
      slug: { $exists: true, $nin: [null, ''] },
    }).select('name slug').limit(12).lean();

    // Does the exam have full PYQ papers to link on to? (exam-level fact only —
    // never claimed as topic-specific PYQ content, since PracticeTest/PYQ
    // papers aren't tagged by subject/topic in the current schema.)
    let hasPyq = false;
    try {
      const ExamPattern = (await import('../../../../models/ExamPattern')).default;
      const PracticeTest = (await import('../../../../models/PracticeTest')).default;
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
    const topicName = topic.name || '';
    const quizCount = quizDocs.length;

    return {
      props: {
        exam: { name: examName, slug: exam.slug },
        subject: { name: subjectName, slug: subject.slug },
        topic: { name: topicName, slug: topic.slug },
        questions,
        totalQuestions,
        quizCount,
        seriesQuizzes: quizDocs.slice(0, SETS_ON_PAGE).map((q) => ({ title: q.title || q.slug, slug: q.slug })),
        relatedTopics: relatedTopics.map((t) => ({ name: t.name || t.slug, slug: t.slug })),
        relatedSubjects: relatedSubjects.map((s) => ({ name: s.name || s.slug, slug: s.slug })),
        hasPyq,
        aboutText: buildAbout({ examName, subjectName, topicName, totalQuestions, quizCount }),
        faqs: buildFaqs({ examName, subjectName, topicName, totalQuestions, quizCount }),
      },
      revalidate: 3600,
    };
  } catch (e) {
    console.error('topic practice getStaticProps failed:', e);
    return { notFound: true, revalidate: 300 };
  }
}
