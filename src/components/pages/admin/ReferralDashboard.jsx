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
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
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
  MoreVertical,
  Activity
} from 'lucide-react';

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
      const response = await API.getAdminUserDetails({
        page,
        limit,
        search,
      });

      if (response?.success) {
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

  const getRewardTypeLabel = (type) => {
    const labels = {
      'registration': 'Registration Reward',
      'plan9': '₹9 Plan Reward',
      'plan49': '₹49 Plan Reward',
      'plan99': '₹99 Plan Reward',
    };
    return labels[type] || type.toUpperCase();
  };

  if (loading && referrals.length === 0) {
    return (
      <AdminMobileAppWrapper title="Referral Dashboard">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-3 lg:p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-primary-500/10 border-t-primary-500 rounded-full shadow-2xl"
            />
            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary-500" />
          </div>
          <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Loading referral data...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Referral Dashboard">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-outfit text-slate-900 dark:text-white pb-20">
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-0' : 'lg:pl-24'} p-4 lg:p-10 pt-16 lg:pt-10`}>
          
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
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">ADMIN / REFERRAL DASHBOARD</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  REFERRAL <span className="text-primary-500">DASHBOARD</span> <span className="text-slate-300 dark:text-white/10 ml-2 italic tracking-widest text-2xl lg:text-4xl">({pagination.total || 0})</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Track referral program performance and user referral activity.</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-4 lg:mb-12 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-3 lg:gap-8 text-[10px] font-black">
              <div className="flex flex-wrap items-center gap-3 lg:gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase tracking-widest mb-1">FILTERS</div>
                      <div className="text-sm italic uppercase tracking-tighter italic">Search and Filter Users</div>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                  placeholder="Search users..."
                  className="bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl py-2 w-full lg:w-96"
                />
              </div>
            </div>
          </motion.div>

          {/* Referral Table */}
          <AnimatePresence mode="wait">
            {referrals.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-40 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
              >
                <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 lg:mb-8" />
                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">NO REFERRALS FOUND</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No users with referral activity were found. Try adjusting your search.</p>
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
                        <th className="px-4 lg:px-8 py-4 lg:py-8">USER</th>
                        <th className="px-4 lg:px-8 py-4 lg:py-8 text-center">REFERRAL CODE</th>
                        <th className="px-4 lg:px-8 py-4 lg:py-8 text-center">JOINED ON</th>
                        <th className="px-4 lg:px-8 py-4 lg:py-8 text-right">WALLET BALANCE</th>
                        <th className="px-4 lg:px-8 py-4 lg:py-8">REFERRAL REWARDS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {referrals.map((u, i) => (
                        <motion.tr
                          key={u._id || i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group hover:bg-primary-500/5 transition-all"
                        >
                          <td className="px-4 lg:px-8 py-3 lg:py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-primary-500 transition-all uppercase">
                                    {u.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{u.name || 'Unknown'}</div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{u.email}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                             <div className="px-4 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-black text-primary-500 italic inline-flex items-center gap-2 tabular-nums">
                                <Zap className="w-3 h-3" /> {u.referralCode || 'N/A'}
                             </div>
                          </td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.referredBy || 'Direct Signup'}</span>
                          </td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                             <div className="text-xl font-black italic tracking-tighter text-emerald-500 tabular-nums">₹{u.walletBalance || 0}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Wallet Balance</div>
                          </td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6">
                             <div className="flex flex-col gap-2">
                                {u.referralRewards?.length > 0 ? (
                                  <>
                                    {u.referralRewards.slice(0, 2).map((reward, idx) => (
                                      <div key={idx} className="flex items-center gap-3 px-3 py-1 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg shadow-inner">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{getRewardTypeLabel(reward.type)}: <span className="text-emerald-500">₹{reward.amount}</span></span>
                                      </div>
                                    ))}
                                    {u.referralRewards.length > 2 && (
                                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest pl-5">+ {u.referralRewards.length - 2} more rewards</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-30 italic">No rewards yet</span>
                                )}
                             </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-16">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.total}
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

