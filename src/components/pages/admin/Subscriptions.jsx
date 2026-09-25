'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, CheckCircle, Clock, Download,
  Layers,
  TrendingUp, Users, Zap, Cpu, Search, Plus, X,
  Eye, EyeOff, Crown,
  Rocket, Table, LayoutGrid, List, Calendar, ArrowUp, ArrowDown,
  AlertTriangle, XCircle
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../../Sidebar";
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import StyledSelect from '../../ui/StyledSelect';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


// â€”â€”â€”â€”â€” Stats Card â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
function StatsCard({ icon: Icon, label, value, sub, color = "primary", i = 0 }) {
  const colors = {
    primary: "text-primary-600 bg-primary-500/10 border-primary-500/20",
    secondary: "text-primary-600 bg-primary-500/10 border-primary-500/20",
    emerald: "text-primary-600 bg-primary-500/10 border-primary-500/20",
    rose: "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20",
    purple: "text-primary-600 bg-primary-500/10 border-primary-500/20",
    amber: "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 + 0.3 }}
      className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 p-6 hover:border-primary-500/30 transition-all shadow-sm overflow-hidden cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      </div>
      <div className="space-y-1">
        <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none group-hover:text-primary-600 transition-colors">
          {value}
        </div>
        {sub !== undefined && (
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
            {sub}
          </div>
        )}
      </div>
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors" />
    </motion.div>
  );
}

