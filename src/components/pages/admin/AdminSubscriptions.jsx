'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaFilter,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaCrown,
  FaStar,
  FaGem,
  FaRocket,
  FaSearch,
  FaTable,
  FaTh,
  FaList,
  FaUsers,
  FaChartLine,
  FaCalendar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';

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
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    // Check if dateString exists and is valid
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (dateString) => {
    // Check if dateString exists and is valid
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day}-${month}-${year} at ${time}`;
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'basic':
        return <FaStar className="text-yellow-500" />;
      case 'premium':
        return <FaGem className="text-yellow-500" />;
      case 'pro':
        return <FaCrown className="text-orange-700" />;
      default:
        return <FaRocket className="text-blue-500" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'basic':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'premium':
        return 'bg-purple-100 text-yellow-800 dark:bg-purple-900 dark:text-yellow-200';
      case 'pro':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'inactive':
        return <FaTimesCircle className="text-red-500" />;
      case 'expired':
        return <FaClock className="text-orange-500" />;
      case 'cancelled':
        return <FaExclamationTriangle className="text-gray-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
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
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl md:text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                User Subscriptions ({summary.totalSubscriptions || 0})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage, view user subscriptions
              </p>
            </div>
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 w-full"
              />
            </div>
            {/* View Mode Toggle - Hidden on mobile, shown on desktop */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <FaTable />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <FaList />
              </button>
            </div>

            {/* Page Size Dropdown */}
            <div className="flex items-center space-x-2">
              <select
                value={filters.limit}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="w-full lg:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            {/* Export Button */}
            <Button
              variant="admin"
              onClick={exportToCSV}
              icon={<FaDownload className="text-sm" />}
            >
              Export CSV
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Subscriptions</p>
                  <p className="text-2xl font-bold">{summary.totalSubscriptions || 0}</p>
                </div>
                <FaUsers className="text-3xl text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{summary.activeSubscriptions || 0}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue || 0)}</p>
                </div>
                <FaChartLine className="text-3xl text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">This Period</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.periodRevenue || 0)}</p>
                </div>
                <FaCalendar className="text-3xl text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Free Subscriptions</p>
                  <p className="text-2xl font-bold">{summary.freeSubscriptions || 0}</p>
                </div>
                <div className="text-4xl text-gray-200">🆓</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 from-red-600 rounded-xl p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Paid Subscriptions</p>
                  <p className="text-2xl font-bold">{summary.paidSubscriptions || 0}</p>
                </div>
                <div className="text-4xl text-red-200">💎</div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Filter Controls */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
                >
                  <FaFilter className="text-sm" />
                  Filters
                </button>

                {showFilters && (
                  <div className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                      <select
                        value={filters.plan}
                        onChange={(e) => handleFilterChange('plan', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 w-full"
                      >
                        <option value="all">All Plans</option>
                        {filterOptions.plans.map(plan => (
                          <option key={plan} value={plan}>{plan}</option>
                        ))}
                      </select>

                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 w-full"
                      >
                        <option value="all">All Status</option>
                        {filterOptions.statuses.slice(1).map(status => (
                          <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                      </select>

                      <select
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 w-full"
                      >
                        <option value="">All Years</option>
                        {filterOptions.years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>

                      <select
                        value={filters.month}
                        onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 w-full"
                      >
                        <option value={0}>All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>


                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subscriptions Display */}
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
              <div className="text-red-600 dark:text-red-400 text-lg mb-2">⚠️ Error</div>
              <div className="text-red-700 dark:text-red-300">{error}</div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center">
              <FaCrown className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Subscriptions Found</h3>
              <p className="text-gray-500 dark:text-gray-500">No subscriptions match your current filters.</p>
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            S.No.
                          </th>
                          <th
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => handleSort('createdAt')}
                          >
                            <div className="flex items-center gap-2">
                              Created At
                              <SortIcon field="createdAt" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => handleSort('user.name')}
                          >
                            <div className="flex items-center gap-2">
                              User
                              <SortIcon field="user.name" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => handleSort('planName')}
                          >
                            <div className="flex items-center gap-2">
                              Plan
                              <SortIcon field="planName" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-2">
                              Status
                              <SortIcon field="status" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => handleSort('startDate')}
                          >
                            <div className="flex items-center gap-2">
                              Start Date
                              <SortIcon field="startDate" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => handleSort('expiryDate')}
                          >
                            <div className="flex items-center gap-2">
                              Expiry Date
                              <SortIcon field="expiryDate" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => handleSort('amount')}
                          >
                            <div className="flex items-center gap-2">
                              Amount
                              <SortIcon field="amount" />
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {subscriptions.map((subscription, index) => (
                          <tr key={subscription._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {((pagination.currentPage - 1) * filters.limit) + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDateTime(subscription.createdAt || subscription.created_at || subscription.startDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {subscription.user?.name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {subscription.user?.name || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {subscription.user?.email || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getPlanIcon(subscription.planName)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(subscription.planName)}`}>
                                  {subscription.planName || 'Free'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                                {getStatusIcon(subscription.status)}
                                {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1) || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDate(subscription.startDate || subscription.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {subscription.expiryDate ? formatDate(subscription.expiryDate) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {subscription.amount ? formatCurrency(subscription.amount) : 'Free'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSubscriptionDetails(subscription._id)}
                                  className="text-orange-700 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="View Details"
                                >
                                  {expandedSubscription === subscription._id ? <FaEyeSlash /> : <FaEye />}
                                </button>
                                <button
                                  onClick={() => openExtendModal(subscription)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Extend Subscription"
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                  {subscriptions.map((subscription) => (
                    <div key={subscription._id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getPlanIcon(subscription.planName)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(subscription.planName)}`}>
                            {subscription.planName || 'Free'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                            {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1) || 'Unknown'}
                          </span>
                          <button
                            onClick={() => toggleSubscriptionDetails(subscription._id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            {expandedSubscription === subscription._id ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          <button
                            onClick={() => openExtendModal(subscription)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Extend Subscription"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
                          <p className="font-medium text-gray-900 dark:text-white">{subscription.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{subscription.user?.email || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {subscription.amount ? formatCurrency(subscription.amount) : 'Free'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                            <p className="text-sm text-gray-900 dark:text-white">{formatDate(subscription.startDate || subscription.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {subscription.expiryDate ? formatDate(subscription.expiryDate) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row item-start lg:items-center justify-between gap-2 lg:gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{subscription.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{subscription.user?.email || 'N/A'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {getPlanIcon(subscription.planName)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(subscription.planName)}`}>
                            {subscription.planName || 'Free'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusIcon(subscription.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                            {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1) || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {subscription.amount ? formatCurrency(subscription.amount) : 'Free'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subscription.expiryDate ? formatDate(subscription.expiryDate) : 'No expiry'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSubscriptionDetails(subscription._id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                            title="View Details"
                          >
                            {expandedSubscription === subscription._id ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          <button
                            onClick={() => openExtendModal(subscription)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-2"
                            title="Extend Subscription"
                          >
                            <FaPlus />
                          </button>
                        </div>



                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm ${pagination.currentPage === page
                              ? 'bg-yellow-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Extend Subscription Modal */}
          {showExtendModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Extend Subscription
                  </h2>
                  <button
                    onClick={closeExtendModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                </div>

                {selectedSubscription && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedSubscription.user?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedSubscription.user?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Current Plan: <span className="font-medium">{selectedSubscription.planName || 'Free'}</span>
                    </p>
                    {selectedSubscription.expiryDate && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current Expiry: <span className="font-medium">{formatDate(selectedSubscription.expiryDate)}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Plan
                    </label>
                    <select
                      value={extendForm.plan}
                      onChange={(e) => setExtendForm({ ...extendForm, plan: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Duration
                    </label>
                    <select
                      value={extendForm.duration}
                      onChange={(e) => setExtendForm({ ...extendForm, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="1 month">1 Month</option>
                      <option value="2 months">2 Months</option>
                      <option value="3 months">3 Months</option>
                      <option value="6 months">6 Months</option>
                      <option value="1 year">1 Year</option>
                      <option value="2 years">2 Years</option>
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={closeExtendModal}
                      disabled={extending}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExtendSubscription}
                      disabled={extending}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg hover:from-red-600 hover:to-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {extending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Extending...
                        </>
                      ) : (
                        'Extend Subscription'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminSubscriptions;





