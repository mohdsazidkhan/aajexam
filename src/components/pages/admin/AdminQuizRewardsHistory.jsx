'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";
import SearchFilter from "../../SearchFilter";
import ViewToggle from "../../ViewToggle";
import API from '../../../lib/api';
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import { isMobile } from 'react-device-detect';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  IndianRupee, 
  Calendar, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Table as TableIcon,
  ChevronRight,
  User,
  History,
  FileText,
  Activity,
  Award,
  Clock,
  ArrowUpRight
} from 'lucide-react';

const PAGE_LIMIT = 20;

export default function AdminQuizRewardsHistory() {
    const { isMounted, isRouterReady, router } = useSSR();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(PAGE_LIMIT);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState(null);
    const [viewMode, setViewMode] = useState('table');

    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
    const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
    const isOpen = useSelector((state) => state.sidebar.isOpen);

    const debouncedSearch = useDebounce(searchTerm, 1000);

    useEffect(() => {
        fetchQuizRewardsHistory(page, limit, debouncedSearch);
    }, [debouncedSearch, page, limit]);

    const fetchQuizRewardsHistory = async (p = 1, l = 20, s = "") => {
        try {
            setLoading(true);
            const params = { page: p, limit: l, ...(s && { search: s }) };
            const res = await API.getAdminQuizRewardsHistory(params);

            if (res?.success) {
                setTransactions(res.data?.transactions || []);
                setPagination(res.data?.pagination || {});
                setSummary(res.data?.summary || null);
            } else {
                setError(res?.message || 'Failed to fetch reward history');
            }
        } catch (err) {
            setError(err.message || 'Synchronization failure');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (v) => { setSearchTerm(v); setPage(1); };
    const handlePageChange = (np) => setPage(np);

    const formatDate = (ds) => {
        if (!ds) return 'N/A';
        const d = new Date(ds);
        return `${d.getDate()} ${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]} ${d.getFullYear()}`;
    };

    if (!isMounted) return null;

    return (
        <AdminMobileAppWrapper title="Quiz Rewards History">
            <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
                {user?.role === "admin" && isAdminRoute && <Sidebar />}
                <div className="adminContent p-4 lg:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden pt-12 lg:pt-8 font-outfit">
                    
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-12">
                      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary-500/20 text-primary-500 rounded-2xl shadow-sm">
                              <History className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Treasury // Rewards Disbursement</span>
                          </div>
                          <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                            Payout History
                          </h1>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                            Audit trail of quiz rewards and beneficiary settlements.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <SearchFilter searchTerm={searchTerm} onSearchChange={handleSearch} placeholder="Filter by user or intent..." />
                          <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 shadow-xl">
                            {[{ icon: TableIcon, id: 'table' }, { icon: List, id: 'list' }, { icon: LayoutGrid, id: 'grid' }].map((mode) => (
                              <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`p-3 rounded-full transition-all ${viewMode === mode.id ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400'}`}>
                                <mode.icon className="w-5 h-5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Summary Cards */}
                    {summary && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-12">
                         {[
                           { label: 'Total Rewards', val: `₹${summary.totalRewards?.toLocaleString() || 0}`, icon: Trophy, color: 'emerald' },
                           { label: 'Disbursements', val: summary.totalTransactions || 0, icon: Activity, color: 'blue' },
                           { label: 'Pending Yield', val: '₹12,450', icon: Clock, color: 'amber' },
                           { label: 'Global Rank', val: 'TOP 1%', icon: Award, color: 'indigo' }
                         ].map((s, i) => (
                           <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 shadow-lg group hover:border-primary-500/30 transition-all">
                              <div className={`p-4 bg-${s.color}-500/10 text-${s.color}-500 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}><s.icon className="w-5 h-5" /></div>
                              <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none mb-1">{s.val}</div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
                           </motion.div>
                         ))}
                      </div>
                    )}

                    {/* Content */}
                    <AnimatePresence mode="wait">
                      {loading ? (
                         <div className="flex items-center justify-center py-32"><Loading size="md" color="blue" message="Synchronizing reward buffer..." /></div>
                      ) : error ? (
                         <div className="text-center py-32">
                            <div className="p-3 lg:p-8 bg-rose-500/10 rounded-xl lg:rounded-[3rem] mb-6 border-4 border-dashed border-rose-500/20 inline-block text-rose-500 text-2xl lg:text-6xl">!</div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Sync Error</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                         </div>
                      ) : transactions.length === 0 ? (
                         <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
                            <Trophy className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                            <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tighter">No Rewards Logged</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No payout transactions found in the treasury buffer.</p>
                         </div>
                      ) : (
                          <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {viewMode === 'table' && (
                              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                                 <table className="w-full border-collapse">
                                    <thead>
                                       <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiary</th>
                                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Description</th>
                                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield</th>
                                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Post-Balance</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                       {transactions.map((tx, i) => (
                                         <motion.tr key={tx._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="group hover:bg-primary-500/5 transition-all cursor-pointer">
                                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">
                                               {formatDate(tx.createdAt)}
                                            </td>
                                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                                               <div className="flex items-center gap-4">
                                                  <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-lg group-hover:scale-110 transition-transform">{tx.user?.name?.[0] || 'U'}</div>
                                                  <div>
                                                     <div className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1 group-hover:text-primary-500 transition-colors uppercase tracking-tight">{tx.user?.name || 'N/A'}</div>
                                                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate max-w-[150px]">{tx.user?.email || 'N/A'}</div>
                                                  </div>
                                               </div>
                                            </td>
                                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                                               <div className="flex items-center gap-3">
                                                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><FileText className="w-3 h-3" /></div>
                                                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-relaxed tracking-wider">{tx.description || 'General Quiz Yield'}</span>
                                               </div>
                                            </td>
                                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                                               <span className="text-sm font-black text-emerald-600 dark:text-emerald-500 tabular-nums italic">+₹{tx.amount}</span>
                                            </td>
                                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-right font-black text-slate-900 dark:text-white tabular-nums text-sm">
                                               ₹{tx.balance?.toLocaleString() || 0}
                                            </td>
                                         </motion.tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                            )}

                            {viewMode === 'grid' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                                 {transactions.map((tx, i) => (
                                   <motion.div key={tx._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl group flex flex-col font-outfit hover:border-primary-500/20 transition-all">
                                      <div className="flex justify-between items-start mb-6">
                                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{formatDate(tx.createdAt)}</div>
                                         <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg grow-0"><IndianRupee className="w-3 h-3" /></div>
                                      </div>
                                      <div className="flex-1 space-y-4">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-lg group-hover:scale-110 transition-transform">{tx.user?.name?.[0] || 'U'}</div>
                                            <div className="truncate">
                                               <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none mb-1 group-hover:text-primary-500 transition-colors truncate">{tx.user?.name || 'Candidate'}</div>
                                               <div className="text-[8px] font-black text-slate-400 tracking-widest uppercase truncate">{tx.user?.email || 'N/A'}</div>
                                            </div>
                                         </div>
                                         <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason</div>
                                            <div className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase leading-relaxed line-clamp-2">{tx.description || 'Disbursement'}</div>
                                         </div>
                                      </div>
                                      <div className="mt-4 lg:mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex justify-between items-end">
                                         <div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement</div>
                                            <div className="text-xl font-black text-emerald-600 dark:text-emerald-500 italic">+₹{tx.amount}</div>
                                         </div>
                                         <div className="text-right">
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Balance</div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">₹{tx.balance || 0}</div>
                                         </div>
                                      </div>
                                   </motion.div>
                                 ))}
                              </div>
                            )}

                            {viewMode === 'list' && (
                              <div className="space-y-3 lg:space-y-6">
                                 {transactions.map((tx, i) => (
                                   <motion.div key={tx._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-xl group">
                                      <div className="flex items-center gap-3 lg:gap-6">
                                         <div className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-xl shrink-0 italic">{tx.user?.name?.[0] || 'U'}</div>
                                         <div>
                                            <div className="flex items-center gap-3 mb-1">
                                               <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-primary-500 transition-colors uppercase">{tx.user?.name || 'Candidate'}</h3>
                                               <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">+₹{tx.amount}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                               <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(tx.createdAt)}</span>
                                               <span className="flex items-center gap-1 grow-0 shrink-0"><FileText className="w-3 h-3 text-indigo-500" /> {tx.description?.substring(0, 30) || 'Reward'}...</span>
                                            </div>
                                         </div>
                                      </div>
                                      <div className="flex items-center gap-3 lg:gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                                         <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">₹{tx.balance?.toLocaleString() || 0} BALANCE</div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tx.user?.email || 'N/A'}</div>
                                         </div>
                                         <Link href={`/admin/quiz-rewards-history/user/${tx.user?._id}`} className="p-4 bg-primary-500 text-white rounded-2xl shadow-xl hover:scale-110 transition-all"><ArrowUpRight className="w-5 h-5" /></Link>
                                      </div>
                                   </motion.div>
                                 ))}
                              </div>
                            )}

                            {/* Pagination */}
                            {!loading && pagination.totalPages > 1 && (
                               <div className="flex justify-center pt-12">
                                  <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} totalItems={pagination.totalItems} itemsPerPage={limit} />
                               </div>
                            )}
                          </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
}

