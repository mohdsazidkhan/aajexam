'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Download, BarChart3, Users, Eye, Filter, RefreshCcw, IndianRupee,
    TrendingUp, TrendingDown, LayoutGrid, List, Table as TableIcon, Tag,
    Wallet, PieChart, Activity, ShieldCheck, Mail, Calendar, ChevronRight,
    Zap, Target, ExternalLink, Cpu, Globe, ArrowRight, ArrowUpRight, ArrowDownRight, Layers,
    DownloadCloud, UserCheck, Star, Award, Trophy, Info
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from '../../Sidebar';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import API from '../../../lib/api';

const AdminUsersAnalytics = () => {
    const { isMounted } = useSSR();
    const isOpen = useSelector(state => state.sidebar.isOpen);
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
    const router = useRouter();
    const isAdminRoute = router?.pathname?.startsWith('/admin') || false;

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [subscription, setSubscription] = useState('');
    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalEarnings: 0,
        totalExpenses: 0,
        totalRevenue: 0,
        totalCustomExpenses: 0,
        totalPlatformExpenses: 0,
        netPlatform: 0
    });

    const [viewMode, setViewMode] = useState('table');
    const LIMIT = 20;

    const fetchStudents = useCallback(async (pg = 1) => {
        try {
            setLoading(true);
            setError(null);
            const params = { page: pg, limit: LIMIT, ...(search.trim() && { search: search.trim() }), ...(subscription && { subscriptionStatus: subscription }) };
            const res = await API.getAdminUsersWithEarnings(params);
            
            if (res?.success !== false) {
                const list = res?.students || res?.data || res || [];
                const pag = res?.pagination || {};
                setStudents(Array.isArray(list) ? list : []);
                setTotalPages(pag.totalPages || Math.ceil((pag.totalUsers || list.length) / LIMIT));
                setTotalUsers(pag.totalUsers || list.length);
                setPage(pg);
            } else {
                setError(res?.message || 'Data loading failure');
            }
        } catch (err) {
            setError(err?.message || 'Failed to load student data');
        } finally {
            setLoading(false);
        }
    }, [search, subscription]);

    useEffect(() => {
        fetchStudents(1);
        API.getAdminAllUsersSummary()
            .then(res => { if (res?.success && res.data) setSummary(res.data); })
            .catch(() => { });
    }, [subscription, fetchStudents]);

    const handleSearch = (e) => { e?.preventDefault(); fetchStudents(1); };

    const exportCSV = () => {
        if (!students.length) return;
        const headers = ['Name', 'Email', 'Level', 'Subscription', 'Earnings', 'Joined'];
        const rows = students.map(s => [
            s.name, s.email, s.level?.currentLevel, s.subscriptionStatus, s.totalEarnings, 
            s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'student_analytics.csv'; a.click();
    };

    if (!isMounted) return null;

    return (
        <AdminMobileAppWrapper title="User Analytics">
            <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
                {user?.role === 'admin' && isAdminRoute && <Sidebar />}

                <div className="adminContent p-4 lg:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden pt-12 lg:pt-8 font-outfit">
                    
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-12">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-4 lg:mb-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary-500/20 text-primary-500 rounded-2xl shadow-sm">
                                        <Users className="w-6 h-6" />
                                    </div>
                                     <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">ADMIN // USER ANALYTICS</span>
                                 </div>
                                 <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                                     User Performance & Earnings
                                 </h1>
                                 <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                                     Detailed analysis of user activity, revenue, and reward distribution.
                                 </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                 <motion.button whileHover={{ scale: 1.05 }} onClick={() => router.push('/admin/expenses')} className="px-4 lg:px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3">
                                     <Wallet className="w-4 h-4" /> EXPENSE RECORDS
                                 </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} onClick={exportCSV} className="p-4 bg-white dark:bg-white/5 text-primary-500 rounded-2xl border-2 border-slate-100 dark:border-white/10 shadow-lg">
                                    <DownloadCloud className="w-6 h-6" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
                            {[
                                 { label: 'Total Users', val: summary.totalUsers || totalUsers, icon: Users, color: 'blue', desc: 'Active Learners' },
                                 { label: 'Monthly Revenue', val: summary.totalRevenue || 0, icon: TrendingUp, color: 'emerald', desc: 'Subscription Flow', isCurrency: true },
                                 { label: 'Total Earnings', val: summary.totalEarnings || 0, icon: Gift, color: 'rose', desc: 'User Rewards', isCurrency: true },
                                 { label: 'Other Expenses', val: summary.totalCustomExpenses || 0, icon: Target, color: 'amber', desc: 'Maintenance & Rewards', isCurrency: true },
                                 { label: 'Net Profit', val: summary.netPlatform || 0, icon: Activity, color: summary.netPlatform >= 0 ? 'primary' : 'rose', desc: 'Platform Performance', isCurrency: true, isNet: true }
                             ].map((stat, i) => (
                                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 shadow-xl group hover:border-primary-500/30 transition-all">
                                    <div className={`p-4 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}><stat.icon className="w-5 h-5" /></div>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        {stat.isCurrency && <IndianRupee className="w-3 h-3 text-slate-400 font-black" />}
                                        <div className={`text-xl font-black tabular-nums tracking-tighter italic ${stat.isNet ? (stat.val >= 0 ? 'text-primary-500' : 'text-rose-500') : 'text-slate-900 dark:text-white'}`}>
                                            {new Intl.NumberFormat('en-IN').format(stat.val)}
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Controls */}
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-4 lg:p-8 mb-4 lg:mb-12 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8 font-outfit">
                         <div className="flex-1 relative group w-full lg:max-w-xl">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                             <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Filter by User Name or Email..." className="w-full pl-14 pr-6 py-5 bg-white dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase outline-none transition-all shadow-xl" />
                         </div>
                         <div className="flex flex-wrap items-center gap-4">
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select value={subscription} onChange={e => setSubscription(e.target.value)} className="pl-12 pr-10 py-4 bg-white dark:bg-white/10 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                                    <option value="">All Tiers</option>
                                    <option value="free">Free Access</option>
                                    <option value="basic">Standard</option>
                                    <option value="pro">Pro Status</option>
                                </select>
                            </div>
                            <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 shadow-xl">
                                {[{ icon: TableIcon, id: 'table' }, { icon: List, id: 'list' }, { icon: LayoutGrid, id: 'grid' }].map((mode) => (
                                    <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`p-3 rounded-full transition-all ${viewMode === mode.id ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400'}`}>
                                        <mode.icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                         </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                             <div className="flex items-center justify-center py-32"><Loading size="md" color="blue" message="Loading user analytics..." /></div>
                        ) : error ? (
                            <div className="text-center py-32">
                                <div className="p-3 lg:p-8 bg-rose-500/10 rounded-xl lg:rounded-[3rem] mb-6 inline-block text-rose-500 text-2xl lg:text-6xl">!</div>
                                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Connection Error</h3>
                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
                                <Globe className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tighter italic">No Users Found</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Adjust filters to locate participants.</p>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 lg:space-y-12">
                                {viewMode === 'table' && (
                                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                                                     <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Rank</th>
                                                     <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tier</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progression</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Yield</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                {students.map((s, idx) => (
                                                    <motion.tr key={s._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className="group hover:bg-primary-500/5 transition-all cursor-pointer">
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6"><div className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl flex items-center justify-center font-black italic text-xs">{idx + 1 + (page - 1) * LIMIT}</div></td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">{(s.name || 'U')[0]}</div>
                                                                <div>
                                                                    <div className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1 group-hover:text-primary-500 transition-colors uppercase tracking-tight">{s.name || 'Anonymous'}</div>
                                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate max-w-[150px]">{s.email || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-center"><span className={`px-4 py-1.5 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest inline-block ${s.subscriptionStatus === 'pro' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>{s.subscriptionStatus || 'Free'}</span></td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">EVO_LEVEL: LVL {s.level?.currentLevel?.number ?? s.level?.currentLevel ?? 0}</span>
                                                            <div className="w-16 h-1 bg-slate-100 dark:bg-white/10 rounded-full mx-auto"><div className="h-full bg-primary-500" style={{ width: `${Math.min((s.level?.currentLevel || 0)*5, 100)}%` }} /></div>
                                                        </td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-right font-black text-emerald-500 tabular-nums italic text-sm">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-right"><motion.button onClick={() => goToUser(s._id)} whileHover={{ scale: 1.1 }} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl hover:bg-primary-500 hover:text-white transition-colors"><ArrowRight className="w-5 h-5" /></motion.button></td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {viewMode === 'grid' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                                        {students.map((s, idx) => (
                                            <motion.div key={s._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl relative flex flex-col group overflow-hidden">
                                                <div className={`absolute top-0 left-0 w-full h-1.5 ${s.subscriptionStatus === 'pro' ? 'bg-amber-400' : 'bg-primary-500'}`} />
                                                <div className="mb-6 mx-auto">
                                                    <div className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-2xl group-hover:rotate-6 transition-all">{(s.name || 'U')[0]}</div>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 text-center truncate">{s.name || 'Anonymous'}</h3>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-4 lg:mb-8 truncate">{s.email || 'N/A'}</div>
                                                <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/5 mb-4 lg:mb-8">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Yield</div>
                                                        <div className="text-md font-black text-emerald-500 tabular-nums italic">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progression</div>
                                                        <span className="text-indigo-500 text-sm italic tracking-tighter">LVL {s.level?.currentLevel?.number ?? s.level?.currentLevel ?? 0}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => goToUser(s._id)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl group-hover:bg-primary-500 group-hover:text-white transition-all">Audit Portfolio</button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {viewMode === 'list' && (
                                    <div className="space-y-3 lg:space-y-6">
                                        {students.map((s, idx) => (
                                            <motion.div key={s._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-xl group">
                                                <div className="flex items-center gap-3 lg:gap-6">
                                                    <div className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shrink-0 italic">{(s.name || 'U')[0]}</div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-primary-500 transition-colors uppercase">{s.name || 'Candidate'}</h3>
                                                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email?.substring(0, 20)}...</span>
                                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black border border-primary-500/20 text-primary-500`}>LVL_{s.level?.currentLevel || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 lg:gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-emerald-500 tabular-nums italic tracking-tighter">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</div>
                                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Yield</div>
                                                    </div>
                                                    <motion.button onClick={() => goToUser(s._id)} whileHover={{ scale: 1.1 }} className="p-4 bg-slate-100 dark:bg-white/5 text-primary-500 rounded-2xl shadow-sm"><ArrowUpRight className="w-5 h-5" /></motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-4 lg:mt-12 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-3 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/5 shadow-lg w-fit mx-auto">
                                        <button onClick={() => fetchStudents(page - 1)} disabled={page <= 1} className="p-3 rounded-xl bg-white dark:bg-white/10 text-slate-600 dark:text-white disabled:opacity-30 hover:scale-110 transition shadow-sm border border-slate-100 dark:border-white/10"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                                        <div className="flex items-center gap-1 px-4">
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                let p = i + 1;
                                                if (totalPages > 5 && page > 3) p = Math.min(page - 2 + i, totalPages - 4 + i);
                                                return (
                                                    <button key={p} onClick={() => fetchStudents(p)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${p === page ? 'bg-primary-500 text-white shadow-xl scale-110' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>{p < 10 ? `0${p}` : p}</button>
                                                );
                                            })}
                                        </div>
                                        <button onClick={() => fetchStudents(page + 1)} disabled={page >= totalPages} className="p-3 rounded-xl bg-white dark:bg-white/10 text-slate-600 dark:text-white disabled:opacity-30 hover:scale-110 transition shadow-sm border border-slate-100 dark:border-white/10"><ChevronRight className="w-5 h-5" /></button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
};

export default AdminUsersAnalytics;
const Gift = (props) => <Award {...props} />;

