import ArticleDetailPage from '../../components/pages/ArticleDetailPage'
import API from '../../lib/api'
import Seo from '../../components/Seo'

export default function ArticleDetail({ article, slug, seo }) {
  return (
    <>
      <Seo
        title={seo?.title}
        description={seo?.description}
        image={seo?.image}
        article={true}
        canonical={seo?.url}
      />
      <ArticleDetailPage article={article} slug={slug} />
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
    const Article = (await import('../../models/Article')).default;
    
    await dbConnect();
    // Pre-render a reasonable set of article pages; fallback will cover the rest
    const articles = await Article.find({ status: 'published' })
      .select('slug')
      .sort({ publishedAt: -1 })
      .limit(200)
      .lean();
      
    const paths = articles
      .filter(a => a?.slug)
      .map(a => ({ params: { slug: a.slug } }));

    return {
      paths,
      fallback: 'blocking'
    };
  } catch (e) {
    console.error('Error in articles getStaticPaths:', e);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params || {};

  try {
    const dbConnect = (await import('../../lib/db')).default;
    const Article = (await import('../../models/Article')).default;
    // Note: Category and User are also imported if needed for population results, 
    // but Mongoose handles named population if the models are registered.
    // However, to be safe and ensure they are registered:
    await import('../../models/Category');
    await import('../../models/User');

    await dbConnect();
    // Note: getArticleBySlug no longer increments views to prevent server-side increments
    // View increment is handled client-side only via separate endpoint
    const articleDoc = await Article.findOne({ slug, status: 'published' })
      .populate('category', 'name')
      .populate('author', 'name')
      .lean();
    
    const article = articleDoc || null;

    if (!article) {
      return { notFound: true, revalidate: 60 };
    }

    const fallbackSiteUrl = 'https://aajexam.com';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;
    const titleBase = 'AajExam Platform';
    const title = `${article?.metaTitle || article?.title || 'Article'} - ${titleBase}`;
    const rawDesc = article?.metaDescription || article?.excerpt || stripHtml(article?.content);
    const description = (rawDesc || '').slice(0, 160);
    const resolveImageUrl = (raw) => {
      if (!raw) return null;
      if (/^https?:\/\//i.test(raw)) return raw;
      const normalizedBase = baseUrl?.replace(/\/$/, '') || '';
      const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
      return `${normalizedBase}${normalizedPath}`;
    };

    const image = resolveImageUrl(article?.featuredImage) || resolveImageUrl(article?.metaImage) || resolveImageUrl('/logo.png');
    const keywords = Array.isArray(article?.tags) && article.tags.length > 0
      ? article.tags.join(', ')
      : (article?.category?.name || '');
    const url = baseUrl ? `${baseUrl}/articles/${slug}` : null;

    // Pick only necessary fields for the UI to reduce data payload size
    const optimizedArticle = {
      _id: article._id.toString(),
      title: article.title,
      content: article.content, // Still large but necessary
      excerpt: article.excerpt || null,
      publishedAt: article.publishedAt ? article.publishedAt.toString() : null,
      createdAt: article.createdAt ? article.createdAt.toString() : null,
      featuredImage: article.featuredImage,
      featuredImageAlt: article.featuredImageAlt,
      views: article.views || 0,
      likes: article.likes || 0,
      readingTime: article.readingTime || 5,
      isFeatured: article.isFeatured,
      isPinned: article.isPinned,
      tags: article.tags || [],
      category: article.category ? {
        _id: article.category._id.toString(),
        name: article.category.name
      } : null,
      author: article.author ? {
        name: article.author.name
      } : { name: 'Anonymous' }
    };

    return {
      props: {
        article: optimizedArticle,
        slug,
        seo: {
          title,
          description,
          keywords,
          image,
          url,
          imageWidth: article?.featuredImageMeta?.width ?? null,
          imageHeight: article?.featuredImageMeta?.height ?? null,
        }
      },
      revalidate: 60
    };
  } catch (e) {
    return { notFound: true, revalidate: 60 };
  }
}
