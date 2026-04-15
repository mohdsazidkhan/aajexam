import Head from 'next/head';
import BlogDetailPage from '../../components/pages/BlogDetailPage';
import Seo from '../../components/Seo';
import { generateArticleSchema, generateBreadcrumbSchema, renderSchemas } from '../../utils/schema';

export default function BlogDetail({ blog, slug, seo }) {
  const articleSchema = blog ? generateArticleSchema({
    title: blog.title,
    description: seo?.description,
    image: seo?.image,
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.publishedAt,
    authorName: blog.author?.name
  }) : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: blog?.title || 'Article' }
  ]);

  return (
    <>
      <Seo
        title={seo?.title || 'Blog - AajExam'}
        description={seo?.description || ''}
        image={seo?.image}
        type="article"
      />
      <Head>
        {renderSchemas([articleSchema, breadcrumbSchema].filter(Boolean))}
      </Head>
      <BlogDetailPage blog={blog} slug={slug} />
    </>
  );
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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
      .populate('exam', 'name code')
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
      _id: blogDoc._id.toString(),
      title: blogDoc.title,
      content: blogDoc.content,
      excerpt: blogDoc.excerpt || null,
      publishedAt: blogDoc.publishedAt ? blogDoc.publishedAt.toString() : null,
      createdAt: blogDoc.createdAt ? blogDoc.createdAt.toString() : null,
      featuredImage: blogDoc.featuredImage,
      featuredImageAlt: blogDoc.featuredImageAlt,
      views: blogDoc.views || 0,
      likes: blogDoc.likes || 0,
      readingTime: blogDoc.readingTime || 5,
      isFeatured: blogDoc.isFeatured,
      isPinned: blogDoc.isPinned,
      tags: blogDoc.tags || [],
      exam: blogDoc.exam ? { _id: blogDoc.exam._id.toString(), name: blogDoc.exam.name, code: blogDoc.exam.code } : null,
      author: blogDoc.author ? { name: blogDoc.author.name } : { name: 'AajExam Team' }
    };

    return {
      props: {
        blog: optimizedBlog,
        slug,
        seo: { title, description, image, url: `${baseUrl}/blog/${slug}` }
      },
      revalidate: 60
    };
  } catch (e) {
    console.error('Error in blog getStaticProps:', e);
    return { notFound: true, revalidate: 60 };
  }
}
