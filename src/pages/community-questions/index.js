import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';

const CommunityQuestionsPage = dynamic(() => import('../../components/pages/CommunityQuestionsPage'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function CommunityQuestions() {
  return (
    <>
      <Seo
        title="Community Questions - AajExam | Practice with User Questions"
        description="Browse and practice questions posted by the AajExam community. Filter by exam and category to find relevant practice questions."
      />
      <CommunityQuestionsPage />
    </>
  );
}
