import dynamic from 'next/dynamic';
import Seo from '../components/Seo';
import { DashboardSkeleton } from '../components/skeletons/PrivateSkeletons';

const QuizResultPage = dynamic(() => import('../components/pages/QuizResultPage'), {
  ssr: false,
  loading: () => <div className="container mx-auto px-4 py-8"><DashboardSkeleton /></div>
});

export default function QuizResult() {
  return (
    <>
      <Seo title="Quiz Result – AajExam" description="Your quiz attempt result on AajExam." noIndex={true} />
      <QuizResultPage />
    </>
  );
}
