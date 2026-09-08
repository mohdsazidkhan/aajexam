import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import LinkIndexSection from '../../components/seo/LinkIndexSection';
import { generateBreadcrumbSchema, generateItemListSchema } from '../../utils/schema';
import { PageLoadingFallback } from '../../components/skeletons/PublicSkeletons';

const SubjectListPage = dynamic(() => import('../../components/pages/SubjectListPage'), { ssr: false, loading: () => <PageLoadingFallback /> });

export default function Subjects({ subjects = [] }) {
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

      <div className="px-3 lg:px-0 pb-10">
        <LinkIndexSection
          title="All subjects"
          intro="Every subject we cover, with free topic-wise MCQs, study notes and timed practice quizzes for SSC, UPSC, Banking, Railway, Defence and State PSC exams."
          groups={[{ items: subjects.map((s) => ({ href: `/subjects/${s.slug}`, name: s.name, meta: s.topicCount ? `${s.topicCount} topics` : null })) }]}
          columns="sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const dbConnect = (await import('../../lib/db')).default;
    const Subject = (await import('../../models/Subject')).default;
    const Topic = (await import('../../models/Topic')).default;

    await dbConnect();
    const docs = await Subject.find({}).select('name slug').sort({ name: 1 }).limit(300).lean();

    const topicCounts = await Topic.aggregate([{ $group: { _id: '$subject', n: { $sum: 1 } } }]);
    const countBySubject = new Map(topicCounts.map((t) => [String(t._id), t.n]));

    const subjects = docs
      .filter((s) => s?.slug)
      .map((s) => ({ name: s.name || '', slug: s.slug, topicCount: countBySubject.get(String(s._id)) || 0 }));

    return { props: { subjects }, revalidate: 3600 };
  } catch (e) {
    console.error('Error in subjects getStaticProps:', e);
    return { props: { subjects: [] }, revalidate: 300 };
  }
}
