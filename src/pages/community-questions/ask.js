import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';

const AskQuestionPage = dynamic(() => import('../../components/pages/AskQuestionPage'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
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
