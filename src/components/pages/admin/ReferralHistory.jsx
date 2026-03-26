'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";
import SearchFilter from "../../SearchFilter";
import API from '../../../lib/api';
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';

const PAGE_LIMIT = 20;

export default function ReferralHistory() {
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

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchReferralHistory(page, limit, debouncedSearch, filterType);
  }, [debouncedSearch, page, limit, filterType]);

  const fetchReferralHistory = async (page = 1, limit = 20, search = "", type = "all") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        type,
      };

      if (search) {
        params.search = search;
      }

      const response = await API.getAdminReferralHistory(params);

      if (response?.success) {
        setTransactions(response.data?.transactions || []);
        setPagination(response.data?.pagination || {});
        setSummary(response.data?.summary || null);
      } else {
        setError(response?.message || 'Failed to fetch referral history');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch referral history');
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

  const getRewardTypeLabel = (type) => {
    const labels = {
      'registration': 'Friend Registration',
      'plan9': 'Friend Purchased ₹9 Plan',
      'plan49': 'Friend Purchased ₹49 Plan',
      'plan99': 'Friend Purchased ₹99 Plan',
    };
    return labels[type] || type;
  };

  const getRewardTypeColor = (type) => {
    const colors = {
      'registration': 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      'plan9': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'plan49': 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
      'plan99': 'bg-purple-100 text-primary-800 dark:bg-purple-900 dark:text-primary-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <AdminMobileAppWrapper title="Referral History">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Referral History
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View all referral reward transactions
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filterType}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="registration">Registration (₹10)</option>
                  <option value="plan9">₹9 Plan (₹3)</option>
                  <option value="plan49">₹49 Plan (₹15)</option>
                  <option value="plan99">₹99 Plan (₹33)</option>
                </select>
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                  placeholder="Search by name, email..."
                />
              </div>
            </div>

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">Registration</div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{summary.registrationRewards?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">₹9 Plan</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{summary.plan9Rewards?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">₹49 Plan</div>
                  <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                    ₹{summary.plan49Rewards?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">₹99 Plan</div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{summary.plan99Rewards?.toLocaleString() || 0}
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
                  Error loading referral history
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                  📊
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No referral transactions found
                </h3>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Inviter (Reward Receiver)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Invitee (Friend)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reward Type
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/admin/user-referral-detail?userId=${tx.inviter?._id}`}
                              className="hover:underline"
                            >
                              <div>
                                <div className="text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300">
                                  {tx.inviter?.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {tx.inviter?.email || 'N/A'}
                                </div>
                                {tx.inviter?.referralCode && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    Code: {tx.inviter.referralCode}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.invitee ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {tx.invitee.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {tx.invitee.email || 'N/A'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRewardTypeColor(tx.rewardType)}`}>
                              {getRewardTypeLabel(tx.rewardType)}
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

