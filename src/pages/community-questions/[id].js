import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { QAThreadSkeleton } from '../../components/skeletons/PrivateSkeletons';

const CommunityQuestionDetailPage = dynamic(
  () => import('../../components/pages/CommunityQuestionDetailPage'),
  { ssr: false, loading: () => <div className="container mx-auto py-6"><QAThreadSkeleton /></div> }
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
