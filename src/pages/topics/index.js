import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import LinkIndexSection from '../../components/seo/LinkIndexSection';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { PageLoadingFallback } from '../../components/skeletons/PublicSkeletons';

const TopicListPage = dynamic(() => import('../../components/pages/TopicListPage'), { ssr: false, loading: () => <PageLoadingFallback /> });

export default function Topics({ groups = [] }) {
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

      <div className="px-3 lg:px-0 pb-10">
        <LinkIndexSection
          title="All topics by subject"
          intro="Every topic we host, grouped under its subject. Each topic page carries free MCQs with explanations, study notes and previous-year question highlights."
          groups={groups}
          columns="sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const dbConnect = (await import('../../lib/db')).default;
    const Topic = (await import('../../models/Topic')).default;
    await import('../../models/Subject');

    await dbConnect();

    // Cap the page so the HTML stays a reasonable size; the remaining topics
    // stay reachable through their subject pages.
    const docs = await Topic.find({})
      .select('name slug subject')
      .populate('subject', 'name slug')
      .sort({ name: 1 })
      .limit(900)
      .lean();

    const bySubject = new Map();
    for (const t of docs) {
      if (!t?.slug) continue;
      const key = t.subject?.name || 'Other topics';
      if (!bySubject.has(key)) {
        bySubject.set(key, { heading: key, href: t.subject?.slug ? `/subjects/${t.subject.slug}` : null, items: [] });
      }
      bySubject.get(key).items.push({ href: `/topics/${t.slug}`, name: t.name || t.slug });
    }

    const groups = Array.from(bySubject.values()).sort((a, b) => b.items.length - a.items.length);

    return { props: { groups }, revalidate: 3600 };
  } catch (e) {
    console.error('Error in topics getStaticProps:', e);
    return { props: { groups: [] }, revalidate: 300 };
  }
}
