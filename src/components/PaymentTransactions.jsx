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
        return <FaClock className="text-primary-500" />;
      case 'refunded':
        return <FaExclamationTriangle className="text-primary-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
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
        return <FaCreditCard className="text-secondary-500" />;
      default:
        return <FaCreditCard className="text-secondary-500" />;
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
    if (type === 'debit') return 'text-primary-600 dark:text-red-400';
    if (source === 'payment_order') return 'text-secondary-600 dark:text-secondary-400';
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
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 lg:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h2 className="text-md lg:text-2xl font-bold mb-2">Payment Transactions</h2>
            <p className="text-primary-100">View and manage your payment history</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              <FaFilter className="text-sm" />
              <span>Filters</span>
            </button>
            {/* <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2">
              <FaDownload className="text-sm" />
              <span>Export</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="p-3 lg:p-6 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(summary.totalAmount || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <FaRupeeSign className="text-green-600 dark:text-green-400 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                  <p className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.totalTransactions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                  <FaReceipt className="text-secondary-600 dark:text-secondary-400 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                  <p className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.paymentOrders?.completed || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-3 lg:p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Month Filter */}
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {filterOptions.years?.map(year => (
                <option key={year.value || year} value={year.value || year}>{year.label || year}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center space-x-2"
            >
              <FaTimes className="text-sm" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="p-3 lg:p-6">
        {error ? (
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <p className="text-primary-600 dark:text-red-400 text-lg">{error}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <FaReceipt className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Transaction Header */}
                <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`text-md lg:text-2xl font-bold ${getTypeColor(transaction.type, transaction.source)}`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction.paymentStatus || transaction.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.paymentStatus || transaction.status)}`}>
                            {transaction.paymentStatus || transaction.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{getSourceIcon(transaction.source)}</span>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{transaction.paymentDesc || transaction.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <FaCalendar className="text-xs" />
                          <span>{formatDate(transaction.date || transaction.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaTag className="text-xs" />
                          <span>{getSourceLabel(transaction.source)}</span>
                        </div>
                        {transaction.paymentMethod && (
                          <div className="flex items-center space-x-1">
                            <FaCreditCard className="text-xs" />
                            <span className="capitalize">{transaction.paymentMethod}</span>
                          </div>
                        )}
                        {transaction.currency && (
                          <div className="flex items-center space-x-1">
                            <FaGlobe className="text-xs" />
                            <span>{transaction.currency}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTransactionDetails(transaction.id)}
                      className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {expandedTransaction === transaction.id ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTransaction === transaction.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Payment Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                          <FaCreditCard className="text-secondary-500" />
                          <span>Payment Details</span>
                        </h4>
                        <div className="space-y-3">
                          {transaction.subscriptionName && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Subscription:</span>
                              <span className="text-gray-900 dark:text-white font-medium">{transaction.subscriptionName}</span>
                            </div>
                          )}
                          {transaction.orderId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                              <span className="text-gray-900 dark:text-white font-mono text-sm">{transaction.orderId}</span>
                            </div>
                          )}
                          {transaction.transactionId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                              <span className="text-gray-900 dark:text-white font-mono text-sm">{transaction.transactionId}</span>
                            </div>
                          )}
                          {transaction.paymentId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                              <span className="text-gray-900 dark:text-white font-mono text-sm">{transaction.paymentId}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                            <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(transaction.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.paymentStatus || transaction.status)}`}>
                              {transaction.paymentStatus || transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                          <FaReceipt className="text-primary-500" />
                          <span>Additional Information</span>
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Source:</span>
                            <span className="text-gray-900 dark:text-white">{getSourceLabel(transaction.source)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="text-gray-900 dark:text-white capitalize">{transaction.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Created:</span>
                            <span className="text-gray-900 dark:text-white">{formatDate(transaction.createdAt)}</span>
                          </div>
                          {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                              <span className="text-gray-900 dark:text-white">{formatDate(transaction.updatedAt)}</span>
                            </div>
                          )}
                          {transaction.balance !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                              <span className="text-gray-900 dark:text-white">{formatCurrency(transaction.balance)}</span>
                            </div>
                          )}
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
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of {pagination.totalCount} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft className="text-sm" />
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${page === pagination.currentPage
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
