'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import API from '../../lib/api';
import Loading from '../Loading';
import { useSelector } from 'react-redux';
import { Eye, Heart, Clock, Star, Pin, ArrowLeft, Share2 } from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

const BlogDetailPage = ({ blog: initialBlog, slug: initialSlug }) => {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(initialBlog);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const viewIncrementedRef = useRef(false);

  useEffect(() => {
    if (initialBlog) {
      if (initialBlog._id && !viewIncrementedRef.current) {
        viewIncrementedRef.current = true;
        API.incrementBlogViews(initialBlog._id).catch(() => {});
        setBlog(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
      }
      if (initialBlog.exam) {
        fetchRelatedBlogs(initialBlog.exam._id || initialBlog.exam);
      }
    }
  }, [initialBlog]);

  const fetchRelatedBlogs = async (examId) => {
    try {
      const response = await API.getBlogsByExam(examId, { limit: 3 });
      setRelatedBlogs(response.data?.blogs || []);
    } catch (err) {
      console.error('Error fetching related blogs:', err);
    }
  };

  const handleLike = async () => {
    if (!blog || liked) return;
    try {
      await API.incrementBlogLikes(blog._id);
      setLiked(true);
      setBlog(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = blog?.metaTitle || blog?.title || 'Check this blog';
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedText = encodeURIComponent(shareText);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({ title: shareText, text: shareText, url: pageUrl });
    } catch (err) { }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="md" color="yellow" message="Loading blog..." />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 lg:px-10 py-8 text-gray-900 dark:text-white text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold mb-2">Blog Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The blog you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog" className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors">
            Browse All Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 lg:px-10 py-6 lg:py-8 text-gray-900 dark:text-white">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/home" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link></li>
            <li>•</li>
            <li><Link href="/blog" className="hover:text-primary-600 dark:hover:text-primary-400">Blog</Link></li>
            <li>•</li>
            <li className="text-gray-900 dark:text-white truncate max-w-[200px]">{blog.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {blog.isFeatured && <span className="flex items-center gap-1 text-yellow-500 text-sm font-bold"><Star className="w-4 h-4 fill-yellow-500" /> Featured</span>}
            {blog.isPinned && <span className="flex items-center gap-1 text-blue-500 text-sm font-bold"><Pin className="w-4 h-4 fill-blue-500" /> Pinned</span>}
            <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(blog.publishedAt || blog.createdAt)}</span>
          </div>

          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{blog.excerpt}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{blog.author?.name?.charAt(0) || 'A'}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{blog.author?.name || 'AajExam Team'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Author</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {blog.views || 0}</span>
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {blog.likes || 0}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {blog.readingTime || 5} min</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-8">
          <img src={blog.featuredImage || '/default_banner.png'} alt={blog.featuredImageAlt || blog.title}
            className="w-full h-48 md:h-72 lg:h-96 object-cover rounded-2xl shadow-lg" />
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none mb-8">
          <div className="text-gray-900 dark:text-white leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} />
        </article>

        {/* Actions */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} disabled={liked}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${liked
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-700'}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </button>

            {canNativeShare ? (
              <button onClick={handleNativeShare}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600">
                <Share2 className="w-4 h-4" /> Share
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <a href={`https://wa.me/?text=${encodedText}%0A${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-green-500 text-xl"><FaWhatsapp /></a>
                <a href={`https://t.me/share/url?text=${encodeURIComponent(`${shareText}\n\n${pageUrl}`)}`} target="_blank" rel="noopener noreferrer" className="text-sky-500 text-xl"><FaTelegramPlane /></a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xl"><FaFacebook /></a>
                <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-sky-400 text-xl"><FaTwitter /></a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 text-xl"><FaLinkedin /></a>
              </div>
            )}
          </div>

          {blog.exam && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Exam:</span>
              <Link href={`/blog?exam=${blog.exam._id}`}
                className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm px-3 py-1 rounded-full font-bold hover:bg-primary-100 dark:hover:bg-primary-800/30">
                {blog.exam.name}
              </Link>
            </div>
          )}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Blogs */}
        {relatedBlogs?.filter(r => r._id !== blog._id).length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Related Blogs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.filter(r => r._id !== blog._id).slice(0, 3).map((related) => (
                <Link key={related._id} href={`/blog/${related.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={related.featuredImage || '/default_banner.png'} alt={related.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="p-4">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-2 line-clamp-2">
                      {related.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                      {related.excerpt || related.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(related.publishedAt || related.createdAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {related.readingTime || 5} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="text-center">
          <Link href="/blog"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
