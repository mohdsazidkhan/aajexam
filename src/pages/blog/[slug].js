import BlogDetailPage from '../../components/pages/BlogDetailPage';
import Seo from '../../components/Seo';
import { generateBlogPostingSchema, generateBreadcrumbSchema, generateFAQSchema, generateItemListSchema } from '../../utils/schema';

export default function BlogDetail({ blog, slug, seo, relatedBlogs = [], faqs = [], hasPyq = false }) {
  const articleSchema = blog ? generateBlogPostingSchema({
    title: blog.title,
    description: seo?.description,
    image: seo?.image,
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.publishedAt,
    authorName: blog.author?.name,
    keywords: blog.tags,
    category: blog.exam?.name,
    url: seo?.url,
    wordCount: blog.content ? String(blog.content).replace(/<[^>]*>/g, '').split(/\s+/).length : undefined
  }) : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    ...(blog?.exam?.name ? [{ name: blog.exam.name, url: `/blog?exam=${blog.exam.slug || ''}` }] : []),
    { name: blog?.title || 'Article', url: `/blog/${slug}` }
  ]);

  // FAQPage is built from the question-style headings already visible in the
  // article body, so the structured data always matches on-page content.
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  const relatedSchema = relatedBlogs.length > 0
    ? generateItemListSchema({
        name: `More ${blog?.exam?.name || 'exam'} articles on AajExam`,
        items: relatedBlogs.map((r) => ({ name: r.title, url: `/blog/${r.slug}` }))
      })
    : null;

  return (
    <>
      <Seo
        title={seo?.title || 'Blog - AajExam'}
        description={seo?.description || ''}
        image={seo?.image}
        type="article"
        canonical={`/blog/${slug}`}
        author={blog?.author?.name}
        publishedTime={blog?.publishedAt}
        modifiedTime={blog?.publishedAt}
        keywords={blog?.tags}
        schemas={[articleSchema, breadcrumbSchema, faqSchema, relatedSchema]}
      />
      <BlogDetailPage blog={blog} slug={slug} relatedBlogs={relatedBlogs} hasPyq={hasPyq} />
    </>
  );
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Build FAQPage entries from the article itself: any h2/h3 phrased as a
 * question, paired with the text that follows it. Nothing is invented — the
 * answer is on-page content, which is what Google requires for FAQ rich
 * results.
 */
function extractFaqs(html, limit = 8) {
  if (!html) return [];
  const faqs = [];
  const headingRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/g;
  let match;

  while ((match = headingRe.exec(html)) !== null) {
    const question = stripHtml(match[2]);
    if (!question || !/[?？]\s*$/.test(question)) continue;

    const after = html.slice(match.index + match[0].length);
    const nextHeading = after.search(/<h[23][^>]*>/);
    const answer = stripHtml(nextHeading === -1 ? after : after.slice(0, nextHeading));
    if (answer.length < 40) continue;

    faqs.push({ question, answer: answer.slice(0, 600) });
    if (faqs.length >= limit) break;
  }

  return faqs;
}

