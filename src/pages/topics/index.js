import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { PageLoadingFallback } from '../../components/skeletons/PublicSkeletons';

const TopicListPage = dynamic(() => import('../../components/pages/TopicListPage'), { ssr: false, loading: () => <PageLoadingFallback /> });

export default function Topics() {
  return (
    <>
      <Seo
        title="Topics – Granular MCQ Practice for Government Exams | AajExam"
        description="Practise topic-wise MCQs on AajExam: Number System, Algebra, Geometry, Reading Comprehension, Reasoning Puzzles, Indian Polity, Economy, History, Geography and more for SSC, UPSC, Banking and Railway exams."
        canonical="/topics"
        keywords={[
          'topic wise quiz',
          'topic wise mcq',
          'reasoning topic mcq',
          'maths topic quiz',
          'english topic quiz',
          'GA topic quiz',
          'aajexam topics'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Topics', url: '/topics' }
        ])}
      />
      <TopicListPage />
    </>
  );
}
