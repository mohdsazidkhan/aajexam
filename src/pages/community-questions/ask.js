import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { FormSkeleton } from '../../components/skeletons/PrivateSkeletons';

const AskQuestionPage = dynamic(() => import('../../components/pages/AskQuestionPage'), {
  ssr: false,
  loading: () => <div className="px-4 py-6"><FormSkeleton fields={3} /></div>
});

export default function AskQuestion() {
  return (
    <>
      <Seo
        title="Post a Question – AajExam Community"
        description="Share your exam questions with the AajExam community. Help fellow students practice and prepare for government exams."
        noIndex={true}
      />
      <AskQuestionPage />
    </>
  );
}
