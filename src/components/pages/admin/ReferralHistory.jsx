'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "../../Pagination";
import API from '../../../lib/api';
import useDebounce from "../../../hooks/useDebounce";
import { AdminTableSkeleton } from "../../skeletons/AdminSkeletons";
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../../Sidebar";
import ResponsiveTable from "../../ResponsiveTable";
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';

import {
  History,
  Award,
  ExternalLink,
  DollarSign,
  Search,
  User
} from 'lucide-react';

const PAGE_LIMIT = DEFAULT_PAGE_SIZE;

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
  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchReferralHistory(page, limit, debouncedSearch, filterType);
  }, [debouncedSearch, page, limit, filterType]);

  const fetchReferralHistory = async (page = 1, limit = DEFAULT_PAGE_SIZE, search = "", type = "all") => {
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

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
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
      'plan99': '₹99 Plan Reward',
    };
    return labels[type] || type.toUpperCase();
  };

  const getRewardTypeIcon = (type) => {
    switch (type) {
      case 'plan99': return Award;
      default: return DollarSign;
    }
  };

  const getRewardTypeColor = (type) => {
    const colors = {
      'plan99': 'text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20',
    };
    return colors[type] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  };

  const columns = [
    {
      key: 'timestamp',
      header: 'TIMESTAMP',
      render: (_, tx) => (
        <>
          <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums">{formatDate(tx.date)}</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(tx.date)}</div>
        </>
      )
    },
    {
      key: 'inviter',
      header: 'INVITER',
      render: (_, tx) => (
        <Link href={`/admin/user-referral-detail?userId=${tx.inviter?._id}`} className="group/link block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-lg lg:rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover/link:bg-primary-600 transition-all uppercase">
              {tx.inviter?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1 group-hover/link:text-primary-600 transition-colors flex items-center gap-2">
                {tx.inviter?.name || 'Unknown'} <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </div>
              <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest italic">{tx.inviter?.email || 'No email'}</div>
            </div>
          </div>
        </Link>
      )
    },
    {
      key: 'invitee',
      header: 'INVITED USER',
      render: (_, tx) => (
        tx.invitee ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 text-primary-600 rounded-lg lg:rounded-xl flex items-center justify-center font-black text-xs border border-primary-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{tx.invitee.name || 'Unknown'}</div>
              <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest italic">{tx.invitee.email || 'No email'}</div>
            </div>
          </div>
        ) : (
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">External</span>
        )
      )
    },
    {
      key: 'rewardType',
      header: 'REWARD TYPE',
      render: (_, tx) => (
        <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${getRewardTypeColor(tx.rewardType)}`}>
          {React.createElement(getRewardTypeIcon(tx.rewardType), { className: "w-3 h-3" })}
          {getRewardTypeLabel(tx.rewardType)}
        </div>
      )
    },
    {
      key: 'amount',
      header: 'AMOUNT',
      render: (_, tx) => (
        <div>
          <div className="text-xl font-black italic tracking-tighter text-primary-600 tabular-nums">+₹{tx.amount}</div>
          <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Reward Earned</div>
        </div>
      )
    },
    {
      key: 'balance',
      header: 'BALANCE AFTER',
      render: (_, tx) => (
        <div className="font-black text-lg italic text-slate-900 dark:text-white tabular-nums">
          ₹{tx.balance?.toLocaleString() || 0}
        </div>
      )
    }
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] max-md:h-[calc(100vh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        <Sidebar />
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] max-md:h-[calc(100vh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">

      <div className="flex-1 min-h-0 flex flex-col transition-all duration-500">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><History className="w-6 h-6 text-primary-600 shrink-0" /> Referral Payouts <span className="text-slate-400 dark:text-slate-500">({pagination.totalItems || 0})</span></h1>

          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
            <div className="relative col-span-2 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
            >
              <option value="all">All Reward Types</option>
              <option value="plan99">Plan 99 Reward (₹33)</option>
            </select>
          </div>
        </div>

        {/* Stats bar */}
        {summary && (
          <div className="grid grid-cols-2 gap-2 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-700 mb-4 shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 lg:p-0 p-2">
            {[
              { label: 'Total Rewards', val: summary.totalRewards, icon: DollarSign },
              { label: 'Plan 99', val: summary.plan99Rewards, icon: Award }
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 px-3 py-2">
                <div className="p-1.5 bg-primary-500/10 text-primary-600 rounded-lg shrink-0"><stat.icon className="w-3.5 h-3.5" /></div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tight">₹{stat.val?.toLocaleString() || 0}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transaction Table */}
        <div className="flex-1 min-h-0 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <History className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-black text-slate-500 uppercase">No Transactions Found</h3>
            <p className="text-sm text-slate-400 mt-2">No referral transactions found for the selected filter. Try a different filter.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
            <ResponsiveTable data={transactions} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
          </div>
        )}
        </div>

        {pagination.totalItems > 0 && (
          <div className="shrink-0">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages || 1}
              onPageChange={handlePageChange}
              totalItems={pagination.totalItems || 0}
              itemsPerPage={limit}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

