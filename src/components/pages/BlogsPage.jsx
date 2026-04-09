'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import API from '../../lib/api';
import Loading from '../Loading';
import { useSelector } from 'react-redux';
import { Search, Eye, Heart, Clock, Star, Pin, ChevronLeft, ChevronRight } from 'lucide-react';

const BlogsPage = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    exam: '',
    featured: false,
  });
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({});
  const currentPage = parseInt(router.query.page || '1', 10);
  const [viewMode, setViewMode] = useState('grid');

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: 9,
        search: filters.search,
        exam: filters.exam,
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
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.search, filters.exam, filters.featured]);

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

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {blogs.map((blog) => (
        <Link key={blog._id} href={`/blog/${blog.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="w-full h-48 bg-center bg-cover"
            style={{ backgroundImage: `url(${blog.featuredImage || '/default_banner.png'})` }} />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {blog.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              {blog.isPinned && <Pin className="w-4 h-4 text-blue-500 fill-blue-500" />}
              <span className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(blog.publishedAt || blog.createdAt)}</span>
            </div>
            <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 line-clamp-2">
              {blog.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {truncateText(blog.excerpt || blog.content, 120)}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views || 0}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likes || 0}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.readingTime || 5} min</span>
              </div>
              <span className="text-primary-600 dark:text-primary-400 text-xs font-bold">Read More</span>
            </div>
            {blog.exam && (
              <div className="mt-3">
                <span className="inline-block bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full font-medium">
                  {blog.exam.name}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <Link key={blog._id} href={`/blog/${blog.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row">
          <div className="md:w-64 w-full h-48 md:h-auto flex-shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${blog.featuredImage || '/default_banner.png'})` }} />
          <div className="p-5 flex-1">
            <div className="flex items-center gap-2 mb-2">
              {blog.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              {blog.isPinned && <Pin className="w-4 h-4 text-blue-500 fill-blue-500" />}
              <span className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(blog.publishedAt || blog.createdAt)}</span>
              {blog.exam && (
                <span className="ml-auto bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full font-medium">
                  {blog.exam.name}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
              {blog.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{truncateText(blog.excerpt || blog.content, 200)}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views || 0}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likes || 0}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.readingTime || 5} min read</span>
              </div>
              <span className="text-primary-600 dark:text-primary-400 text-xs font-bold">Read More</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="md" color="yellow" message="Loading blogs..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 lg:px-10 py-6 lg:py-8 text-gray-900 dark:text-white">
        {/* Header & Filters */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Blog ({pagination.total || 0})
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Exam preparation tips, guides & insights</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                Grid
              </button>
              <button onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                List
              </button>
            </div>

            {/* Exam Filter */}
            <select name="exam" value={filters.exam} onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white">
              <option value="">All Exams</option>
              {exams.map(exam => (
                <option key={exam._id} value={exam._id}>{exam.name}</option>
              ))}
            </select>

            {/* Featured Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="featured" checked={filters.featured} onChange={handleFilterChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Featured</span>
            </label>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search blogs..."
                className="w-full lg:w-64 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white" />
              <button type="submit" className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-primary-500 text-white rounded-r-lg">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Blog Content */}
        {blogs.length > 0 ? (
          viewMode === 'grid' ? <GridView /> : <ListView />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No blogs found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try adjusting your filters or check back later.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-2">
              <button onClick={() => goToPage(Math.max(currentPage - 1, 1))} disabled={!pagination.hasPrev}
                className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button onClick={() => goToPage(Math.min(currentPage + 1, pagination.totalPages))} disabled={!pagination.hasNext}
                className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
