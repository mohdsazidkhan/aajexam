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
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  ArrowRight,
  Clock,
  ChevronRight,
  Wallet,
  Award,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Mail,
  Zap,
  Filter,
  CheckCircle2,
  Calendar,
  ExternalLink,
  DollarSign,
  Briefcase,
  User
} from 'lucide-react';

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
    const d = new Date(dateString);
    return `${d.getDate()} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getRewardTypeLabel = (type) => {
    const labels = {
      'registration': 'Initial Link',
      'plan9': '₹9 Expansion',
      'plan49': '₹49 Expansion',
      'plan99': '₹99 Expansion',
    };
    return labels[type] || type.toUpperCase();
  };

  const getRewardTypeIcon = (type) => {
    switch (type) {
      case 'registration': return UserPlus;
      case 'plan9': return Zap;
      case 'plan49': return Briefcase;
      case 'plan99': return Award;
      default: return DollarSign;
    }
  };

  const getRewardTypeColor = (type) => {
    const colors = {
      'registration': 'text-primary-500 bg-primary-500/10 border-primary-500/20',
      'plan9': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      'plan49': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      'plan99': 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    };
    return colors[type] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  };

  if (loading && transactions.length === 0) {
    return (
      <AdminMobileAppWrapper title="Referral History">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-3 lg:p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-primary-500/10 border-t-primary-500 rounded-full shadow-2xl"
            />
            <History className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary-500" />
          </div>
          <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Reconstructing Transaction Chronicle...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Referral History">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-outfit text-slate-900 dark:text-white pb-20">
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-80' : 'lg:pl-24'} p-4 lg:p-10 pt-16 lg:pt-10`}>
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 lg:mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4 lg:mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl">
                    <History className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">ADMIN_HUB // TRANSACTION_CHRONICLE</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  REFERRAL <span className="text-primary-500">HISTORY</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Full audit log of reward distributions, network expansions, and capital transfers.</p>
              </div>

               <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                     <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <select
                        value={filterType}
                        onChange={handleFilterChange}
                        className="pl-14 pr-10 py-5 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-primary-500/30 transition-all font-outfit shadow-xl"
                     >
                        <option value="all">ALL_TRANSMISSION_TYPES</option>
                        <option value="registration">Registration Reward (₹10)</option>
                        <option value="plan9">PLAN_9_COEFF (₹3)</option>
                        <option value="plan49">PLAN_49_COEFF (₹15)</option>
                        <option value="plan99">PLAN_99_COEFF (₹33)</option>
                     </select>
                     <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                  <SearchFilter
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Search..."
                    className="bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-xl lg:rounded-[2.5rem] py-2 shadow-xl"
                  />
               </div>
            </div>

            {/* Tactical Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-4 lg:mb-12">
                {[
                  { label: "TOTAL REWARDS", value: summary.totalRewards, icon: DollarSign, color: "bg-slate-900 dark:bg-white/10 text-white" },
                  { label: "REG_PROTO", value: summary.registrationRewards, icon: UserPlus, color: "bg-primary-500 text-white shadow-primary-500/20" },
                  { label: "PLAN_9", value: summary.plan9Rewards, icon: Zap, color: "bg-emerald-500 text-white shadow-emerald-500/20" },
                  { label: "PLAN_49", value: summary.plan49Rewards, icon: Briefcase, color: "bg-indigo-500 text-white shadow-indigo-500/20" },
                  { label: "PLAN_99", value: summary.plan99Rewards, icon: Award, color: "bg-rose-500 text-white shadow-rose-500/20" }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`${stat.color} rounded-lg lg:rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group`}
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                       <stat.icon className="w-12 h-12" />
                    </div>
                    <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">{stat.label}</div>
                    <div className="text-xl lg:text-3xl font-black italic tracking-tighter tabular-nums">₹{stat.value?.toLocaleString() || 0}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Chronicle Table */}
          <AnimatePresence mode="wait">
             {transactions.length === 0 ? (
               <motion.div
                 key="empty"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-40 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
               >
                 <History className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 lg:mb-8" />
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">ZERO_EVENTS_RECOVERED</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No Recorded transaction events detected for the current tactical filter.</p>
               </motion.div>
             ) : (
               <motion.div
                 key="content"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl"
               >
                 <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-4 lg:px-8 py-4 lg:py-8">TIMESTAMP</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8">INVITER</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8">INVITED USER</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-center">REWARD TYPE</th>
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
                            className="group hover:bg-primary-500/5 transition-all"
                          >
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                               <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums">{formatDate(tx.date)}</div>
                               <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(tx.date)}</div>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                               <Link href={`/admin/user-referral-detail?userId=${tx.inviter?._id}`} className="group/link block">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg group-hover/link:bg-primary-600 transition-all uppercase">
                                        {tx.inviter?.name?.[0]?.toUpperCase() || 'U'}
                                     </div>
                                     <div>
                                        <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1 group-hover/link:text-primary-500 transition-colors flex items-center gap-2">
                                           {tx.inviter?.name || 'Unknown'} <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{tx.inviter?.email || 'OFFLINE'}</div>
                                     </div>
                                  </div>
                               </Link>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                               {tx.invitee ? (
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center font-black text-xs border border-emerald-500/20">
                                        <User className="w-5 h-5" />
                                     </div>
                                     <div>
                                        <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{tx.invitee.name || 'Unknown'}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{tx.invitee.email || 'OFFLINE'}</div>
                                     </div>
                                  </div>
                               ) : (
                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">External</span>
                                )}
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                               <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${getRewardTypeColor(tx.rewardType)}`}>
                                  {React.createElement(getRewardTypeIcon(tx.rewardType), { className: "w-3 h-3" })}
                                  {getRewardTypeLabel(tx.rewardType)}
                               </div>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                               <div className="text-xl font-black italic tracking-tighter text-emerald-500 tabular-nums">+₹{tx.amount}</div>
                               <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">YIELD_ADJUSTMENT</div>
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
             )}

             {/* Pagination Segment */}
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
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
}

