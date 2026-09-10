import dynamic from 'next/dynamic';
import Seo from '../../../components/Seo';
import { QuizAttemptSkeleton } from '../../../components/skeletons/PrivateSkeletons';

const AttemptQuizPage = dynamic(() => import('../../../components/pages/AttemptQuizPage'), {
  ssr: false,
  loading: () => <QuizAttemptSkeleton />
});

export default function AttemptQuiz() {
  return (
    <>
      <Seo title="Attempt Quiz – AajExam" description="Attempt this quiz on AajExam." noIndex={true} />
      <AttemptQuizPage />
    </>
  );
}
