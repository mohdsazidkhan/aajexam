'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, CheckCircle, Clock, CreditCard, Download, Filter,
  IndianRupee, Layers, LayoutDashboard, LineChart, PieChart,
  TrendingUp, Users, Wallet, Zap, Cpu, Search, Plus, X,
  Eye, EyeOff, ChevronLeft, ChevronRight, Crown, Star, Gem,
  Rocket, Table, LayoutGrid, List, Calendar, ArrowUp, ArrowDown,
  AlertTriangle, XCircle
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';

// â€”â€”â€”â€”â€” Stats Card â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
function StatsCard({ icon: Icon, label, value, sub, color = "primary", i = 0 }) {
  const colors = {
    primary: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    secondary: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 + 0.3 }}
      className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 hover:border-indigo-500/30 transition-all shadow-xl overflow-hidden cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      </div>
      <div className="space-y-1">
        <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none group-hover:text-indigo-500 transition-colors">
          {value}
        </div>
        {sub !== undefined && (
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
            {sub}
          </div>
        )}
      </div>
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
    </motion.div>
  );
}

const AdminSubscriptions = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    plan: 'all',
    status: 'all',
    year: new Date().getFullYear(),
    month: '0', // Default to no month filter
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
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    freeSubscriptions: 0,
    paidSubscriptions: 0,
    totalRevenue: 0,
    periodRevenue: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    plans: ['Free', 'Basic', 'Premium', 'Pro'],
    statuses: ['all', 'active', 'inactive', 'expired', 'cancelled'],
    years: [],
    months: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSubscription, setExpandedSubscription] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    // Set default view based on screen size
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'grid' : 'table';
    }
    return 'table';
  }); // table, grid, list
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [extendForm, setExtendForm] = useState({
    plan: 'basic',
    duration: '1 month'
  });
  const [extending, setExtending] = useState(false);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.getAdminSubscriptions({
        ...filters,
        sortField,
        sortOrder
      });

      if (response.success) {
        setSubscriptions(response.data.subscriptions);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          limit: 20,
          hasNext: false,
          hasPrev: false
        });
        setSummary(response.data.summary || {});
      } else {
        setError(response.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      setError('Error fetching subscriptions: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder]);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await API.getAdminSubscriptionFilterOptions();
      if (response.success) {
        setFilterOptions(prev => ({
          ...prev,
          years: response.data.years || [],
          months: response.data.months || []
        }));
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    try {
      const response = await API.getAdminSubscriptionSummary({
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

  useEffect(() => {
    fetchSubscriptions();
    fetchSummary();
  }, [fetchSubscriptions, fetchSummary]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Handle window resize to update view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'table') {
        setViewMode('grid');
      } else if (window.innerWidth >= 768 && viewMode === 'grid') {
        setViewMode('table');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handlePageSizeChange = (newLimit) => {
    setFilters(prev => ({
      ...prev,
      limit: parseInt(newLimit),
      page: 1 // Reset to first page when changing page size
    }));
  };

  const toggleSubscriptionDetails = (subscriptionId) => {
    setExpandedSubscription(expandedSubscription === subscriptionId ? null : subscriptionId);
  };

  const openExtendModal = (subscription) => {
    setSelectedSubscription(subscription);
    setExtendForm({
      plan: subscription.planName?.toLowerCase() || 'basic',
      duration: '1 month'
    });
    setShowExtendModal(true);
  };

  const closeExtendModal = () => {
    setShowExtendModal(false);
    setSelectedSubscription(null);
    setExtendForm({
      plan: 'basic',
      duration: '1 month'
    });
  };

  const handleExtendSubscription = async () => {
    if (!selectedSubscription || !extendForm.plan || !extendForm.duration) {
      setError('Please select both plan and duration');
      return;
    }

    try {
      setExtending(true);
      setError(null);

      const response = await API.extendUserSubscription(selectedSubscription.user._id, {
        plan: extendForm.plan,
        duration: extendForm.duration
      });

      if (response.success) {
        // Refresh subscriptions list
        await fetchSubscriptions();
        await fetchSummary();
        closeExtendModal();
        alert(`Subscription ${response.data.isExtension ? 'extended' : 'created'} successfully!`);
      } else {
        setError(response.message || 'Failed to extend subscription');
      }
    } catch (err) {
      setError('Error extending subscription: ' + err.message);
    } finally {
      setExtending(false);
    }
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

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'ERR_DATE';

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    if (!includeTime) return `${day}-${month}-${year}`;

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day}-${month}-${year} // ${time}`;
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'pro': return <Crown className="w-4 h-4 text-amber-500" />;
      case 'premium': return <Gem className="w-4 h-4 text-indigo-500" />;
      case 'basic': return <Star className="w-4 h-4 text-indigo-500" />;
      default: return <Rocket className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'pro': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case 'premium': return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
      case 'basic': return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'expired': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-slate-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case 'expired': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case 'inactive': return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['User Name', 'Email', 'Plan', 'Status', 'Start Date', 'Expiry Date', 'Amount', 'Payment Method'];
    csvRows.push(headers.join(','));

    subscriptions.forEach(subscription => {
      const row = [
        subscription.user?.name || 'N/A',
        subscription.user?.email || 'N/A',
        subscription.planName || 'N/A',
        subscription.status || 'N/A',
        formatDate(subscription.startDate || subscription.createdAt),
        formatDate(subscription.expiryDate || 'N/A'),
        subscription.amount || 0,
        subscription.paymentMethod || 'N/A'
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `subscriptions_${filters.year}_${filters.month}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <div className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg opacity-40"><ArrowUp className="w-3 h-3" /></div>;
    return (
      <div className="p-1.5 bg-indigo-500/20 text-indigo-500 rounded-lg">
        {sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminMobileAppWrapper title="Subscriptions">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && isAdminRoute && <Sidebar />}
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading subscriptions..." />
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Subscriptions">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'} bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white min-h-screen font-sans selection:bg-indigo-500/30`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 lg:p-12 w-full max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-4 md:p-8 lg:p-12 mb-12 shadow-2xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers className="w-64 h-64 text-indigo-500 -rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">ADMIN // SUBSCRIPTIONS</span>
                </div>

                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                  MANAGE <span className="text-indigo-600">SUBSCRIPTIONS</span>
                </h1>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group/search">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search subscriptions..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-14 pr-8 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all w-full lg:w-80"
                    />
                  </div>

                  <div className="flex bg-slate-100 dark:bg-white/5 p-2 rounded-2xl border-2 border-slate-200/50 dark:border-white/5">
                    {[
                      { mode: 'table', icon: Table },
                      { mode: 'grid', icon: LayoutGrid },
                      { mode: 'list', icon: List }
                    ].map(({ mode, icon: Icon }) => (
                      <motion.button
                        key={mode}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode(mode)}
                        className={`p-3 rounded-xl transition-all ${viewMode === mode ? 'bg-white dark:bg-white/10 text-indigo-500 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportToCSV}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/20 group/btn"
                  >
                    <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-widest">EXPORT CSV</span>
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL REVENUE</span>
                <div className="flex items-center gap-3 text-5xl lg:text-7xl font-black text-indigo-600 tabular-nums tracking-tighter">
                  <IndianRupee className="w-10 h-10 lg:w-16 lg:h-16 stroke-[3]" />
                  {(summary.totalRevenue || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
            <StatsCard i={0} color="primary" icon={Users} label="TOTAL SUBS" value={summary.totalSubscriptions || 0} sub="GRAND TOTAL" />
            <StatsCard i={1} color="emerald" icon={CheckCircle} label="ACTIVE PLANS" value={summary.activeSubscriptions || 0} sub="CURRENTLY ACTIVE" />
            <StatsCard i={2} color="rose" icon={Zap} label="PAID PLANS" value={summary.paidSubscriptions || 0} sub="PREMIUM MEMBERS" />
            <StatsCard i={3} color="secondary" icon={Clock} label="FREE PLANS" value={summary.freeSubscriptions || 0} sub="NON-PAID MEMBERS" />
            <StatsCard i={4} color="purple" icon={TrendingUp} label="TOTAL REVENUE" value={formatCurrency(summary.totalRevenue || 0)} sub="NET GROWTH" />
            <StatsCard i={5} color="amber" icon={Calendar} label="MONTHLY REVENUE" value={formatCurrency(summary.periodRevenue || 0)} sub="CURRENT MONTH" />
          </div>


          {/* Filter Controller */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 mb-12 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex items-center gap-4 px-6 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl border-2 border-slate-200/50 dark:border-white/5">
                <Filter className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REFINE RESULTS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                <select
                  value={filters.plan}
                  onChange={(e) => handleFilterChange('plan', e.target.value)}
                  className="bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer outline-none"
                >
                  <option value="all">Plan: ALL PLANS</option>
                  {filterOptions.plans.map(plan => (
                    <option key={plan} value={plan}>Plan: {plan.toUpperCase()}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer outline-none"
                >
                  <option value="all">Status: ALL STATUS</option>
                  {filterOptions.statuses.slice(1).map(status => (
                    <option key={status} value={status}>Status: {status.toUpperCase()}</option>
                  ))}
                </select>

                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                  className="bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer outline-none"
                >
                  <option value="">Year: ALL YEARS</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>Year: {year}</option>
                  ))}
                </select>

                <select
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                  className="bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer outline-none"
                >
                  <option value={0}>Month: ALL MONTHS</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      Month: {new Date(0, month - 1).toLocaleString('default', { month: 'long' }).toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.limit}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer outline-none"
                >
                  {[10, 20, 50, 100, 250, 500].map(v => <option key={v} value={v}>Show: {v} rows</option>)}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Registry View Matrix */}
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/10 border-4 border-rose-500/20 rounded-[3.5rem] p-12 text-center shadow-2xl"
              >
                <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/30">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">FAILED TO LOAD DATA</h3>
                <p className="text-rose-500 font-bold uppercase text-sm tracking-widest">{error}</p>
              </motion.div>
            ) : subscriptions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-100 dark:bg-white/5 border-4 border-slate-200 dark:border-white/5 rounded-[3.5rem] p-24 text-center shadow-2xl"
              >
                <Layers className="w-24 h-24 text-slate-300 mx-auto mb-8 opacity-20" />
                <h3 className="text-xl lg:text-2xl font-black text-slate-400 uppercase tracking-tighter">NO SUBSCRIPTIONS FOUND</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">No active subscriptions detected in the current filter.</p>
              </motion.div>
            ) : (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Table View */}
                {viewMode === 'table' && (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto selection:bg-indigo-500/30">
                      <table className="w-full border-separate border-spacing-y-4 px-8 py-4">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                            <th className="px-6 py-4">S.No.</th>
                            <th className="px-6 py-4 cursor-pointer group" onClick={() => handleSort('createdAt')}>
                              <div className="flex items-center gap-2 group-hover:text-indigo-500 transition-colors">CREATED AT <SortIcon field="createdAt" /></div>
                            </th>
                            <th className="px-6 py-4">USER</th>
                            <th className="px-6 py-4">PLAN</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4">VALIDITY</th>
                            <th className="px-6 py-4 text-right">AMOUNT</th>
                            <th className="px-6 py-4 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscriptions.map((subscription, index) => (
                            <motion.tr
                              key={subscription._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="group bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-xl rounded-3xl"
                            >
                              <td className="px-6 py-6 first:rounded-l-[2rem]">
                                <span className="text-[10px] font-black text-slate-400 tabular-nums">#{((pagination.currentPage - 1) * filters.limit) + index + 1}</span>
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums leading-none mb-1">
                                    {formatDate(subscription.createdAt || subscription.created_at || subscription.startDate)}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: {subscription._id?.slice(-6).toUpperCase()}</span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-500 p-[2px] shadow-lg group-hover:rotate-6 transition-transform">
                                    <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xs text-indigo-500">
                                      {subscription.user?.name?.charAt(0) || 'U'}
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-500 transition-colors line-clamp-1">{subscription.user?.name || 'N/A'}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 line-clamp-1">{subscription.user?.email || 'N/A'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${getPlanColor(subscription.planName)}`}>
                                  {getPlanIcon(subscription.planName)}
                                  {subscription.planName || 'FREE'}
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${getStatusColor(subscription.status)}`}>
                                  {getStatusIcon(subscription.status)}
                                  {subscription.status || 'UNKNOWN'}
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="uppercase tracking-widest tabular-nums">{formatDate(subscription.startDate || subscription.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    <span className="uppercase tracking-widest tabular-nums">{subscription.expiryDate ? formatDate(subscription.expiryDate) : 'INDEFINITE'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6 text-right">
                                <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic">
                                  {subscription.amount ? formatCurrency(subscription.amount) : "₹0.00"}
                                </div>
                              </td>
                              <td className="px-6 py-6 last:rounded-r-[2rem] text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleSubscriptionDetails(subscription._id)}
                                    className="p-3 text-indigo-500 rounded-xl"
                                  >
                                    {expandedSubscription === subscription._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => openExtendModal(subscription)}
                                    className="p-3 text-emerald-500 rounded-xl"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {subscriptions.map((subscription, index) => (
                      <motion.div
                        key={subscription._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-8 shadow-2xl hover:border-indigo-500/30 transition-all overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className={`px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${getPlanColor(subscription.planName)}`}>
                            {subscription.planName || 'FREE'}
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openExtendModal(subscription)}
                              className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border-2 border-emerald-500/20"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                            <div className={`px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${getStatusColor(subscription.status)}`}>
                              {subscription.status || 'UNKNOWN'}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-6 pb-6 border-b-2 border-slate-100 dark:border-white/5">
                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-indigo-500 p-[3px] shadow-xl">
                              <div className="w-full h-full rounded-[21px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xl text-indigo-500">
                                {subscription.user?.name?.charAt(0) || 'U'}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <h4 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2 line-clamp-1">{subscription.user?.name || 'N/A'}</h4>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">{subscription.user?.email || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">START DATE</span>
                              <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{formatDate(subscription.startDate || subscription.createdAt)}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">EXPIRY DATE</span>
                              <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{subscription.expiryDate ? formatDate(subscription.expiryDate) : "INDEFINITE"}</div>
                            </div>
                          </div>

                          <div className="pt-4 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">REFERENCE ID</span>
                              <span className="text-[10px] font-black text-indigo-500 tabular-nums uppercase">#{subscription._id?.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                              {subscription.amount ? formatCurrency(subscription.amount) : "₹0"}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-6">
                    {subscriptions.map((subscription, index) => (
                      <motion.div
                        key={subscription._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 shadow-xl hover:border-indigo-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-500 p-[2px] shadow-lg">
                            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-sm text-indigo-500">
                              {subscription.user?.name?.charAt(0) || 'U'}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-500 transition-colors line-clamp-1">{subscription.user?.name || 'N/A'}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">{subscription.user?.email || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className={`px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${getPlanColor(subscription.planName)}`}>
                            {subscription.planName || 'FREE_LEVEL'}
                          </div>
                          <div className={`px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${getStatusColor(subscription.status)}`}>
                            {subscription.status || 'UNKNOWN'}
                          </div>
                        </div>

                        <div className="flex items-center gap-12">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">STAMP_SYNC</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums uppercase">{formatDate(subscription.createdAt)}</span>
                          </div>
                          <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic">
                            {subscription.amount ? formatCurrency(subscription.amount) : "₹0"}
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openExtendModal(subscription)}
                              className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border-2 border-emerald-500/20"
                            >
                              <Plus className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Tactical Pagination Orchestrator */}
                {pagination.totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-12 border-t-4 border-slate-100 dark:border-white/5"
                  >
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-8 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl border-2 border-slate-200/50 dark:border-white/5 italic">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} // {Math.min(pagination.currentPage * pagination.limit, pagination.total)} OF {pagination.total} ENTRIES_ACTIVE
                    </div>

                    <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 p-2 rounded-[2rem] border-2 border-slate-200/50 dark:border-white/5">
                      <motion.button
                        whileHover={{ scale: 1.1, x: -3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="p-4 bg-white dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-2xl disabled:opacity-20 transition-all font-black"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </motion.button>

                      <div className="flex items-center px-4 gap-4">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <motion.button
                              key={page}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${pagination.currentPage === page ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                            >
                              {page}
                            </motion.button>
                          );
                        })}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1, x: 3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-4 bg-white dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-2xl disabled:opacity-20 transition-all font-black"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tactical Extend Registry Modal */}
          <AnimatePresence>
            {showExtendModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeExtendModal}
                  className="absolute inset-0 bg-[#fafafa]/80 dark:bg-[#050505]/80 backdrop-blur-xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8">
                    <motion.button whileHover={{ rotate: 90 }} onClick={closeExtendModal} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl">
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  <div className="p-12">
                    <div className="flex items-center gap-4 mb-12">
                      <div className="p-4 bg-emerald-500/20 text-emerald-500 rounded-3xl">
                        <Layers className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">EXTEND PLAN</h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedSubscription?.user?.name || 'User'} / {selectedSubscription?.user?.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 bg-slate-50 dark:bg-white/5 p-4 lg:p-8 rounded-[2.5rem] border-2 border-slate-200/50 dark:border-white/5">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">START DATE</label>
                        <select
                          value={extendForm.plan}
                          onChange={(e) => setExtendForm({ ...extendForm, plan: e.target.value })}
                          className="w-full bg-white dark:bg-white/10 border-2 border-transparent focus:border-emerald-500/50 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="free">Free_Node</option>
                          <option value="basic">Basic_Logic</option>
                          <option value="premium">Premium_Matrix</option>
                          <option value="pro">Pro_Engine</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">TEMPORAL_DURATION</label>
                        <select
                          value={extendForm.duration}
                          onChange={(e) => setExtendForm({ ...extendForm, duration: e.target.value })}
                          className="w-full bg-white dark:bg-white/10 border-2 border-transparent focus:border-emerald-500/50 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="1 month">01_Month_Cycle</option>
                          <option value="2 months">02_Month_Cycle</option>
                          <option value="3 months">03_Month_Cycle</option>
                          <option value="6 months">06_Month_Cycle</option>
                          <option value="1 year">12_Month_Phase</option>
                          <option value="2 years">24_Month_Phase</option>
                        </select>
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-rose-500/10 border-2 border-rose-500/20 rounded-2xl text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">
                        {error}
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeExtendModal}
                        className="flex-1 py-5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest rounded-2xl text-[10px]"
                      >
                        CANCEL
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExtendSubscription}
                        className="flex-[2] py-5 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        disabled={extending}
                      >
                        {extending ? <Cpu className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {extending ? 'Saving...' : 'EXTEND PLAN'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminSubscriptions;





