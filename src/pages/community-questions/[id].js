import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const CommunityQuestionDetailPage = dynamic(
  () => import('../../components/pages/CommunityQuestionDetailPage'),
  { ssr: false, loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div> }
);

export default function CommunityQuestionDetail() {
  return (
    <>
      <Seo
        title="Community Question – Discuss & Solve with AajExam Aspirants"
        description="Solve, discuss and learn from this community question on AajExam. Compare approaches, share shortcuts and help fellow government exam aspirants."
        keywords={[
          'community question',
          'mcq discussion',
          'exam doubt',
          'aajexam community'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Community Q&A', url: '/community-questions' },
          { name: 'Question' }
        ])}
      />
      <CommunityQuestionDetailPage />
    </>
  );
}
