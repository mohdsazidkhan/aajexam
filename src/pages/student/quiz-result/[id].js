import dynamic from 'next/dynamic';
import Seo from '../../../components/common/Seo';
import { QuizResultSkeleton } from '../../../components/common/skeletons/PrivateSkeletons';

const QuizResultDetail = dynamic(() => import('../../../components/student/pages/QuizResultDetail'), { ssr: false, loading: () => <div className="container mx-auto py-6"><QuizResultSkeleton /></div> });

export default function QuizResultPage() {
  return (
    <>
      <Seo title="Quiz Result – AajExam" description="Detailed quiz attempt result on AajExam." noIndex={true} />
      <QuizResultDetail />
    </>
  );
}
