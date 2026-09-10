import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import LinkIndexSection from '../../components/seo/LinkIndexSection';
import { generateBreadcrumbSchema, generateItemListSchema } from '../../utils/schema';
import { BlogListSkeleton } from '../../components/skeletons/PublicSkeletons';

const BlogsPage = dynamic(() => import('../../components/pages/BlogsPage'), {
  ssr: false,
  loading: () => <BlogListSkeleton />
});

export default function Blog({ groups = [], allPosts = [] }) {
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
      <div className="px-3 lg:px-0 pb-10">
        <LinkIndexSection
          title="All articles"
          intro="Notifications, admit cards, results, salary break-downs and preparation guides for every government exam we cover — grouped by exam."
          groups={groups}
          columns="sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const dbConnect = (await import('../../lib/db')).default;
    const Blog = (await import('../../models/Blog')).default;
    await import('../../models/Exam');

    await dbConnect();
    const docs = await Blog.find({ status: 'published' })
      .select('slug title readingTime publishedAt createdAt exam')
      .populate('exam', 'name slug')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const allPosts = docs.filter((d) => d?.slug).map((d) => ({ slug: d.slug, title: d.title || '' }));

    // Group by exam so the index doubles as a per-exam hub for crawlers.
    const byExam = new Map();
    for (const d of docs) {
      if (!d?.slug) continue;
      const key = d.exam?.name || 'General exam updates';
      if (!byExam.has(key)) {
        byExam.set(key, { heading: key, href: d.exam?.slug ? `/govt-exams/exam/${d.exam.slug}` : null, items: [] });
      }
      byExam.get(key).items.push({
        href: `/blog/${d.slug}`,
        name: d.title || d.slug,
        meta: `${d.readingTime || 5} min read`
      });
    }

    const groups = Array.from(byExam.values()).sort((a, b) => b.items.length - a.items.length);

    return { props: { groups, allPosts }, revalidate: 900 };
  } catch (e) {
    console.error('Error in blog index getStaticProps:', e);
    return { props: { groups: [], allPosts: [] }, revalidate: 300 };
  }
}
