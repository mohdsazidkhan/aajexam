import dynamic from 'next/dynamic';
import Seo from '../components/Seo';

const QuizResultPage = dynamic(() => import('../components/pages/QuizResultPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function QuizResult() {
  return (
    <>
      <Seo title="Quiz Result – AajExam" description="Your quiz attempt result on AajExam." noIndex={true} />
      <QuizResultPage />
    </>
  );
}
