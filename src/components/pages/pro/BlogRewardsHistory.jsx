'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../../Pagination";
import API from '../../../lib/api';
import UnifiedFooter from "../../UnifiedFooter";
import Loading from "../../Loading";
import ViewToggle from "../../ViewToggle";
import { useSSR } from '../../../hooks/useSSR';
import { FaBook, FaRupeeSign, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';

const PAGE_LIMIT = 20;

export default function BlogRewardsHistory() {
  const { isMounted, isRouterReady, router } = useSSR();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState(null);
  const [blogCount, setBlogCount] = useState({
    currentCount: 0,
    limit: 10,
    remaining: 10,
    canAddMore: true
  });
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
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
    if (isMounted) {
      fetchBlogRewardsHistory(page, limit);
      fetchCurrentMonthBlogCount();
    }
  }, [isMounted, page, limit]);

  const fetchBlogRewardsHistory = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
      };

      const response = await API.getBlogRewardsHistory(params);

      if (response?.success) {
        setTransactions(response.data?.transactions || []);
        setPagination(response.data?.pagination || {});
        setSummary(response.data?.summary || null);
      } else {
        const errorMsg = response?.message || response?.error || 'Failed to fetch blog rewards history';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching blog rewards history:', err);
      console.error('Error details:', {
        message: err?.message,
        response: err?.response,
        status: err?.response?.status,
        data: err?.response?.data
      });
      const errorMessage = err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to fetch blog rewards history. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRewardTierLabel = (tier) => {
    const labels = {
      'normal': 'Normal Blog - ₹5',
      'good': 'Good Blog - ₹10',
      'high': 'High Blog - ₹15',
    };
    return labels[tier] || tier || 'Unknown';
  };

  const getRewardTierColor = (tier) => {
    const colors = {
      'normal': 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
      'good': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'high': 'bg-purple-100 text-primary-800 dark:bg-purple-900 dark:text-primary-200',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="container mx-auto px-0 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between mb-2">
            {/* Header */}
            <div className="mb-2">
              <h2 className="text-xl lg:text-2xl xl:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📝 Blog Rewards History
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View your earnings from approved blogs
              </p>
            </div>

            {/* View Toggle */}
            {!loading && !error && transactions.length > 0 && (
              <div className="mb-4 flex justify-end">
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

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Blog Earnings</div>
                    <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                      ₹{summary.totalEarnings?.toLocaleString('en-IN') || 0}
                    </div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                    <FaRupeeSign className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Blogs Rewarded</div>
                    <div className="text-2xl md:text-3xl font-bold text-secondary-600 dark:text-secondary-400">
                      {summary.totalBlogs || 0}
                    </div>
                  </div>
                  <div className="bg-secondary-100 dark:bg-secondary-900/30 rounded-full p-4">
                    <FaBook className="text-2xl text-secondary-600 dark:text-secondary-400" />
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loading size="lg" color="blue" message="" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Error loading blog rewards history
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                📝
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No blog rewards found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start creating blogs to earn rewards!
              </p>
              <button
                onClick={() => router.push('/pro/create-blog')}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all"
              >
                Create Your First Blog
              </button>
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gradient-to-r from-primary-500 to-secondary-500">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Blog
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Reward Tier
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Balance After
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.map((tx, index) => (
                          <tr key={tx._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-12 w-12">
                                  {tx.article?.featuredImage ? (
                                    <img
                                      className="h-12 w-12 rounded-lg object-cover"
                                      src={tx.article.featuredImage}
                                      alt={tx.articleTitle || 'Blog Image'}
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
                                    {tx.articleTitle || 'Unknown Blog'}
                                  </div>
                                  {tx.article?.status && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Status: {tx.article.status}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRewardTierColor(tx.rewardTier)}`}>
                                {getRewardTierLabel(tx.rewardTier)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                +₹{tx.amount?.toLocaleString('en-IN') || 0}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                ₹{tx.balance?.toLocaleString('en-IN') || 0}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(tx.createdAt)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                      <Pagination
                        currentPage={pagination.page || 1}
                        totalPages={pagination.pages || 1}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx._id || index}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Blog Image */}
                        <div className="flex-shrink-0">
                          <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {tx.article?.featuredImage ? (
                              <img
                                src={tx.article.featuredImage}
                                alt={tx.articleTitle || 'Blog Image'}
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
                                    e.target.parentElement.innerHTML = '<span class="text-gray-400 text-2xl">📝</span>';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Blog Content */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                {tx.articleTitle || 'Unknown Blog'}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getRewardTierColor(tx.rewardTier)}`}>
                                {getRewardTierLabel(tx.rewardTier)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <FaRupeeSign className="text-green-600 dark:text-green-400" />
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  +₹{tx.amount?.toLocaleString('en-IN') || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Balance:</span>
                                <span className="font-medium">₹{tx.balance?.toLocaleString('en-IN') || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaCalendarAlt className="text-gray-400" />
                                <span>{formatDate(tx.createdAt)}</span>
                              </div>
                            </div>
                            {tx.article?.status && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Status: {tx.article.status}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3 border border-gray-200 dark:border-gray-700">
                      <Pagination
                        currentPage={pagination.page || 1}
                        totalPages={pagination.pages || 1}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx._id || index}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
                    >
                      {/* Blog Image */}
                      <div className="mb-3">
                        <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {tx.article?.featuredImage ? (
                            <img
                              src={tx.article.featuredImage}
                              alt={tx.articleTitle || 'Blog Image'}
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
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                          {tx.articleTitle || 'Unknown Blog'}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getRewardTierColor(tx.rewardTier)}`}>
                          {getRewardTierLabel(tx.rewardTier)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Reward Amount</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            +₹{tx.amount?.toLocaleString('en-IN') || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Balance After</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ₹{tx.balance?.toLocaleString('en-IN') || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <FaCalendarAlt />
                          <span>{formatDate(tx.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3 border border-gray-200 dark:border-gray-700 mt-4">
                      <Pagination
                        currentPage={pagination.page || 1}
                        totalPages={pagination.pages || 1}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
}

