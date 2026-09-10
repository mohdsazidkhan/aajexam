import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { DetailSkeleton } from '../../components/skeletons/PrivateSkeletons';

const QuizResultDetail = dynamic(() => import('../../components/pages/QuizResultDetail'), { ssr: false, loading: () => <div className="max-w-4xl mx-auto px-4 py-6"><DetailSkeleton /></div> });

export default function QuizResultPage() {
  return (
    <>
      <Seo title="Quiz Result – AajExam" description="Detailed quiz attempt result on AajExam." noIndex={true} />
      <QuizResultDetail />
    </>
  );
}
