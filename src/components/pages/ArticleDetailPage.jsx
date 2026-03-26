
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Pages Router
import Link from 'next/link';
import API from '../../lib/api';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import { useSelector } from 'react-redux';
import { safeLocalStorage } from '../../lib/utils/storage';
import { FaWhatsapp, FaTelegramPlane, FaFacebook, FaTwitter, FaLinkedin, FaShare } from 'react-icons/fa';

const ArticleDetailPage = ({ article: initialArticle, slug: initialSlug }) => {
  const router = useRouter();
  const { slug } = router.query;
  const [article, setArticle] = useState(initialArticle);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const viewIncrementedRef = React.useRef(false);

  const isOpen = useSelector((state) => state.sidebar.isOpen);

  useEffect(() => {
    // Run only on client
    const storedUser = safeLocalStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // If article was passed as prop, use it and fetch related articles
    if (initialArticle) {
      // Increment view count only once per page load (client-side only)
      if (initialArticle?._id && !viewIncrementedRef.current) {
        viewIncrementedRef.current = true;
        try {
          API.incrementArticleViews(initialArticle._id).catch(err => {
            console.error('Failed to increment view count:', err);
          });
          // Update local view count optimistically
          setArticle(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
        } catch (viewErr) {
          console.error('Failed to increment view count:', viewErr);
        }
      }

      // Fetch related articles from the same category
      if (initialArticle.category) {
        fetchRelatedArticles(initialArticle.category._id);
      }
    }
  }, [initialArticle]);

  const fetchRelatedArticles = async (categoryId) => {
    try {
      const response = await API.getArticlesByCategory(categoryId, { limit: 3 });
      console.log(response, 'fetchRelatedArticles')
      setRelatedArticles(response.data.articles || []);
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  const handleLike = async () => {
    if (!article || liked) return;

    try {
      await API.incrementArticleLikes(article._id);
      setLiked(true);
      setArticle(prev => ({
        ...prev,
        likes: prev.likes + 1
      }));
    } catch (err) {
      console.error('Error liking article:', err);
    }
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = article?.metaTitle || article?.title || 'Check this article';
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedText = encodeURIComponent(shareText);
  const telegramText = encodeURIComponent(`${shareText}\n\n${pageUrl}`);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({ title: shareText, text: shareText, url: pageUrl });
    } catch (err) {
      // ignore
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <div className={`mainContent ${isOpen ? 'showPanel' : 'hidePanel'} bg-gray-50 dark:bg-gray-900 min-h-screen`}>
          <div className="container mx-auto px-4 lg:px-10 py-8 text-gray-900 dark:text-white">
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading article..." />
            </div>
          </div>
        </div>
        <UnifiedFooter />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <div className={`mainContent ${isOpen ? 'showPanel' : 'hidePanel'} bg-gray-50 dark:bg-gray-900 min-h-screen`}>
          <div className="px-8 py-4 container mx-auto text-gray-900 dark:text-white">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Article Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Link
                href="/articles"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 lg:px-6 py-1 lg:py-3 rounded-lg font-medium transition-colors"
              >
                Browse All Articles
              </Link>
            </div>
          </div>
        </div>
        <UnifiedFooter />
      </>
    );
  }

  return (
    <>
      <div className={`mainContent ${isOpen ? 'showPanel' : 'hidePanel'} bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <div className="container mx-auto px-4 lg:px-10 py-8 text-gray-900 dark:text-white">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/" className="hover:text-orange-700 dark:hover:text-yellow-400">Home</Link></li>
              <li>•</li>
              <li><Link href="/articles" className="hover:text-orange-700 dark:hover:text-yellow-400">Articles</Link></li>
              <li>•</li>
              <li className="text-gray-900 dark:text-white">
                <span className="hidden sm:inline">{article.title}</span>
                <span className="sm:hidden">{article.title?.length > 25 ? article.title?.slice(0, 25) + '...' : article.title}</span>
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center mb-4">
              {article.isFeatured && (
                <span className="text-yellow-500 text-sm font-medium mr-3">⭐ Featured</span>
              )}
              {article.isPinned && (
                <span className="text-blue-500 text-sm font-medium mr-3">📌 Pinned</span>
              )}
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
            </div>

            <h1 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-md lg:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {article.author?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {article.author?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Author
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <span>👁️ {article.views || 0} views</span>
                <span>❤️ {article.likes || 0} likes</span>
                <span>⏱️ {article.readingTime || 5} min read</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={article.featuredImage || '/default_banner.png'}
              alt={article.featuredImageAlt || article.title}
              className="w-full h-42 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none mb-0 lg:mb-8">
            <div
              className="text-gray-900 dark:text-white leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: article.content.replace(/\n/g, '<br />')
              }}
            />
          </article>

          {/* Article Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-700 mb-0 lg:mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${liked
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                  }`}
              >
                <span>{liked ? '❤️' : '🤍'}</span>
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>
              {canNativeShare ? (
                <button onClick={handleNativeShare} className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow hover:from-blue-600 hover:to-indigo-700 transition-colors">
                  <FaShare />
                  <span>Share</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <a href={`https://wa.me/?text=${encodedText}%0A${encodedUrl}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="text-green-500 text-xl">
                    <FaWhatsapp />
                  </a>
                  <a href={`https://t.me/share/url?text=${telegramText}`} target="_blank" rel="noopener noreferrer" title="Telegram" className="text-sky-500 text-xl">
                    <FaTelegramPlane />
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" title="Facebook" className="text-blue-600 text-xl">
                    <FaFacebook />
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" title="Twitter/X" className="text-sky-400 text-xl">
                    <FaTwitter />
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-blue-700 text-xl">
                    <FaLinkedin />
                  </a>
                </div>
              )}
            </div>

            {article.category && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                <Link href={`/articles/category/${article.category._id}`}
                  className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-sm px-3 py-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/30"
                >
                  {article.category.name}
                </Link>
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Link
                    key={index} href={`/articles/tag/${encodeURIComponent(tag)}`}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles?.filter(relatedArticle => relatedArticle._id !== article._id).length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles
                  ?.filter(relatedArticle => relatedArticle._id !== article._id)
                  ?.slice(0, 3)
                  ?.map((relatedArticle) => (
                    <Link
                      key={relatedArticle._id} href={`/articles/${relatedArticle.slug}`}
                      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={relatedArticle.featuredImage || '/default_banner.png'}
                          alt={relatedArticle.featuredImageAlt || relatedArticle.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-yellow-400 transition-colors mb-2">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {relatedArticle.excerpt || relatedArticle.content?.substring(0, 100) + '...'}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatDate(relatedArticle.publishedAt || relatedArticle.createdAt)}</span>
                          <span>⏱️ {relatedArticle.readingTime || 5} min</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Back to Articles */}
          <div className="text-center">
            <Link
              href="/articles"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-red-500 text-white 
              dark:from-yellow-600 dark:to-red-700 px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors"
            >
              <span>←</span>
              <span>Go Back</span>
            </Link>
          </div>
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default ArticleDetailPage;



