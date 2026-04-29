import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const TopicDetailPage = dynamic(() => import('../../components/pages/TopicDetailPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function TopicDetail({ resolvedId, topic }) {
  const topicName = topic?.name || 'Topic';
  return (
    <>
      <Seo
        title={`${topicName} – Practice Quizzes & Notes for Government Exams | AajExam`}
        description={topic?.description || `Free MCQs, study notes and previous year question highlights for ${topicName}. Sharpen weak areas before your SSC, UPSC, Banking, Railway or State PSC exam on AajExam.`}
        canonical={`/topics/${topic?.slug || resolvedId}`}
        keywords={[
          `${topicName} quiz`,
          `${topicName} mcq`,
          `${topicName} notes`,
          'topic quiz',
          'government exam topic',
          'aajexam topic'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Topics', url: '/topics' },
          { name: topicName, url: `/topics/${topic?.slug || resolvedId}` }
        ])}
      />
      <TopicDetailPage resolvedId={resolvedId} initialTopic={topic} />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const dbConnect = (await import('../../lib/db')).default;
  const Topic = (await import('../../models/Topic')).default;
  const { isObjectId, slugRedirect } = await import('../../lib/web/slugRouting');
  const segment = params?.id;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await Topic.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/topics/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
    }

    const topic = await Topic.findOne(isObjectId(segment) ? { _id: segment } : { slug: segment })
      .select('_id name slug description')
      .populate('subject', 'name slug')
      .lean();

    if (!topic) return { notFound: true };

    return {
      props: {
        resolvedId: String(topic._id),
        topic: JSON.parse(JSON.stringify(topic))
      }
    };
  } catch (e) {
    console.error('topic ssr error', e);
    return { notFound: true };
  }
}
