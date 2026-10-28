'use client';

import Select from '../../common/ui/Select';
import { BookOpen } from 'lucide-react';
import PageHero from '@/components/common/ui/PageHero';
import React, { useState, useEffect, useCallback } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import API from '../../../lib/api';
import useTargetExamsVersion from '../../../hooks/useTargetExamsVersion';
import { getStoredTargetExamIds } from '../../../lib/utils/targetExams';
import { BlogListSkeleton } from '../../common/skeletons/PublicSkeletons';
import { useSelector } from 'react-redux';
import { Search, Eye, Heart, Clock, Star, Pin } from 'lucide-react';
import useTranslate from '../../../hooks/useTranslate';
import Pagination from '../../common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';

const BlogsPage = ({ initialBlogs = [], initialTotal = 0 } = {}) => {
  const { translate } = useTranslate();
  const router = useRouter();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(initialBlogs.length === 0);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    exam: '',
    featured: false,
  });
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState(initialBlogs.length ? { total: initialTotal } : {});
  const currentPage = parseInt(router.query.page || '1', 10);
  const [viewMode, setViewMode] = useState('grid');

  const targetVersion = useTargetExamsVersion();
  // Resolved after mount (localStorage) so SSR and first paint match.
  const [hasTargets, setHasTargets] = useState(false);
  useEffect(() => { setHasTargets(getStoredTargetExamIds().length > 0); }, [targetVersion]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: filters.search,
        // '' = default (target exams if any); 'all' = explicit "All Exams", no target filter.
        exam: filters.exam === 'all' ? undefined : filters.exam,
        examIds: filters.exam === 'all' ? 'all' : undefined,
        featured: filters.featured || undefined,
      };
      const response = await API.getPublishedBlogs(params);
      if (response.success && response.data) {
        setBlogs(response.data.blogs || []);
        setPagination(response.data.pagination || {});
      } else {
        setBlogs([]);
        setPagination({});
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(translate('Failed to load blogs'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters.search, filters.exam, filters.featured, targetVersion]);

  const fetchExams = async () => {
    try {
      const response = await API.getPublicExams({ limit: 500 });
      setExams(response.data?.exams || response.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchExams();
  }, [fetchBlogs]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    router.push({ pathname: '/blog', query: {} }, undefined, { shallow: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
    router.push({ pathname: '/blog', query: {} }, undefined, { shallow: true });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    const stripped = text.replace(/<[^>]*>/g, '');
    return stripped.length <= maxLength ? stripped : stripped.substr(0, maxLength) + '...';
  };

  const goToPage = (page) => {
    router.push({ pathname: '/blog', query: page > 1 ? { page } : {} }, undefined, { shallow: true });
  };

  // Shared pieces for the ticket-style article cards (grid + list). Radii are inline because
  // styles/index.css forces every [class*="rounded"] to a flat 8px with !important.
  const cardBase = 'group relative flex overflow-hidden bg-background-surface border border-border-primary hover:-translate-y-1 transition-all duration-300';

  const FlagPills = ({ blog }) => (
    <>
      {blog.isFeatured && (
        <span className="w-7 h-7 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
          <Star className="w-4 h-4 fill-current" />
        </span>
      )}
      {blog.isPinned && (
        <span className="w-7 h-7 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
          <Pin className="w-4 h-4 fill-current" />
        </span>
      )}
    </>
  );

  const Stub = ({ blog, readLabel }) => (
    <div className="relative flex items-center justify-between gap-3 px-4 py-3 border-t-2 border-dashed border-primary-500/30">
      <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-page" style={{ borderRadius: 'var(--radius-sm)' }} />
      <span className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-page" style={{ borderRadius: 'var(--radius-sm)' }} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-content-muted min-w-0">
        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.views || 0}</span>
        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {blog.likes || 0}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readLabel}</span>
      </div>
      <span className="shrink-0 px-3 py-1 text-on-primary text-[11px] font-bold uppercase tracking-[0.08em] group-hover:brightness-105 bg-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
        {translate('Read More')}
      </span>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
      {blogs.map((blog) => (
        <Link key={blog._id} href={`/blog/${blog.slug}`} className={`${cardBase} flex-col`} style={{ borderRadius: 'var(--radius)' }}>
          <div className="relative w-full h-44 sm:h-48 bg-center bg-cover" style={{ backgroundImage: `url(${blog.featuredImage || '/default_banner.png'})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5"><FlagPills blog={blog} /></div>
            {blog.exam && (
              <span className="absolute bottom-3 left-3 max-w-[85%] truncate px-2.5 py-1 text-on-primary text-[11px] font-bold bg-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
                {blog.exam.name}
              </span>
            )}
          </div>
          <div className="flex-1 p-4 xl:p-5">
            <span className="text-primary-600 text-[11px] font-bold uppercase tracking-[0.08em]">{formatDate(blog.publishedAt || blog.createdAt)}</span>
            <h2 className="mt-1 text-base xl:text-lg font-bold text-content-primary group-hover:text-primary-600 dark:group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
              {blog.title}
            </h2>
            <p className="text-content-secondary text-sm line-clamp-2">
              {truncateText(blog.excerpt || blog.content, 120)}
            </p>
          </div>
          <Stub blog={blog} readLabel={translate('{count} min', { count: blog.readingTime || 5 })} />
        </Link>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-3 xl:space-y-4">
      {blogs.map((blog) => (
        <Link key={blog._id} href={`/blog/${blog.slug}`} className={`${cardBase} flex-col md:flex-row`} style={{ borderRadius: 'var(--radius)' }}>
          <div className="relative md:w-72 w-full h-44 md:h-auto flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${blog.featuredImage || '/default_banner.png'})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5"><FlagPills blog={blog} /></div>
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 p-4 xl:p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-primary-600 text-[11px] font-bold uppercase tracking-[0.08em]">{formatDate(blog.publishedAt || blog.createdAt)}</span>
                {blog.exam && (
                  <span className="ml-auto px-2.5 py-1 text-on-primary text-[11px] font-bold bg-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
                    {blog.exam.name}
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-lg font-bold text-content-primary group-hover:text-primary-600 dark:group-hover:text-primary-600 transition-colors mb-2">
                {blog.title}
              </h2>
              <p className="text-content-secondary text-sm">{truncateText(blog.excerpt || blog.content, 200)}</p>
            </div>
            <Stub blog={blog} readLabel={translate('{count} min read', { count: blog.readingTime || 5 })} />
          </div>
        </Link>
      ))}
    </div>
  );

  if (loading && blogs.length === 0) {
    return <BlogListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background-page">
      <div className="container mx-auto py-2 xl:py-4">
        <PageHero
          icon={BookOpen}
          eyebrow="Blog"
          title={`Blog (${pagination.total || 0})`}
          center={
            <form onSubmit={handleSearch} className="relative w-full">
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={translate('Search blogs...')}
                className="w-full pl-4 pr-12 py-2 border rounded-lg text-sm font-semibold focus:outline-none bg-background-surface text-content-primary placeholder:text-slate-400 border-primary-600" />
              <button aria-label={translate('Search')} type="submit" className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-primary-600 text-on-primary rounded-r-lg">
                <Search className="w-4 h-4" />
              </button>
            </form>
          }
          actions={
            <div className="flex flex-wrap xl:flex-nowrap items-center justify-end gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-1">
                <button onClick={() => setViewMode('grid')}
                  className={`border border-primary-600 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all ${viewMode === 'grid' ? 'text-on-primary bg-primary-600' : 'bg-background-surface text-content-secondary '}`}>
                  {translate('Grid')}
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`border border-primary-600 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all ${viewMode === 'list' ? 'text-on-primary bg-primary-600' : 'bg-background-surface text-content-secondary '}`}>
                  {translate('List')}
                </button>
              </div>

              {/* Exam Filter */}
              <Select name="exam" value={filters.exam} onChange={handleFilterChange}
                className="w-auto max-w-[10rem] shrink min-w-0 px-3 py-1.5 border border-border-primary dark:border-slate-600 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background-surface text-content-primary">
                <option value="">{hasTargets ? translate('My target exams') : translate('All Exams')}</option>
                {hasTargets && <option value="all">{translate('All Exams')}</option>}
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>{exam.name}</option>
                ))}
              </Select>

              {/* Featured Toggle */}
              <label className="flex shrink-0 items-center gap-2 cursor-pointer px-3 py-1.5 bg-background-surface border border-border-primary dark:border-slate-600 rounded-lg">
                <input type="checkbox" name="featured" checked={filters.featured} onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border-primary rounded" />
                <span className="text-xs font-bold text-content-secondary">{translate('Featured')}</span>
              </label>
            </div>
          }
        />
        <div className="mb-4" />

        {/* Blog Content */}
        {blogs.length > 0 ? (
          viewMode === 'grid' ? <GridView /> : <ListView />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-content-primary mb-2">{translate('No blogs found')}</h2>
            <p className="text-content-secondary">{translate('Try adjusting your filters or check back later.')}</p>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8"><Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={goToPage} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); goToPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>

        {error && (
          <div className="mt-4 border border-border-primary dark:border-white rounded-md p-4">
            <p className="text-content-primary">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
