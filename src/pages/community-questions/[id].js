import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';

const CommunityQuestionDetailPage = dynamic(
  () => import('../../components/pages/CommunityQuestionDetailPage'),
  { ssr: false, loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div> }
);

export default function CommunityQuestionDetail() {
  return (
    <>
      <Seo
        title="Community Question - AajExam"
        description="Answer this question and learn from other students on AajExam. Discuss approaches, share shortcuts, and help fellow aspirants."
      />
      <CommunityQuestionDetailPage />
    </>
  );
}
