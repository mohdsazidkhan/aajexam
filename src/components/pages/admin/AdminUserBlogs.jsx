'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Sidebar from '../../Sidebar';
import Loading from '../../Loading';
import { useSelector } from 'react-redux';
import ViewToggle from '../../ViewToggle';
import { isMobile } from 'react-device-detect';
import { safeLocalStorage } from '../../../lib/utils/storage';
import { toast } from 'react-toastify';
import Button from '../../ui/Button';

const AdminUserBlogs = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    rewardTier: ''
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    rewardTier: ''
  });
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
      }
    } catch (e) { }
    return isMobile ? 'grid' : 'table';
  });

  // Ensure Grid on small screens after mount and on orientation change
  useEffect(() => {
    try {
      const enforceGridOnSmall = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setViewMode('grid');
        }
      };
      enforceGridOnSmall();
      window.addEventListener('orientationchange', enforceGridOnSmall);
      return () => {
        window.removeEventListener('orientationchange', enforceGridOnSmall);
      };
    } catch (e) { }
  }, []);

  const user = (() => {
    const raw = safeLocalStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
  })();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [currentPage, filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };

      const response = await API.getAdminUserBlogs(params);
      if (response?.success) {
        setBlogs(response.blogs || []);
        setPagination(response.pagination || {});
      } else {
        setError('Failed to load user blogs');
      }
    } catch (err) {
      console.error('Error fetching user blogs:', err);
      setError('Failed to load user blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.getAdminCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleViewContent = (blog) => {
    setSelectedBlog(blog);
    setShowContentModal(true);
  };

  const handleStatusChange = (blog) => {
    setSelectedBlog(blog);
    setStatusFormData({
      status: blog.status || 'pending',
      rewardTier: blog.rewardTier || ''
    });
    setShowStatusModal(true);
  };

  // Note: Reward tier is now always visible, but only required when status is 'approved'
  // We don't auto-clear it so admins can see/change it for any status

  const handleStatusSubmit = async () => {
    if (!selectedBlog) return;

    try {
      // Validate: if status is approved, rewardTier must be set
      if (statusFormData.status === 'approved' && !statusFormData.rewardTier) {
        toast.error('Please select a reward tier when approving a blog');
        return;
      }

      // If status is not approved, clear rewardTier
      const updateData = {
        status: statusFormData.status
      };

      if (statusFormData.status === 'approved') {
        updateData.rewardTier = statusFormData.rewardTier;
      } else {
        // Clear reward tier if status is not approved
        updateData.rewardTier = null;
      }

      const response = await API.updateArticle(selectedBlog._id, updateData);

      if (response?.success) {
        toast.success('Blog status updated successfully!');
        setShowStatusModal(false);
        setSelectedBlog(null);
        setStatusFormData({ status: '', rewardTier: '' });
        fetchBlogs();
      } else {
        toast.error(response?.message || 'Failed to update blog status');
      }
    } catch (err) {
      console.error('Error updating blog status:', err);
      toast.error(err?.response?.data?.message || 'Failed to update blog status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await API.deleteArticle(id);
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } catch (err) {
        console.error('Error deleting blog:', err);
        toast.error('Failed to delete blog');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', text: 'Pending', icon: '⏳' },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', text: 'Approved', icon: '✅' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', text: 'Rejected', icon: '❌' },
      published: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', text: 'Published', icon: '📝' },
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: 'Draft', icon: '📄' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getRewardTierBadge = (tier, amount) => {
    if (!tier) return null;
    const tierConfig = {
      normal: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', text: 'Normal ₹5' },
      good: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', text: 'Good ₹10' },
      high: { color: 'bg-purple-100 text-yellow-800 dark:bg-purple-900/30 dark:text-yellow-300', text: 'High ₹15' }
    };
    const config = tierConfig[tier];
    if (!config) return null;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} ml-2`}>
        {config.text}
      </span>
    );
  };

  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                S.No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Blog
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {blogs.map((blog, index) => (
              <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {((currentPage - 1) * 10) + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={blog.featuredImage || '/default_banner.png'}
                        alt={blog.title}
                      />
                    </div>
                    <div className="ml-4 max-w-96" >
                      <div className="text-sm font-medium text-gray-900 dark:text-white" title={blog.title}>
                        {blog.title?.length > 40 ? blog.title?.substring(0, 40) + '...' : blog.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {blog.author?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {blog.category?.name || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center flex-wrap gap-1">
                    {getStatusBadge(blog.status)}
                    {getRewardTierBadge(blog.rewardTier, blog.rewardAmount)}
                    {blog.rewardCredited && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ml-2" title="Reward credited">
                        💰
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-4">
                    <span>👁️ {blog.views || 0}</span>
                    <span>❤️ {blog.likes || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(blog.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(blog.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleViewContent(blog)}
                      variant="admin"
                      size="small"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(blog)}
                      variant="admin"
                      size="small"
                    >
                      Status
                    </Button>
                    <Button
                      onClick={() => handleDelete(blog._id)}
                      variant="danger"
                      size="small"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.page - 1) * pagination.limit) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={blog.featuredImage || '/default_banner.png'}
              alt={blog.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{blog.title}</h3>
                {getStatusBadge(blog.status)}
                {getRewardTierBadge(blog.rewardTier, blog.rewardAmount)}
                {blog.rewardCredited && <span className="text-green-500" title="Reward credited">💰</span>}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-4">
                <span>By {blog.author?.name || 'Unknown'}</span>
                <span>In {blog.category?.name || 'Uncategorized'}</span>
                <span>👁️ {blog.views || 0}</span>
                <span>❤️ {blog.likes || 0}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Created: {formatDate(blog.createdAt)} at {new Date(blog.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Button
                  onClick={() => handleViewContent(blog)}
                  variant="admin"
                  size="small"
                >
                  View
                </Button>
                <Button
                  onClick={() => handleStatusChange(blog)}
                  variant="admin"
                  size="small"
                >
                  Status
                </Button>
                <Button
                  onClick={() => handleDelete(blog._id)}
                  variant="danger"
                  size="small"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {blogs.map((blog) => (
        <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="mb-3">
            <img
              src={blog.featuredImage || '/default_banner.png'}
              alt={blog.title}
              className="w-full h-40 rounded-lg object-cover"
            />
          </div>
          <div className="flex flex-col items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">{blog.title}</h3>
            <div className="flex items-end gap-1">
              {getStatusBadge(blog.status)}
              {getRewardTierBadge(blog.rewardTier, blog.rewardAmount)}
              {blog.rewardCredited && <span className="text-green-500 text-xs" title="Reward credited">💰</span>}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-3">
            <span>{blog.author?.name || 'Unknown'}</span>
            <span>{blog.category?.name || 'Uncategorized'}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
            <span>👁️ {blog.views || 0}</span>
            <span>❤️ {blog.likes || 0}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Created: {new Date(blog.createdAt).toLocaleDateString('en-US')} at {new Date(blog.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Button
              onClick={() => handleViewContent(blog)}
              variant="admin"
              size="small"
            >
              View
            </Button>
            <Button
              onClick={() => handleStatusChange(blog)}
              variant="admin"
              size="small"
            >
              Status
            </Button>
            <Button
              onClick={() => handleDelete(blog._id)}
              variant="danger"
              size="small"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <AdminMobileAppWrapper title="User Blogs">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && <Sidebar />}
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading user blogs..." />
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="User Blogs">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📝 User Blogs ({blogs?.length || 0})
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Review, approve, and manage user-submitted blogs
                </p>
              </div>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['table', 'list', 'grid']} />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search blogs..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reward Tier
                </label>
                <select
                  name="rewardTier"
                  value={filters.rewardTier}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Tiers</option>
                  <option value="normal">Normal ₹5</option>
                  <option value="good">Good ₹10</option>
                  <option value="high">High ₹15</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No user blogs found</p>
            </div>
          ) : (
            viewMode === 'table' ? renderTableView() :
              viewMode === 'list' ? renderListView() :
                renderGridView()
          )}
        </div>
      </div>

      {/* Content Modal */}
      {showContentModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                {selectedBlog.title}
              </h2>
              <button
                onClick={() => {
                  setShowContentModal(false);
                  setSelectedBlog(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-3 lg:p-6">
              <img
                src={selectedBlog.featuredImage || '/default_banner.png'}
                alt={selectedBlog.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Author:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedBlog.author?.name || 'Unknown'} ({selectedBlog.author?.email || 'N/A'})
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedBlog.category?.name || 'Uncategorized'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  {getStatusBadge(selectedBlog.status)}
                </div>
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
                    {selectedBlog.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {selectedBlog.excerpt && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Excerpt:</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedBlog.excerpt}</p>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content:</h3>
                <div
                  className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => {
                    setShowContentModal(false);
                    handleStatusChange(selectedBlog);
                  }}
                  variant="admin"
                >
                  Change Status
                </Button>
                <Button
                  onClick={() => {
                    setShowContentModal(false);
                    setSelectedBlog(null);
                  }}
                  variant="secondary"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Change Blog Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reward Tier {statusFormData.status === 'approved' && '*'}
                  {statusFormData.status === 'approved' && <span className="text-xs text-gray-500">(Required for approval)</span>}
                </label>
                <select
                  value={statusFormData.rewardTier || ''}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, rewardTier: e.target.value || '' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Reward Tier</option>
                  <option value="normal">Normal - ₹5</option>
                  <option value="good">Good - ₹10</option>
                  <option value="high">High - ₹15</option>
                </select>
                {statusFormData.status === 'approved' && !statusFormData.rewardTier && (
                  <p className="mt-1 text-xs text-red-500">Please select a reward tier when approving a blog</p>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleStatusSubmit}
                  variant="admin"
                  fullWidth
                >
                  Update Status
                </Button>
                <Button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedBlog(null);
                    setStatusFormData({ status: '', rewardTier: '' });
                  }}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminMobileAppWrapper>
  );
};

export default AdminUserBlogs;

