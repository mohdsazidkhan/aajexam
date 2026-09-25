'use client';

import { useEffect, useState } from "react";
import Pagination from "../../Pagination";
import SearchFilter from "../../SearchFilter";
import API from '../../../lib/api';
import useDebounce from "../../../hooks/useDebounce";
import { AdminDashboardSkeleton } from "../../admin/Skeletons";
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../../Sidebar";
import ResponsiveTable from "../../ResponsiveTable";
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

import {
  Users,
  Zap,
  Filter
} from 'lucide-react';

const PAGE_LIMIT = DEFAULT_PAGE_SIZE;

export default function ReferralDashboard() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({});
  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchReferrals(page, limit, debouncedSearch);
  }, [debouncedSearch, page, limit]);

  const fetchReferrals = async (page = 1, limit = DEFAULT_PAGE_SIZE, search = "") => {
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

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const getRewardTypeLabel = (type) => {
    const labels = {
      'plan99': '₹99 Plan Reward',
    };
    return labels[type] || type.toUpperCase();
  };

  const columns = [
    {
      key: 'user',
      header: 'USER',
      render: (_, u) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-lg lg:rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-all uppercase">
            {u.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{u.name || 'Unknown'}</div>
            <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest italic">{u.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'referralCode',
      header: 'REFERRAL CODE',
      render: (_, u) => (
        <div className="px-4 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-black text-primary-600 italic inline-flex items-center gap-2 tabular-nums">
          <Zap className="w-3 h-3" /> {u.referralCode || 'N/A'}
        </div>
      )
    },
    {
      key: 'joined',
      header: 'JOINED ON',
      render: (_, u) => (
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.referredBy || 'Direct Signup'}</span>
      )
    },
    {
      key: 'walletBalance',
      header: 'WALLET BALANCE',
      render: (_, u) => (
        <div>
          <div className="text-xl font-black italic tracking-tighter text-primary-600 tabular-nums">₹{u.walletBalance || 0}</div>
          <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Wallet Balance</div>
        </div>
      )
    },
    {
      key: 'referralRewards',
      header: 'REFERRAL REWARDS',
      render: (_, u) => (
        <div className="flex flex-col gap-2">
          {u.referralRewards?.length > 0 ? (
            <>
              {u.referralRewards.slice(0, 2).map((reward, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-1 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{getRewardTypeLabel(reward.type)}: <span className="text-primary-600">₹{reward.amount}</span></span>
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
      )
    }
  ];

  const searchFilterInput = (
    <SearchFilter
      searchTerm={searchTerm}
      onSearchChange={handleSearch}
      placeholder="Search users..."
      className="w-full lg:w-96"
    />
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={page}
      totalPages={pagination.totalPages || 1}
      onPageChange={handlePageChange}
      totalItems={pagination.total || 0}
      itemsPerPage={limit}
      onItemsPerPageChange={handleLimitChange}
    />
  );

  useAdminMobileHeader({
    title: 'Referral Dashboard',
    count: pagination.total || 0,
    filters: (
      <>
        {searchFilterInput}
        {paginationControl}
      </>
    )
  });

  if (loading && referrals.length === 0) {
    return (
      <div className="min-h-screen p-3 lg:p-8">
        <AdminDashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto flex flex-col transition-all duration-500">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          {/* Referral Table */}
          <div className="flex-1 min-h-0 overflow-auto">
          <AnimatePresence mode="wait">
            {referrals.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 lg:py-20 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm"
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
                className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden shadow-sm h-auto flex flex-col"
              >
                <ResponsiveTable data={referrals} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
