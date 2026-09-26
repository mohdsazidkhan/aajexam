'use client';

import React, { useState, useEffect } from 'react';
import {
   CreditCard,
   Calendar,
   Clock,
   CheckCircle,
   XCircle,
   AlertCircle,
   IndianRupee,
   Receipt,
   RefreshCw,
   Hash,
   Smartphone,
   Landmark,
   Table as TableIcon,
   LayoutGrid,
   List,
   TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../lib/api';
import MobileAppWrapper from '../components/MobileAppWrapper';
import { ListSkeleton } from '../components/skeletons/PrivateSkeletons';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import Pagination from '../components/Pagination';
import ResponsiveTable from '../components/ResponsiveTable';

const PAGE_LIMIT = 12;

const PaymentHistoryPage = () => {
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalCount, setTotalCount] = useState(0);
   const [summary, setSummary] = useState({ totalTransactions: 0, successCount: 0, pendingAmount: 0, totalSpent: 0 });
   const [filterMonth, setFilterMonth] = useState('');
   const [filterYear, setFilterYear] = useState('');
   const [filterOptions, setFilterOptions] = useState({ months: [], years: [] });
   const [viewMode, setViewMode] = useState('table');

   useEffect(() => {
      if (window.innerWidth < 768) setViewMode('grid');
   }, []);

   const fetchTransactions = async () => {
      try {
         setLoading(true);
         const filters = { page: currentPage, limit: PAGE_LIMIT };
         if (filterMonth) filters.month = filterMonth;
         if (filterYear) filters.year = filterYear;

         const res = await API.getUserPaymentTransactions(filters);
         const payload = res?.data || res;
         setTransactions(payload.transactions || []);
         setTotalPages(payload.pagination?.totalPages || 1);
         setTotalCount(payload.pagination?.totalCount || 0);
         if (payload.summary) setSummary(payload.summary);
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
         case 'success': return { label: 'Success', icon: CheckCircle, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20', border: 'border-primary-200 dark:border-primary-600' };
         case 'pending': return { label: 'Pending', icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' };
         case 'failed': return { label: 'Failed', icon: XCircle, color: 'text-black dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800 dark:bg-white/20', border: 'border-slate-200 dark:border-slate-800 dark:border-white' };
         case 'refunded': return { label: 'Refunded', icon: RefreshCw, color: 'text-black dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800 dark:bg-white/20', border: 'border-slate-200 dark:border-slate-800 dark:border-white' };
         default: return { label: status || 'Unknown', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-white dark:bg-slate-900/20', border: 'border-gray-200 dark:border-gray-800' };
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

   const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
   }).format(amount || 0);

   // Per-transaction payment details only — this page is already scoped to
   // the current user, so repeating their name/email/phone on every card
   // (unlike the admin page, which lists many different users) is redundant.
   const getDetailItems = (txn) => ([
      { label: 'Product Info', value: txn.productInfo, icon: Receipt },
      { label: 'Payment Mode', value: txn.paymentMode, icon: CreditCard },
      { label: 'UPI ID', value: txn.upiId, icon: Smartphone },
      { label: 'UPI App / Channel', value: txn.upiChannel, icon: Smartphone },
      { label: 'Bank Code', value: txn.bankCode, icon: Landmark },
      { label: 'Bank Ref. No.', value: txn.bankRefNum, icon: Hash },
   ].filter(item => item.value));

   const clearFilters = () => {
      setFilterMonth('');
      setFilterYear('');
      setCurrentPage(1);
   };

   const transactionColumns = [
      {
         key: 'date', header: 'Date', render: (_, txn) => (
            <>
               <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatDate(txn.date)}</div>
               <div className="text-[9px] font-bold text-slate-400 uppercase">{formatTime(txn.date)}</div>
            </>
         )
      },
      {
         key: 'description', header: 'Plan', render: (_, txn) => (
            <>
               <div className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{txn.description}</div>
               {txn.subscription && (
                  <div className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{txn.subscription.plan} &bull; {txn.subscription.status}</div>
               )}
            </>
         )
      },
      {
         key: 'amount', header: 'Amount', render: (_, txn) => (
            <div className="text-right tabular-nums font-black text-slate-900 dark:text-white">
               {formatCurrency(txn.amount)} <span className="text-[9px] font-bold text-slate-400">{txn.currency || 'INR'}</span>
            </div>
         )
      },
      {
         key: 'status', header: 'Status', align: 'center', render: (_, txn) => {
            const cfg = getStatusConfig(txn.status);
            const StatusIcon = cfg.icon;
            return (
               <div className="flex justify-center">
                  <div className={`px-4 py-1.5 rounded-lg lg:rounded-xl border-2 text-[9px] font-black uppercase flex items-center gap-2 shadow-sm ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                     <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                  </div>
               </div>
            );
         }
      },
      { key: 'paymentMode', header: 'Payment Mode', render: (_, txn) => txn.paymentMode || 'N/A' },
      { key: 'upiId', header: 'UPI ID', render: (_, txn) => txn.upiId || 'N/A' },
      { key: 'upiChannel', header: 'UPI App / Channel', render: (_, txn) => txn.upiChannel || txn.bankCode || 'N/A' },
      { key: 'productInfo', header: 'Product Info', render: (_, txn) => txn.productInfo || 'N/A' },
      { key: 'bankRefNum', header: 'Bank Ref. No.', render: (_, txn) => txn.bankRefNum || 'N/A' }
   ];

   const viewToggleButtons = (
      <div className="flex items-center gap-1 p-2 w-full bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl border-2 border-slate-200/40 dark:border-slate-700/40">
         {[
            { icon: TableIcon, id: 'table', label: 'Table' },
            { icon: LayoutGrid, id: 'grid', label: 'Grid' },
            { icon: List, id: 'list', label: 'List' }
         ].map((mode) => (
            <button
               key={mode.id}
               onClick={() => setViewMode(mode.id)}
               title={mode.label}
               className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
               <mode.icon className="w-4 h-4" />
               <span className="text-[9px] font-black uppercase tracking-widest">{mode.label}</span>
            </button>
         ))}
      </div>
   );

   const statsBar = (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 lg:p-0 p-2">
         {[
            { label: 'Total Spent', val: summary.totalSpent || 0, icon: IndianRupee, isCurrency: true },
            { label: 'Total Transactions', val: summary.totalTransactions || 0, icon: Receipt },
            { label: 'Successful', val: summary.successCount || 0, icon: TrendingUp },
            { label: 'Pending Amount', val: summary.pendingAmount || 0, icon: AlertCircle, isCurrency: true }
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
   );

   const filtersGroup = (
      <div className="flex flex-wrap gap-3 justify-end items-center">
         {filterOptions.months?.length > 0 && (
            <select
               className="px-4 py-3 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-black outline-none focus:border-primary-700"
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
               className="px-4 py-3 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-black outline-none focus:border-primary-700"
               value={filterYear} onChange={e => { setFilterYear(e.target.value); setCurrentPage(1); }}
            >
               <option value="">All Years</option>
               {filterOptions.years.map(y => (
                  <option key={y} value={y}>{y}</option>
               ))}
            </select>
         )}
         {(filterMonth || filterYear) && (
            <button onClick={clearFilters} className="px-4 py-3 text-xs font-black text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-2xl transition-colors">
               Clear
            </button>
         )}
      </div>
   );

   if (loading && transactions.length === 0) return (
      <MobileAppWrapper title="Payment History">
         <div className="py-8"><ListSkeleton rows={6} /></div>
      </MobileAppWrapper>
   );

   return (
      <MobileAppWrapper title="Payment History">
         <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white mt-0">
            <Seo title="Payment History - AajExam" noIndex={true} />

            <div className="py-2 lg:py-4 space-y-2 lg:space-y-4 mt-0">
               {/* Mobile header: heading + filters share a row, stats and toggle stack below */}
               <div className="flex flex-col gap-3 lg:hidden">
                  <div className="flex items-center justify-between gap-3">
                     <h1 className="text-xl font-black font-outfit tracking-tight truncate min-w-0">
                        Payment History{totalCount > 0 ? ` (${totalCount})` : ''}
                     </h1>
                     <div className="shrink-0">{filtersGroup}</div>
                  </div>
                  {statsBar}
                  {viewToggleButtons}
               </div>

               {/* Desktop header: heading, stats, view toggle, filters share a single row */}
               <div className="hidden lg:flex lg:items-center gap-4">
                  <h1 className="text-3xl font-black font-outfit tracking-tight truncate shrink-0">
                     Payment History{totalCount > 0 ? ` (${totalCount})` : ''}
                  </h1>
                  <div className="flex-1">{statsBar}</div>
                  <div className="shrink-0">{viewToggleButtons}</div>
                  <div className="shrink-0">{filtersGroup}</div>
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
                  <>
                     {viewMode === 'table' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                           <ResponsiveTable
                              data={transactions}
                              columns={transactionColumns}
                              viewModes={['table']}
                              defaultView="table"
                              showPagination={false}
                              showViewToggle={false}
                           />
                        </div>
                     )}

                     {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                           {transactions.map((txn, idx) => {
                              const statusConfig = getStatusConfig(txn.status);
                              const StatusIcon = statusConfig.icon;
                              const items = getDetailItems(txn);
                              return (
                                 <motion.div key={txn.id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                                    <Card className="group hover:shadow-sm transition-all duration-500 border-2">
                                       <div className="space-y-5">
                                          {/* Top Row: Icon + Status */}
                                          <div className="flex justify-between items-center gap-2">
                                             <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
                                                <CreditCard className="w-6 h-6 text-primary-600" />
                                             </div>
                                             <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${statusConfig.bg} ${statusConfig.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                             </div>
                                          </div>

                                          {/* Description + Amount */}
                                          <div className="flex items-end justify-between gap-2">
                                             <div className="space-y-1 min-w-0">
                                                <p className="text-sm font-bold text-content-primary line-clamp-1">{txn.description}</p>
                                                {txn.subscription && (
                                                   <p className="text-[10px] font-bold text-gray-400">
                                                      {txn.subscription.plan} plan &bull; {txn.subscription.status}
                                                   </p>
                                                )}
                                             </div>
                                             <div className="text-right shrink-0">
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Amount</p>
                                                <div className="flex items-center justify-end gap-1">
                                                   <IndianRupee className="w-4 h-4 text-content-primary" />
                                                   <span className="text-xl font-black font-outfit">{txn.amount?.toLocaleString('en-IN')}</span>
                                                   <span className="text-[10px] font-black text-gray-400">{txn.currency || 'INR'}</span>
                                                </div>
                                             </div>
                                          </div>

                                          {/* Transaction ID */}
                                          {txn.transactionId && (
                                             <div className="pt-2 border-t-2 border-slate-50 dark:border-slate-800">
                                                <p className="text-[8px] font-black text-gray-400 uppercase">Transaction ID</p>
                                                <p className="text-[11px] font-bold text-content-secondary font-mono truncate">{txn.transactionId}</p>
                                             </div>
                                          )}

                                          {/* Payment Details */}
                                          {items.length > 0 && (
                                             <div className="pt-2 border-t-2 border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-x-3 gap-y-2">
                                                {items.map(item => (
                                                   <div key={item.label} className="min-w-0">
                                                      <p className="flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase truncate">
                                                         <item.icon className="w-2.5 h-2.5 shrink-0" /> {item.label}
                                                      </p>
                                                      <p className="text-[11px] font-bold text-content-secondary truncate" title={item.value}>{item.value}</p>
                                                   </div>
                                                ))}
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

                     {viewMode === 'list' && (
                        <div className="space-y-3">
                           {transactions.map((txn, idx) => {
                              const statusConfig = getStatusConfig(txn.status);
                              const StatusIcon = statusConfig.icon;
                              const items = getDetailItems(txn);
                              return (
                                 <div key={txn.id || idx} className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
                                    <div className="p-4 flex items-center justify-between gap-3">
                                       <div className="flex items-center gap-3 min-w-0">
                                          <div className={`relative p-2.5 rounded-xl border-2 shrink-0 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                             <StatusIcon className="w-4 h-4" />
                                             <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-900">{(currentPage - 1) * PAGE_LIMIT + idx + 1}</span>
                                          </div>
                                          <div className="min-w-0">
                                             <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px]">{txn.description}</div>
                                             <div className="text-[10px] text-slate-400">{formatDate(txn.date)}, {formatTime(txn.date)}</div>
                                          </div>
                                       </div>
                                       <div className="text-right shrink-0">
                                          <div className="text-[9px] font-bold text-slate-400 uppercase">Amount</div>
                                          <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(txn.amount)} <span className="text-[9px] font-bold text-slate-400">{txn.currency || 'INR'}</span></div>
                                       </div>
                                    </div>
                                    {items.length > 0 && (
                                       <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
                                          {items.map(item => (
                                             <div key={item.label} className="min-w-0">
                                                <p className="flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase truncate">
                                                   <item.icon className="w-2.5 h-2.5 shrink-0" /> {item.label}
                                                </p>
                                                <p className="text-[11px] font-bold text-content-secondary truncate" title={item.value}>{item.value}</p>
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </>
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
