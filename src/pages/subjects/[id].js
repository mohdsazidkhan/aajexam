import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const SubjectDetailPage = dynamic(() => import('../../components/pages/SubjectDetailPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function SubjectDetail() {
  return (
    <>
      <Seo
        title="Subject – Topic-wise Quizzes & Practice Tests | AajExam"
        description="Explore topic-wise MCQs, practice tests and study resources for this subject. Free quizzes for SSC, UPSC, Banking, Railway and State PSC exam aspirants on AajExam."
        keywords={[
          'subject quiz',
          'topic wise mcq',
          'government exam practice',
          'aajexam'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Subjects', url: '/subjects' },
          { name: 'Subject' }
        ])}
      />
      <SubjectDetailPage />
    </>
  );
}
