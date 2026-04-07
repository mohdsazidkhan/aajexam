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
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  ChevronRight,
  Wallet,
  Award,
  ShieldCheck,
  TrendingUp,
  FileText,
  Mail,
  Zap,
  Filter,
  CheckCircle2,
  Calendar,
  ExternalLink,
  DollarSign,
  Star,
  Layers,
  LayoutGrid,
  List,
  Table as TableIcon,
  Image as ImageIcon,
  User
} from 'lucide-react';

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
    const d = new Date(dateString);
    return `${d.getDate()} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
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
      'high': 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    };
    return colors[tier] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';
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

  if (loading && transactions.length === 0) {
    return (
      <AdminMobileAppWrapper title="Blog Rewards History">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-3 lg:p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full shadow-2xl"
            />
            <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-emerald-500" />
          </div>
          <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Loading blog rewards history...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  const renderTableView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-4 lg:px-8 py-4 lg:py-8">THUMBNAIL</th>
              <th className="px-4 lg:px-8 py-4 lg:py-8">DATE</th>
              <th className="px-4 lg:px-8 py-4 lg:py-8">STUDENT</th>
              <th className="px-4 lg:px-8 py-4 lg:py-8">ARTICLE</th>
              <th className="px-4 lg:px-8 py-4 lg:py-8 text-center">REWARD TIER</th>
              <th className="px-4 lg:px-8 py-4 lg:py-8 text-right">AMOUNT</th>
              <th className="px-4 lg:px-8 py-4 lg:py-8 text-right">BALANCE AFTER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {transactions.map((tx, i) => (
              <motion.tr
                key={tx._id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-emerald-500/5 transition-all"
              >
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                   <div className="w-16 h-12 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                      <img
                        src={tx.article?.featuredImage || '/default_banner.png'}
                        alt="Article thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/default_banner.png'; }}
                      />
                   </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                   <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums">{formatDate(tx.date)}</div>
                   <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(tx.date)}</div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                   {tx.user?._id ? (
                    <Link href={`/admin/blog-rewards-history/user/${tx.user._id}`} className="group/link block">
                       <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1 group-hover/link:text-emerald-500 transition-colors flex items-center gap-2">
                          {tx.user?.name || 'Unknown'} <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                       </div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{tx.user?.email || 'N/A'}</div>
                    </Link>
                   ) : (
                    <div>
                       <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{tx.user?.name || 'N/A'}</div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{tx.user?.email || 'N/A'}</div>
                    </div>
                   )}
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  {tx.article ? (
                    <Link href={`/admin/articles/${tx.article._id}/edit`} className="group/link block max-w-xs">
                       <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-tight mb-1 group-hover/link:text-primary-500 transition-colors line-clamp-1">
                          {tx.article.title || 'N/A'}
                       </div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{tx.article.category || 'UNCATEGORIZED'}</div>
                    </Link>
                  ) : (
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Article Deleted</span>
                  )}
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                   <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${getRewardTierColor(tx.rewardTier)}`}>
                      <Star className="w-3 h-3" />
                      {getRewardTierLabel(tx.rewardTier)}
                   </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                   <div className="text-xl font-black italic tracking-tighter text-emerald-500 tabular-nums">+₹{tx.amount}</div>
                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Paid</div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6 text-right font-black text-lg italic text-slate-900 dark:text-white tabular-nums">
                   ₹{tx.balance?.toLocaleString() || 0}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderListView = () => (
    <div className="space-y-3 lg:space-y-6">
      {transactions.map((tx, i) => (
        <motion.div
           key={tx._id || i}
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: i * 0.05 }}
           className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 hover:border-emerald-500/30 transition-all shadow-xl flex flex-col lg:flex-row items-center gap-10"
        >
          <div className="w-24 h-20 rounded-lg lg:rounded-[2rem] overflow-hidden border-4 border-slate-100 dark:border-white/10 shadow-xl shrink-0 group-hover:scale-105 transition-transform">
             <img
                src={tx.article?.featuredImage || '/default_banner.png'}
                alt="Article thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/default_banner.png'; }}
              />
          </div>

          <div className="flex-1 text-center lg:text-left space-y-3">
             <div className="flex flex-col lg:flex-row items-center gap-4">
                <Link href={`/admin/articles/${tx.article?._id}/edit`} className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none hover:text-primary-500 transition-colors line-clamp-1">{tx.article?.title || 'Untitled'}</Link>
                <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${getRewardTierColor(tx.rewardTier)}`}>
                   {getRewardTierLabel(tx.rewardTier)}
                </div>
             </div>
             <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                   <User className="w-4 h-4 text-slate-300" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{tx.user?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Layers className="w-4 h-4 text-slate-300" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{tx.article?.category || 'UNCATEGORIZED'}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-slate-300" />
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest tabular-nums italic">{formatDate(tx.date)} @ {formatTime(tx.date)}</span>
                </div>
             </div>
          </div>

          <div className="flex gap-4">
             <div className="p-6 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 text-center min-w-[140px] group-hover:border-emerald-500/20 transition-all">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">REWARD AMOUNT</div>
                <div className="text-2xl font-black italic tracking-tighter text-emerald-500 tabular-nums">+₹{tx.amount}</div>
             </div>
             <div className="p-6 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 text-center min-w-[140px] group-hover:border-primary-500/20 transition-all">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance After</div>
                <div className="text-2xl font-black italic tracking-tighter text-primary-500 tabular-nums">₹{tx.balance?.toLocaleString() || 0}</div>
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
      {transactions.map((tx, i) => (
        <motion.div
           key={tx._id || i}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: i * 0.05 }}
           className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 hover:border-emerald-500/30 transition-all shadow-xl flex flex-col overflow-hidden"
        >
          <div className="relative mb-6 rounded-lg lg:rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl aspect-video">
             <img
                src={tx.article?.featuredImage || '/default_banner.png'}
                alt="Article thumbnail"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => { e.target.src = '/default_banner.png'; }}
              />
              <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                 <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md text-[8px] font-black uppercase tracking-widest shadow-2xl ${getRewardTierColor(tx.rewardTier)}`}>
                    {getRewardTierLabel(tx.rewardTier)}
                 </div>
              </div>
          </div>
          
          <div className="space-y-4 px-2">
             <Link href={`/admin/articles/${tx.article?._id}/edit`} className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight hover:text-primary-500 transition-colors line-clamp-2 block h-10 uppercase">
                {tx.article?.title || 'Untitled'}
             </Link>
             
             <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 bg-slate-900 dark:bg-white/10 rounded-lg flex items-center justify-center font-black text-[10px] text-white">
                   {tx.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                   <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{tx.user?.name || 'Unknown'}</div>
                   <div className="text-[8px] font-bold text-slate-400 uppercase italic truncate">{tx.user?.email || 'N/A'}</div>
                </div>
             </div>

             <div className="pt-4 border-t-2 border-slate-50 dark:border-white/5 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</span>
                   <span className="text-xl font-black italic text-emerald-500 tabular-nums">+₹{tx.amount}</span>
                </div>
                <div className="flex flex-col text-right">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance After</span>
                   <span className="text-xl font-black italic text-primary-500 tabular-nums">₹{tx.balance?.toLocaleString() || 0}</span>
                </div>
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Blog Rewards History">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-outfit text-slate-900 dark:text-white pb-20">
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'p-4 lg:p-8' : 'p-4 lg:p-8'}`}>
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Blog Rewards Payout History</span>
                </div>
                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  BLOG <span className="text-emerald-500">REWARDS</span> <span className="text-slate-300 dark:text-white/10 ml-2 italic tracking-widest text-2xl lg:text-4xl">HISTORY</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">View the history of blog rewards paid to students for their published articles.</p>
              </div>

               <div className="grid grid-cols-1 lg:flex lg:items-center gap-3 w-full lg:w-auto">
                  <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-4 border-slate-100 dark:border-white/10 shadow-xl w-full lg:w-auto">
                    {[
                      { icon: TableIcon, id: 'table', label: 'TAB' },
                      { icon: List, id: 'list', label: 'LIN' },
                      { icon: LayoutGrid, id: 'grid', label: 'SPC' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        className={`p-4 rounded-full transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <mode.icon className="w-4 h-4" />
                        {viewMode === mode.id && <span className="text-[8px] font-black uppercase tracking-widest pr-1">{mode.label}</span>}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full lg:w-auto">
                     <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <select
                        value={filterType}
                        onChange={handleFilterChange}
                        className="w-full lg:w-auto pl-14 pr-10 py-5 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-emerald-500/30 transition-all font-outfit shadow-xl"
                     >
                        <option value="all">All Tiers</option>
                        <option value="normal">Standard (₹5)</option>
                        <option value="good">Good (₹10)</option>
                        <option value="high">High (₹15)</option>
                     </select>
                     <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                  <SearchFilter
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Search blogs..."
                    className="bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-xl lg:rounded-[2.5rem] py-2 shadow-xl"
                  />
               </div>
            </div>

            {/* Tactical Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8 mb-4">
                {[
                  { label: "TOTAL BLOGS", value: summary.totalBlogs, icon: BookOpen, color: "bg-slate-900 dark:bg-white/10 text-white" },
                  { label: "TOTAL REWARDS", value: summary.totalRewards, icon: DollarSign, color: "bg-emerald-600 text-white shadow-emerald-500/20" },
                  { label: "STANDARD TIER", value: summary.normalRewards, icon: Zap, color: "bg-indigo-500 text-white shadow-indigo-500/20" },
                  { label: "GOOD TIER", value: summary.goodRewards, icon: Award, color: "bg-primary-500 text-white shadow-primary-500/20" },
                  { label: "HIGH TIER", value: summary.highRewards, icon: Star, color: "bg-rose-500 text-white shadow-rose-500/20" }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`${stat.color} rounded-xl lg:rounded-[2.5rem] p-3 lg:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[160px]`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                       <stat.icon className="w-16 h-16" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-4">{stat.label}</div>
                    <div className="text-2xl lg:text-4xl font-black italic tracking-tighter tabular-nums">
                       {stat.label === 'TOTAL BLOGS' ? stat.value : `₹${stat.value?.toLocaleString() || 0}`}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Results Visuzalization */}
          <AnimatePresence mode="wait">
             {transactions.length === 0 ? (
               <motion.div
                 key="empty"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-10 lg:py-20  text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
               >
                 <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 lg:mb-8" />
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">No Rewards Found</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No blog reward payouts match your current filters. Try adjusting your search or filter settings.</p>
               </motion.div>
             ) : (
                viewMode === 'table' ? renderTableView() :
                viewMode === 'list' ? renderListView() :
                renderGridView()
             )}
          </AnimatePresence>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-16">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.totalItems}
                itemsPerPage={limit}
              />
            </div>
          )}
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
}

