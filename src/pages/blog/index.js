import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const BlogsPage = dynamic(() => import('../../components/pages/BlogsPage'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function Blog() {
  return (
    <>
      <Seo
        title="AajExam Blog – Exam Strategy, Study Guides & Government Exam Tips"
        description="Get expert exam strategy, syllabus break-downs and topic-wise study guides for SSC CHSL, CGL, MTS, UPSC, Banking, Railway and State PSC exams. Updated daily by the AajExam team."
        canonical="/blog"
        keywords={[
          'government exam blog',
          'SSC preparation tips',
          'UPSC strategy',
          'banking exam tips',
          'railway exam study guide',
          'previous year question analysis',
          'aajexam blog'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' }
        ])}
      />
      <BlogsPage />
    </>
  );
}
