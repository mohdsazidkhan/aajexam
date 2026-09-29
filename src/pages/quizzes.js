import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import API from '../lib/api';
import useTargetExamsVersion from '../hooks/useTargetExamsVersion';
import { getStoredTargetExamIds } from '../lib/utils/targetExams';
import Seo from '../components/Seo';
import LinkIndexSection from '../components/seo/LinkIndexSection';
import { generateBreadcrumbSchema, generateItemListSchema } from '../utils/schema';
import { PageLoadingFallback } from '../components/skeletons/PublicSkeletons';

const QuizListPage = dynamic(() => import('../components/pages/QuizListPage'), { ssr: false, loading: () => <PageLoadingFallback /> });

export default function Quizzes(props) {
  // Static HTML carries the full catalogue (SEO). Logged-in users with target exams get the
  // same sections limited to those exams, on mount and right after they change them.
  const [scoped, setScoped] = useState(null);
  const targetVersion = useTargetExamsVersion();

  useEffect(() => {
    const ids = getStoredTargetExamIds();
    if (!ids.length) { setScoped(null); return; }
    let cancelled = false;
    API.request(`/api/quiz/index?examIds=${ids.join(',')}`).then((res) => {
      if (!cancelled && res?.success) setScoped(res.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [targetVersion]);

  const { subjects = [], latestQuizzes = [], practiceGroups = [] } = scoped || props;

  return (
    <>
      <Seo
        title="Free Quizzes – Topic-wise Government Exam Practice | AajExam"
        description="Practise 1000+ topic-wise free quizzes on AajExam: Reasoning, Quantitative Aptitude, English, General Awareness and Current Affairs for SSC, UPSC, Banking and Railway exams."
        canonical="/quizzes"
        keywords={[
          'free online quiz',
          'government exam quiz',
          'topic wise quiz',
          'reasoning quiz',
          'quantitative aptitude mcq',
          'english quiz',
          'current affairs quiz',
          'aajexam quizzes'
        ]}
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Quizzes', url: '/quizzes' }
          ]),
          latestQuizzes.length > 0 && generateItemListSchema({
            name: 'Latest quizzes on AajExam',
            items: latestQuizzes.map((q) => ({ name: q.title, url: `/quiz/${q.slug}` }))
          })
        ].filter(Boolean)}
      />
      <QuizListPage />

      <div className="px-3 xl:px-0 pb-10 space-y-6">
        <LinkIndexSection
          title="Browse quizzes by subject"
          intro="Start with a subject, drill into a topic, then attempt the quizzes under it. Every quiz is free, timed and shipped with step-by-step solutions."
          groups={[{ items: subjects.map((s) => ({ href: `/subjects/${s.slug}`, name: s.name, meta: s.topicCount ? `${s.topicCount} topics` : null })) }]}
          columns="sm:grid-cols-2 xl:grid-cols-4"
        />
        <LinkIndexSection
          title="Subject-wise previous year questions"
          intro="Every question asked in past papers, grouped by exam and subject, with answers and explanations. These pages carry the full question bank; the individual sets below are ten-question slices of it."
          groups={practiceGroups}
          columns="sm:grid-cols-2 xl:grid-cols-3"
        />
        <LinkIndexSection
          title="Latest quizzes"
          groups={[{ items: latestQuizzes.map((q) => ({ href: `/quiz/${q.slug}`, name: q.title, meta: q.meta })) }]}
          columns="sm:grid-cols-2 xl:grid-cols-3"
        />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const { buildQuizzesIndex } = await import('../lib/quizzesIndex');
    return { props: await buildQuizzesIndex(), revalidate: 1800 };
  } catch (e) {
    console.error('Error in quizzes getStaticProps:', e);
    return { props: { subjects: [], latestQuizzes: [], practiceGroups: [] }, revalidate: 300 };
  }
}
