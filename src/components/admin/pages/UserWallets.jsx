'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Wallet, Search, LayoutGrid, List, Table,
  User, Phone, Mail, Crown,
  RefreshCcw
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '../../../utils/authUtils';
import Pagination from '../../common/Pagination';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from '../Sidebar';
import ResponsiveTable from '../../common/ResponsiveTable';
import { AdminTableSkeleton } from '../Skeletons';
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
      console.error('Failed to load Referral Rewards', e);
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-600 p-[2px] group-hover:rotate-6 transition-transform">
            <div className="w-full h-full rounded-2xl bg-background-surface flex items-center justify-center font-bold text-xs text-primary-600">
              {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-content-primary uppercase tracking-tight group-hover:text-primary-600 transition-colors">{row.user?.name || row.name || 'Unknown'}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md text-primary-600 text-[8px] font-bold uppercase tracking-[0.08em]">{(row.user?.subscriptionStatus || row.subscriptionStatus) === 'PRO' ? 'PRO' : 'FREE'}</span>
              {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'PRO' && <Crown className="w-3 h-3 text-content-primary" />}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (_, row) => (
        <div className="text-[10px] font-bold text-content-muted">
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
        <div className="text-sm font-bold text-primary-600 tabular-nums italic tracking-tight text-right">
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
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.08em]">-</span>
        </div>
      )
    },
    {
      key: 'questionCounts',
      header: 'Questions',
      render: (_, row) => (
        <div className="grid grid-cols-2 gap-2 max-w-[150px]">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-content-muted uppercase">TOTAL</span>
            <span className="text-xs font-bold text-content-primary tabular-nums">{row.questionCounts?.total || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-primary-600 uppercase">APPROVED</span>
            <span className="text-xs font-bold text-primary-600 tabular-nums">{row.questionCounts?.approved || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (_, row) => (
        <div>
          <div className="text-[10px] font-bold text-content-primary uppercase tracking-tight tabular-nums leading-none mb-1">{formatDate(row.createdAt)}</div>
          <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">{row.createdAt ? new Date(row.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}</div>
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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
        placeholder="Search by username..."
        className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm"
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
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const resetButton = (
    <button
      onClick={handleResetClaimableRewards}
      disabled={resetting}
      className="w-full col-span-2 xl:col-span-1 flex items-center justify-center gap-2 text-on-primary px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 bg-primary-600"
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
    title: 'Referral Rewards',
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
    <div className="flex-1 min-h-0 overflow-auto flex flex-col text-content-primary font-sans">
      <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-background-surface rounded-2xl border border-border-primary">
            <Wallet className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-content-primary tracking-tight mb-2">No Referral Rewards Records Found</h3>
            <p className="text-sm text-content-muted max-w-md text-center">There are no student Referral Rewards matching your search. Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto">
            {viewMode === 'table' && (
              <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
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
                  <div key={idx} className="bg-background-surface rounded-xl border border-border-primary p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-3 relative">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-sm text-on-primary shrink-0">
                        {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{(page - 1) * itemsPerPage + idx + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-content-primary truncate">{row.user?.name || row.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-content-muted flex-wrap">
                          <span>{row.user?.email || row.email || 'N/A'}</span>
                          <span className="w-1 h-1 rounded-full bg-border-primary shrink-0" />
                          <span>{row.user?.phone || row.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-content-muted uppercase block">Status</span>
                        <div className="text-xs font-bold text-content-muted">{row.subscriptionStatus === 'PRO' ? 'PRO' : 'FREE'}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-content-muted uppercase block">Balance</span>
                        <div className="text-sm font-bold text-primary-600 tabular-nums">{formatAmount(row.amount || row.walletBalance)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                {items.map((row, idx) => (
                  <div key={idx} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3 relative">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-sm text-on-primary shrink-0">
                        {(row.user?.name || row.name || 'U').charAt(0).toUpperCase()}
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{(page - 1) * itemsPerPage + idx + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-content-primary truncate">{row.user?.name || row.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-primary-600 text-[9px] font-bold">{(row.user?.subscriptionStatus || row.subscriptionStatus) === 'PRO' ? 'PRO' : 'FREE'}</span>
                          {(row.user?.subscriptionStatus || row.subscriptionStatus) === 'PRO' && <Crown className="w-3 h-3 text-content-primary" />}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-content-muted">Joined {formatDate(row.createdAt)}</div>
                    <div className="p-2.5 rounded-lg border border-border-primary flex items-center justify-between">
                      <span className="text-[9px] font-bold text-content-muted uppercase">Balance</span>
                      <span className="text-sm font-bold text-primary-600 tabular-nums">{formatAmount(row.amount || row.walletBalance)}</span>
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
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">
        {content}
      </div>
    </div>
  );
};

export default AdminUserWallets;
