'use client';

import React, { useEffect, useState, useCallback } from 'react';
import API from '../../../lib/api';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '../../../utils/authUtils';
import Pagination from '../../Pagination';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';
import Button from '../../ui/Button';

const AdminUserWallets = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [resetting, setResetting] = useState(false);

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const user = getCurrentUser();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: itemsPerPage,
        sortBy: 'amount',
        sortOrder: 'desc'
      };
      if (searchTerm) params.search = searchTerm;
      const res = await API.adminGetUserWallets(params);
      if (res?.success || res) {
        setItems(res.students || res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Failed to load wallets', e);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, searchTerm]);

  useEffect(() => { load(); }, [load]);

  const [viewMode, setViewMode] = useState((typeof window !== 'undefined' && window.innerWidth < 768) ? 'list' : 'table');

  const formatAmount = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setPage(1);
  };

  const handleResetClaimableRewards = async () => {
    if (!confirm('Are you sure you want to reset all claimableRewards to 0 for users where claimableRewards > 0? This action cannot be undone.')) {
      return;
    }

    setResetting(true);
    try {
      const res = await API.resetClaimableRewards();
      if (res?.success) {
        alert(`Successfully reset claimableRewards to 0 for ${res.modifiedCount || 0} users`);
        load(); // Refresh the data
      } else {
        alert('Failed to reset claimableRewards: ' + (res?.message || 'Unknown error'));
      }
    } catch (e) {
      console.error('Failed to reset claimableRewards', e);
      alert('Failed to reset claimableRewards: ' + (e.response?.data?.message || e.message || 'Unknown error'));
    } finally {
      setResetting(false);
    }
  };

  // ViewMode controls layout; default list on mobile

  const content = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto p-2 lg:p-4">


        {/* Search + View toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="text-xl lg:text-4xl mr-3">💼</span>
              User Wallets
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">User name, email, phone and current wallet amount</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="admin"
              onClick={handleResetClaimableRewards}
              disabled={resetting}
              className="text-sm font-medium"
            >
              {resetting ? 'Resetting...' : 'Reset Rewards to 0'}
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
              placeholder="Search by name, email, phone"
              className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm"
            />
            <Button
              variant="admin"
              onClick={() => { setPage(1); load(); }}
              className="text-sm"
            >Search</Button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <label className="text-xs sm:text-lg text-gray-600 dark:text-gray-400 whitespace-nowrap">Show:</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-secondary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>List</button>
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-secondary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Grid</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-secondary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Table</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading size="md" color="gray" message="" />
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">S.No.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">User Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Claimable Rewards</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Created At</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Questions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {items.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {((page - 1) * itemsPerPage) + idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          <div className="font-medium">{row.user?.name || row.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200 mr-2">
                              {row.user?.level?.levelName || row.level?.levelName || 'Starter'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${(row.user?.subscriptionStatus || row.subscriptionStatus) === 'pro' ? 'bg-purple-100 text-primary-800 dark:bg-purple-900 dark:text-primary-200' :


                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                              {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'free' ? 'Free' :

                                (row.user?.subscriptionStatus || row.subscriptionStatus) === 'pro' ? 'Pro' : 'Free'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          <div>{row.user?.email || row.email || '-'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Level {row.user?.level?.currentLevel || row.level?.currentLevel || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.user?.phone || row.phone || '-'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-400">{formatAmount(row.amount || row.walletBalance)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary-600 dark:text-secondary-400">
                          {row.claimableRewards > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                              {row.claimableRewards}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatDate(row.createdAt)}
                          </div>
                          {row.createdAt && !isNaN(new Date(row.createdAt).getTime()) && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(row.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 px-2 py-1 rounded">
                                Total: {row.questionCounts?.total || 0}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded">
                                ✓ {row.questionCounts?.approved || 0}
                              </span>
                              <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-1 py-0.5 rounded">
                                ⏳ {row.questionCounts?.pending || 0}
                              </span>
                              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1 py-0.5 rounded">
                                ✗ {row.questionCounts?.rejected || 0}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-3">
                {items.map((row, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{row.user?.name || row.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{(row.user?.email || row.email || '-')}{(row.user?.phone || row.phone) ? ` • ${(row.user?.phone || row.phone)}` : ''}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Level {row.user?.level?.currentLevel || row.level?.currentLevel || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Claimable Rewards: {row.claimableRewards > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ml-1">
                              {row.claimableRewards}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200">
                            {row.user?.level?.levelName || row.level?.levelName || 'Starter'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${(row.user?.subscriptionStatus || row.subscriptionStatus) === 'pro' ? 'bg-purple-100 text-primary-800 dark:bg-purple-900 dark:text-primary-200' :

                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                            {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'free' ? 'Free' :

                              (row.user?.subscriptionStatus || row.subscriptionStatus) === 'pro' ? 'Pro' : 'Free'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Created: {formatDate(row.createdAt)} {row.createdAt && !isNaN(new Date(row.createdAt).getTime()) && `at ${new Date(row.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </div>
                      </div>
                      <div className="text-base font-bold text-green-700 dark:text-green-400">{formatAmount(row.amount || row.walletBalance)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 px-2 py-1 rounded">
                        Total Questions: {row.questionCounts?.total || 0}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        ✓ Approved: {row.questionCounts?.approved || 0}
                      </span>
                      <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                        ⏳ Pending: {row.questionCounts?.pending || 0}
                      </span>
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                        ✗ Rejected: {row.questionCounts?.rejected || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((row, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">{row.user?.name || row.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{(row.user?.email || row.email || '-')}{(row.user?.phone || row.phone) ? ` • ${(row.user?.phone || row.phone)}` : ''}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Level {row.user?.level?.currentLevel || row.level?.currentLevel || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Claimable Rewards: {row.claimableRewards > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ml-1">
                          {row.claimableRewards}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200">
                        {row.user?.level?.levelName || row.level?.levelName || 'Starter'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${(row.user?.subscriptionStatus || row.subscriptionStatus) === 'pro' ? 'bg-purple-100 text-primary-800 dark:bg-purple-900 dark:text-primary-200' :

                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                        {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'free' ? 'Free' :

                          (row.user?.subscriptionStatus || row.subscriptionStatus) === 'pro' ? 'Pro' : 'Free'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Created: {formatDate(row.createdAt)} {row.createdAt && !isNaN(new Date(row.createdAt).getTime()) && `at ${new Date(row.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                    </div>
                    <div className="text-xl font-extrabold text-green-700 dark:text-green-400 mb-3">{formatAmount(row.amount || row.walletBalance)}</div>
                    <div className="space-y-2">
                      <div className="text-xs bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 px-2 py-1 rounded text-center">
                        Total Questions: {row.questionCounts?.total || 0}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-1 rounded text-center">
                          ✓ {row.questionCounts?.approved || 0}
                        </span>
                        <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-1 py-1 rounded text-center">
                          ⏳ {row.questionCounts?.pending || 0}
                        </span>
                        <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1 py-1 rounded text-center">
                          ✗ {row.questionCounts?.rejected || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {Math.max(1, Math.ceil(total / itemsPerPage)) > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={Math.max(1, Math.ceil(total / itemsPerPage))}
                  onPageChange={setPage}
                  totalItems={total}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <AdminMobileAppWrapper title="User Wallets">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent  w-full text-gray-900 dark:text-white">
          {content}
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminUserWallets;






