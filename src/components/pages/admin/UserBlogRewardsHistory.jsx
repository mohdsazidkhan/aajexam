'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  LayoutGrid,
  List,
  Table as TableIcon,
  Search,
  ChevronRight,
  Clock,
  Wallet,
  Star,
  Crown,
  FileText,
  Filter
} from 'lucide-react';

const PAGE_LIMIT = 20;

export default function UserBlogRewardsHistory({ userId }) {
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
  const [userInfo, setUserInfo] = useState(null);
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
    if (userId && isMounted) {
      fetchUserBlogRewardsHistory(page, limit, debouncedSearch, filterType);
    }
  }, [userId, debouncedSearch, page, limit, filterType, isMounted]);

  const fetchUserBlogRewardsHistory = async (page = 1, limit = 20, search = "", tier = "all") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        rewardTier: tier,
        userId: userId,
      };

      if (search) {
        params.search = search;
      }

      const response = await API.getAdminBlogRewardsHistory(params);

      if (response?.success) {
        setTransactions(response.data?.transactions || []);
        setPagination(response.data?.pagination || {});
        setSummary(response.data?.summary || null);

        if (response.data?.transactions?.length > 0 && response.data.transactions[0].user) {
          setUserInfo(response.data.transactions[0].user);
        }
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
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getRewardTierLabel = (tier) => {
    const labels = {
      'normal': 'Standard',
      'good': 'Good',
      'high': 'High',
    };
    return labels[tier] || tier.toUpperCase();
  };

  const getRewardTierColor = (tier) => {
    const colors = {
      'normal': 'text-primary-500 bg-primary-500/10 border-primary-500/20',
      'good': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      'high': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    };
    return colors[tier] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  };

  if (loading) {
    return (
      <AdminMobileAppWrapper title="Creative Analytics">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-primary-500/10 border-t-primary-500 rounded-full shadow-2xl"
            />
            <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary-500" />
          </div>
          <div className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Analyzing Editorial Flux...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Creative Analytics">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-sans text-slate-900 dark:text-white pb-20">
        {isMounted && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-80' : 'lg:pl-24'} p-4 lg:p-10 pt-16 lg:pt-10`}>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">ADMIN / BLOG REWARDS</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  BLOG <span className="text-primary-500">REWARDS</span>
                </h1>
                {userInfo && (
                  <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-3xl border-2 border-slate-100 dark:border-white/5 backdrop-blur-3xl w-fit">
                    <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {userInfo.name?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{userInfo.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{userInfo.email}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => router.push('/admin/blog-rewards-history')}
                  className="px-8 py-4 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-500" /> EXIT_TO_MAIN_INDEX
                </button>
              </div>
            </div>

            {/* Metric Overview */}
            {summary && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { label: 'Total Manuscripts', value: summary.totalBlogs || 0, icon: FileText, color: 'blue' },
                  { label: 'Aggregated Rewards', value: `₹${summary.totalRewards?.toLocaleString() || 0}`, icon: Wallet, color: 'emerald' },
                  { label: 'Standard Tier', value: `₹${summary.normalRewards?.toLocaleString() || 0}`, icon: Zap, color: 'primary' },
                  { label: 'Advanced Tier', value: `₹${summary.goodRewards?.toLocaleString() || 0}`, icon: Star, color: 'emerald' },
                  { label: 'Elite Tier', value: `₹${summary.highRewards?.toLocaleString() || 0}`, icon: Crown, color: 'amber' }
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="p-8 bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-xl transition-all hover:scale-[1.02]"
                  >
                    <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 w-fit mb-6 shadow-inner`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tabular-nums mb-2 tracking-tighter italic leading-none">{stat.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Interface Controller */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-12 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-[10px] font-black">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                <Filter className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 uppercase tracking-widest mb-1">DATA_FILTERING</span>
                <span className="text-sm italic uppercase tracking-tighter">Content Reward Index</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner">
                {[
                  { icon: TableIcon, id: 'table', label: 'Tabular' },
                  { icon: List, id: 'list', label: 'Linear' },
                  { icon: LayoutGrid, id: 'grid', label: 'Spectral' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-4 rounded-full transition-all flex items-center gap-2 ${viewMode === mode.id ? 'bg-white dark:bg-primary-600 text-primary-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <mode.icon className="w-4 h-4" />
                    {viewMode === mode.id && <span className="uppercase tracking-widest pr-2">{mode.label}</span>}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={filterType}
                  onChange={handleFilterChange}
                  className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-primary-500/30 transition-all font-outfit"
                >
                  <option value="all">All Tiers</option>
                  <option value="normal">STANDARD (₹5)</option>
                  <option value="good">ADVANCED (₹10)</option>
                  <option value="high">ELITE (₹15)</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                placeholder="Search by title..."
                className="bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl py-2"
              />
            </div>
          </div>

          {/* Results Visuzalization */}
          <AnimatePresence mode="wait">
            {transactions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-40 text-center bg-white/50 dark:bg-white/5 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
              >
                <div className="p-10 bg-slate-100/50 dark:bg-white/5 rounded-[3rem] mb-8 shadow-xl">
                  <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">ZERO_MATCHES_LOCATED</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No Recorded financial dissemination detected for the selected editorial parameters.</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {viewMode === 'table' && (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left">
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visual</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manuscript_Title</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reward_Protocol</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payout</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aggregate_Balance</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Temporal_Stamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {transactions.map((tx, i) => (
                          <motion.tr
                            key={tx._id || i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group hover:bg-primary-500/5 transition-all"
                          >
                            <td className="px-8 py-6 text-center">
                              <img
                                src={tx.article?.featuredImage || '/default_banner.png'}
                                alt="Visual"
                                className="w-16 h-10 rounded-xl object-cover border-2 border-slate-100 dark:border-white/10 shadow-lg group-hover:scale-110 transition-transform"
                                onError={(e) => { e.target.src = '/default_banner.png'; }}
                              />
                            </td>
                            <td className="px-8 py-6">
                              {tx.article ? (
                                <Link href={`/admin/articles/${tx.article._id}/edit`} className="group/link">
                                  <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 group-hover/link:text-primary-500 transition-colors">{tx.article.title || 'Untitled'}</div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.article.category || 'SYSTEM_CHANNELS'}</div>
                                </Link>
                              ) : (
                                <span className="text-[10px] font-black text-slate-300 italic">ORPHANED_RELATION</span>
                              )}
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block border ${getRewardTierColor(tx.rewardTier)}`}>
                                {getRewardTierLabel(tx.rewardTier)}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="text-sm font-black text-emerald-500 tabular-nums italic">+₹{tx.amount}</div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums italic tracking-tighter">₹{tx.balance?.toLocaleString() || 0}</div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex flex-col items-end">
                                <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{formatDate(tx.date)}</div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(tx.date)}</div>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {transactions.map((tx, i) => (
                      <motion.div
                        key={tx._id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-4 hover:border-primary-500/30 transition-all shadow-xl flex flex-col items-center text-center overflow-hidden"
                      >
                        <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-6 border-2 border-slate-100 dark:border-white/10 shadow-inner group-hover:scale-[1.02] transition-transform relative">
                           <img
                             src={tx.article?.featuredImage || '/default_banner.png'}
                             alt="Poster"
                             className="w-full h-full object-cover"
                             onError={(e) => { e.target.src = '/default_banner.png'; }}
                           />
                           <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full text-[8px] font-black italic">
                              REWARD: +₹{tx.amount}
                           </div>
                        </div>

                        <div className="px-4 pb-4 space-y-4">
                           <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border w-fit mx-auto ${getRewardTierColor(tx.rewardTier)}`}>
                             {getRewardTierLabel(tx.rewardTier)}
                           </div>
                           <h3 className="text-md font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight limit-text-2">{tx.article?.title || 'Untitled'}</h3>
                           <div className="flex flex-col items-center gap-2 pt-4 border-t-2 border-slate-100 dark:border-white/5">
                              <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums">BALANCE: ₹{tx.balance?.toLocaleString() || 0}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatDate(tx.date)}</div>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="grid grid-cols-1 gap-6">
                    {transactions.map((tx, i) => (
                      <motion.div
                        key={tx._id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 hover:border-primary-500/30 transition-all shadow-xl flex flex-col lg:flex-row lg:items-center gap-8"
                      >
                        <div className="w-40 h-24 rounded-[2rem] overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                           <img
                             src={tx.article?.featuredImage || '/default_banner.png'}
                             alt="Poster"
                             className="w-full h-full object-cover"
                             onError={(e) => { e.target.src = '/default_banner.png'; }}
                           />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                           <div className="flex flex-wrap items-center gap-4">
                              <h3 className="text-md lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-primary-500 transition-colors">{tx.article?.title || 'Untitled'}</h3>
                              <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${getRewardTierColor(tx.rewardTier)}`}>
                                 {getRewardTierLabel(tx.rewardTier)}
                              </div>
                           </div>
                           <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                              <div className="flex items-center gap-2">
                                 <Wallet className="w-4 h-4 text-emerald-500/50" />
                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Reward: +₹{tx.amount}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <TrendingUp className="w-4 h-4 text-primary-500/50" />
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">YIELD_BALANCE: ₹{tx.balance?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Clock className="w-4 h-4 text-slate-400/50" />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{formatDate(tx.date)} @ {formatTime(tx.date)}</span>
                              </div>
                           </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 shadow-inner group-hover:bg-primary-500 group-hover:text-white transition-all cursor-pointer">
                           <ChevronRight className="w-6 h-6" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Spectral Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-12">
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      totalItems={pagination.totalItems}
                      itemsPerPage={limit}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
}

