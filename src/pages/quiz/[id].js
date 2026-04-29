import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const QuizPreviewPage = dynamic(() => import('../../components/pages/QuizPreviewPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function QuizPreview({ resolvedId, quiz, seo }) {
  const title = seo?.title || (quiz?.title ? `${quiz.title} – Free Online Quiz | AajExam` : 'Take a Quiz | AajExam');
  const description = seo?.description || (quiz?.title
    ? `Attempt the ${quiz.title} quiz on AajExam. ${quiz.totalQuestions || ''} MCQs with detailed solutions for government exam preparation.`.trim()
    : 'Attempt free topic-wise quizzes on AajExam for SSC, UPSC, Banking, Railway and State PSC government exam preparation.');
  return (
    <>
      <Seo
        title={title}
        description={description}
        canonical={`/quiz/${quiz?.slug || resolvedId}`}
        keywords={[
          quiz?.title && `${quiz.title} quiz`,
          quiz?.subject?.name && `${quiz.subject.name} quiz`,
          quiz?.topic?.name && `${quiz.topic.name} mcq`,
          'free online quiz',
          'government exam quiz',
          'aajexam quiz'
        ].filter(Boolean)}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Quizzes', url: '/quizzes' },
          { name: quiz?.title || 'Quiz', url: `/quiz/${quiz?.slug || resolvedId}` }
        ])}
      />
      <QuizPreviewPage resolvedId={resolvedId} initialQuiz={quiz} />
    </>
  );
}

export async function getServerSideProps({ params }) {
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
      .select('_id title slug description duration totalMarks difficulty')
      .populate('subject', 'name slug')
      .populate('topic', 'name slug')
      .lean();

    if (!quiz) return { notFound: true };

    return {
      props: {
        resolvedId: String(quiz._id),
        quiz: JSON.parse(JSON.stringify(quiz))
      }
    };
  } catch (e) {
    console.error('quiz ssr error', e);
    return { notFound: true };
  }
}
