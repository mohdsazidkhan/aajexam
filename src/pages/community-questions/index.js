import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const CommunityQuestionsPage = dynamic(() => import('../../components/pages/CommunityQuestionsPage'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function CommunityQuestions() {
  return (
    <>
      <Seo
        title="Community Q&A – Crowdsourced Government Exam MCQs | AajExam"
        description="Browse and answer thousands of community-contributed MCQs for SSC, UPSC, Banking, Railway and State PSC exams on AajExam. Filter by exam, subject and topic."
        canonical="/community-questions"
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
