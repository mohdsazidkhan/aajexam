import dynamic from 'next/dynamic';
import Seo from '../../components/common/Seo';
import { QuizResultSkeleton } from '../../components/common/skeletons/PrivateSkeletons';

const QuizResultPage = dynamic(() => import('../../components/student/pages/QuizResultPage'), {
  ssr: false,
  loading: () => <div className="py-8"><QuizResultSkeleton /></div>
});

export default function QuizResult() {
  return (
    <>
      <Seo title="Quiz Result – AajExam" description="Your quiz attempt result on AajExam." noIndex={true} />
      <QuizResultPage />
    </>
  );
}
