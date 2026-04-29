import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const SubjectDetailPage = dynamic(() => import('../../components/pages/SubjectDetailPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function SubjectDetail({ resolvedId, subject }) {
  const subjectName = subject?.name || 'Subject';
  return (
    <>
      <Seo
        title={`${subjectName} – Topic-wise Quizzes & Practice Tests | AajExam`}
        description={subject?.description || `Explore topic-wise MCQs, practice tests and study resources for ${subjectName}. Free quizzes for SSC, UPSC, Banking, Railway and State PSC exam aspirants on AajExam.`}
        canonical={`/subjects/${subject?.slug || resolvedId}`}
        keywords={[
          `${subjectName} quiz`,
          `${subjectName} mcq`,
          `${subjectName} practice`,
          'topic wise mcq',
          'government exam practice',
          'aajexam'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Subjects', url: '/subjects' },
          { name: subjectName, url: `/subjects/${subject?.slug || resolvedId}` }
        ])}
      />
      <SubjectDetailPage resolvedId={resolvedId} initialSubject={subject} />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const dbConnect = (await import('../../lib/db')).default;
  const Subject = (await import('../../models/Subject')).default;
  const { isObjectId, slugRedirect } = await import('../../lib/web/slugRouting');
  const segment = params?.id;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await Subject.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/subjects/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
    }

    const subject = await Subject.findOne(isObjectId(segment) ? { _id: segment } : { slug: segment })
      .select('_id name slug description icon')
      .lean();

    if (!subject) return { notFound: true };

    return {
      props: {
        resolvedId: String(subject._id),
        subject: JSON.parse(JSON.stringify(subject))
      }
    };
  } catch (e) {
    console.error('subject ssr error', e);
    return { notFound: true };
  }
}
