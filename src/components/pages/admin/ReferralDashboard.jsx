'use client';

import { useEffect, useState } from "react";
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

export default function ReferralDashboard() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({});

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchReferrals(page, limit, debouncedSearch);
  }, [debouncedSearch, page, limit]);

  const fetchReferrals = async (page = 1, limit = 20, search = "") => {
    try {
      setLoading(true);
      // This will need to be implemented in the backend
      // For now, we'll fetch from user details and filter
      const response = await API.getAdminUserDetails({
        page,
        limit,
        search,
      });
      
      if (response?.success) {
        // Filter users who have referral rewards or referredBy
        const usersWithReferrals = response.data?.users?.filter(u => 
          u.referralRewards?.length > 0 || u.referredBy
        ) || [];
        
        setReferrals(usersWithReferrals);
        setPagination(response.data?.pagination || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch referrals');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  return (
    <AdminMobileAppWrapper title="Referral Dashboard">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Referral Dashboard ({pagination.total || 0})
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View all referrals and reward transactions
                </p>
              </div>
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                placeholder="Search by name, email, referral code..."
              />
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loading size="lg" color="yellow" message="" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Error loading referrals
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                  👥
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No referrals found
                </h3>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Referral Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Referred By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Wallet Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rewards
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {referrals.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {user.referralCode || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.referredBy || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            ₹{user.walletBalance || 0}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {user.referralRewards?.length > 0 ? (
                                <div className="space-y-1">
                                  {user.referralRewards.slice(0, 3).map((reward, idx) => (
                                    <div key={idx} className="text-xs">
                                      {getRewardTypeLabel(reward.type)}: ₹{reward.amount}
                                    </div>
                                  ))}
                                  {user.referralRewards.length > 3 && (
                                    <div className="text-xs text-gray-500">
                                      +{user.referralRewards.length - 3} more
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">No rewards</span>
                              )}
                            </div>
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
                totalItems={pagination.total}
                itemsPerPage={limit}
              />
            )}
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
}

