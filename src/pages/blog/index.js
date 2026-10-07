import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import API from '../../lib/api';
import useTargetExamsVersion from '../../hooks/useTargetExamsVersion';
import { getStoredTargetExamIds } from '../../lib/utils/targetExams';
import Seo from '../../components/Seo';
import LinkIndexSection from '../../components/seo/LinkIndexSection';
import { generateBreadcrumbSchema, generateItemListSchema } from '../../utils/schema';
import { BlogListSkeleton } from '../../components/skeletons/PublicSkeletons';
import useTranslate from '../../hooks/useTranslate';

const BlogsPage = dynamic(() => import('../../components/pages/BlogsPage'), {
  ssr: false,
  loading: () => <BlogListSkeleton />
});

export default function Blog(props) {
  const { translate } = useTranslate();
  // Static HTML lists every article (SEO). Logged-in users with target exams get the index
  // limited to those exams, on mount and right after they change them.
  const [scoped, setScoped] = useState(null);
  const targetVersion = useTargetExamsVersion();

  useEffect(() => {
    const ids = getStoredTargetExamIds();
    if (!ids.length) { setScoped(null); return; }
    let cancelled = false;
    API.request(`/api/public/blogs/index?examIds=${ids.join(',')}`).then((res) => {
      if (!cancelled && res?.success) setScoped(res.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [targetVersion]);

  const { groups = [], allPosts = [] } = scoped || props;

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
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Blog', url: '/blog' }
          ]),
          allPosts.length > 0 && generateItemListSchema({
            name: 'AajExam blog articles',
            items: allPosts.map((p) => ({ name: p.title, url: `/blog/${p.slug}` }))
          })
        ].filter(Boolean)}
      />
      <BlogsPage />

      {/* Server-rendered index — the interactive list above is client-only, so
          without this every article is an orphan for crawlers. */}
      <div className="container mx-auto px-3 xl:px-0 pb-10">
        <LinkIndexSection
          title={translate('All articles')}
          intro="Notifications, admit cards, results, salary break-downs and preparation guides for every government exam we cover — grouped by exam."
          groups={groups}
          columns="sm:grid-cols-2 xl:grid-cols-3"
        />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const { buildBlogIndex } = await import('../../lib/blogIndex');
    return { props: await buildBlogIndex(), revalidate: 900 };
  } catch (e) {
    console.error('Error in blog index getStaticProps:', e);
    return { props: { groups: [], allPosts: [] }, revalidate: 300 };
  }
}
