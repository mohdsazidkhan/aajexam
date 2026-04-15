import dynamic from 'next/dynamic';
import Head from 'next/head';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema, renderSchema } from '../../utils/schema';

const BlogsPage = dynamic(() => import('../../components/pages/BlogsPage'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function Blog() {
  return (
    <>
      <Seo
        title="Blog - AajExam | Exam Preparation Tips & Guides"
        description="Read exam preparation tips, study guides, and expert insights for government exams. Stay updated with the latest exam strategies and resources."
      />
      <Head>
        <meta name="keywords" content="exam preparation tips, study guides, government exam blog, SSC tips, UPSC preparation, banking exam guides" />
        {renderSchema(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog' }
        ]))}
      </Head>
      <BlogsPage />
    </>
  );
}
