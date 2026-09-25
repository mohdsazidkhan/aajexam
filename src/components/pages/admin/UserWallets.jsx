'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Wallet, Search, LayoutGrid, List, Table,
  User, Phone, Mail, Crown,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '../../../utils/authUtils';
import Pagination from '../../Pagination';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from '../../Sidebar';
import ResponsiveTable from '../../ResponsiveTable';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminUserWallets = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [resetting, setResetting] = useState(false);
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

  useEffect(() => {
    if (window.innerWidth < 768) setViewMode('grid');
  }, []);

  const formatAmount = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setPage(1);
  };

  const walletColumns = [
    {
      key: 'user',
      header: 'Student',
      render: (_, row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-600 p-[2px] shadow-sm group-hover:rotate-6 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xs text-primary-600">
              {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors">{row.user?.name || row.name || 'Unknown'}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-600 text-[8px] font-black uppercase tracking-widest">{(row.user?.subscriptionStatus || row.subscriptionStatus) === 'PRO' ? 'PRO' : 'FREE'}</span>
              {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'PRO' && <Crown className="w-3 h-3 text-black dark:text-white" />}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (_, row) => (
        <div className="text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-2 mb-1"><Mail className="w-3 h-3" /> {row.user?.email || row.email || '-'}</div>
          <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {row.user?.phone || row.phone || '-'}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Balance',
      align: 'right',
      render: (_, row) => (
        <div className="text-sm font-black text-primary-600 tabular-nums italic tracking-tighter text-right">
          {formatAmount(row.amount || row.walletBalance)}
        </div>
      )
    },
    {
      key: 'pendingRewards',
      header: 'Pending Rewards',
      align: 'center',
      render: () => (
        <div className="text-center">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">-</span>
        </div>
      )
    },
    {
      key: 'questionCounts',
      header: 'Questions',
      render: (_, row) => (
        <div className="grid grid-cols-2 gap-2 max-w-[150px]">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase">TOTAL</span>
            <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{row.questionCounts?.total || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-primary-600 uppercase">APPROVED</span>
            <span className="text-xs font-black text-primary-600 tabular-nums">{row.questionCounts?.approved || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (_, row) => (
        <div>
          <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums leading-none mb-1">{formatDate(row.createdAt)}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.createdAt ? new Date(row.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}</div>
        </div>
      )
    }
  ];

  const handleResetClaimableRewards = async () => {
    if (!confirm('Are you sure you want to reset all pending rewards to 0 for every student who has unclaimed rewards? This action cannot be undone.')) {
      return;
    }

    setResetting(true);
    try {
      const res = await API.resetClaimableRewards();
      if (res?.success) {
        alert(`Successfully reset pending rewards for ${res.modifiedCount || 0} students.`);
        load(); // Refresh the data
      } else {
        alert('Failed to reset rewards: ' + (res?.message || 'Unknown error'));
      }
    } catch (e) {
      console.error('Failed to reset rewards', e);
      alert('Failed to reset rewards: ' + (e.response?.data?.message || e.message || 'Unknown error'));
    } finally {
      setResetting(false);
    }
  };

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
        placeholder="Search by username..."
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { id: 'table', icon: Table, label: 'Table View' },
        { id: 'grid', icon: LayoutGrid, label: 'Grid View' },
        { id: 'list', icon: List, label: 'List View' }
      ].map((mode) => (
        <button
          key={mode.id}
          onClick={() => setViewMode(mode.id)}
          title={mode.label}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const resetButton = (
    <button
      onClick={handleResetClaimableRewards}
      disabled={resetting}
      className="w-full col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700 disabled:opacity-50"
    >
      <RefreshCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
      {resetting ? 'Resetting...' : 'Reset All Rewards'}
    </button>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={page}
      totalPages={Math.max(1, Math.ceil(total / itemsPerPage))}
      onPageChange={setPage}
      totalItems={total}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );

  useAdminMobileHeader({
    title: 'Wallets',
    count: total,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {resetButton}
        {paginationControl}
      </>
    )
  });

  const content = (
    <div className="flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden text-slate-900 dark:text-white font-sans selection:bg-primary-500/30">
      <div className="flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">
        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Wallet className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-6" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Wallet Records Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">There are no student wallets matching your search. Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto">
            {viewMode === 'table' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
                <ResponsiveTable
                  data={items}
                  columns={walletColumns}
                  viewModes={['table']}
                  defaultView={'table'}
                  showPagination={false}
                  showViewToggle={false}
                  fillHeight
                />
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="h-full overflow-auto space-y-3">
                {items.map((row, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-black text-sm text-white shrink-0">
                        {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{row.user?.name || row.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                          <span>{row.user?.email || row.email || 'N/A'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                          <span>{row.user?.phone || row.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Status</span>
                        <div className="text-xs font-black text-slate-500">{row.subscriptionStatus === 'PRO' ? 'PRO' : 'FREE'}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Balance</span>
                        <div className="text-sm font-black text-primary-600 tabular-nums">{formatAmount(row.amount || row.walletBalance)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                {items.map((row, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-black text-sm text-white shrink-0">
                        {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{row.user?.name || row.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-600 text-[9px] font-black">{(row.user?.subscriptionStatus || row.subscriptionStatus) === 'PRO' ? 'PRO' : 'FREE'}</span>
                          {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'PRO' && <Crown className="w-3 h-3 text-black dark:text-white" />}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400">Joined {formatDate(row.createdAt)}</div>
                    <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Balance</span>
                      <span className="text-sm font-black text-primary-600 tabular-nums">{formatAmount(row.amount || row.walletBalance)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">
        {content}
      </div>
    </div>
  );
};

export default AdminUserWallets;
