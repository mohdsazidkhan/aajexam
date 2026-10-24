'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Link from '@/components/common/AppLink';
import API from '../../../lib/api';
import Loading from '../../common/Loading';
import { DetailSkeleton } from '../../common/skeletons/PrivateSkeletons';
import { useSelector } from 'react-redux';
import { Eye, Heart, Clock, Star, Pin, ArrowLeft, ArrowRight, Share2, BookMarked, Layers, BrainCircuit, GraduationCap } from 'lucide-react';
import BackButton from '../../common/ui/BackButton';
import { FaWhatsapp, FaTelegramPlane, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { optimizedImage } from '../../../utils/imageUrl';
import useTranslate from '../../../hooks/useTranslate';


/**
 * Blog bodies are authored as HTML. The old renderer turned every newline
 * into a <br />, so the line breaks between block tags rendered as blank
 * gaps. Collapse tag-to-tag whitespace and only convert newlines that are
 * genuinely inside text.
 */
const renderContent = (html) => {
  if (!html) return '';
  return html
    .replace(/>{translate('[ \\t]*\\r?\\n[ \\t\\r\\n]*')}</g, '><')
    .replace(/\r?\n/g, ' ');
};

const BlogDetailPage = ({ blog: initialBlog, slug: initialSlug, relatedBlogs: ssrRelatedBlogs = [], hasPyq = false }) => {
  const liteMode = useSelector((state) => state.display?.liteMode);
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(initialBlog);
  const [relatedBlogs, setRelatedBlogs] = useState(ssrRelatedBlogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  // Sidebar: five related subjects / topics / quizzes (scoped to the blog's exam when it has one)
  const [sideLists, setSideLists] = useState({ exams: [], subjects: [], topics: [], quizzes: [] });
  const viewIncrementedRef = useRef(false);

  useEffect(() => {
    if (initialBlog) {
      if (initialBlog._id && !viewIncrementedRef.current) {
        viewIncrementedRef.current = true;
        API.incrementBlogViews(initialBlog._id).catch(() => {});
        setBlog(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
      }
      if (ssrRelatedBlogs.length === 0 && initialBlog.exam) {
        fetchRelatedBlogs(initialBlog.exam._id || initialBlog.exam);
      }
    }
  }, [initialBlog]);

  const blogExamId = blog?.exam?._id || (typeof blog?.exam === 'string' ? blog.exam : '');
  useEffect(() => {
    if (!blog?._id) return;
    let alive = true;
    const byExam = blogExamId ? `&examIds=${blogExamId}` : '';
    Promise.all([
      API.request('/api/real-exams/all-exams?page=1&limit=100').catch(() => null),
      API.request(`/api/quiz/subjects/all?page=1&limit=5${byExam}`).catch(() => null),
      API.request(`/api/quiz/topics/all?page=1&limit=5${byExam}`).catch(() => null),
      API.request(`/api/quiz/quizzes?page=1&limit=5${blogExamId ? `&exam=${blogExamId}` : ''}`).catch(() => null),
    ]).then(([exm, sub, top, quiz]) => {
      if (!alive) return;
      // Top 10 other exams, ordered by how many PYQ papers they have
      const exams = (exm?.data || [])
        .filter((e) => String(e._id) !== String(blogExamId))
        .sort((a, b) => (b.pyqCount || 0) - (a.pyqCount || 0))
        .slice(0, 10);
      setSideLists({
        exams,
        subjects: (sub?.data || []).slice(0, 5),
        topics: (top?.data || []).slice(0, 5),
        quizzes: (quiz?.data || []).slice(0, 5),
      });
    });
    return () => { alive = false; };
  }, [blog?._id, blogExamId]);

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
      <div className="min-h-screen bg-background-page font-outfit">
        <div className="py-8"><DetailSkeleton /></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background-page">
        <div className="py-8 text-gray-900 dark:text-white text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold mb-2">{translate('Blog Not Found')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{translate('The blog you\'re looking for doesn\'t exist or has been removed.')}</p>
          <Link href="/blog" className="bg-primary-600 text-white px-6 py-3 rounded-lg xl:rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors">
            {translate('Browse All Blogs')}
          </Link>
        </div>
      </div>
    );
  }

  // Radii are inline throughout: styles/index.css forces every [class*="rounded"] to 8px !important.
  const panel = 'relative overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md';
  const topLine = <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />;
  const outlineLink = 'flex items-center justify-between gap-2 px-4 py-2.5 bg-background-surface-secondary border border-slate-200 dark:border-slate-700 text-primary-700 dark:text-primary-300 font-bold text-sm hover:border-primary-500 hover:-translate-y-0.5 transition-all';
  const related = (relatedBlogs || []).filter(r => r._id !== blog._id).slice(0, 6);

  return (
    <div className="min-h-screen bg-background-page">
      <div className="container mx-auto">
        {/* Breadcrumb + back (back sits at the right end like every detail page) */}
        <div className="flex items-center justify-between gap-3 pt-3 xl:pt-4 mb-4">
          <nav className="min-w-0 flex-1">
            <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">{translate('Home')}</Link></li>
              <li>•</li>
              <li><Link href="/blog" className="hover:text-primary-600 dark:hover:text-primary-400">{translate('Blog')}</Link></li>
              <li>•</li>
              <li className="text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[240px] md:max-w-none">{blog.title}</li>
            </ol>
          </nav>
          <BackButton onClick={() => router.push('/blog')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </BackButton>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5 xl:gap-6 items-start">
          {/* ───────────── Main column ───────────── */}
          <main className="min-w-0 space-y-4 xl:space-y-5">
            {/* Header */}
            <header className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 shadow-xl ring-1 ring-slate-200 dark:ring-white/10 p-4 xl:p-6" style={{ borderRadius: 16 }}>
              <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
              <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
              <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />

              <div className="flex items-center gap-2 flex-wrap mb-3">
                {blog.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] text-xs font-black uppercase tracking-wider shadow" style={{ borderRadius: 999 }}>
                    <Star className="w-3.5 h-3.5 fill-current" /> {translate('Featured')}
                  </span>
                )}
                {blog.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 dark:bg-white/15 text-primary-700 dark:text-white ring-1 ring-primary-200 dark:ring-white/25 text-xs font-black uppercase tracking-wider" style={{ borderRadius: 999 }}>
                    <Pin className="w-3.5 h-3.5 fill-current" /> {translate('Pinned')}
                  </span>
                )}
                <span className="text-primary-700 dark:text-primary-300 text-xs font-black uppercase tracking-wider">{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>

              <h1 className="text-xl md:text-2xl xl:text-4xl font-black text-gray-900 dark:text-gray-100 mb-3 leading-tight">
                {blog.title}
              </h1>

              {blog.excerpt && (
                <p className="text-base xl:text-lg text-slate-600 dark:text-white/80 mb-5 leading-relaxed">{blog.excerpt}</p>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-dashed border-slate-300 dark:border-white/25">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-lg rotate-[-4deg] flex items-center justify-center" style={{ borderRadius: 12 }}>
                    <span className="font-black text-sm">{blog.author?.name?.charAt(0) || 'A'}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{blog.author?.name || translate('AajExam Team')}</p>
                    <p className="text-xs text-slate-500 dark:text-white/60">{translate('Author')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { icon: Eye, v: blog.views || 0 },
                    { icon: Heart, v: blog.likes || 0 },
                    { icon: Clock, v: translate('{count} min', { count: blog.readingTime || 5 }) },
                  ].map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-white/10 ring-1 ring-slate-200 dark:ring-white/20 text-xs font-bold text-slate-700 dark:text-white/80" style={{ borderRadius: 10 }}>
                      <m.icon className="w-3.5 h-3.5" /> {m.v}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            {/* Featured image */}
            <div className="relative overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-white/10" style={{ borderRadius: 16 }}>
              <img src={optimizedImage(blog.featuredImage) || '/default_banner.png'} alt={blog.featuredImageAlt || blog.title}
                width={1200} height={630} fetchPriority="high" decoding="async"
                className="w-full h-48 md:h-72 xl:h-96 object-cover" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
            </div>

            {/* Content */}
            <article className="prose prose-lg max-w-none bg-white dark:bg-black text-black dark:text-white p-4 xl:p-8 border border-slate-200 dark:border-slate-800 shadow-md [&_*:not(a)]:!text-black dark:[&_*:not(a)]:!text-white [&_img]:max-w-full [&_table]:block [&_table]:overflow-x-auto [&_pre]:overflow-x-auto" style={{ borderRadius: 16 }}>
              <div className="text-black dark:text-white leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderContent(blog.content) }} />
            </article>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className={`${panel} p-4 xl:p-5`} style={{ borderRadius: 16 }}>
                {topLine}
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">{translate('Tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 bg-primary-500/5 border-2 border-dashed border-primary-500/30 text-slate-700 dark:text-slate-200 text-sm px-3 py-1 font-bold" style={{ borderRadius: 10 }}>
                      <span className="w-1.5 h-1.5 bg-amber-400" style={{ borderRadius: '50%' }} />#{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ───────────── Sidebar ───────────── */}
          <aside className="space-y-4 xl:space-y-5">
            {/* Actions */}
            <div className={`${panel} p-4 xl:p-5 space-y-4`} style={{ borderRadius: 16 }}>
              {topLine}
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={handleLike} disabled={liked}
                  className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-colors ${liked
                    ? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000]'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-primary-500/10'}`}
                  style={{ borderRadius: 10 }}>
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  {liked ? translate('Liked') : translate('Like')}
                </button>

                {canNativeShare ? (
                  <button onClick={handleNativeShare}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-bold text-sm hover:bg-primary-700" style={{ borderRadius: 10 }}>
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <a href={`https://wa.me/?text=${encodedText}%0A${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-300 text-xl"><FaWhatsapp /></a>
                    <a href={`https://t.me/share/url?text=${encodeURIComponent(`${shareText}\n\n${pageUrl}`)}`} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white text-xl"><FaTelegramPlane /></a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white text-xl"><FaFacebook /></a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white text-xl"><FaTwitter /></a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white text-xl"><FaLinkedin /></a>
                  </div>
                )}
              </div>

              {blog.exam && (
                <div className="flex items-center gap-2 pt-3 border-t border-dashed border-primary-300 dark:border-white/20">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{translate('Exam:')}</span>
                  <Link href={blog.exam.slug ? `/govt-exams/exam/${blog.exam.slug}` : '/govt-exams'}
                    className="bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] text-sm px-3 py-1 font-black shadow hover:brightness-105" style={{ borderRadius: 999 }}>
                    {blog.exam.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Next steps — contextual internal links */}
            <section className={`${panel} p-4 xl:p-5`} style={{ borderRadius: 16 }}>
              {topLine}
              <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                {translate('Prepare for {name} on AajExam', { name: blog.exam?.name || translate('this exam') })}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Reading the notification is step one. Start free practice with topic-wise quizzes,
                previous-year papers and full-length mock tests built for this exam.
              </p>
              <div className="flex flex-col gap-2">
                {blog.exam?.slug && (
                  <Link href={`/govt-exams/exam/${blog.exam.slug}`}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-sm hover:brightness-110 transition-all" style={{ borderRadius: 10 }}>
                    {blog.exam.name} syllabus & pattern <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                )}
                {hasPyq && blog.exam?.slug && (
                  <Link href={`/pyq/${blog.exam.slug}`} className={outlineLink} style={{ borderRadius: 10 }}>
                    {translate('Previous year question papers')} <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                )}
                <Link href="/quizzes" className={outlineLink} style={{ borderRadius: 10 }}>
                  {translate('Free practice quizzes')} <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
                <Link href="/govt-exams" className={outlineLink} style={{ borderRadius: 10 }}>
                  {translate('All government exams')} <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>
            </section>

            {/* Related subjects / topics / quizzes */}
            {[
              { key: 'exams', title: translate('Exams'), icon: GraduationCap, href: (x) => `/govt-exams/exam/${x.slug || x._id}`, label: (x) => translateData(x.name) },
              { key: 'subjects', title: translate('Subjects'), icon: BookMarked, href: (x) => `/subjects/${x.slug}`, label: (x) => translateData(x.name) },
              { key: 'topics', title: translate('Topics'), icon: Layers, href: (x) => `/topics/${x.slug}`, label: (x) => translateData(x.name) },
              { key: 'quizzes', title: translate('Quizzes'), icon: BrainCircuit, href: (x) => `/quiz/${x.slug || x._id}`, label: (x) => x.title },
            ].filter((g) => sideLists[g.key].length > 0).map((g) => (
              <section key={g.key} className={`${panel} p-4 xl:p-5`} style={{ borderRadius: 16 }}>
                {topLine}
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}>
                    <g.icon className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">{g.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {sideLists[g.key].map((item) => (
                    <li key={item._id}>
                      <Link href={g.href(item)} className="group flex items-center justify-between gap-2 px-3 py-2 bg-background-surface-secondary border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-700 dark:hover:text-primary-300 transition-all" style={{ borderRadius: 10 }}>
                        <span className="truncate">{g.label(item)}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-primary-600 dark:text-primary-300 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </aside>
        </div>

        {/* Related Blogs */}
        {related.length > 0 && (
          <div className="mt-8 xl:mt-10">
            <h3 className="text-xl xl:text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">{translate('Related Blogs')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
              {related.map((rel) => (
                <Link key={rel._id} href={`/blog/${rel.slug}`}
                  className="group relative flex flex-col overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all" style={{ borderRadius: 16 }}>
                  {topLine}
                  {!liteMode && (
                    <img src={optimizedImage(rel.featuredImage, 480) || '/default_banner.png'} alt={rel.title}
                      width={480} height={256} loading="lazy" decoding="async"
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <div className="flex-1 p-4">
                    <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 mb-2 line-clamp-2 transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {rel.excerpt || rel.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                    </p>
                  </div>
                  <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 border-t-2 border-dashed border-primary-500/30 bg-primary-600/5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-page" style={{ borderRadius: '50%' }} />
                    <span className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-page" style={{ borderRadius: '50%' }} />
                    <span>{formatDate(rel.publishedAt || rel.createdAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {translate('{count} min', { count: rel.readingTime || 5 })}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom spacing above the footer */}
        <div className="pb-10 xl:pb-14" />
      </div>
    </div>
  );
};

export default BlogDetailPage;
