import React, { useState, useEffect } from 'react';
import { FaFilter, FaDownload, FaEye, FaEyeSlash, FaChevronLeft, FaChevronRight, FaRupeeSign, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle, FaCreditCard, FaReceipt, FaTag, FaCalendar, FaGlobe, FaSearch, FaTimes } from 'react-icons/fa';
import API from '../lib/api';
import Loading from './Loading';

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
        return <FaCheckCircle className="text-green-500" />;
      case 'failed':
      case 'failure':
        return <FaTimesCircle className="text-red-500" />;
      case 'created':
      case 'authorized':
        return <FaClock className="text-primary-700 dark:text-primary-500" />;
      case 'refunded':
        return <FaExclamationTriangle className="text-primary-700 dark:text-primary-500" />;
      default:
        return <FaExclamationTriangle className="text-slate-700 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
      case 'failure':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'created':
      case 'authorized':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300';
      case 'refunded':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'payment_order':
        return <FaCreditCard className="text-primary-700 dark:text-primary-500" />;
      default:
        return <FaCreditCard className="text-primary-700 dark:text-primary-500" />;
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
    if (type === 'credit') return 'text-green-600 dark:text-green-400';
    if (type === 'debit') return 'text-primary-700 dark:text-primary-500 dark:text-red-400';
    if (source === 'payment_order') return 'text-primary-700 dark:text-primary-500 dark:text-primary-400';
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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/30">
        <div className="flex items-center justify-center py-12">
          <Loading size="md" color="yellow" message="" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-b-8 border-slate-100 dark:border-slate-800 overflow-hidden font-outfit">
      {/* Header */}
      <div className="bg-primary-500 p-4 lg:p-8 text-white shadow-duo-primary border-b-8 border-white/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black mb-3 uppercase tracking-tighter">Payment <span className="text-primary-100">History</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-100 opacity-80">All your AajExam plan purchases & receipts</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 px-8 py-5 rounded-2xl transition-all active:translate-y-1 flex items-center space-x-3 border-4 border-white/10 shadow-sm"
            >
              <FaFilter className="text-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="p-10 lg:p-14 bg-slate-50 dark:bg-slate-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border-4 border-b-[12px] border-slate-100 dark:border-slate-700 shadow-2xl transition-all hover:-translate-y-2 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Total Investment</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-green-500 transition-colors">
                    {formatCurrency(summary.totalAmount || 0)}
                  </p>
                </div>
                <div className="w-20 h-20 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-duo-primary border-4 border-white dark:border-slate-700 rotate-3 group-hover:rotate-6 transition-transform">
                  <FaRupeeSign className="text-3xl" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border-4 border-b-[12px] border-slate-100 dark:border-slate-700 shadow-2xl transition-all hover:-translate-y-2 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Total Transactions</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary-700 dark:text-primary-500 transition-colors">
                    {summary.totalTransactions || 0}
                  </p>
                </div>
                <div className="w-20 h-20 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-duo-primary border-4 border-white dark:border-slate-700 -rotate-3 group-hover:-rotate-6 transition-transform">
                  <FaReceipt className="text-3xl" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border-4 border-b-[12px] border-slate-100 dark:border-slate-700 shadow-2xl transition-all hover:-translate-y-2 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Successful Clear</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary-700 dark:text-primary-500 transition-colors">
                    {summary.paymentOrders?.completed || 0}
                  </p>
                </div>
                <div className="w-20 h-20 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-duo-secondary border-4 border-white dark:border-slate-700 rotate-6 group-hover:rotate-12 transition-transform">
                  <FaCheckCircle className="text-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-4 md:p-8 lg:p-12 bg-slate-50 dark:bg-slate-900/50 border-b-2 border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            {/* Month Filter */}
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
              className="px-6 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
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
              className="px-6 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {filterOptions.years?.map(year => (
                <option key={year.value || year} value={year.value || year}>{year.label || year}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-6 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
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
              className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-duo border-2 border-slate-200 dark:border-slate-600 active:translate-y-1 transition-all"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="p-4 md:p-8 lg:p-12">
        {error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-duo border-2 border-white">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
            </div>
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{error}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-duo border-2 border-white">
              <FaReceipt className="text-slate-600 dark:text-slate-400 text-2xl" />
            </div>
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">No records found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border-2 border-b-8 border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:-translate-y-1">
                {/* Transaction Header */}
                <div className="p-8 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className={`text-2xl lg:text-xl lg:text-3xl font-black tracking-tighter ${getTypeColor(transaction.type, transaction.source)}`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 flex items-center gap-2 ${getStatusColor(transaction.paymentStatus || transaction.status)}`}>
                          {getStatusIcon(transaction.paymentStatus || transaction.status)}
                          {transaction.paymentStatus || transaction.status}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-duo border-1 border-white/50">
                          {getSourceIcon(transaction.source)}
                        </div>
                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{transaction.paymentDesc || transaction.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-slate-300" />
                          <span>{formatDate(transaction.date || transaction.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTag className="text-slate-300" />
                          <span>{getSourceLabel(transaction.source)}</span>
                        </div>
                        {transaction.paymentMethod && (
                          <div className="flex items-center gap-2">
                            <FaCreditCard className="text-slate-300" />
                            <span>{transaction.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTransactionDetails(transaction.id)}
                      className="p-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl shadow-duo border-2 border-slate-200 dark:border-slate-600 active:translate-y-1 transition-all"
                    >
                      {expandedTransaction === transaction.id ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTransaction === transaction.id && (
                  <div className="border-t-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Payment Details */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-inner">
                        <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <FaCreditCard className="text-primary-700 dark:text-primary-500" />
                          Payment Details
                        </h4>
                        <div className="space-y-4">
                          {transaction.subscriptionName && (
                            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                              <span className="text-slate-600 dark:text-slate-400">Subscription</span>
                              <span className="text-slate-800 dark:text-white">{transaction.subscriptionName}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">Status</span>
                            <span className={`px-3 py-1 rounded-lg ${getStatusColor(transaction.paymentStatus || transaction.status)}`}>
                              {transaction.paymentStatus || transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Details */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-inner">
                        <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <FaReceipt className="text-primary-700 dark:text-primary-500" />
                          Transaction Details
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">Type</span>
                            <span className="text-slate-800 dark:text-white">{transaction.type}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">Order ID</span>
                            <span className="text-slate-800 dark:text-white font-mono">{transaction.orderId?.slice(0, 8)}...</span>
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
          <div className="mt-12 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Records {((pagination.currentPage - 1) * filters.limit) + 1}-{Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of {pagination.totalCount}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl shadow-duo border-2 border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:translate-y-0 transition-all active:translate-y-1 flex items-center justify-center"
              >
                <FaChevronLeft className="text-sm" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-12 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${page === pagination.currentPage
                        ? 'bg-primary-500 text-white shadow-duo-primary border-2 border-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 shadow-duo border-2 border-slate-200 dark:border-slate-600 active:translate-y-1'
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
                className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl shadow-duo border-2 border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:translate-y-0 transition-all active:translate-y-1 flex items-center justify-center"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTransactions;


