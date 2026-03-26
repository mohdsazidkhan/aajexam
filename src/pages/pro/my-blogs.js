'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import API from '../../lib/api';
// MobileAppWrapper import removed
import UnifiedFooter from '../../components/UnifiedFooter';
import ViewToggle from '../../components/ViewToggle';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaHistory, FaTrash } from 'react-icons/fa';
import { isMobile } from 'react-device-detect';

const MyBlogsPage = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [blogCount, setBlogCount] = useState({
    currentCount: 0,
    limit: 10,
    remaining: 10,
    canAddMore: true
  });
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (isMobile || window.innerWidth < 768) ? 'list' : 'table';
    }
    return isMobile ? 'list' : 'table';
  });

  const fetchCurrentMonthBlogCount = async () => {
    try {
      const response = await API.getCurrentMonthBlogCount();
      if (response.success && response.data) {
        setBlogCount(response.data);
      }
    } catch (error) {
      console.error('Error fetching current month blog count:', error);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCurrentMonthBlogCount();
  }, [statusFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await API.getMyBlogs(params);
      if (response.success) {
        setBlogs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId, blogTitle) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await API.deleteBlog(blogId);
      if (response.success) {
        toast.success('Blog deleted successfully');
        // Refresh the list
        fetchBlogs();
      } else {
        toast.error(response.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete blog';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-primary-100 text-primary-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      published: { color: 'bg-secondary-100 text-secondary-800', text: 'Published' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRewardTierBadge = (rewardTier, rewardAmount) => {
    if (!rewardTier) return null;
    const tierConfig = {
      normal: { color: 'bg-green-100 text-green-800', text: 'Normal ₹5' },
      good: { color: 'bg-secondary-100 text-secondary-800', text: 'Good ₹10' },
      high: { color: 'bg-purple-100 text-primary-800', text: 'High ₹15' }
    };
    const config = tierConfig[rewardTier];
    if (!config) return null;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} ml-2`}>
        {config.text}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>My Blogs - AajExam</title>
      </Head>
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark py-4 lg:py-8 px-4">
        <div className="container mx-auto py-0 px-0 lg:px-10">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                📝 My Blogs
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your blog submissions and track rewards
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/pro/blog-rewards-history"
                className="flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 lg:py-2 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600"
              >
                <FaHistory className="mr-2" />
                Rewards History
              </Link>
              <Link
                href="/pro/create-blog"
                className="flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 lg:py-2 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600"
              >
                <FaPlus className="mr-2" />
                Create Blog
              </Link>
            </div>
            {/* View Toggle */}
            {!loading && blogs.length > 0 && (
              <div className="flex justify-end">
                <ViewToggle
                  currentView={viewMode}
                  onViewChange={setViewMode}
                  views={['table', 'list', 'grid']}
                />
              </div>
            )}
          </div>

          {/* Monthly Blog Limit Info */}
          <div className={`mb-4 lg:mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border ${!blogCount.canAddMore
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
            : 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${!blogCount.canAddMore
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-primary-800 dark:text-primary-300'
                  }`}>
                  Monthly Blog Limit
                </p>
                <p className={`text-xs mt-1 ${!blogCount.canAddMore
                  ? 'text-primary-600 dark:text-red-400'
                  : 'text-primary-700 dark:text-primary-400'
                  }`}>
                  {blogCount.currentCount} / {blogCount.limit} blogs this month
                  {blogCount.canAddMore && ` (${blogCount.remaining} remaining)`}
                </p>
              </div>
              {!blogCount.canAddMore && (
                <span className="text-primary-600 dark:text-red-400 font-semibold text-sm">
                  Limit Reached
                </span>
              )}
            </div>
          </div>

          {/* Status Filter and View Toggle */}
          <div className="mb-4 lg:mb-6 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-0 lg:p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'approved', 'rejected', 'published'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2 lg:px-4 py-1 lg:py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>


          </div>

          {/* Blogs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading blogs...</div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No blogs found. Create your first blog to start earning rewards!
              </p>
              <Link
                href="/pro/create-blog"
                className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600"
              >
                <FaPlus className="mr-2" />
                Create Blog
              </Link>
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-12 lg:mb-2">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gradient-to-r from-primary-500 to-secondary-500">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Blog
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Reward
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {blogs.map((blog) => (
                          <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-12 w-12">
                                  {blog.featuredImage ? (
                                    <img
                                      className="h-12 w-12 rounded-lg object-cover"
                                      src={blog.featuredImage}
                                      alt={blog.title || 'Blog Image'}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/default_banner.png';
                                      }}
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                      <img
                                        src="/default_banner.png"
                                        alt="Default Blog Image"
                                        className="h-12 w-12 rounded-lg object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.style.display = 'none';
                                          e.target.parentElement.innerHTML = '<span class="text-gray-400 text-xl">📝</span>';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {blog.title}
                                  </div>
                                  {blog.excerpt && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {blog.excerpt}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStatusBadge(blog.status)}
                              {getRewardTierBadge(blog.rewardTier, blog.rewardAmount)}
                              {blog.rewardCredited && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2" title="Reward credited">
                                  💰
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {blog.category?.name || 'Uncategorized'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {blog.rewardAmount ? (
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  ₹{blog.rewardAmount}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {blog.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => router.push(`/pro/create-blog?edit=${blog._id}`)}
                                    className="bg-secondary-500 text-white px-3 py-1 rounded hover:bg-secondary-600"
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBlog(blog._id, blog.title)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4 mb-12 lg:mb-2">
                  {blogs.map((blog) => (
                    <div
                      key={blog._id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-2 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Blog Image */}
                        <div className="flex-shrink-0">
                          <div className="w-full md:w-32 lg:w-40 h-32 md:h-32 lg:h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {blog.featuredImage ? (
                              <img
                                src={blog.featuredImage}
                                alt={blog.title || 'Blog Image'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/default_banner.png';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                <img
                                  src="/default_banner.png"
                                  alt="Default Blog Image"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<span class="text-gray-400 text-4xl">📝</span>';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Blog Content */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-2">
                                <h3 className="text-md lg:text-xl font-semibold text-gray-900 dark:text-white">
                                  {blog.title}
                                </h3>
                                {getStatusBadge(blog.status)}
                                {getRewardTierBadge(blog.rewardTier, blog.rewardAmount)}
                                {blog.rewardCredited && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" title="Reward credited">
                                    💰 Credited
                                  </span>
                                )}
                              </div>
                              {blog.excerpt && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                  {blog.excerpt}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>Category: {blog.category?.name || 'Uncategorized'}</span>
                                <span>
                                  Created: {new Date(blog.createdAt).toLocaleDateString()}
                                </span>
                                {blog.rewardAmount && (
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    Reward: ₹{blog.rewardAmount}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Edit and Delete buttons - only show if status is pending */}
                            {blog.status === 'pending' && (
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => router.push(`/pro/create-blog?edit=${blog._id}`)}
                                  className="flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-2 lg:px-4 py-1 lg:py-2 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-md hover:shadow-lg"
                                  title="Edit Blog"
                                >
                                  <FaEdit className="mr-2" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(blog._id, blog.title)}
                                  className="flex items-center justify-center bg-gradient-to-r from-red-500 to-secondary-600 text-white px-2 lg:px-4 py-1 lg:py-2 rounded-lg font-medium hover:from-red-600 hover:to-secondary-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                  title="Delete Blog"
                                >
                                  <FaTrash className="mr-2" />
                                  <span className="hidden sm:inline">Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 lg:mb-2">
                  {blogs.map((blog) => (
                    <div
                      key={blog._id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
                    >
                      {/* Blog Image */}
                      <div className="mb-3">
                        <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {blog.featuredImage ? (
                            <img
                              src={blog.featuredImage}
                              alt={blog.title || 'Blog Image'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default_banner.png';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <img
                                src="/default_banner.png"
                                alt="Default Blog Image"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<span class="text-gray-400 text-4xl">📝</span>';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Blog Content */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                            {blog.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(blog.status)}
                          {getRewardTierBadge(blog.rewardTier, blog.rewardAmount)}
                          {blog.rewardCredited && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" title="Reward credited">
                              💰
                            </span>
                          )}
                        </div>
                        {blog.excerpt && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {blog.excerpt}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <div>Category: {blog.category?.name || 'Uncategorized'}</div>
                          <div>Created: {new Date(blog.createdAt).toLocaleDateString()}</div>
                          {blog.rewardAmount && (
                            <div className="text-green-600 dark:text-green-400 font-medium">
                              Reward: ₹{blog.rewardAmount}
                            </div>
                          )}
                        </div>
                        {blog.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => router.push(`/pro/create-blog?edit=${blog._id}`)}
                              className="flex-1 flex items-center justify-center bg-secondary-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary-600"
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog._id, blog.title)}
                              className="flex-1 flex items-center justify-center bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default MyBlogsPage;

