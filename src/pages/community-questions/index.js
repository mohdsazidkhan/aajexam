import dynamic from 'next/dynamic';
import Seo from '../../components/common/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { ListSkeleton } from '../../components/common/skeletons/PrivateSkeletons';

const CommunityQuestionsPage = dynamic(() => import('../../components/public/pages/CommunityQuestionsPage'), {
  ssr: false,
  loading: () => <div className="px-4 py-4"><ListSkeleton rows={6} /></div>
});

export default function CommunityQuestions() {
  return (
    <>
      <Seo
        title="Community Q&A – Crowdsourced Government Exam MCQs | AajExam"
        description="Browse and answer thousands of community-contributed MCQs for SSC, UPSC, Banking, Railway and State PSC exams on AajExam. Filter by exam, subject and topic."
        canonical="/community-questions"
        noIndex
        keywords={[
          'government exam community',
          'crowdsourced mcq',
          'community questions',
          'exam Q&A',
          'aajexam community'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Community Q&A', url: '/community-questions' }
        ])}
      />
      <CommunityQuestionsPage />
    </>
  );
}
