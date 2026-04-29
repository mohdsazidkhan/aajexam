import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const QuizPreviewPage = dynamic(() => import('../../components/pages/QuizPreviewPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function QuizPreview({ quiz, seo }) {
  const title = seo?.title || (quiz?.title ? `${quiz.title} – Free Online Quiz | AajExam` : 'Take a Quiz | AajExam');
  const description = seo?.description || (quiz?.title
    ? `Attempt the ${quiz.title} quiz on AajExam. ${quiz.totalQuestions || ''} MCQs with detailed solutions for government exam preparation.`
    : 'Attempt free topic-wise quizzes on AajExam for SSC, UPSC, Banking, Railway and State PSC government exam preparation.');
  return (
    <>
      <Seo
        title={title}
        description={description}
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
          { name: quiz?.title || 'Quiz' }
        ])}
      />
      <QuizPreviewPage />
    </>
  );
}
