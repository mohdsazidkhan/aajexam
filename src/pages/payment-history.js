'use client';

import React, { useState, useEffect } from 'react';
import {
   CreditCard,
   Search,
   Calendar,
   Clock,
   CheckCircle,
   XCircle,
   AlertCircle,
   IndianRupee,
   Filter,
   Receipt,
   RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../lib/api';
import MobileAppWrapper from '../components/MobileAppWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/Loading';
import Seo from '../components/Seo';
import Pagination from '../components/Pagination';

const PaymentHistoryPage = () => {
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalCount, setTotalCount] = useState(0);
   const [filterMonth, setFilterMonth] = useState('');
   const [filterYear, setFilterYear] = useState('');
   const [filterOptions, setFilterOptions] = useState({ months: [], years: [] });

   const fetchTransactions = async () => {
      try {
         setLoading(true);
         const filters = { page: currentPage, limit: 12 };
         if (filterMonth) filters.month = filterMonth;
         if (filterYear) filters.year = filterYear;

         const res = await API.getUserPaymentTransactions(filters);
         const payload = res?.data || res;
         setTransactions(payload.transactions || []);
         setTotalPages(payload.pagination?.totalPages || 1);
         setTotalCount(payload.pagination?.totalCount || 0);
      } catch (e) {
         toast.error('Could not load payment history');
      } finally {
         setLoading(false);
      }
   };

   const fetchFilterOptions = async () => {
      try {
         const res = await API.getTransactionFilterOptions();
         if (res?.success && res.data) {
            setFilterOptions(res.data);
         }
      } catch (e) { /* silently fail */ }
   };

   useEffect(() => { fetchFilterOptions(); }, []);
   useEffect(() => { fetchTransactions(); }, [currentPage, filterMonth, filterYear]);

   const getStatusConfig = (status) => {
      switch (status) {
         case 'paid': return { label: 'Paid', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' };
         case 'authorized': return { label: 'Authorized', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' };
         case 'failed': return { label: 'Failed', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' };
         case 'refunded': return { label: 'Refunded', icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' };
         case 'created': return { label: 'Pending', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-800' };
         default: return { label: status || 'Unknown', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-800' };
      }
   };

   const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
   };

   const formatTime = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
   };

   const clearFilters = () => {
      setFilterMonth('');
      setFilterYear('');
      setCurrentPage(1);
   };

   if (loading && transactions.length === 0) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

   return (
      <MobileAppWrapper title="Payment History">
         <div className="min-h-screen animate-fade-in selection:bg-primary-500 selection:text-white mt-0">
            <Seo title="Payment History - AajExam" noIndex={true} />

            <div className="container mx-auto px-0 lg:px-8 py-4 lg:py-12 space-y-6 lg:space-y-12 mt-0">
               {/* Header */}
               <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center lg:text-left">
                     <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight">Payment History</h1>
                     <p className="text-sm font-bold text-gray-400">
                        {totalCount > 0 ? `${totalCount} payment${totalCount > 1 ? 's' : ''} found` : 'All your payment transactions'}
                     </p>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 justify-center items-center">
                     {filterOptions.months?.length > 0 && (
                        <select
                           className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black outline-none focus:border-primary-500"
                           value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setCurrentPage(1); }}
                        >
                           <option value="">All Months</option>
                           {filterOptions.months.map(m => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                           ))}
                        </select>
                     )}
                     {filterOptions.years?.length > 0 && (
                        <select
                           className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black outline-none focus:border-primary-500"
                           value={filterYear} onChange={e => { setFilterYear(e.target.value); setCurrentPage(1); }}
                        >
                           <option value="">All Years</option>
                           {filterOptions.years.map(y => (
                              <option key={y} value={y}>{y}</option>
                           ))}
                        </select>
                     )}
                     {(filterMonth || filterYear) && (
                        <button onClick={clearFilters} className="px-4 py-3 text-xs font-black text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-2xl transition-colors">
                           Clear
                        </button>
                     )}
                  </div>
               </div>

               {/* Transactions */}
               {transactions.length === 0 ? (
                  <div className="py-4 lg:py-8 text-center space-y-3 lg:space-y-6">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                        <Receipt className="w-10 h-10 text-gray-400" />
                     </div>
                     <h3 className="text-xl lg:text-2xl font-black font-outfit">No payments yet</h3>
                     <p className="text-sm font-bold text-gray-400">Your payment transactions will appear here</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                     {transactions.map((txn, idx) => {
                        const statusConfig = getStatusConfig(txn.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                           <motion.div key={txn.id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="p-5 group hover:shadow-2xl transition-all duration-500 border-2">
                                 <div className="space-y-5">
                                    {/* Top Row: Icon + Status */}
                                    <div className="flex justify-between items-start">
                                       <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                          <CreditCard className="w-6 h-6 text-primary-500" />
                                       </div>
                                       <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${statusConfig.bg} ${statusConfig.color}`}>
                                          <StatusIcon className="w-3 h-3" />
                                          {statusConfig.label}
                                       </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-black text-gray-400 uppercase">Amount</p>
                                       <div className="flex items-center gap-1">
                                          <IndianRupee className="w-5 h-5 text-content-primary" />
                                          <span className="text-2xl font-black font-outfit">{txn.amount?.toLocaleString('en-IN')}</span>
                                       </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1">
                                       <p className="text-sm font-bold text-content-primary line-clamp-1">{txn.description}</p>
                                       {txn.subscription && (
                                          <p className="text-[10px] font-bold text-gray-400">
                                             {txn.subscription.plan} plan &bull; {txn.subscription.status}
                                          </p>
                                       )}
                                    </div>

                                    {/* Transaction ID */}
                                    {txn.transactionId && (
                                       <div className="pt-2 border-t-2 border-slate-50 dark:border-slate-800">
                                          <p className="text-[8px] font-black text-gray-400 uppercase">Transaction ID</p>
                                          <p className="text-[11px] font-bold text-content-secondary font-mono truncate">{txn.transactionId}</p>
                                       </div>
                                    )}

                                    {/* Date & Time */}
                                    <div className="flex items-center justify-between text-[9px] font-black text-gray-400 pt-2 border-t-2 border-slate-50 dark:border-slate-800">
                                       <div className="flex items-center gap-1.5">
                                          <Calendar className="w-3 h-3" />
                                          {formatDate(txn.date)}
                                       </div>
                                       <div className="flex items-center gap-1.5">
                                          <Clock className="w-3 h-3" />
                                          {formatTime(txn.date)}
                                       </div>
                                    </div>
                                 </div>
                              </Card>
                           </motion.div>
                        );
                     })}
                  </div>
               )}

               {/* Pagination */}
               {totalPages > 1 && (
                  <div className="flex justify-center pt-10">
                     <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
               )}
            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default PaymentHistoryPage;
