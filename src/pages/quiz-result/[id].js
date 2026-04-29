import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';

const QuizResultDetail = dynamic(() => import('../../components/pages/QuizResultDetail'), { ssr: false, loading: () => <div>Loading...</div> });

export default function QuizResultPage() {
  return (
    <>
      <Seo title="Quiz Result – AajExam" description="Detailed quiz attempt result on AajExam." noIndex={true} />
      <QuizResultDetail />
    </>
  );
}
