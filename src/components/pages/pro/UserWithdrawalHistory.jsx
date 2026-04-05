'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
   History,
   Wallet,
   ArrowLeft,
   Calendar,
   CreditCard,
   CircleCheck,
   CircleAlert,
   Clock,
   ChevronRight,
   ArrowUpRight,
   ShieldCheck,
   TrendingUp,
   Zap,
   BarChart3,
   Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../../lib/api';
import UnifiedFooter from "../../UnifiedFooter";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const PAGE_LIMIT = 20;

export default function UserWithdrawalHistory() {
   const { isMounted, router } = useSSR();

   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [page, setPage] = useState(1);
   const [limit] = useState(PAGE_LIMIT);
   const [pagination, setPagination] = useState({});
   const [summary, setSummary] = useState({ totalRequested: 0, totalPaid: 0, count: 0 });

   const fetchHistory = useCallback(async (pageNumber = 1) => {
      setLoading(true);
      try {
         const res = await API.getWithdrawalHistory({ page: pageNumber, limit });
         if (res.success) {
            setRequests(res.data || []);
            setPagination(res.pagination || {});
            setSummary(res.summary || { totalRequested: 0, totalPaid: 0, count: 0 });
         } else {
            setError(res.message || "Extraction logs inaccessible");
         }
      } catch (err) {
         setError("Vault sync failed");
      } finally {
         setLoading(false);
      }
   }, [limit]);

   useEffect(() => {
      if (isMounted) fetchHistory(page);
   }, [isMounted, page, fetchHistory]);

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
         style: 'currency',
         currency: 'INR',
         minimumFractionDigits: 0
      }).format(amount);
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
         day: 'numeric',
         month: 'short',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   const getStatusConfig = (status) => {
      switch (status) {
         case 'paid': return { color: 'emerald', icon: CircleCheck, label: 'CONFIRMED' };
         case 'approved': return { color: 'secondary', icon: ShieldCheck, label: 'AUTHORIZED' };
         case 'rejected': return { color: 'primary', icon: CircleAlert, label: 'REJECTED' };
         default: return { color: 'amber', icon: Clock, label: 'PROCESSING' };
      }
   };

   if (!isMounted) return null;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">

         <div className="container mx-auto px-2 lg:px-6 py-4 max-w-7xl space-y-12">

            {/* --- Extraction Logs Hero --- */}
            <section className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <History className="w-10 h-10" />
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Extraction <span className="text-primary-700 dark:text-primary-500">Logs</span></h1>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto">Chronological record of bounty transfers and archive status</p>
               </div>

               <div className="flex justify-center pt-6">
                  <Button variant="ghost" onClick={() => router.push('/pro/wallet')} className="px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-100 dark:border-slate-800">
                     <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO VAULT
                  </Button>
               </div>
            </section>

            {/* --- Summary Bento Grid --- */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {[
                  { label: 'Total Transmitted', val: formatCurrency(summary.totalRequested), icon: TrendingUp, color: 'primary' },
                  { label: 'Confirmed Extraction', val: formatCurrency(summary.totalPaid), icon: CircleCheck, color: 'emerald' },
                  { label: 'Log Count', val: summary.count || 0, icon: BarChart3, color: 'secondary' }
               ].map((s, i) => (
                  <Card key={i} className="p-8 group border-b-4 border-slate-100 dark:border-slate-800 hover:border-slate-200">
                     <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 bg-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color}-500/10 text-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color}-500 rounded-2xl`}>
                           <s.icon className="w-6 h-6" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-slate-600 dark:text-slate-400 transition-colors" />
                     </div>
                     <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                     <p className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight">{s.val}</p>
                  </Card>
               ))}
            </section>

            {/* --- Main Table Area --- */}
            <Card className="overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[3rem]">
               <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary-500 rounded-xl text-white shadow-duo-primary">
                        <Zap className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black font-outfit uppercase tracking-tight">Command Center Transfers</h3>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Global extraction and Creation history</p>
                     </div>
                  </div>
               </div>

               <AnimatePresence mode="wait">
                  {loading ? (
                     <div className="py-24 flex justify-center"><Loading size="lg" /></div>
                  ) : error ? (
                     <div className="py-24 text-center space-y-6">
                        <CircleAlert className="w-16 h-16 text-primary-700 dark:text-primary-500 mx-auto" />
                        <div className="space-y-2">
                           <h3 className="text-xl font-black font-outfit uppercase">Log Corruption</h3>
                           <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{error}</p>
                        </div>
                        <Button variant="primary" onClick={() => fetchHistory(page)}>REBOOT LOG FETCH</Button>
                     </div>
                  ) : requests.length === 0 ? (
                     <div className="py-32 text-center space-y-8">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
                           <Wallet className="w-12 h-12 text-slate-300" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">No Extractions Detected</h3>
                           <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">The vault remains full. Initiate your first extraction to see transmission logs here.</p>
                        </div>
                        <Button variant="secondary" size="lg" onClick={() => router.push('/pro/wallet')} className="rounded-full px-10 py-5 text-xs font-black shadow-duo-secondary uppercase tracking-widest">GO TO VAULT</Button>
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead className="bg-slate-50/50 dark:bg-slate-900/30">
                              <tr>
                                 <th className="px-10 py-6 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Timestamp</th>
                                 <th className="px-10 py-6 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Bounty Amount</th>
                                 <th className="px-10 py-6 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Creation ID</th>
                                 <th className="px-10 py-6 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Extraction Status</th>
                                 <th className="px-10 py-6 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 text-right">Reference</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                              {requests.map((req, idx) => {
                                 const conf = getStatusConfig(req.status);
                                 return (
                                    <motion.tr key={req._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                       <td className="px-10 py-8">
                                          <div className="flex items-center gap-4">
                                             <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400">
                                                <Calendar className="w-5 h-5" />
                                             </div>
                                             <div>
                                                <p className="text-sm font-bold font-outfit uppercase text-slate-900 dark:text-white tracking-tight">{formatDate(req.requestedAt)}</p>
                                                <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">Transmission Time</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-10 py-8">
                                          <p className="text-xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">{formatCurrency(req.amount)}</p>
                                       </td>
                                       <td className="px-10 py-8">
                                          <div className="flex items-center gap-3">
                                             <div className={`p-2 rounded-lg bg-${conf.color}-500/10 text-${conf.color}-500`}>
                                                <Smartphone className="w-4 h-4" />
                                             </div>
                                             <p className="text-xs font-bold font-mono tracking-widest text-slate-700 dark:text-slate-400 uppercase">{req.upi || 'BANKING'}</p>
                                          </div>
                                       </td>
                                       <td className="px-10 py-8">
                                          <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-${conf.color}-500/20 bg-${conf.color}-500/5 text-${conf.color}-500 text-[10px] font-black uppercase tracking-[0.2em]`}>
                                             <conf.icon className="w-4 h-4" /> {conf.label}
                                          </div>
                                       </td>
                                       <td className="px-10 py-8 text-right">
                                          <p className="text-[10px] font-black font-mono text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">TXN NODE</p>
                                          <p className="text-xs font-black font-mono text-slate-300">#{req._id.substring(req._id.length - 8).toUpperCase()}</p>
                                       </td>
                                    </motion.tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  )}
               </AnimatePresence>

               {/* Pagination Hub */}
               {pagination.pages > 1 && (
                  <div className="p-4 lg:p-8 bg-slate-50/30 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-2">
                     {[...Array(pagination.pages)].map((_, i) => (
                        <button
                           key={i}
                           onClick={() => setPage(i + 1)}
                           className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}
                        >
                           {i + 1}
                        </button>
                     ))}
                  </div>
               )}
            </Card>

         </div>
         <UnifiedFooter />
      </div>
   );
}

