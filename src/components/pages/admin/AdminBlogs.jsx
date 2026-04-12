'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import API from '../../../lib/api';
import Loading from '../../Loading';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import { getCurrentUser } from '../../../utils/authUtils';
import { useSSR } from '../../../hooks/useSSR';
import { toast } from 'react-toastify';
import { Plus, Eye, Heart, Pin, Star, Trash2, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminBlogs = () => {
  const { isMounted, router } = useSSR();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [exams, setExams] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    exam: '',
    isFeatured: '',
    isPinned: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 768) return 'grid';
    } catch (e) { }
    return 'table';
  });
  const user = getCurrentUser();

  useEffect(() => {
    fetchBlogs();
    fetchExams();
  }, [currentPage, filters, itemsPerPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: currentPage, limit: itemsPerPage, ...filters };
      const response = await API.getAdminBlogs(params);
      setBlogs(response.blogs || []);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await API.getAdminExams();
      setExams(response.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await API.deleteBlog(id);
        toast.success('Blog deleted');
        fetchBlogs();
      } catch (err) {
        toast.error('Failed to delete blog');
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await API.publishBlog(id);
      toast.success('Blog published');
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to publish');
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await API.unpublishBlog(id);
      toast.success('Blog unpublished');
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to unpublish');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await API.toggleBlogFeatured(id);
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to toggle featured');
    }
  };

  const handleTogglePinned = async (id) => {
    try {
      await API.toggleBlogPinned(id);
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to toggle pinned');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${day}-${monthNames[date.getMonth()]}-${date.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    const cfg = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg[status] || cfg.draft}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">S.No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Blog</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Exam</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stats</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {blogs.map((blog, idx) => (
              <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {((currentPage - 1) * itemsPerPage) + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-lg object-cover" src={blog.featuredImage || '/default_banner.png'} alt={blog.title} />
                    <div className="ml-3 max-w-xs">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={blog.title}>
                        {blog.title}
                        {blog.isFeatured && <Star className="inline w-3 h-3 ml-1 text-yellow-500 fill-yellow-500" />}
                        {blog.isPinned && <Pin className="inline w-3 h-3 ml-1 text-blue-500 fill-blue-500" />}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5"><code>/blog/{blog.slug}</code></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {blog.exam?.name || 'N/A'}
                </td>
                <td className="px-4 py-3">{getStatusBadge(blog.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likes || 0}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(blog.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/blogs/${blog._id}/edit`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    {blog.status === 'published' ? (
                      <button onClick={() => handleUnpublish(blog._id)} className="text-orange-600 hover:text-orange-800 dark:text-orange-400 text-xs font-bold">Unpublish</button>
                    ) : (
                      <button onClick={() => handlePublish(blog._id)} className="text-green-600 hover:text-green-800 dark:text-green-400 text-xs font-bold">Publish</button>
                    )}
                    <button onClick={() => handleToggleFeatured(blog._id)} title="Toggle Featured">
                      <Star className={`w-4 h-4 ${blog.isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                    </button>
                    <button onClick={() => handleTogglePinned(blog._id)} title="Toggle Pinned">
                      <Pin className={`w-4 h-4 ${blog.isPinned ? 'text-blue-500 fill-blue-500' : 'text-gray-400'}`} />
                    </button>
                    <button onClick={() => handleDelete(blog._id)} className="text-red-600 hover:text-red-800 dark:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {blogs.map((blog) => (
        <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <img src={blog.featuredImage || '/default_banner.png'} alt={blog.title} className="w-full h-40 rounded-lg object-cover mb-3" />
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{blog.title}</h3>
            {getStatusBadge(blog.status)}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
            <span>{blog.exam?.name || 'N/A'}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likes || 0}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDate(blog.createdAt)}</div>
          <div className="mt-3 flex items-center gap-2">
            <Link href={`/admin/blogs/${blog._id}/edit`} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">Edit</Link>
            {blog.status === 'published' ? (
              <button onClick={() => handleUnpublish(blog._id)} className="text-orange-600 dark:text-orange-400 text-xs font-bold">Unpublish</button>
            ) : (
              <button onClick={() => handlePublish(blog._id)} className="text-green-600 dark:text-green-400 text-xs font-bold">Publish</button>
            )}
            <button onClick={() => handleToggleFeatured(blog._id)}>
              <Star className={`w-4 h-4 ${blog.isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
            </button>
            <button onClick={() => handleTogglePinned(blog._id)}>
              <Pin className={`w-4 h-4 ${blog.isPinned ? 'text-blue-500 fill-blue-500' : 'text-gray-400'}`} />
            </button>
            <button onClick={() => handleDelete(blog._id)} className="text-red-600 dark:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {blogs.map((blog) => (
        <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-start gap-4">
          <img src={blog.featuredImage || '/default_banner.png'} alt={blog.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{blog.title}</h3>
              {getStatusBadge(blog.status)}
              {blog.isFeatured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
              {blog.isPinned && <Pin className="w-3 h-3 text-blue-500 fill-blue-500" />}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex gap-4">
              <span>{blog.exam?.name || 'N/A'}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views || 0}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likes || 0}</span>
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Link href={`/admin/blogs/${blog._id}/edit`} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">Edit</Link>
              {blog.status === 'published' ? (
                <button onClick={() => handleUnpublish(blog._id)} className="text-orange-600 dark:text-orange-400 text-xs font-bold">Unpublish</button>
              ) : (
                <button onClick={() => handlePublish(blog._id)} className="text-green-600 dark:text-green-400 text-xs font-bold">Publish</button>
              )}
              <button onClick={() => handleDelete(blog._id)} className="text-red-600 dark:text-red-400 text-xs font-bold">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isMounted) return null;

  return (<div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
              <div className="space-y-4">
                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  BLOG <span className="text-indigo-600">POSTS</span>
                </h1>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Create and manage blog posts for exam preparation.
                </p>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-3">
                <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['table', 'list', 'grid']} />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin/blogs/create')}
                  className="w-full lg:w-auto px-4 lg:px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                >
                  <Plus className="w-4 h-4" /> NEW BLOG
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Search</label>
                <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search blogs..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Exam</label>
                <select name="exam" value={filters.exam} onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value="">All Exams</option>
                  {exams.map(exam => (
                    <option key={exam._id} value={exam._id}>{exam.name} ({exam.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Featured</label>
                <select name="isFeatured" value={filters.isFeatured} onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value="">All</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Pinned</label>
                <select name="isPinned" value={filters.isPinned} onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value="">All</option>
                  <option value="true">Pinned</option>
                  <option value="false">Not Pinned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Per Page</label>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading blogs..." />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No blogs found</p>
            </div>
          ) : (
            <>
              {viewMode === 'table' && renderTableView()}
              {viewMode === 'list' && renderListView()}
              {viewMode === 'grid' && renderGridView()}
            </>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
              />
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

export default AdminBlogs;
