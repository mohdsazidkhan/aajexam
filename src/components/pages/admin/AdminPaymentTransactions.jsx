'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Filter, Download, Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, Clock, AlertTriangle, ReceiptText, Search, Table as TableIcon,
  LayoutGrid, List, IndianRupee, TrendingUp, Users, ArrowUpDown,
  ArrowUp, ArrowDown, Wallet, Calendar, BarChart3, Activity, PieChart,
  Target, Globe, Cpu, Zap
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../../lib/api';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../../Sidebar";


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
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
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
  const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

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
          limit: 20,
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
      case 'completed': case 'success': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'failed': case 'failure': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'pending': case 'created': case 'authorized': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'refunded': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
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
    return sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-500" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-500" />;
  };

  if (loading && transactions.length === 0) {
    return (<div className="adminContent w-full flex items-center justify-center">
      <Loading size="md" color="yellow" message="Loading Transactions..." />
    </div>
    );
  }

  return (
    <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">


        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 text-indigo-500 rounded-2xl">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Admin // Payment Transactions</span>
              </div>
              <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                Payment Transactions
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Track and manage all payment transactions on the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:flex lg:items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner">
                {[
                  { icon: TableIcon, id: 'table', label: 'Table' },
                  { icon: LayoutGrid, id: 'grid', label: 'Cards' },
                  { icon: List, id: 'list', label: 'List' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-4 rounded-full transition-all flex items-center gap-2 ${viewMode === mode.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <mode.icon className="w-4 h-4" />
                    {viewMode === mode.id && <span className="text-[10px] font-black uppercase tracking-widest leading-none pr-1">{mode.label}</span>}
                  </button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                className="w-full lg:w-auto px-4 lg:px-8 py-4 bg-indigo-500 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
              >
                <Download className="w-4 h-4" /> Export CSV
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4">
          {[
            { label: 'Total Revenue', val: summary.totalRevenue || 0, icon: IndianRupee, color: 'emerald', isCurrency: true },
            { label: 'Monthly Revenue', val: summary.periodRevenue || 0, icon: TrendingUp, color: 'indigo', isCurrency: true },
            { label: 'Total Transactions', val: summary.totalTransactions || 0, icon: ReceiptText, color: 'purple' },
            { label: 'Paying Users', val: summary.activeUsers || 0, icon: Users, color: 'rose' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-3 lg:p-8 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl group hover:border-indigo-500/30 transition-all font-outfit"
            >
              <div className={`p-4 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl lg:text-3xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white mb-2 truncate">
                {stat.isCurrency ? formatCurrency(stat.val) : stat.val.toLocaleString()}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-8 mb-4 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-8">
            <div className="flex-1 relative group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by order ID or username..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase outline-none transition-all shadow-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 w-full lg:w-auto">
              {[
                { icon: Calendar, val: filters.year, options: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i), key: 'year' },
                { icon: Calendar, val: filters.month, options: [{ l: 'All Months', v: 'all' }, ...Array.from({ length: 12 }, (_, i) => ({ l: new Date(0, i).toLocaleString('default', { month: 'long' }), v: i + 1 }))], key: 'month' },
                { icon: Activity, val: filters.status, options: [{ l: 'All Statuses', v: 'all' }, ...filterOptions.statuses.slice(1).map(s => ({ l: s.charAt(0).toUpperCase() + s.slice(1), v: s }))], key: 'status' },
                { icon: PieChart, val: filters.plan, options: [{ l: 'All Plans', v: 'all' }, ...filterOptions.plans.map(p => ({ l: p, v: p }))], key: 'plan' }
              ].map((f, i) => (
                <div key={i} className="w-full lg:w-auto flex items-center gap-3 px-3 lg:px-6 py-3 bg-white dark:bg-white/10 rounded-2xl shadow-sm border-2 border-slate-200/50 dark:border-white/5">
                  <f.icon className="w-4 h-4 text-indigo-500" />
                  <select
                    value={f.val}
                    onChange={(e) => handleFilterChange(f.key, e.target.value === 'all' ? 'all' : (f.key === 'year' || f.key === 'month' ? parseInt(e.target.value) : e.target.value))}
                    className="w-full lg:w-auto bg-transparent text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none cursor-pointer"
                  >
                    {f.options.map((o, idx) => (
                      <option key={idx} value={typeof o === 'object' ? o.v : o}>{typeof o === 'object' ? o.l : o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/10 border-2 border-rose-500/20 p-3 lg:p-8 rounded-3xl text-center">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <div className="text-rose-500 font-black uppercase tracking-widest">{error}</div>
            </motion.div>
          ) : transactions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-20 text-center shadow-2xl">
              <ReceiptText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4 lg:mb-8 opacity-20" />
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 font-outfit">No Transactions Found</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Try adjusting your filters or search terms to find transactions.</p>
            </motion.div>
          ) : (
            <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {viewMode === 'table' && (
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                        <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                        <th onClick={() => handleSort('createdAt')} className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 transition-colors">
                          <div className="flex items-center gap-2">Date <SortIcon field="createdAt" /></div>
                        </th>
                        <th onClick={() => handleSort('user.name')} className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 transition-colors">
                          <div className="flex items-center gap-2">User <SortIcon field="user.name" /></div>
                        </th>
                        <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                        <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                        <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {transactions.map((t, idx) => (
                        <motion.tr key={t._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                          <td className="px-4 lg:px-8 py-3 lg:py-6 text-slate-300 dark:text-slate-700 font-mono text-[10px]">{(idx + 1).toString().padStart(2, '0')}</td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6">
                            <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatDate(t.createdAt)}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">{new Date(t.createdAt).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6">
                            <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{t.user?.name || 'Unknown User'}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{t.user?.email || 'N/A'}</div>
                          </td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[10px] font-black uppercase border border-indigo-500/20">{t.planId || 'N/A'}</span>
                          </td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6 text-right tabular-nums font-black text-slate-900 dark:text-white">{formatCurrency(t.amount)}</td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6">
                            <div className="flex justify-center">
                              <div className={`px-4 py-1.5 rounded-xl border-2 text-[9px] font-black uppercase flex items-center gap-2 shadow-sm ${getStatusColor(t.payuStatus || t.status)}`}>
                                {getStatusIcon(t.payuStatus || t.status)}
                                {t.payuStatus || t.status || 'Unknown'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => toggleTransactionDetails(t._id)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl">
                              {expandedTransaction === t._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
                  {transactions.map((t, idx) => (
                    <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl flex flex-col font-outfit relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
                      <div className="flex justify-between items-start mb-4 lg:mb-8">
                        <div className={`px-4 py-1.5 rounded-xl border-2 text-[9px] font-black uppercase flex items-center gap-2 ${getStatusColor(t.payuStatus || t.status)}`}>
                          {getStatusIcon(t.payuStatus || t.status)}
                          {t.payuStatus || t.status || 'Unknown'}
                        </div>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => toggleTransactionDetails(t._id)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl">
                          {expandedTransaction === t._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>
                      </div>
                      <div className="space-y-3 lg:space-y-6 flex-1">
                        <div>
                          <div className="text-lg font-black text-slate-900 dark:text-white uppercase truncate">{t.user?.name || 'Unknown User'}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase truncate">{t.user?.email || 'N/A'}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border-2 border-slate-100 dark:border-white/10 flex justify-between items-center">
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Amount</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{formatCurrency(t.amount)}</div>
                          </div>
                          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 font-black text-xs uppercase tracking-widest">{t.planId || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="mt-4 lg:mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between text-[9px] font-black text-slate-400 uppercase">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />{formatDate(t.createdAt)}</div>
                        <div className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5" />{t.paymentMethod || 'Online Payment'}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-3 lg:space-y-6">
                  {transactions.map((t, idx) => (
                    <motion.div key={t._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-indigo-500/30 transition-all font-outfit shadow-xl">
                      <div className="flex items-center gap-3 lg:gap-6">
                        <div className={`p-4 rounded-2xl border-2 ${getStatusColor(t.payuStatus || t.status)} shadow-sm`}>{getStatusIcon(t.payuStatus || t.status)}</div>
                        <div>
                          <div className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{t.user?.name || 'Unknown User'}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDateTime(t.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 lg:gap-8">
                        <div className="text-right">
                          <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Plan</div>
                          <div className="text-sm font-black text-primary-500 uppercase tracking-widest tracking-widest">{t.planId || 'N/A'}</div>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Amount Paid</div>
                          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{formatCurrency(t.amount)}</div>
                        </div>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => toggleTransactionDetails(t._id)} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl">
                          {expandedTransaction === t._id ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-3 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/5 shadow-lg w-fit mx-auto">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-3 rounded-xl bg-white dark:bg-white/10 text-slate-600 dark:text-white disabled:opacity-30 hover:scale-110 transition shadow-sm border border-slate-100 dark:border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1 px-4">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${pagination.currentPage === pageNum ? 'bg-indigo-500 text-white shadow-xl scale-110' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600'}`}
                  >
                    {pageNum.toString().padStart(2, '0')}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-3 rounded-xl bg-white dark:bg-white/10 text-slate-600 dark:text-white disabled:opacity-30 hover:scale-110 transition shadow-sm border border-slate-100 dark:border-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentTransactions;

