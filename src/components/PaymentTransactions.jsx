import React, { useState, useEffect } from 'react';
import { FaFilter, FaDownload, FaEye, FaEyeSlash, FaChevronLeft, FaChevronRight, FaRupeeSign, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle, FaCreditCard, FaReceipt, FaTag, FaCalendar, FaGlobe, FaSearch, FaTimes } from 'react-icons/fa';
import API from '../lib/api';
import { ListSkeleton } from './skeletons/PrivateSkeletons';

const PaymentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: 'all',
    status: 'all',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState({});
  const [filterOptions, setFilterOptions] = useState({ months: [], years: [] });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.getUserPaymentTransactions({
        month: filters.month,
        year: filters.year,
        type: filters.type !== 'all' ? filters.type : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        page: filters.page,
        limit: filters.limit
      });

      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      } else {
        setError(response.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('Error fetching transactions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await API.getTransactionFilterOptions();
      if (response.success) {
        setFilterOptions(response.data);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchFilterOptions();
  }, []);

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

  const toggleTransactionDetails = (transactionId) => {
    setExpandedTransaction(expandedTransaction === transactionId ? null : transactionId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'success':
        return <FaCheckCircle className="text-primary-600" />;
      case 'failed':
      case 'failure':
        return <FaTimesCircle className="text-black dark:text-white" />;
      case 'created':
      case 'authorized':
      case 'pending':
        return <FaClock className="text-amber-600 dark:text-amber-400" />;
      case 'refunded':
        return <FaExclamationTriangle className="text-primary-600" />;
      default:
        return <FaExclamationTriangle className="text-slate-700 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'success':
        return 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300';
      case 'failed':
      case 'failure':
        return 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white ';
      case 'created':
      case 'authorized':
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'refunded':
        return 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'payment_order':
        return <FaCreditCard className="text-primary-600" />;
      default:
        return <FaCreditCard className="text-primary-600" />;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'payment_order':
        return 'Payment Order';
      default:
        return 'Payment Order';
    }
  };

  const getTypeColor = (type, source) => {
    if (type === 'credit') return 'text-primary-600';
    if (type === 'debit') return 'text-primary-600 dark:text-white';
    if (source === 'payment_order') return 'text-primary-600 dark:text-primary-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Filter transactions based on search term (PaymentOrder fields only)
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.paymentDesc?.toLowerCase().includes(searchLower) ||
      transaction.orderId?.toLowerCase().includes(searchLower) ||
      transaction.transactionId?.toLowerCase().includes(searchLower) ||
      transaction.paymentId?.toLowerCase().includes(searchLower) ||
      transaction.subscriptionName?.toLowerCase().includes(searchLower) ||
      transaction.paymentMethod?.toLowerCase().includes(searchLower) ||
      transaction.paymentStatus?.toLowerCase().includes(searchLower)
    );
  });

  const clearFilters = () => {
    setFilters({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      type: 'all',
      status: 'all',
      page: 1,
      limit: 10
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl xl:rounded-3xl shadow-sm p-4 xl:p-6 border border-white/30">
        <ListSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl xl:rounded-[2.5rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 overflow-hidden font-outfit">
      {/* Header */}
      <div className="bg-primary-600 p-4 xl:p-8 text-white shadow-sm border-b-2 xl:border-b-2 border-white/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xl:gap-8 relative z-10">
          <div>
            <h2 className="text-lg xl:text-4xl font-black mb-1 xl:mb-3 uppercase tracking-tight xl:tracking-tighter">Payment <span className="text-primary-100">History</span></h2>
            <p className="text-[8px] xl:text-[10px] font-black uppercase tracking-[0.15em] xl:tracking-[0.3em] text-primary-100 opacity-80">All your AajExam plan purchases & receipts</p>
          </div>
          <div className="flex items-center w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto bg-white/20 hover:bg-white/30 px-4 py-2.5 xl:px-8 xl:py-5 rounded-lg xl:rounded-xl xl:rounded-2xl transition-all active:translate-y-1 flex items-center justify-center space-x-2 xl:space-x-3 border-2 xl:border-2 border-white/10 shadow-sm"
            >
              <FaFilter className="text-xs xl:text-sm" />
              <span className="text-[9px] xl:text-[10px] font-black uppercase tracking-widest">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="p-3 xl:p-14 bg-white dark:bg-slate-900/50">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl xl:rounded-[2.5rem] p-4 xl:p-10 border-2 xl:border-2 border-slate-100 dark:border-slate-700 shadow-sm xl:shadow-sm transition-all hover:-translate-y-2 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 xl:mb-3">Total Investment</p>
                  <p className="text-xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary-600 transition-colors">
                    {formatCurrency(summary.totalAmount || 0)}
                  </p>
                </div>
                <div className="w-10 h-10 xl:w-20 xl:h-20 bg-primary-600 text-white rounded-lg xl:rounded-xl xl:rounded-2xl flex items-center justify-center shadow-sm border-2 xl:border-2 border-white dark:border-slate-700 rotate-3 group-hover:rotate-6 transition-transform flex-shrink-0">
                  <FaRupeeSign className="text-sm xl:text-3xl" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl xl:rounded-[2.5rem] p-4 xl:p-10 border-2 xl:border-2 border-slate-100 dark:border-slate-700 shadow-sm xl:shadow-sm transition-all hover:-translate-y-2 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 xl:mb-3">Total Transactions</p>
                  <p className="text-xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary-600 transition-colors">
                    {summary.totalTransactions || 0}
                  </p>
                </div>
                <div className="w-10 h-10 xl:w-20 xl:h-20 bg-primary-600 text-white rounded-lg xl:rounded-xl xl:rounded-2xl flex items-center justify-center shadow-sm border-2 xl:border-2 border-white dark:border-slate-700 -rotate-3 group-hover:-rotate-6 transition-transform flex-shrink-0">
                  <FaReceipt className="text-sm xl:text-3xl" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl xl:rounded-[2.5rem] p-4 xl:p-10 border-2 xl:border-2 border-slate-100 dark:border-slate-700 shadow-sm xl:shadow-sm transition-all hover:-translate-y-2 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 xl:mb-3">Successful Clear</p>
                  <p className="text-xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary-600 transition-colors">
                    {summary.paymentOrders?.completed || 0}
                  </p>
                </div>
                <div className="w-10 h-10 xl:w-20 xl:h-20 bg-primary-600 text-white rounded-lg xl:rounded-xl xl:rounded-2xl flex items-center justify-center shadow-sm border-2 xl:border-2 border-white dark:border-slate-700 rotate-6 group-hover:rotate-12 transition-transform flex-shrink-0">
                  <FaCheckCircle className="text-sm xl:text-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-3 xl:p-12 bg-white dark:bg-slate-900/50 border-b-2 border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 xl:gap-6 mb-4 xl:mb-8">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400 text-xs xl:text-base" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 xl:pl-12 pr-3 xl:pr-4 py-2.5 xl:py-4 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl xl:rounded-2xl bg-slate-50 dark:bg-black text-[9px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-700 outline-none transition-all"
              />
            </div>

            {/* Month Filter */}
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
              className="px-4 xl:px-6 py-2.5 xl:py-4 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl xl:rounded-2xl bg-slate-50 dark:bg-black text-[9px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-700 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="px-4 xl:px-6 py-2.5 xl:py-4 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl xl:rounded-2xl bg-slate-50 dark:bg-black text-[9px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-700 outline-none transition-all appearance-none cursor-pointer"
            >
              {filterOptions.years?.map(year => (
                <option key={year.value || year} value={year.value || year}>{year.label || year}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 xl:px-6 py-2.5 xl:py-4 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl xl:rounded-2xl bg-slate-50 dark:bg-black text-[9px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-700 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="success">Success</option>
              <option value="created">Created</option>
              <option value="authorized">Authorized</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-5 xl:px-8 py-2 xl:py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg xl:rounded-xl text-[9px] xl:text-[10px] font-black uppercase tracking-widest shadow-sm border-2 border-slate-200 dark:border-slate-600 active:translate-y-1 transition-all"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="p-3 xl:p-12">
        {error ? (
          <div className="text-center py-10 xl:py-20">
            <div className="w-12 h-12 xl:w-16 xl:h-16 bg-slate-100 dark:bg-slate-800 rounded-lg xl:rounded-xl xl:rounded-2xl flex items-center justify-center mx-auto mb-3 xl:mb-6 shadow-sm border-2 border-white">
              <FaExclamationTriangle className="text-black dark:text-white text-base xl:text-2xl" />
            </div>
            <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{error}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-10 xl:py-20">
            <div className="w-12 h-12 xl:w-16 xl:h-16 bg-slate-100 rounded-lg xl:rounded-xl xl:rounded-2xl flex items-center justify-center mx-auto mb-3 xl:mb-6 shadow-sm border-2 border-white">
              <FaReceipt className="text-slate-600 dark:text-slate-400 text-base xl:text-2xl" />
            </div>
            <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">No records found</p>
          </div>
        ) : (
          <div className="space-y-3 xl:space-y-6">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-slate-800 rounded-lg xl:rounded-xl xl:rounded-[2rem] shadow-sm xl:shadow-sm border-2 border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:-translate-y-1">
                {/* Transaction Header */}
                <div className="p-3 xl:p-8 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 xl:gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 xl:gap-4 mb-2 xl:mb-4">
                        <div className={`text-base xl:text-3xl font-black tracking-tighter ${getTypeColor(transaction.type, transaction.source)}`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className={`px-2.5 xl:px-4 py-1 xl:py-1.5 rounded-lg xl:rounded-xl text-[11px] xl:text-[13px] font-black uppercase tracking-widest border-2 flex items-center gap-1.5 xl:gap-2 ${getStatusColor(transaction.paymentStatus || transaction.status)}`}>
                          {getStatusIcon(transaction.paymentStatus || transaction.status)}
                          {transaction.paymentStatus || transaction.status}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 xl:gap-4 mb-2 xl:mb-4">
                        <div className="w-7 h-7 xl:w-10 xl:h-10 bg-slate-100 dark:bg-slate-700 rounded-lg xl:rounded-xl flex items-center justify-center shadow-sm border-1 border-white/50 flex-shrink-0">
                          {getSourceIcon(transaction.source)}
                        </div>
                        <p className="text-[10px] xl:text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{transaction.paymentDesc || transaction.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 xl:gap-6 text-[8px] xl:text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 xl:gap-2">
                          <FaCalendar className="text-slate-300" />
                          <span>{formatDate(transaction.date || transaction.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 xl:gap-2">
                          <FaTag className="text-slate-300" />
                          <span>{getSourceLabel(transaction.source)}</span>
                        </div>
                        {transaction.paymentMethod && (
                          <div className="flex items-center gap-1.5 xl:gap-2">
                            <FaCreditCard className="text-slate-300" />
                            <span>{transaction.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTransactionDetails(transaction.id)}
                      className="self-end xl:self-auto p-2.5 xl:p-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg xl:rounded-xl xl:rounded-2xl shadow-sm border-2 border-slate-200 dark:border-slate-600 active:translate-y-1 transition-all"
                    >
                      {expandedTransaction === transaction.id ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTransaction === transaction.id && (
                  <div className="border-t-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 xl:p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-8">
                      {/* Payment Details */}
                      <div className="bg-white dark:bg-slate-800 p-3 xl:p-6 rounded-lg xl:rounded-xl xl:rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                        <h4 className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3 xl:mb-6 flex items-center gap-2 xl:gap-3">
                          <FaCreditCard className="text-primary-600" />
                          Payment Details
                        </h4>
                        <div className="space-y-2 xl:space-y-4">
                          {transaction.subscriptionName && (
                            <div className="flex justify-between items-center text-[9px] xl:text-[10px] uppercase font-black tracking-widest">
                              <span className="text-slate-600 dark:text-slate-400">Subscription</span>
                              <span className="text-slate-800 dark:text-white">{transaction.subscriptionName}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[9px] xl:text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">Status</span>
                            <span className={`px-2.5 xl:px-3 py-0.5 xl:py-1 rounded-lg ${getStatusColor(transaction.paymentStatus || transaction.status)}`}>
                              {transaction.paymentStatus || transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Details */}
                      <div className="bg-white dark:bg-slate-800 p-3 xl:p-6 rounded-lg xl:rounded-xl xl:rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                        <h4 className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3 xl:mb-6 flex items-center gap-2 xl:gap-3">
                          <FaReceipt className="text-primary-600" />
                          Transaction Details
                        </h4>
                        <div className="space-y-2 xl:space-y-4">
                          <div className="flex justify-between items-center text-[9px] xl:text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">Type</span>
                            <span className="text-slate-800 dark:text-white">{transaction.type}</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] xl:text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">Order ID</span>
                            <span className="text-slate-800 dark:text-white font-mono break-all text-right">{transaction.orderId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 xl:mt-12 flex flex-col xl:flex-row items-center justify-between gap-3 xl:gap-6">
            <div className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Records {((pagination.currentPage - 1) * filters.limit) + 1}-{Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of {pagination.totalCount}
            </div>
            <div className="flex items-center gap-2 xl:gap-3">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="w-9 h-9 xl:w-12 xl:h-12 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg xl:rounded-xl xl:rounded-2xl shadow-sm border-2 border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:translate-y-0 transition-all active:translate-y-1 flex items-center justify-center"
              >
                <FaChevronLeft className="text-xs xl:text-sm" />
              </button>

              <div className="flex gap-1.5 xl:gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 xl:w-12 xl:h-12 rounded-lg xl:rounded-xl xl:rounded-2xl text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all ${page === pagination.currentPage
                        ? 'bg-primary-600 text-white shadow-sm border-2 border-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 shadow-sm border-2 border-slate-200 dark:border-slate-600 active:translate-y-1'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="w-9 h-9 xl:w-12 xl:h-12 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg xl:rounded-xl xl:rounded-2xl shadow-sm border-2 border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:translate-y-0 transition-all active:translate-y-1 flex items-center justify-center"
              >
                <FaChevronRight className="text-xs xl:text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTransactions;