const AdminSubscriptions = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    plan: 'all',
    status: 'all',
    year: new Date().getFullYear(),
    month: 0, // Default to no month filter
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
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    freeSubscriptions: 0,
    paidSubscriptions: 0,
    totalRevenue: 0,
    periodRevenue: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    plans: ['FREE', 'PRO'],
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
    plan: 'PRO',
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
          limit: DEFAULT_PAGE_SIZE,
          hasNext: false,
          hasPrev: false
        });
        setSummary(response.data.summary || {});
      } else {
        setError(response.message || 'Unable to load subscriptions. Please try again.');
      }
    } catch (err) {
      setError('Unable to load subscriptions: ' + err.message);
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
      plan: subscription.planName?.toUpperCase() || 'PRO',
      duration: '1 month'
    });
    setShowExtendModal(true);
  };

  const closeExtendModal = () => {
    setShowExtendModal(false);
    setSelectedSubscription(null);
    setExtendForm({
      plan: 'PRO',
      duration: '1 month'
    });
  };

  const handleExtendSubscription = async () => {
    if (!selectedSubscription || !extendForm.plan || !extendForm.duration) {
      setError('Please select a plan and duration before extending.');
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
        alert(`Subscription ${response.data.isExtension ? 'extended' : 'created'} successfully.`);
      } else {
        setError(response.message || 'Unable to extend subscription. Please try again.');
      }
    } catch (err) {
      setError('Unable to extend subscription: ' + err.message);
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
    if (!dateString) return 'Not Available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    if (!includeTime) return `${day}-${month}-${year}`;

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day}-${month}-${year} at ${time}`;
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toUpperCase()) {
      case 'PRO': return <Crown className="w-4 h-4 text-black dark:text-white" />;
      case 'FREE': return <Rocket className="w-4 h-4 text-slate-400" />;
      default: return <Rocket className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName?.toUpperCase()) {
      case 'PRO': return "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20";
      case 'FREE': return "text-slate-500 bg-slate-500/10 border-slate-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-primary-600" />;
      case 'expired': return <Clock className="w-4 h-4 text-black dark:text-white" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-black dark:text-white" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-slate-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return "text-primary-600 bg-primary-500/10 border-primary-500/20";
      case 'expired': return "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20";
      case 'inactive': return "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20";
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
      <div className="p-1.5 bg-primary-500/20 text-primary-600 rounded-lg">
        {sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      </div>
    );
  };

  const subscriptionColumns = [
    {
      key: 'createdAt',
      header: (
        <div className="flex items-center gap-2 hover:text-primary-600 transition-colors cursor-pointer" onClick={() => handleSort('createdAt')}>
          DATE <SortIcon field="createdAt" />
        </div>
      ),
      render: (_, subscription) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums leading-none mb-1">
            {formatDate(subscription.createdAt || subscription.created_at || subscription.startDate)}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: {subscription._id?.slice(-6).toUpperCase()}</span>
        </div>
      )
    },
    {
      key: 'user',
      header: 'Student',
      render: (_, subscription) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-600 p-[2px] shadow-sm group-hover:rotate-6 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xs text-primary-600">
              {subscription.user?.name?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors line-clamp-1">{subscription.user?.name || 'N/A'}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 line-clamp-1">{subscription.user?.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'planName',
      header: 'Plan',
      render: (_, subscription) => (
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${getPlanColor(subscription.planName)}`}>
          {getPlanIcon(subscription.planName)}
          {subscription.planName || 'FREE'}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, subscription) => (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${getStatusColor(subscription.status)}`}>
          {getStatusIcon(subscription.status)}
          {subscription.status || 'UNKNOWN'}
        </div>
      )
    },
    {
      key: 'validPeriod',
      header: 'Valid Period',
      render: (_, subscription) => (
        <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
            <span className="uppercase tracking-widest tabular-nums">{formatDate(subscription.startDate || subscription.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
            <span className="uppercase tracking-widest tabular-nums">{subscription.expiryDate ? formatDate(subscription.expiryDate) : 'No Expiry'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (_, subscription) => (
        <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic text-right">
          {subscription.amount ? formatCurrency(subscription.amount) : "₹0.00"}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, subscription) => (
        <div className="flex items-center justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleSubscriptionDetails(subscription._id)}
            className="p-3 text-primary-600 rounded-lg lg:rounded-xl"
          >
            {expandedSubscription === subscription._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openExtendModal(subscription)}
            className="p-3 text-primary-600 rounded-lg lg:rounded-xl"
          >
            <Plus className="w-4 h-4" />
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
        placeholder="Search by name, email, or plan..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

  const planSelect = (
    <StyledSelect
      value={filters.plan}
      onChange={(val) => handleFilterChange('plan', val)}
      options={[{ value: 'all', label: 'All Plans' }, ...filterOptions.plans.map(plan => ({ value: plan, label: plan }))]}
      className="w-full"
    />
  );

  const statusSelect = (
    <StyledSelect
      value={filters.status}
      onChange={(val) => handleFilterChange('status', val)}
      options={[{ value: 'all', label: 'All Statuses' }, ...filterOptions.statuses.slice(1).map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))]}
      className="w-full"
    />
  );

  const yearSelect = (
    <StyledSelect
      value={filters.year}
      onChange={(val) => handleFilterChange('year', parseInt(val))}
      options={[{ value: '', label: 'All Years' }, ...filterOptions.years.map(year => ({ value: year, label: year }))]}
      className="w-full"
    />
  );

  const monthSelect = (
    <StyledSelect
      value={filters.month}
      onChange={(val) => handleFilterChange('month', parseInt(val))}
      options={[
        { value: 0, label: 'All Months' },
        ...Array.from({ length: 12 }, (_, i) => i + 1).map(month => ({ value: month, label: new Date(0, month - 1).toLocaleString('default', { month: 'long' }) }))
      ]}
      className="w-full"
    />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { mode: 'table', icon: Table, label: 'Table View' },
        { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
        { mode: 'list', icon: List, label: 'List View' }
      ].map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          title={label}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const exportButton = (
    <button
      onClick={exportToCSV}
      className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700"
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
      onItemsPerPageChange={handlePageSizeChange}
      compact
    />
  );

  useAdminMobileHeader({
    title: 'Plans',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {planSelect}
        {statusSelect}
        {yearSelect}
        {monthSelect}
        {viewToggleButtons}
        {exportButton}
        {paginationControl}
      </>
    )
  });

  if (loading && subscriptions.length === 0) {
    return (
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        <Sidebar />
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">
          <AdminTableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">

        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-700 mb-4 shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 lg:p-0 p-2">
          {[
            { label: 'Total Subscriptions', val: summary.totalSubscriptions || 0, icon: Users },
            { label: 'Active', val: summary.activeSubscriptions || 0, icon: CheckCircle },
            { label: 'Paid Members', val: summary.paidSubscriptions || 0, icon: Crown },
            { label: 'Free Members', val: summary.freeSubscriptions || 0, icon: Rocket },
            { label: 'Total Revenue', val: formatCurrency(summary.totalRevenue || 0), icon: TrendingUp },
            { label: 'This Month', val: formatCurrency(summary.periodRevenue || 0), icon: Calendar }
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 px-3 py-2">
              <div className="p-1.5 bg-primary-500/10 text-primary-600 rounded-lg shrink-0"><stat.icon className="w-3.5 h-3.5" /></div>
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">{stat.val}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription List */}
        <div className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/10 dark:bg-white/10 border-2 border-black/20 dark:border-white/20 rounded-2xl lg:rounded-[3.5rem] p-4 lg:p-12 text-center shadow-sm"
            >
              <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-8 shadow-sm">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">SOMETHING WENT WRONG</h3>
              <p className="text-black dark:text-white font-bold uppercase text-sm tracking-widest">{error}</p>
            </motion.div>
          ) : subscriptions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 rounded-2xl lg:rounded-[3.5rem] p-24 text-center shadow-sm"
            >
              <Layers className="w-24 h-24 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
              <h3 className="text-xl lg:text-2xl font-black text-slate-400 uppercase tracking-tighter">NO SUBSCRIPTIONS FOUND</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">No subscriptions match your current filters. Try adjusting your search or filter criteria.</p>
            </motion.div>
          ) : (
            <div className="h-auto flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto">
              {/* Table View */}
              {viewMode === 'table' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
                  <ResponsiveTable
                    data={subscriptions}
                    columns={subscriptionColumns}
                    viewModes={['table']}
                    defaultView={'table'}
                    showPagination={false}
                    showViewToggle={false}
                    fillHeight
                  />
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                  {subscriptions.map((subscription, idx) => (
                    <div key={subscription._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase ${getPlanColor(subscription.planName)}`}>{subscription.planName || 'FREE'}</span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openExtendModal(subscription)} className="p-1.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 rounded-lg"><Plus className="w-3.5 h-3.5" /></button>
                          <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase ${getStatusColor(subscription.status)}`}>{subscription.status || 'UNKNOWN'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-black text-sm text-white shrink-0">
                          {subscription.user?.name?.charAt(0) || 'U'}
                          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(pagination.currentPage - 1) * filters.limit + idx + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{subscription.user?.name || 'N/A'}</h4>
                          <span className="text-[10px] text-slate-400 truncate block">{subscription.user?.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="font-bold text-slate-400 uppercase block">Start</span>
                          <div className="font-black text-slate-900 dark:text-white tabular-nums">{formatDate(subscription.startDate || subscription.createdAt)}</div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 uppercase block">Expiry</span>
                          <div className="font-black text-slate-900 dark:text-white tabular-nums">{subscription.expiryDate ? formatDate(subscription.expiryDate) : "Indefinite"}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-primary-600 uppercase tabular-nums">#{subscription._id?.slice(-8).toUpperCase()}</span>
                        <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{subscription.amount ? formatCurrency(subscription.amount) : "₹0"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="h-full overflow-auto space-y-3">
                  {subscriptions.map((subscription, idx) => (
                    <div key={subscription._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-black text-sm text-white shrink-0">
                          {subscription.user?.name?.charAt(0) || 'U'}
                          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(pagination.currentPage - 1) * filters.limit + idx + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{subscription.user?.name || 'N/A'}</h4>
                          <span className="text-[10px] text-slate-400 truncate block">{subscription.user?.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase ${getPlanColor(subscription.planName)}`}>{subscription.planName || 'FREE'}</span>
                        <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase ${getStatusColor(subscription.status)}`}>{subscription.status || 'UNKNOWN'}</span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Created</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{formatDate(subscription.createdAt)}</span>
                        </div>
                        <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{subscription.amount ? formatCurrency(subscription.amount) : "₹0"}</div>
                        <button onClick={() => openExtendModal(subscription)} className="p-2 bg-primary-50 dark:bg-primary-950/30 text-primary-600 rounded-lg">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          )}
        </AnimatePresence>
        </div>

        {/* Extend Subscription Modal */}
        <AnimatePresence>
          {showExtendModal && (
            <div className="fixed inset-0 z-[100]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeExtendModal}
                className="absolute inset-0 bg-[#fafafa]/80 dark:bg-[#050505]/80 backdrop-blur-xl"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                className="absolute top-16 right-0 bottom-0 left-0 lg:left-64 bg-white dark:bg-slate-900 lg:rounded-l-[3rem] border-l-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-3 lg:p-8">
                  <motion.button whileHover={{ rotate: 90 }} onClick={closeExtendModal} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl">
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="flex-1 p-4 lg:p-12 overflow-y-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-primary-500/20 text-primary-600 rounded-3xl">
                      <Layers className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">EXTEND SUBSCRIPTION</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedSubscription?.user?.name || 'User'} &mdash; {selectedSubscription?.user?.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8 mb-4 bg-slate-50 dark:bg-white/5 p-4 lg:p-8 rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 border-slate-200/50 dark:border-white/5">
                    <div className="space-y-2 lg:space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">SELECT PLAN</label>
                      <select
                        value={extendForm.plan}
                        onChange={(e) => setExtendForm({ ...extendForm, plan: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/50 rounded-2xl px-3 lg:px-6 py-4 text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white outline-none cursor-pointer"
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="pro">Pro</option>
                      </select>
                    </div>
                    <div className="space-y-2 lg:space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">DURATION</label>
                      <select
                        value={extendForm.duration}
                        onChange={(e) => setExtendForm({ ...extendForm, duration: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/50 rounded-2xl px-3 lg:px-6 py-4 text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white outline-none cursor-pointer"
                      >
                        <option value="1 month">1 Month</option>
                        <option value="2 months">2 Months</option>
                        <option value="3 months">3 Months</option>
                        <option value="6 months">6 Months</option>
                        <option value="1 year">1 Year</option>
                        <option value="2 years">2 Years</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-8 p-4 bg-black/10 dark:bg-white/10 border-2 border-black/20 dark:border-white/20 rounded-2xl text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-center">
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
                      className="flex-[2] py-5 bg-primary-600 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-sm disabled:opacity-50 flex items-center justify-center gap-3"
                      disabled={extending}
                    >
                      {extending ? <Cpu className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      {extending ? 'SAVING...' : 'EXTEND SUBSCRIPTION'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminSubscriptions;





