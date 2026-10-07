import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import API from '../../lib/api';
import useTargetExamsVersion from '../../hooks/useTargetExamsVersion';
import { getStoredTargetExamIds } from '../../lib/utils/targetExams';
import Seo from '../../components/Seo';
import LinkIndexSection from '../../components/seo/LinkIndexSection';
import { generateBreadcrumbSchema, generateItemListSchema } from '../../utils/schema';
import { PageLoadingFallback } from '../../components/skeletons/PublicSkeletons';
import useTranslate from '../../hooks/useTranslate';

const SubjectListPage = dynamic(() => import('../../components/pages/SubjectListPage'), { ssr: false, loading: () => <PageLoadingFallback /> });

export default function Subjects(props) {
  const { translate } = useTranslate();
  // Static HTML lists the full catalogue (SEO). Logged-in users with target exams get the
  // index limited to those exams, on mount and right after they change them.
  const [scoped, setScoped] = useState(null);
  const targetVersion = useTargetExamsVersion();

  useEffect(() => {
    const ids = getStoredTargetExamIds();
    if (!ids.length) { setScoped(null); return; }
    let cancelled = false;
    API.request(`/api/quiz/subjects/index?examIds=${ids.join(',')}`).then((res) => {
      if (!cancelled && res?.success) setScoped(res.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [targetVersion]);

  const { subjects = [] } = scoped || props;

  return (
    <>
      <Seo
        title="Subjects – Reasoning, Maths, English, GA & GK Practice | AajExam"
        description="Browse subject-wise practice on AajExam: Reasoning, Quantitative Aptitude, English Language, General Awareness, General Knowledge and Current Affairs for SSC, UPSC, Banking and Railway exams."
        canonical="/subjects"
        keywords={[
          'reasoning practice',
          'quantitative aptitude practice',
          'english language quiz',
          'general awareness mcq',
          'general knowledge quiz',
          'subject wise mcq',
          'aajexam subjects'
        ]}
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Subjects', url: '/subjects' }
          ]),
          subjects.length > 0 && generateItemListSchema({
            name: 'Subjects on AajExam',
            items: subjects.map((s) => ({ name: s.name, url: `/subjects/${s.slug}` }))
          })
        ].filter(Boolean)}
      />
      <SubjectListPage />

      <div className="px-3 xl:px-0 pb-10">
        <LinkIndexSection
          title={translate('All subjects')}
          intro="Every subject we cover, with free topic-wise MCQs, study notes and timed practice quizzes for SSC, UPSC, Banking, Railway, Defence and State PSC exams."
          groups={[{ items: subjects.map((s) => ({ href: `/subjects/${s.slug}`, name: s.name, meta: s.topicCount ? `${s.topicCount} topics` : null })) }]}
          columns="sm:grid-cols-2 xl:grid-cols-4"
        />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const { buildSubjectsIndex } = await import('../../lib/catalogIndex');
    return { props: await buildSubjectsIndex(), revalidate: 3600 };
  } catch (e) {
    console.error('Error in subjects getStaticProps:', e);
    return { props: { subjects: [] }, revalidate: 300 };
  }
}
