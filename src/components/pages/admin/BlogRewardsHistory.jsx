'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";
import SearchFilter from "../../SearchFilter";
import ViewToggle from "../../ViewToggle";
import API from '../../../lib/api';
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import { isMobile } from 'react-device-detect';

const PAGE_LIMIT = 20;

export default function BlogRewardsHistory() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
      }
    } catch (e) { }
    return isMobile ? 'grid' : 'table';
  });

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchBlogRewardsHistory(page, limit, debouncedSearch, filterType);
  }, [debouncedSearch, page, limit, filterType]);

  const fetchBlogRewardsHistory = async (page = 1, limit = 20, search = "", tier = "all") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        rewardTier: tier,
      };

      if (search) {
        params.search = search;
      }

      const response = await API.getAdminBlogRewardsHistory(params);

      if (response?.success) {
        setTransactions(response.data?.transactions || []);
        setPagination(response.data?.pagination || {});
        setSummary(response.data?.summary || null);
      } else {
        setError(response?.message || 'Failed to fetch blog rewards history');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch blog rewards history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
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
    return labels[tier] || tier;
  };

  const getRewardTierColor = (tier) => {
    const colors = {
      'normal': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'good': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'high': 'bg-purple-100 text-yellow-800 dark:bg-purple-900 dark:text-yellow-200',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

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

  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Blog Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Reward Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Balance After
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((tx) => (
              <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  {tx.article?.featuredImage ? (
                    <img
                      src={tx.article.featuredImage}
                      alt={tx.article.title || 'Blog image'}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = '/default_banner.png';
                      }}
                    />
                  ) : (
                    <img
                      src="/default_banner.png"
                      alt="Default blog image"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(tx.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tx.user?._id ? (
                    <Link
                      href={`/admin/blog-rewards-history/user/${tx.user._id}`}
                      className="hover:underline"
                    >
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
                        {tx.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {tx.user?.email || 'N/A'}
                      </div>
                    </Link>
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {tx.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {tx.user?.email || 'N/A'}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {tx.article ? (
                    <Link
                      href={`/admin/articles/${tx.article._id}/edit`}
                      className="hover:underline"
                    >
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        {tx.article.title || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tx.article.category || 'Uncategorized'}
                      </div>
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRewardTierColor(tx.rewardTier)}`}>
                    {getRewardTierLabel(tx.rewardTier)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                  +₹{tx.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ₹{tx.balance?.toLocaleString() || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-start gap-4">
            {tx.article?.featuredImage ? (
              <img
                src={tx.article.featuredImage}
                alt={tx.article.title || 'Blog image'}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.src = '/default_banner.png';
                }}
              />
            ) : (
              <img
                src="/default_banner.png"
                alt="Default blog image"
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {tx.article ? (
                  <Link
                    href={`/admin/articles/${tx.article._id}/edit`}
                    className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {tx.article.title || 'N/A'}
                  </Link>
                ) : (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">N/A</h3>
                )}
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRewardTierColor(tx.rewardTier)}`}>
                  {getRewardTierLabel(tx.rewardTier)}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-4">
                {tx.user?._id ? (
                  <Link
                    href={`/admin/blog-rewards-history/user/${tx.user._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                  >
                    User: {tx.user?.name || 'N/A'} ({tx.user?.email || 'N/A'})
                  </Link>
                ) : (
                  <span>User: {tx.user?.name || 'N/A'} ({tx.user?.email || 'N/A'})</span>
                )}
                {tx.article && (
                  <span>Category: {tx.article.category || 'Uncategorized'}</span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Date: {formatDate(tx.date)}
              </div>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Amount: +₹{tx.amount}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Balance: ₹{tx.balance?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {transactions.map((tx) => (
        <div key={tx._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="mb-3">
            {tx.article?.featuredImage ? (
              <img
                src={tx.article.featuredImage}
                alt={tx.article.title || 'Blog image'}
                className="w-full h-40 rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = '/default_banner.png';
                }}
              />
            ) : (
              <img
                src="/default_banner.png"
                alt="Default blog image"
                className="w-full h-40 rounded-lg object-cover"
              />
            )}
          </div>
          <div className="flex flex-col items-start justify-between gap-2 mb-2">
            {tx.article ? (
              <Link
                href={`/admin/articles/${tx.article._id}/edit`}
                className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 line-clamp-2 flex-1"
              >
                {tx.article.title || 'N/A'}
              </Link>
            ) : (
              <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">N/A</h3>
            )}
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRewardTierColor(tx.rewardTier)} flex-shrink-0`}>
              {getRewardTierLabel(tx.rewardTier)}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {tx.user?._id ? (
              <Link
                href={`/admin/blog-rewards-history/user/${tx.user._id}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
              >
                <div>User: {tx.user?.name || 'N/A'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tx.user?.email || 'N/A'}</div>
              </Link>
            ) : (
              <>
                <div>User: {tx.user?.name || 'N/A'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tx.user?.email || 'N/A'}</div>
              </>
            )}
          </div>
          {tx.article && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Category: {tx.article.category || 'Uncategorized'}
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Date: {formatDate(tx.date)}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +₹{tx.amount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance: ₹{tx.balance?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Blog Rewards History">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Blog Rewards History
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View all blog reward transactions
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['table', 'list', 'grid']} />
                <select
                  value={filterType}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Tiers</option>
                  <option value="normal">Normal Blog (₹5)</option>
                  <option value="good">Good Blog (₹10)</option>
                  <option value="high">High Blog (₹15)</option>
                </select>
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                  placeholder="Search by name, email, blog title..."
                />
              </div>
            </div>

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Blogs</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {summary.totalBlogs?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Blogs with rewards
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Rewards</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{summary.totalRewards?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {summary.totalTransactions || 0} transactions
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Normal Blog</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{summary.normalRewards?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Good Blog</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{summary.goodRewards?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">High Blog</div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-yellow-400">
                    ₹{summary.highRewards?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loading size="lg" color="yellow" message="" />
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
                  No blog reward transactions found
                </h3>
              </div>
            ) : (
              viewMode === 'table' ? renderTableView() :
                viewMode === 'list' ? renderListView() :
                  renderGridView()
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.totalItems}
                itemsPerPage={limit}
              />
            )}
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
}

