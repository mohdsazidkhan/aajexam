'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import API from '../../../lib/api';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';

const AdminNotificationsPage = () => {
  const { isMounted, router } = useSSR();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const typeToPath = {
    question: '/admin/user-questions',
    quiz: '/admin/user-quizzes',
    withdraw: '/admin/withdraw-requests',
    contact: '/admin/contacts',
    bank: '/admin/bank-details',
    subscription: '/admin/subscriptions',
    registration: '/admin/students',
    quiz_attempt: '/admin/analytics/performance',
    exam_attempt: '/admin/govt-exams/results',
    blog: '/admin/user-blogs',
    referral_registration: '/admin/referral-history',
    competition_reset: '/admin/competition-resets'
  };

  const fetchPage = useCallback(async (p = 1, perPage = limit) => {
    try {
      setLoading(true);
      const res = await API.getAdminNotifications(p, perPage, { unreadOnly: false });
      const data = res?.data || res?.notifications || [];
      setItems(Array.isArray(data) ? data : []);
      const pg = res?.pagination || { page: p, totalPages: 1, total: data.length };
      setPage(pg.page || p);
      setTotalPages(pg.totalPages || 1);
      setTotal(pg.total || data.length || 0);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (!isMounted) return;
    fetchPage(1, limit);
  }, [isMounted, fetchPage, limit]);

  const handlePrev = () => page > 1 && fetchPage(page - 1);
  const handleNext = () => page < totalPages && fetchPage(page + 1);

  const handleLimitChange = (value) => {
    const per = parseInt(value);
    setLimit(per);
    fetchPage(1, per);
  };

  const handleClearAll = async () => {
    try {
      await API.clearAdminNotifications();
      fetchPage(1, limit);
    } catch (_) { }
  };

  return (
    <AdminMobileAppWrapper title="Notifications">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications {total ? `(${total})` : ''}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View and manage recent admin notifications
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="w-full lg:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>
                <Button
                  onClick={handleClearAll}
                  variant="admin"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full flex items-center justify-center h-48">
                  <Loading size="md" color="gray" message="" />
                </div>
              ) : items.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔔</div>
                  <h3 className="text-md md:text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You're all caught up.
                  </p>
                </div>
              ) : (
                items.map((n) => {
                  const href = typeToPath[n.type] || '/admin/notifications';
                  return (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) {
                          // optimistic update
                          setItems((prev) => prev.map((it) => it._id === n._id ? { ...it, isRead: true } : it));
                          // fire-and-forget; navigation may occur immediately
                          API.markAdminNotificationRead(n._id).catch(() => {
                            // revert on failure if still mounted
                            setItems((prev) => prev.map((it) => it._id === n._id ? { ...it, isRead: false } : it));
                          });
                        }
                        router.push(href);
                      }}
                      className={`block rounded-lg shadow-md border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${n.isRead ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' : 'border-secondary-300 dark:border-secondary-700 ring-1 ring-secondary-200 dark:ring-secondary-900/40 bg-secondary-50 dark:bg-secondary-900/20'}`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{n.type}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">{n.title}</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">{n.description}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="text-sm text-gray-700 dark:text-gray-300">Page {page} / {totalPages}</div>
                <button
                  onClick={handleNext}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminNotificationsPage;


