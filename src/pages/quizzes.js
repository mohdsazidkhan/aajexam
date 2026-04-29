import dynamic from 'next/dynamic';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const QuizListPage = dynamic(() => import('../components/pages/QuizListPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function Quizzes() {
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
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Quizzes', url: '/quizzes' }
        ])}
      />
      <QuizListPage />
    </>
  );
}
