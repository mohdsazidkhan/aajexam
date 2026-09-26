'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import API from '../../../lib/api';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import ResponsiveTable from '../../ResponsiveTable';
import StyledSelect from '../../ui/StyledSelect';
import { getCurrentUser } from '../../../utils/authUtils';
import { useSSR } from '../../../hooks/useSSR';
import { toast } from 'react-hot-toast';
import { Plus, Eye, Heart, Pin, Star, Trash2, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from "../../Sidebar";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

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
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState('table');
  const user = getCurrentUser();

  useEffect(() => {
    try {
      if (window.innerWidth < 768) setViewMode('grid');
    } catch (e) { }
  }, []);

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

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
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
      published: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
      draft: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg[status] || cfg.draft}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const blogTableColumns = [
    {
      key: 'blog', header: 'Blog', render: (_, blog) => (
        <div className="flex items-center">
          <img className="h-10 w-10 rounded-lg object-cover" src={blog.featuredImage || '/default_banner.png'} alt={blog.title} />
          <div className="ml-3 max-w-xs">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={blog.title}>
              {blog.title}
              {blog.isFeatured && <Star className="inline w-3 h-3 ml-1 text-black dark:text-white fill-black dark:fill-white" />}
              {blog.isPinned && <Pin className="inline w-3 h-3 ml-1 text-black dark:text-white fill-black dark:fill-white" />}
            </div>
            <div className="text-xs text-black dark:text-white mt-0.5 max-w-[220px] truncate" title={`/blog/${blog.slug}`}><code>/blog/{blog.slug}</code></div>
          </div>
        </div>
      )
    },
    {
      key: 'exam', header: 'Exam', render: (_, blog) => blog.exam?.name || 'N/A'
    },
    {
      key: 'status', header: 'Status', render: (_, blog) => getStatusBadge(blog.status)
    },
    {
      key: 'stats', header: 'Stats', render: (_, blog) => (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views || 0}</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likes || 0}</span>
        </div>
      )
    },
    {
      key: 'date', header: 'Date', render: (_, blog) => formatDate(blog.createdAt)
    },
    {
      key: 'actions', header: 'Actions', render: (_, blog) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/blogs/${blog._id}/edit`} className="text-primary-600 hover:text-primary-800 dark:text-primary-400">
            <Edit3 className="w-4 h-4" />
          </Link>
          {blog.status === 'published' ? (
            <button onClick={() => handleUnpublish(blog._id)} className="text-black dark:text-white hover:text-black dark:hover:text-white text-xs font-bold">Unpublish</button>
          ) : (
            <button onClick={() => handlePublish(blog._id)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 text-xs font-bold">Publish</button>
          )}
          <button onClick={() => handleToggleFeatured(blog._id)} title="Toggle Featured">
            <Star className={`w-4 h-4 ${blog.isFeatured ? 'text-black dark:text-white fill-black dark:fill-white' : 'text-gray-400'}`} />
          </button>
          <button onClick={() => handleTogglePinned(blog._id)} title="Toggle Pinned">
            <Pin className={`w-4 h-4 ${blog.isPinned ? 'text-black dark:text-white fill-black dark:fill-white' : 'text-gray-400'}`} />
          </button>
          <button onClick={() => handleDelete(blog._id)} className="text-black dark:text-white hover:text-black dark:hover:text-white">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 min-h-0 overflow-auto flex flex-col">
      <ResponsiveTable
        data={blogs}
        columns={blogTableColumns}
        viewModes={['table']}
        defaultView="table"
        showPagination={false}
        showViewToggle={false}
        fillHeight
      />
    </div>
  );

  const renderGridView = () => (
    <div className="flex-1 min-h-0 overflow-auto grid content-start items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {blogs.map((blog, idx) => {
        const serialNumber = (currentPage - 1) * itemsPerPage + idx + 1;
        return (
        <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="relative mb-3">
            <img src={blog.featuredImage || '/default_banner.png'} alt={blog.title} className="w-full h-40 rounded-lg object-cover" />
            <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10">{serialNumber}</span>
          </div>
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
            <Link href={`/admin/blogs/${blog._id}/edit`} className="text-primary-600 text-xs font-bold">Edit</Link>
            {blog.status === 'published' ? (
              <button onClick={() => handleUnpublish(blog._id)} className="text-black dark:text-white text-xs font-bold">Unpublish</button>
            ) : (
              <button onClick={() => handlePublish(blog._id)} className="text-primary-600 text-xs font-bold">Publish</button>
            )}
            <button onClick={() => handleToggleFeatured(blog._id)}>
              <Star className={`w-4 h-4 ${blog.isFeatured ? 'text-black dark:text-white fill-black dark:fill-white' : 'text-gray-400'}`} />
            </button>
            <button onClick={() => handleTogglePinned(blog._id)}>
              <Pin className={`w-4 h-4 ${blog.isPinned ? 'text-black dark:text-white fill-black dark:fill-white' : 'text-gray-400'}`} />
            </button>
            <button onClick={() => handleDelete(blog._id)} className="text-black dark:text-white">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="flex-1 min-h-0 overflow-auto space-y-3">
      {blogs.map((blog, idx) => {
        const serialNumber = (currentPage - 1) * itemsPerPage + idx + 1;
        return (
        <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-start gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <img src={blog.featuredImage || '/default_banner.png'} alt={blog.title} className="w-16 h-16 rounded-lg object-cover" />
            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10">{serialNumber}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{blog.title}</h3>
              {getStatusBadge(blog.status)}
              {blog.isFeatured && <Star className="w-3 h-3 text-black dark:text-white fill-black dark:fill-white" />}
              {blog.isPinned && <Pin className="w-3 h-3 text-black dark:text-white fill-black dark:fill-white" />}
            </div>
            <div className="mt-0.5 text-xs text-black dark:text-white break-all"><code>/blog/{blog.slug}</code></div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex gap-4">
              <span>{blog.exam?.name || 'N/A'}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views || 0}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likes || 0}</span>
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Link href={`/admin/blogs/${blog._id}/edit`} className="text-primary-600 text-xs font-bold">Edit</Link>
              {blog.status === 'published' ? (
                <button onClick={() => handleUnpublish(blog._id)} className="text-black dark:text-white text-xs font-bold">Unpublish</button>
              ) : (
                <button onClick={() => handlePublish(blog._id)} className="text-primary-600 text-xs font-bold">Publish</button>
              )}
              <button onClick={() => handleDelete(blog._id)} className="text-black dark:text-white text-xs font-bold">Delete</button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );

  const searchInput = (
    <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search blogs..."
      className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm w-full" />
  );

  const statusSelect = (
    <StyledSelect
      value={filters.status}
      onChange={(val) => { setFilters(prev => ({ ...prev, status: val })); setCurrentPage(1); }}
      options={[
        { value: '', label: 'All Status' },
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' }
      ]}
      className="w-full"
    />
  );

  const examSelect = (
    <StyledSelect
      value={filters.exam}
      onChange={(val) => { setFilters(prev => ({ ...prev, exam: val })); setCurrentPage(1); }}
      options={[{ value: '', label: 'All Exams' }, ...exams.map(exam => ({ value: exam._id, label: `${exam.name} (${exam.code})` }))]}
      className="w-full"
    />
  );

  const featuredSelect = (
    <StyledSelect
      value={filters.isFeatured}
      onChange={(val) => { setFilters(prev => ({ ...prev, isFeatured: val })); setCurrentPage(1); }}
      options={[
        { value: '', label: 'Featured: All' },
        { value: 'true', label: 'Featured' },
        { value: 'false', label: 'Not Featured' }
      ]}
      className="w-full"
    />
  );

  const pinnedSelect = (
    <StyledSelect
      value={filters.isPinned}
      onChange={(val) => { setFilters(prev => ({ ...prev, isPinned: val })); setCurrentPage(1); }}
      options={[
        { value: '', label: 'Pinned: All' },
        { value: 'true', label: 'Pinned' },
        { value: 'false', label: 'Not Pinned' }
      ]}
      className="w-full"
    />
  );

  const viewToggleButtons = (
    <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['table', 'list', 'grid']} fullWidth />
  );

  const newBlogButton = (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/admin/blogs/create')}
      className="w-full px-4 lg:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2"
    >
      <Plus className="w-4 h-4" /> NEW BLOG
    </motion.button>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={currentPage}
      totalPages={pagination.totalPages || 1}
      onPageChange={(page) => setCurrentPage(page)}
      totalItems={pagination.total || 0}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );

  useAdminMobileHeader({
    title: 'Blog',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {statusSelect}
        {examSelect}
        {featuredSelect}
        {pinnedSelect}
        {viewToggleButtons}
        {newBlogButton}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">


        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No blogs found</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'list' && renderListView()}
            {viewMode === 'grid' && renderGridView()}
          </div>
        )}

        {error && (
          <div className="shrink-0 mt-4 bg-slate-100 dark:bg-slate-800 dark:bg-white/20 border border-slate-200 dark:border-slate-800 dark:border-white rounded-md p-4">
            <p className="text-black dark:text-white">{error}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs;
