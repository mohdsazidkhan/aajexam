import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { QuizResultSkeleton } from '../../components/skeletons/PrivateSkeletons';

const QuizResultDetail = dynamic(() => import('../../components/pages/QuizResultDetail'), { ssr: false, loading: () => <div className="container mx-auto py-6"><QuizResultSkeleton /></div> });

export default function QuizResultPage() {
  return (
    <>
      <Seo title="Quiz Result – AajExam" description="Detailed quiz attempt result on AajExam." noIndex={true} />
      <QuizResultDetail />
    </>
  );
}
