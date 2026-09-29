import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import API from '../../lib/api';
import useTargetExamsVersion from '../../hooks/useTargetExamsVersion';
import { getStoredTargetExamIds } from '../../lib/utils/targetExams';
import Seo from '../../components/Seo';
import LinkIndexSection from '../../components/seo/LinkIndexSection';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { PageLoadingFallback } from '../../components/skeletons/PublicSkeletons';

const TopicListPage = dynamic(() => import('../../components/pages/TopicListPage'), { ssr: false, loading: () => <PageLoadingFallback /> });

export default function Topics(props) {
  // Static HTML lists the full catalogue (SEO). Logged-in users with target exams get the
  // index limited to those exams, on mount and right after they change them.
  const [scoped, setScoped] = useState(null);
  const targetVersion = useTargetExamsVersion();

  useEffect(() => {
    const ids = getStoredTargetExamIds();
    if (!ids.length) { setScoped(null); return; }
    let cancelled = false;
    API.request(`/api/quiz/topics/index?examIds=${ids.join(',')}`).then((res) => {
      if (!cancelled && res?.success) setScoped(res.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [targetVersion]);

  const { groups = [] } = scoped || props;

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

      <div className="px-3 xl:px-0 pb-10">
        <LinkIndexSection
          title="All topics by subject"
          intro="Every topic we host, grouped under its subject. Each topic page carries free MCQs with explanations, study notes and previous-year question highlights."
          groups={groups}
          columns="sm:grid-cols-2 xl:grid-cols-4"
        />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const { buildTopicsIndex } = await import('../../lib/catalogIndex');
    return { props: await buildTopicsIndex(), revalidate: 3600 };
  } catch (e) {
    console.error('Error in topics getStaticProps:', e);
    return { props: { groups: [] }, revalidate: 300 };
  }
}
