import React, { useState, useEffect } from 'react';
import { FaFilter, FaDownload, FaEye, FaEyeSlash, FaRupeeSign, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle, FaCreditCard, FaReceipt, FaTag, FaCalendar, FaGlobe, FaSearch, FaTimes } from 'react-icons/fa';
import API from '../../lib/api';
import { ListSkeleton } from '../common/skeletons/PrivateSkeletons';
import useTranslate from '../../hooks/useTranslate';
import Pagination from '../common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../lib/constants/pagination';

const PaymentTransactions = () => {
  const { translate, rich } = useTranslate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: 'all',
    status: 'all',
    page: 1,
    limit: PUBLIC_DEFAULT_PAGE_SIZE
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
        search: debouncedSearch || undefined,
        page: filters.page,
        limit: filters.limit
      });

      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      } else {
        setError(response.message || translate('Failed to fetch transactions'));
      }
    } catch (err) {
      setError(translate('Error fetching transactions: {message}', { message: err.message }));
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

  // Search is applied by the API; debounce so each keystroke isn't a request.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setFilters(prev => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [filters, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

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
        return <FaCheckCircle className="text-primary-600 dark:text-primary-300" />;
      case 'failed':
      case 'failure':
        return <FaTimesCircle className="text-black dark:text-white" />;
      case 'created':
      case 'authorized':
      case 'pending':
        return <FaClock className="text-amber-600 dark:text-amber-400" />;
      case 'refunded':
        return <FaExclamationTriangle className="text-primary-600 dark:text-primary-300" />;
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
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-primary-300';
      case 'refunded':
        return 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'payment_order':
        return <FaCreditCard className="text-primary-600 dark:text-primary-300" />;
      default:
        return <FaCreditCard className="text-primary-600 dark:text-primary-300" />;
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
    if (type === 'credit') return 'text-primary-600 dark:text-primary-300';
    if (type === 'debit') return 'text-primary-600 dark:text-white';
    if (source === 'payment_order') return 'text-primary-600 dark:text-primary-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Search + filters are applied server-side; the list is already the filtered page.
  const filteredTransactions = transactions;

  const clearFilters = () => {
    setFilters({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      type: 'all',
      status: 'all',
      page: 1,
      limit: PUBLIC_DEFAULT_PAGE_SIZE
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
    <div className="relative bg-background-surface shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden font-outfit mb-4 xl:mb-6" style={{ borderRadius: 16 }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 z-10 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-100 via-slate-50 to-white text-slate-900 border-b border-slate-200 dark:border-transparent dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:text-white p-3 xl:p-4 pt-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xl:gap-4 relative z-10">
          <div>
            <h2 className="text-lg xl:text-2xl font-black uppercase tracking-tight">{rich('Payment <0>History</0>', [(c) => <span className="text-primary-600 dark:text-primary-300">{c}</span>])}</h2>
          </div>
          <div className="flex items-center w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] hover:brightness-105 px-3 py-2 xl:px-4 xl:py-2 rounded-lg xl:rounded-xl transition-all active:translate-y-0.5 flex items-center justify-center space-x-2 xl:space-x-3 shadow-md"
            >
              <FaFilter className="text-xs xl:text-sm" />
              <span className="text-[9px] xl:text-[10px] font-black uppercase tracking-widest">{translate('Filters')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="p-2 xl:p-3 bg-white dark:bg-slate-900/50">
          <div className="grid grid-cols-3 gap-2 xl:gap-3">
            <div className="relative overflow-hidden bg-primary-50/60 dark:bg-slate-800 rounded-xl p-2.5 xl:p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{translate('Total Investment')}</p>
                  <p className="text-base xl:text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary-600 transition-colors">
                    {formatCurrency(summary.totalAmount || 0)}
                  </p>
                </div>
                <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] rounded-lg hidden sm:flex items-center justify-center transition-transform flex-shrink-0">
                  <FaRupeeSign className="text-xs xl:text-lg" />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-primary-50/60 dark:bg-slate-800 rounded-xl p-2.5 xl:p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{translate('Total Transactions')}</p>
                  <p className="text-base xl:text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary-600 transition-colors">
                    {summary.totalTransactions || 0}
                  </p>
                </div>
                <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] rounded-lg hidden sm:flex items-center justify-center transition-transform flex-shrink-0">
                  <FaReceipt className="text-xs xl:text-lg" />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-primary-50/60 dark:bg-slate-800 rounded-xl p-2.5 xl:p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{translate('Successful Clear')}</p>
                  <p className="text-base xl:text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary-600 transition-colors">
                    {summary.paymentOrders?.completed || 0}
                  </p>
                </div>
                <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] rounded-lg hidden sm:flex items-center justify-center transition-transform flex-shrink-0">
                  <FaCheckCircle className="text-xs xl:text-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-2 xl:p-3 bg-white dark:bg-slate-900/50 border-b-2 border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 xl:gap-3 mb-2 xl:mb-3">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400 text-xs xl:text-base" />
              <input
                type="text"
                placeholder={translate('Search history...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 xl:pl-12 pr-3 xl:pr-4 py-2 xl:py-2.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl xl:rounded-2xl bg-white dark:bg-black text-[9px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-700 outline-none transition-all"
              />
            </div>

            {/* Month Filter */}
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
              className="px-4 xl:px-6 py-2 xl:py-2.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl xl:rounded-2xl bg-white dark:bg-black text-[9px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-700 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value={1}>{translate('January')}</option>
              <option value={2}>{translate('February')}</option>
              <option value={3}>{translate('March')}</option>
              <option value={4}>{translate('April')}</option>
              <option value={5}>{translate('May')}</option>
              <option value={6}>{translate('June')}</option>
              <option value={7}>{translate('July')}</option>
              <option value={8}>{translate('August')}</option>
              <option value={9}>{translate('September')}</option>
              <option value={10}>{translate('October')}</option>
              <option value={11}>{translate('November')}</option>
              <option value={12}>{translate('December')}</option>
            </select>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="px-4 xl:px-6 py-2 xl:py-2.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl xl:rounded-2xl bg-white dark:bg-black text-[9px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-700 outline-none transition-all appearance-none cursor-pointer"
            >
              {filterOptions.years?.map(year => (
                <option key={year.value || year} value={year.value || year}>{year.label || year}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 xl:px-6 py-2 xl:py-2.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl xl:rounded-2xl bg-white dark:bg-black text-[9px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-700 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">{translate('All Status')}</option>
              <option value="paid">{translate('Paid')}</option>
              <option value="success">{translate('Success')}</option>
              <option value="created">{translate('Created')}</option>
              <option value="authorized">{translate('Authorized')}</option>
              <option value="failed">{translate('Failed')}</option>
              <option value="refunded">{translate('Refunded')}</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-5 xl:px-8 py-2 xl:py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg xl:rounded-xl text-[9px] xl:text-[10px] font-black uppercase tracking-widest shadow-sm border-2 border-slate-200 dark:border-slate-600 active:translate-y-1 transition-all"
            >
              {translate('Clear All')}
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="p-2 xl:p-3">
        {error ? (
          <div className="text-center py-6 xl:py-10">
            <div className="w-12 h-12 xl:w-16 xl:h-16 bg-slate-100 dark:bg-slate-800 rounded-lg xl:rounded-xl xl:rounded-2xl flex items-center justify-center mx-auto mb-2 xl:mb-3 shadow-sm border-2 border-white">
              <FaExclamationTriangle className="text-black dark:text-white text-base xl:text-2xl" />
            </div>
            <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{error}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-6 xl:py-10">
            <div className="w-12 h-12 xl:w-16 xl:h-16 bg-slate-100 rounded-lg xl:rounded-xl xl:rounded-2xl flex items-center justify-center mx-auto mb-2 xl:mb-3 shadow-sm border-2 border-white">
              <FaReceipt className="text-slate-600 dark:text-slate-400 text-base xl:text-2xl" />
            </div>
            <p className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{translate('No records found')}</p>
          </div>
        ) : (
          <div className="space-y-2 xl:space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-slate-800 rounded-lg xl:rounded-xl xl:rounded-xl shadow-sm xl:shadow-sm border-2 border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:-translate-y-1">
                {/* Transaction Header */}
                <div className="p-3 xl:p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
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

                    <button aria-label={translate('Toggle visibility')}
                      onClick={() => toggleTransactionDetails(transaction.id)}
                      className="self-end xl:self-auto p-2.5 xl:p-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg xl:rounded-xl xl:rounded-2xl shadow-sm border-2 border-slate-200 dark:border-slate-600 active:translate-y-1 transition-all"
                    >
                      {expandedTransaction === transaction.id ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTransaction === transaction.id && (
                  <div className="border-t-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 xl:p-4">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-4">
                      {/* Payment Details */}
                      <div className="bg-white dark:bg-slate-800 p-3 xl:p-4 rounded-lg xl:rounded-xl xl:rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 xl:mb-3 flex items-center gap-2 xl:gap-3">
                          <FaCreditCard className="text-primary-600 dark:text-primary-300" />
                          {translate('Payment Details')}
                        </h3>
                        <div className="space-y-2 xl:space-y-4">
                          {transaction.subscriptionName && (
                            <div className="flex justify-between items-center text-[9px] xl:text-[10px] uppercase font-black tracking-widest">
                              <span className="text-slate-600 dark:text-slate-400">{translate('Subscription')}</span>
                              <span className="text-slate-800 dark:text-white">{transaction.subscriptionName}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[9px] xl:text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">{translate('Status')}</span>
                            <span className={`px-2.5 xl:px-3 py-0.5 xl:py-1 rounded-lg ${getStatusColor(transaction.paymentStatus || transaction.status)}`}>
                              {transaction.paymentStatus || transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Details */}
                      <div className="bg-white dark:bg-slate-800 p-3 xl:p-4 rounded-lg xl:rounded-xl xl:rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-[9px] xl:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 xl:mb-3 flex items-center gap-2 xl:gap-3">
                          <FaReceipt className="text-primary-600 dark:text-primary-300" />
                          {translate('Transaction Details')}
                        </h3>
                        <div className="space-y-2 xl:space-y-4">
                          <div className="flex justify-between items-center text-[9px] xl:text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">{translate('Type')}</span>
                            <span className="text-slate-800 dark:text-white">{transaction.type}</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] xl:text-[10px] uppercase font-black tracking-widest">
                            <span className="text-slate-600 dark:text-slate-400">{translate('Order ID')}</span>
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
        <div className="mt-6 xl:mt-12"><Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} itemsPerPage={filters.limit} onItemsPerPageChange={(n) => setFilters(prev => ({ ...prev, limit: n, page: 1 }))} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} totalItems={pagination.totalCount} sticky={false} /></div>
      </div>
    </div>
  );
};

export default PaymentTransactions;