export async function getStaticPaths() {
  try {
    const dbConnect = (await import('../../lib/db')).default;
    const Blog = (await import('../../models/Blog')).default;

    await dbConnect();
    const blogs = await Blog.find({ status: 'published' })
      .select('slug')
      .sort({ publishedAt: -1 })
      .limit(200)
      .lean();

    const paths = blogs.filter(b => b?.slug).map(b => ({ params: { slug: b.slug } }));

    return { paths, fallback: 'blocking' };
  } catch (e) {
    console.error('Error in blog getStaticPaths:', e);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params || {};

  try {
    const dbConnect = (await import('../../lib/db')).default;
    const Blog = (await import('../../models/Blog')).default;
    await import('../../models/Exam');
    await import('../../models/User');

    await dbConnect();
    const blogDoc = await Blog.findOne({ slug, status: 'published' })
      .populate('exam', 'name code slug')
      .populate('author', 'name')
      .lean();

    if (!blogDoc) {
      return { notFound: true, revalidate: 60 };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
    const title = `${blogDoc.metaTitle || blogDoc.title} - AajExam Blog`;
    const rawDesc = blogDoc.metaDescription || blogDoc.excerpt || stripHtml(blogDoc.content);
    const description = (rawDesc || '').slice(0, 160);

    const resolveImageUrl = (raw) => {
      if (!raw) return null;
      if (/^https?:\/\//i.test(raw)) return raw;
      return `${baseUrl.replace(/\/$/, '')}${raw.startsWith('/') ? raw : `/${raw}`}`;
    };
    const image = resolveImageUrl(blogDoc.featuredImage) || resolveImageUrl('/logo.png');

    const optimizedBlog = {
      _id: blogDoc._id ? blogDoc._id.toString() : '',
      title: blogDoc.title || '',
      content: blogDoc.content || '',
      excerpt: blogDoc.excerpt || null,
      publishedAt: blogDoc.publishedAt ? blogDoc.publishedAt.toString() : null,
      createdAt: blogDoc.createdAt ? blogDoc.createdAt.toString() : null,
      featuredImage: blogDoc.featuredImage || null,
      featuredImageAlt: blogDoc.featuredImageAlt || null,
      views: blogDoc.views || 0,
      likes: blogDoc.likes || 0,
      readingTime: blogDoc.readingTime || 5,
      isFeatured: Boolean(blogDoc.isFeatured),
      isPinned: Boolean(blogDoc.isPinned),
      tags: Array.isArray(blogDoc.tags) ? blogDoc.tags : [],
      exam: blogDoc.exam ? { _id: blogDoc.exam._id ? blogDoc.exam._id.toString() : '', name: blogDoc.exam.name || '', code: blogDoc.exam.code || '', slug: blogDoc.exam.slug || '' } : null,
      author: blogDoc.author ? { name: blogDoc.author.name || 'AajExam Team' } : { name: 'AajExam Team' }
    };

    // Does this exam have PYQ landing pages? Only link the CTA if it does.
    let hasPyq = false;
    if (blogDoc.exam?._id) {
      try {
        const ExamPattern = (await import('../../models/ExamPattern')).default;
        const PracticeTest = (await import('../../models/PracticeTest')).default;
        const patternIds = (await ExamPattern.find({ exam: blogDoc.exam._id }).select('_id').lean()).map((p) => p._id);
        if (patternIds.length > 0) {
          hasPyq = Boolean(await PracticeTest.exists({
            examPattern: { $in: patternIds },
            isPYQ: true,
            slug: { $exists: true, $nin: [null, ''] }
          }));
        }
      } catch (err) {
        hasPyq = false;
      }
    }

    // Related posts were previously fetched client-side, so Googlebot saw a
    // blog post with zero outgoing internal links. Fetch them here instead.
    const relatedDocs = await Blog.find({
      status: 'published',
      _id: { $ne: blogDoc._id },
      ...(blogDoc.exam?._id ? { exam: blogDoc.exam._id } : {})
    })
      .select('slug title excerpt featuredImage readingTime publishedAt createdAt')
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean();

    // Top up with the newest posts so every article links out, even the ones
    // that are the only piece written for their exam.
    if (relatedDocs.length < 6) {
      const seen = new Set(relatedDocs.map((r) => r._id.toString()));
      const fillers = await Blog.find({
        status: 'published',
        _id: { $ne: blogDoc._id, $nin: [...seen].map((id) => id) }
      })
        .select('slug title excerpt featuredImage readingTime publishedAt createdAt')
        .sort({ publishedAt: -1 })
        .limit(6 - relatedDocs.length)
        .lean();
      relatedDocs.push(...fillers);
    }

    const relatedBlogs = relatedDocs.filter((r) => r?.slug).map((r) => ({
      _id: r._id.toString(),
      slug: r.slug,
      title: r.title || '',
      excerpt: r.excerpt || stripHtml(r.title).slice(0, 120),
      featuredImage: r.featuredImage || null,
      readingTime: r.readingTime || 5,
      publishedAt: r.publishedAt ? r.publishedAt.toString() : null
    }));

    const safeProps = JSON.parse(
      JSON.stringify(
        {
          blog: optimizedBlog,
          slug: slug || '',
          relatedBlogs,
          hasPyq,
          faqs: extractFaqs(blogDoc.content),
          seo: { title, description, image, url: `${baseUrl}/blog/${slug || ''}` }
        },
        (_, v) => (v === undefined ? null : v)
      )
    );

    return {
      props: safeProps,
      revalidate: 60
    };
  } catch (e) {
    console.error('Error in blog getStaticProps:', e);
    return { notFound: true, revalidate: 60 };
  }
}
