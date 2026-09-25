'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, Eye, EyeOff, CheckCircle2,
  XCircle, Clock, AlertTriangle, ReceiptText, Search, Table as TableIcon,
  LayoutGrid, List, IndianRupee, TrendingUp, Users, ArrowUpDown,
  ArrowUp, ArrowDown, Wallet, Calendar, Activity
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../../lib/api';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import StyledSelect from '../../ui/StyledSelect';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../../Sidebar";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


const AdminPaymentTransactions = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    status: 'all',
    plan: 'all',
    search: '',
    page: 1,
    limit: DEFAULT_PAGE_SIZE
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    periodRevenue: 0,
    totalTransactions: 0,
    activeUsers: 0,
    completedTransactions: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    years: [],
    months: [],
    plans: [],
    statuses: ['all', 'completed', 'pending', 'failed', 'refunded']
  });
  const [showFilters, setShowFilters] = useState(true);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (window.innerWidth < 768) setViewMode('grid');
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.getAdminPaymentTransactions({
        ...filters,
        sortField,
        sortOrder
      });
      if (response.success) {
        setTransactions(response.data.transactions || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          limit: DEFAULT_PAGE_SIZE,
          hasNext: false,
          hasPrev: false
        });
      } else {
        setError(response.message || 'Unable to load transactions. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong while loading transactions. ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder]);

  const fetchFilterOptions = async () => {
    try {
      const response = await API.getAdminTransactionFilterOptions();
      if (response.success) {
        setFilterOptions(prev => ({
          ...prev,
          years: response.data.years || [],
          months: response.data.months || [],
          plans: response.data.plans || [],
          statuses: response.data.statuses || ['all']
        }));
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchSummary = useCallback(async () => {
    try {
      const response = await API.getAdminTransactionSummary({
        year: filters.year,
        month: filters.month
      });
      if (response.success) {
        setSummary(response.data || {});
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, [filters.year, filters.month]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchFilterOptions(); }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleItemsPerPageChange = (newLimit) => {
    setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const toggleTransactionDetails = (transactionId) => {
    setExpandedTransaction(expandedTransaction === transactionId ? null : transactionId);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const dayStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dayStr}, ${timeStr}`;
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': case 'success': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'failed': case 'failure': return <XCircle className="w-3.5 h-3.5" />;
      case 'pending': case 'created': case 'authorized': return <Clock className="w-3.5 h-3.5" />;
      case 'refunded': return <AlertTriangle className="w-3.5 h-3.5" />;
      default: return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': case 'success': return 'bg-primary-500/10 text-primary-600 border-primary-500/20';
      case 'failed': case 'failure': return 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20';
      case 'pending': case 'created': case 'authorized': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'refunded': return 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const exportToCSV = () => {
    const csvRows = [['Date', 'User', 'Plan', 'Amount', 'Status', 'Method', 'Order ID']];
    transactions.forEach(t => {
      csvRows.push([
        formatDate(t.createdAt),
        t.user?.name || 'N/A',
        t.planId?.toUpperCase() || 'N/A',
        t.amount || 0,
        t.payuStatus || t.status || 'N/A',
        t.paymentMethod || 'N/A',
        t.orderId || 'N/A'
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${filters.year}_${filters.month}.csv`;
    a.click();
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-primary-600" /> : <ArrowDown className="w-3.5 h-3.5 text-primary-600" />;
  };

  const transactionColumns = [
    {
      key: 'createdAt',
      header: (
        <div onClick={() => handleSort('createdAt')} className="flex items-center gap-2 cursor-pointer hover:text-primary-600 transition-colors">Date <SortIcon field="createdAt" /></div>
      ),
      render: (_, t) => (
        <>
          <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatDate(t.createdAt)}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase">{new Date(t.createdAt).toLocaleTimeString()}</div>
        </>
      )
    },
    {
      key: 'user',
      header: (
        <div onClick={() => handleSort('user.name')} className="flex items-center gap-2 cursor-pointer hover:text-primary-600 transition-colors">User <SortIcon field="user.name" /></div>
      ),
      render: (_, t) => (
        <>
          <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{t.user?.name || 'Unknown User'}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{t.user?.email || 'N/A'}</div>
        </>
      )
    },
    {
      key: 'planId', header: 'Plan', render: (_, t) => (
        <span className="px-3 py-1 bg-primary-500/10 text-primary-600 rounded-lg text-[10px] font-black uppercase border border-primary-500/20">{t.planId || 'N/A'}</span>
      )
    },
    {
      key: 'amount', header: 'Amount', render: (_, t) => (
        <div className="text-right tabular-nums font-black text-slate-900 dark:text-white">{formatCurrency(t.amount)}</div>
      )
    },
    {
      key: 'status', header: 'Status', align: 'center', render: (_, t) => (
        <div className="flex justify-center">
          <div className={`px-4 py-1.5 rounded-lg lg:rounded-xl border-2 text-[9px] font-black uppercase flex items-center gap-2 shadow-sm ${getStatusColor(t.payuStatus || t.status)}`}>
            {getStatusIcon(t.payuStatus || t.status)}
            {t.payuStatus || t.status || 'Unknown'}
          </div>
        </div>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, t) => (
        <div className="flex justify-end">
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => toggleTransactionDetails(t._id)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-xl">
            {expandedTransaction === t._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </motion.button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search by order ID or username..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

  const yearSelect = (
    <StyledSelect
      value={filters.year}
      onChange={(val) => handleFilterChange('year', parseInt(val))}
      options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => ({ value: y, label: y }))}
      className="w-full"
    />
  );

  const monthSelect = (
    <StyledSelect
      value={filters.month}
      onChange={(val) => handleFilterChange('month', val === 'all' ? 'all' : parseInt(val))}
      options={[
        { value: 'all', label: 'All Months' },
        ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('default', { month: 'long' }) }))
      ]}
      className="w-full"
    />
  );

  const statusSelect = (
    <StyledSelect
      value={filters.status}
      onChange={(val) => handleFilterChange('status', val)}
      options={[{ value: 'all', label: 'All Statuses' }, ...filterOptions.statuses.slice(1).map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
      className="w-full"
    />
  );

  const planSelect = (
    <StyledSelect
      value={filters.plan}
      onChange={(val) => handleFilterChange('plan', val)}
      options={[{ value: 'all', label: 'All Plans' }, ...filterOptions.plans.map(p => ({ value: p, label: p }))]}
      className="w-full"
    />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' },
        { icon: List, id: 'list', label: 'List View' }
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

  const exportButton = (
    <button
      onClick={exportToCSV}
      className="w-full col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700"
    >
      <Download className="w-4 h-4" /> Export to CSV
    </button>
  );

  const paginationControl = pagination.totalPages > 1 && (
    <Pagination
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      onPageChange={handlePageChange}
      totalItems={pagination.total}
      itemsPerPage={filters.limit}
      onItemsPerPageChange={handleItemsPerPageChange}
      compact
    />
  );

  useAdminMobileHeader({
    title: 'Transactions',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {yearSelect}
        {monthSelect}
        {statusSelect}
        {planSelect}
        {viewToggleButtons}
        {exportButton}
        {paginationControl}
      </>
    )
  });

  if (loading && transactions.length === 0) {
    return (<div className="adminContent w-full flex items-center justify-center">
      <AdminTableSkeleton />
    </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">


        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-700 mb-4 shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 lg:p-0 p-2">
          {[
            { label: 'Total Revenue', val: summary.totalRevenue || 0, icon: IndianRupee, isCurrency: true },
            { label: 'Monthly Revenue', val: summary.periodRevenue || 0, icon: TrendingUp, isCurrency: true },
            { label: 'Total Transactions', val: summary.totalTransactions || 0, icon: ReceiptText },
            { label: 'Paying Users', val: summary.activeUsers || 0, icon: Users }
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 px-3 py-2">
              <div className="p-1.5 bg-primary-500/10 text-primary-600 rounded-lg shrink-0"><stat.icon className="w-3.5 h-3.5" /></div>
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">{stat.isCurrency ? formatCurrency(stat.val) : stat.val.toLocaleString()}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/10 dark:bg-white/10 border-2 border-black/20 dark:border-white/20 p-3 lg:p-8 rounded-3xl text-center">
              <AlertTriangle className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
              <div className="text-black dark:text-white font-black uppercase tracking-widest">{error}</div>
            </motion.div>
          ) : transactions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-20 text-center shadow-sm">
              <ReceiptText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4 lg:mb-8 opacity-20" />
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 font-outfit">No Transactions Found</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Try adjusting your filters or search terms to find transactions.</p>
            </motion.div>
          ) : (
            <>
            <div className="flex-1 min-h-0 overflow-auto">
              {viewMode === 'table' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
                  <ResponsiveTable data={transactions} columns={transactionColumns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                </div>
              )}

              {viewMode === 'grid' && (
                <div className="grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                  {transactions.map((t, idx) => (
                    <div key={t._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[9px] font-black flex items-center justify-center">{(pagination.currentPage - 1) * filters.limit + idx + 1}</span>
                          <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase flex items-center gap-1.5 ${getStatusColor(t.payuStatus || t.status)}`}>
                            {getStatusIcon(t.payuStatus || t.status)}
                            {t.payuStatus || t.status || 'Unknown'}
                          </div>
                        </div>
                        <button onClick={() => toggleTransactionDetails(t._id)} className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg shrink-0">
                          {expandedTransaction === t._id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.user?.name || 'Unknown User'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{t.user?.email || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 flex justify-between items-center">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Amount</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(t.amount)}</div>
                        </div>
                        <div className="px-2 py-1 bg-primary-500/10 rounded-lg text-primary-600 font-black text-[10px] uppercase">{t.planId || 'N/A'}</div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-[9px] font-bold text-slate-400">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateTime(t.createdAt)}</div>
                        <div className="flex items-center gap-1"><Wallet className="w-3 h-3" />{t.paymentMethod || 'Online'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="h-full overflow-auto space-y-3">
                  {transactions.map((t, idx) => (
                    <div key={t._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`relative p-2.5 rounded-xl border ${getStatusColor(t.payuStatus || t.status)}`}>
                          {getStatusIcon(t.payuStatus || t.status)}
                          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(pagination.currentPage - 1) * filters.limit + idx + 1}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{t.user?.name || 'Unknown User'}</div>
                          <div className="text-[10px] text-slate-400">{formatDateTime(t.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Plan</div>
                          <div className="text-xs font-black text-primary-600 uppercase">{t.planId || 'N/A'}</div>
                        </div>
                        <div className="text-right min-w-[90px]">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Amount</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(t.amount)}</div>
                        </div>
                        <button onClick={() => toggleTransactionDetails(t._id)} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg">
                          {expandedTransaction === t._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentTransactions;

