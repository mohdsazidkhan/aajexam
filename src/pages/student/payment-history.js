'use client';

import Select from '../../components/common/ui/Select';
import PageHero from '@/components/common/ui/PageHero';
import { PaymentsPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
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
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/common/MobileAppWrapper';
import Card from '../../components/common/ui/Card';
import Seo from '../../components/common/Seo';
import Pagination from '../../components/common/Pagination';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import useTranslate from '../../hooks/useTranslate';

const PAGE_LIMIT = 12;

const PaymentHistoryPage = () => {
  const { translate } = useTranslate();
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
         toast.error(translate('Could not load payment history'));
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
   // eslint-disable-next-line react-hooks/exhaustive-deps
   useEffect(() => { fetchTransactions(); }, [currentPage, filterMonth, filterYear]);

   const getStatusConfig = (status) => {
      switch (status) {
         case 'success': return { label: translate('Success'), icon: CheckCircle, color: 'text-primary-600', bg: '', border: 'border-primary-200 dark:border-primary-600' };
         case 'pending': return { label: translate('Pending'), icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' };
         case 'failed': return { label: translate('Failed'), icon: XCircle, color: 'text-content-primary', bg: 'bg-background-surface-secondary', border: 'border-border-primary dark:border-white' };
         case 'refunded': return { label: translate('Refunded'), icon: RefreshCw, color: 'text-content-primary', bg: 'bg-background-surface-secondary', border: 'border-border-primary dark:border-white' };
         default: return { label: status || translate('Unknown'), icon: AlertCircle, color: 'text-content-muted', bg: 'bg-background-surface', border: 'border-border-primary' };
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
      { label: translate('Product Info'), value: txn.productInfo, icon: Receipt },
      { label: translate('Payment Mode'), value: txn.paymentMode, icon: CreditCard },
      { label: translate('UPI ID'), value: txn.upiId, icon: Smartphone },
      { label: translate('UPI App / Channel'), value: txn.upiChannel, icon: Smartphone },
      { label: translate('Bank Code'), value: txn.bankCode, icon: Landmark },
      { label: translate('Bank Ref. No.'), value: txn.bankRefNum, icon: Hash },
   ].filter(item => item.value));

   const clearFilters = () => {
      setFilterMonth('');
      setFilterYear('');
      setCurrentPage(1);
   };

   const transactionColumns = [
      {
         key: 'date', header: translate('Date'), render: (_, txn) => (
            <>
               <div className="text-sm font-bold text-content-primary uppercase tracking-tight">{formatDate(txn.date)}</div>
               <div className="text-[9px] font-bold text-content-muted uppercase">{formatTime(txn.date)}</div>
            </>
         )
      },
      {
         key: 'description', header: translate('Plan'), render: (_, txn) => (
            <>
               <div className="text-sm font-bold text-content-primary truncate max-w-[200px]">{txn.description}</div>
               {txn.subscription && (
                  <div className="text-[9px] font-bold text-content-muted uppercase truncate max-w-[200px]">{txn.subscription.plan} &bull; {txn.subscription.status}</div>
               )}
            </>
         )
      },
      {
         key: 'amount', header: translate('Amount'), render: (_, txn) => (
            <div className="text-right tabular-nums font-bold text-content-primary">
               {formatCurrency(txn.amount)} <span className="text-[9px] font-bold text-content-muted">{txn.currency || 'INR'}</span>
            </div>
         )
      },
      {
         key: 'status', header: translate('Status'), align: 'center', render: (_, txn) => {
            const cfg = getStatusConfig(txn.status);
            const StatusIcon = cfg.icon;
            return (
               <div className="flex justify-center">
                  <div className={`px-4 py-1.5 rounded-lg xl:rounded-xl border text-[9px] font-bold uppercase flex items-center gap-2 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                     <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                  </div>
               </div>
            );
         }
      },
      { key: 'paymentMode', header: translate('Payment Mode'), render: (_, txn) => txn.paymentMode || translate('N/A') },
      { key: 'upiId', header: translate('UPI ID'), render: (_, txn) => txn.upiId || translate('N/A') },
      { key: 'upiChannel', header: translate('UPI App / Channel'), render: (_, txn) => txn.upiChannel || txn.bankCode || translate('N/A') },
      { key: 'productInfo', header: translate('Product Info'), render: (_, txn) => txn.productInfo || translate('N/A') },
      { key: 'bankRefNum', header: translate('Bank Ref. No.'), render: (_, txn) => txn.bankRefNum || translate('N/A') }
   ];

   const viewToggleButtons = (
      <div className="flex items-center gap-1 p-1 bg-white/80 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/20" style={{ borderRadius: 10 }}>
         {[
            { icon: TableIcon, id: 'table', label: translate('Table') },
            { icon: LayoutGrid, id: 'grid', label: translate('Grid') },
            { icon: List, id: 'list', label: translate('List') }
         ].map((mode) => (
            <button
               key={mode.id}
               onClick={() => setViewMode(mode.id)}
               title={mode.label}
               className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${viewMode === mode.id ? 'text-on-primary bg-primary-600' : 'text-content-muted dark:hover:bg-white/10'}`}
            >
               <mode.icon className="w-4 h-4" />
               <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label}</span>
            </button>
         ))}
      </div>
   );

   const statsBar = (
      <>
         {[
            { label: translate('Total Spent'), val: summary.totalSpent || 0, isCurrency: true },
            { label: translate('Total Transactions'), val: summary.totalTransactions || 0 },
            { label: translate('Successful'), val: summary.successCount || 0 },
            { label: translate('Pending Amount'), val: summary.pendingAmount || 0, isCurrency: true }
         ].map((stat) => (
            <div key={stat.label} className="bg-white/80 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/20 px-3 py-1.5 min-w-[88px]" style={{ borderRadius: 10 }}>
               <p className="text-base xl:text-lg font-bold font-outfit leading-none text-primary-600 tabular-nums whitespace-nowrap">{stat.isCurrency ? formatCurrency(stat.val) : stat.val.toLocaleString()}</p>
               <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 whitespace-nowrap">{stat.label}</p>
            </div>
         ))}
      </>
   );

   const filtersGroup = (
      <div className="flex flex-wrap gap-2 items-center">
         {filterOptions.months?.length > 0 && (
            <Select
               className="px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs font-bold outline-none focus:border-primary-600"
               value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setCurrentPage(1); }}
            >
               <option value="">{translate('All Months')}</option>
               {filterOptions.months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
               ))}
            </Select>
         )}
         {filterOptions.years?.length > 0 && (
            <Select
               className="px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs font-bold outline-none focus:border-primary-600"
               value={filterYear} onChange={e => { setFilterYear(e.target.value); setCurrentPage(1); }}
            >
               <option value="">{translate('All Years')}</option>
               {filterOptions.years.map(y => (
                  <option key={y} value={y}>{y}</option>
               ))}
            </Select>
         )}
         {(filterMonth || filterYear) && (
            <button onClick={clearFilters} className="px-3 py-2 text-xs font-bold text-primary-600 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors">
               {translate('Clear')}
            </button>
         )}
      </div>
   );

   if (loading && transactions.length === 0) return (
      <MobileAppWrapper title={translate('Payment History')}>
         <div className="py-2 xl:py-4"><PaymentsPageSkeleton /></div>
      </MobileAppWrapper>
   );

   return (
      <MobileAppWrapper title={translate('Payment History')}>
         <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white mt-0">
            <Seo title="Payment History - AajExam" noIndex={true} />

            <div className="py-2 xl:py-4 space-y-2 xl:space-y-4 mt-0">
               <PageHero
                  icon={Receipt}
                  eyebrow={translate('Payment History')}
                  title={`${translate('Payment History')}${totalCount > 0 ? ` (${totalCount})` : ''}`}
                  actions={
                     <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        {statsBar}
                        {viewToggleButtons}
                        {filtersGroup}
                     </div>
                  }
               />

               {/* Transactions */}
               {transactions.length === 0 ? (
                  <div className="py-4 xl:py-8 text-center space-y-3 xl:space-y-6">
                     <div className="w-24 h-24 bg-background-surface-secondary rounded-3xl flex items-center justify-center mx-auto opacity-50">
                        <Receipt className="w-10 h-10 text-content-muted" />
                     </div>
                     <h2 className="text-xl xl:text-2xl font-bold font-outfit">{translate('No payments yet')}</h2>
                     <p className="text-sm font-bold text-content-muted">{translate('Your payment transactions will appear here')}</p>
                  </div>
               ) : (
                  <>
                     {viewMode === 'table' && (
                        <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
                           {transactions.map((txn, idx) => {
                              const statusConfig = getStatusConfig(txn.status);
                              const StatusIcon = statusConfig.icon;
                              const items = getDetailItems(txn);
                              return (
                                 <motion.div key={txn.id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                                    <Card className="group transition-all duration-500 border">
                                       <div className="space-y-5">
                                          {/* Top Row: Icon + Status */}
                                          <div className="flex justify-between items-center gap-2">
                                             <div className="p-3 bg-background-surface-secondary rounded-2xl shrink-0">
                                                <CreditCard className="w-6 h-6 text-primary-600" />
                                             </div>
                                             <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${statusConfig.bg} ${statusConfig.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                             </div>
                                          </div>

                                          {/* Description + Amount */}
                                          <div className="flex items-end justify-between gap-2">
                                             <div className="space-y-1 min-w-0">
                                                <p className="text-sm font-bold text-content-primary line-clamp-1">{txn.description}</p>
                                                {txn.subscription && (
                                                   <p className="text-[10px] font-bold text-content-muted">
                                                      {txn.subscription.plan} plan &bull; {txn.subscription.status}
                                                   </p>
                                                )}
                                             </div>
                                             <div className="text-right shrink-0">
                                                <p className="text-[10px] font-bold text-content-muted uppercase">{translate('Amount')}</p>
                                                <div className="flex items-center justify-end gap-1">
                                                   <IndianRupee className="w-4 h-4 text-content-primary" />
                                                   <span className="text-xl font-bold font-outfit">{txn.amount?.toLocaleString('en-IN')}</span>
                                                   <span className="text-[10px] font-bold text-content-muted">{txn.currency || 'INR'}</span>
                                                </div>
                                             </div>
                                          </div>

                                          {/* Transaction ID */}
                                          {txn.transactionId && (
                                             <div className="pt-2 border-t-2 border-border-primary dark:border-slate-800">
                                                <p className="text-[8px] font-bold text-content-muted uppercase">{translate('Transaction ID')}</p>
                                                <p className="text-[11px] font-bold text-content-secondary font-mono truncate">{txn.transactionId}</p>
                                             </div>
                                          )}

                                          {/* Payment Details */}
                                          {items.length > 0 && (
                                             <div className="pt-2 border-t-2 border-border-primary dark:border-slate-800 grid grid-cols-2 gap-x-3 gap-y-2">
                                                {items.map(item => (
                                                   <div key={item.label} className="min-w-0">
                                                      <p className="flex items-center gap-1 text-[8px] font-bold text-content-muted uppercase truncate">
                                                         <item.icon className="w-2.5 h-2.5 shrink-0" /> {item.label}
                                                      </p>
                                                      <p className="text-[11px] font-bold text-content-secondary truncate" title={item.value}>{item.value}</p>
                                                   </div>
                                                ))}
                                             </div>
                                          )}

                                          {/* Date & Time */}
                                          <div className="flex items-center justify-between text-[9px] font-bold text-content-muted pt-2 border-t-2 border-border-primary dark:border-slate-800">
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
                                 <div key={txn.id || idx} className="bg-background-surface rounded-xl border border-border-primary overflow-hidden">
                                    <div className="p-4 flex items-center justify-between gap-3">
                                       <div className="flex items-center gap-3 min-w-0">
                                          <div className={`relative p-2.5 rounded-xl border shrink-0 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                             <StatusIcon className="w-4 h-4" />
                                             <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-900">{(currentPage - 1) * PAGE_LIMIT + idx + 1}</span>
                                          </div>
                                          <div className="min-w-0">
                                             <div className="text-sm font-bold text-content-primary truncate max-w-[220px]">{txn.description}</div>
                                             <div className="text-[10px] text-content-muted">{formatDate(txn.date)}, {formatTime(txn.date)}</div>
                                          </div>
                                       </div>
                                       <div className="text-right shrink-0">
                                          <div className="text-[9px] font-bold text-content-muted uppercase">{translate('Amount')}</div>
                                          <div className="text-sm font-bold text-content-primary tabular-nums">{formatCurrency(txn.amount)} <span className="text-[9px] font-bold text-content-muted">{txn.currency || 'INR'}</span></div>
                                       </div>
                                    </div>
                                    {items.length > 0 && (
                                       <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
                                          {items.map(item => (
                                             <div key={item.label} className="min-w-0">
                                                <p className="flex items-center gap-1 text-[8px] font-bold text-content-muted uppercase truncate">
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
