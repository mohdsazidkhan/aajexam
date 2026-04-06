'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Wallet, Search, LayoutGrid, List, Table, Filter, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, User, Phone, Mail, Award, Crown, CheckCircle2,
  Clock, XCircle, RefreshCcw, TrendingUp, IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [viewMode, setViewMode] = useState('table');

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

  const content = (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-8 lg:p-12 mb-12 shadow-2xl overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-64 h-64 text-indigo-500 -rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">ADMIN // TREASURY</span>
              </div>

              <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                USER <span className="text-indigo-600">WALLETS</span>
              </h1>

              <p className="max-w-2xl text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                Monitor and manage user portal balances, rewards, and transaction history.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetClaimableRewards}
                disabled={resetting}
                className="flex items-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-2xl shadow-xl shadow-rose-500/20 group/btn disabled:opacity-50"
              >
                <RefreshCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{resetting ? 'RESETTING...' : 'RESET REWARDS'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search + Controls */}
        <div className="flex flex-col lg:flex-row items-center gap-6 mb-12">
          <div className="relative group/search w-full lg:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
              placeholder="Search by name, email, phone..."
              className="w-full pl-14 pr-8 py-4 bg-white/80 dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 focus:border-indigo-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
            />
          </div>

          <div className="flex bg-slate-100 dark:bg-white/10 p-2 rounded-2xl border-2 border-slate-200/50 dark:border-white/5">
            {[
              { id: 'table', icon: Table },
              { id: 'grid', icon: LayoutGrid },
              { id: 'list', icon: List }
            ].map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode.id)}
                className={`p-3 rounded-xl transition-all ${viewMode === mode.id ? 'bg-white dark:bg-white/10 text-indigo-500 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <mode.icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SHOW ROWS</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="bg-white/80 dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {[10, 20, 50, 100, 250, 500, 1000].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loading size="md" color="yellow" message="Loading treasury data..." />
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto selection:bg-indigo-500/30 text-nowrap">
                  <table className="w-full border-separate border-spacing-y-4 px-8 py-4">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                        <th className="px-6 py-4">S.No.</th>
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4 text-right">Wallet Amount</th>
                        <th className="px-6 py-4 text-center">Claimable</th>
                        <th className="px-6 py-4">Questions Track</th>
                        <th className="px-6 py-4">Join Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {items.map((row, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="group bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-xl rounded-3xl"
                        >
                          <td className="px-6 py-6 first:rounded-l-[2rem]">
                            <span className="text-[10px] font-black text-slate-400 tabular-nums">#{((page - 1) * itemsPerPage) + idx + 1}</span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-500 p-[2px] shadow-lg group-hover:rotate-6 transition-transform">
                                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xs text-indigo-500">
                                  {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-500 transition-colors">{row.user?.name || row.name || 'Unknown'}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-widest">{row.user?.level?.levelName || row.level?.levelName || 'Starter'}</span>
                                  {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'pro' && <Crown className="w-3 h-3 text-amber-500" />}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-[10px] font-bold text-slate-500">
                            <div className="flex items-center gap-2 mb-1"><Mail className="w-3 h-3" /> {row.user?.email || row.email || '-'}</div>
                            <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {row.user?.phone || row.phone || '-'}</div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-500 tabular-nums italic tracking-tighter">
                              {formatAmount(row.amount || row.walletBalance)}
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            {row.claimableRewards > 0 ? (
                              <span className="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 uppercase tracking-widest">
                                {row.claimableRewards} REWARDS
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">NONE</span>
                            )}
                          </td>
                          <td className="px-6 py-6">
                            <div className="grid grid-cols-2 gap-2 max-w-[150px]">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase">TOTAL</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{row.questionCounts?.total || 0}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-emerald-500 uppercase">APPV</span>
                                <span className="text-xs font-black text-emerald-500 tabular-nums">{row.questionCounts?.approved || 0}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 last:rounded-r-[2rem]">
                            <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums leading-none mb-1">{formatDate(row.createdAt)}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.createdAt ? new Date(row.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}</div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-6">
                {items.map((row, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 shadow-xl hover:border-indigo-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-500 p-[2px] shadow-lg">
                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-sm text-indigo-500">
                          {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-500 transition-colors">{row.user?.name || row.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.user?.email || row.email || 'N/A'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.user?.phone || row.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 lg:justify-end">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CLAIMABLE</span>
                        <div className={`text-md font-black italic tracking-tighter ${row.claimableRewards > 0 ? 'text-indigo-500' : 'text-slate-400'}`}>
                          {row.claimableRewards || 0} REWARDS
                        </div>
                      </div>
                      <div className="w-[2px] h-8 bg-slate-100 dark:bg-white/5 hidden lg:block" />
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">WALLET BALANCE</span>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-500 italic tracking-tighter tabular-nums">
                          {formatAmount(row.amount || row.walletBalance)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {items.map((row, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-8 shadow-2xl hover:border-indigo-500/30 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Wallet className="w-24 h-24 text-indigo-500 -rotate-12" />
                    </div>

                    <div className="flex items-center gap-6 mb-8 pb-6 border-b-2 border-slate-50 dark:border-white/5">
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-indigo-500 p-[3px] shadow-xl">
                        <div className="w-full h-full rounded-[21px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xl text-indigo-500">
                          {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">{row.user?.name || row.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-widest">{row.user?.level?.levelName || row.level?.levelName || 'Starter'}</span>
                          {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'pro' && <Crown className="w-3 h-3 text-amber-500" />}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CLAIMABLE</span>
                        <span className={`text-sm font-black italic tabular-nums ${row.claimableRewards > 0 ? 'text-indigo-500' : 'text-slate-400'}`}>{row.claimableRewards || 0} REWARDS</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JOIN DATE</span>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white tabular-nums uppercase">{formatDate(row.createdAt)}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border-2 border-slate-100 dark:border-white/5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">WALLET BALANCE</span>
                      <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500 italic tracking-tighter leading-none">{formatAmount(row.amount || row.walletBalance)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {Math.max(1, Math.ceil(total / itemsPerPage)) > 1 && (
              <div className="mt-12 flex justify-center">
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
