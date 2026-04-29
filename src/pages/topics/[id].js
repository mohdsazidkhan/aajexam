import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const TopicDetailPage = dynamic(() => import('../../components/pages/TopicDetailPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function TopicDetail() {
  return (
    <>
      <Seo
        title="Topic – Practice Quizzes & Notes for Government Exams | AajExam"
        description="Free MCQs, study notes and previous year question highlights for this topic. Sharpen weak areas before your SSC, UPSC, Banking, Railway or State PSC exam on AajExam."
        keywords={[
          'topic quiz',
          'topic mcq',
          'topic notes',
          'government exam topic',
          'aajexam topic'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Topics', url: '/topics' },
          { name: 'Topic' }
        ])}
      />
      <TopicDetailPage />
    </>
  );
}
