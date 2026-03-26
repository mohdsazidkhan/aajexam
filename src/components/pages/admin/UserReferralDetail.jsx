'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";
import API from '../../../lib/api';
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import Link from 'next/link';

const PAGE_LIMIT = 20;

export default function UserReferralDetail() {
  const { isMounted, isRouterReady, router } = useSSR();
  const searchParams = useSearchParams();
  const userId = searchParams?.get('userId');

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState(null);

  const userInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchUserReferralHistory(page, limit);
    }
  }, [userId, page, limit]);

  const fetchUserDetails = async () => {
    try {
      const response = await API.getAdminUserDetails({ userId });
      if (response?.success) {
        if (response.user) {
          setUser(response.user);
        } else if (response.data?.user) {
          setUser(response.data.user);
        }
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const fetchUserReferralHistory = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        userId,
      };

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

  const handlePageChange = (newPage) => {
    setPage(newPage);
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

  if (!userId) {
    return (
      <AdminMobileAppWrapper title="User Referral Detail">
        <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
          {userInfo?.role === "admin" && isAdminRoute && <Sidebar />}
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                User ID not provided
              </h3>
              <Link href="/admin/referral-history" className="text-secondary-600 dark:text-secondary-400 hover:underline">
                ← Back to Referral History
              </Link>
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="User Referral Detail">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {userInfo?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <Link href="/admin/referral-history" className="text-secondary-600 dark:text-secondary-400 hover:underline mb-2 inline-block">
                  ← Back to Referral History
                </Link>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  User Referral History
                </h2>
                {user && (
                  <div className="mt-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">{user.name}</span> ({user.email})
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Referral Code: <span className="font-mono">{user.referralCode}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* User Stats */}
            {user && (() => {
              // Calculate total earnings from referral rewards (this is the accurate amount)
              const totalEarnings = user.referralRewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
              // Use totalEarnings for wallet balance display to ensure they match
              const displayWalletBalance = totalEarnings;

              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Wallet Balance</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{displayWalletBalance.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      From Referrals Only
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Referral Count</div>
                    <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                      {user.referralCount || 0}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Rewards</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {user.referralRewards?.length || 0}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Referred By</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.referredBy || 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Earnings Breakdown */}
            {user && (() => {
              // Calculate total from referral rewards to ensure accuracy
              const totalFromRegistrations = user.referralRewards?.filter(r => r.type === 'registration').reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
              const totalFromPlan9 = user.referralRewards?.filter(r => r.type === 'plan9').reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
              const totalFromPlan49 = user.referralRewards?.filter(r => r.type === 'plan49').reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
              const totalFromPlan99 = user.referralRewards?.filter(r => r.type === 'plan99').reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
              const totalEarnings = totalFromRegistrations + totalFromPlan9 + totalFromPlan49 + totalFromPlan99;

              return (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    💰 Earnings Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Earnings</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{totalEarnings.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {user.referralRewards?.length || 0} rewards
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg p-4 border border-primary-200 dark:border-primary-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">From Registrations</div>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{totalFromRegistrations.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {user.referralRewards?.filter(r => r.type === 'registration').length || 0} registrations
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">From ₹9 Plans</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{totalFromPlan9.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {user.referralRewards?.filter(r => r.type === 'plan9').length || 0} purchases
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">From ₹49 Plans</div>
                      <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                        ₹{totalFromPlan49.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {user.referralRewards?.filter(r => r.type === 'plan49').length || 0} purchases
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 from-red-100 dark:from-purple-900/30 dark:from-red-800/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">From ₹99 Plans</div>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{totalFromPlan99.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {user.referralRewards?.filter(r => r.type === 'plan99').length || 0} purchases
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

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
                  No referral transactions found for this user
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

