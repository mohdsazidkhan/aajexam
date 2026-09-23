'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Download, BarChart3, Users, Eye, Filter, RefreshCcw, IndianRupee,
    TrendingUp, TrendingDown, LayoutGrid, List, Table as TableIcon, Tag,
    Wallet, PieChart, Activity, ShieldCheck, Mail, Calendar,
    Zap, Target, ExternalLink, Cpu, Globe, ArrowRight, ArrowUpRight, ArrowDownRight, Layers,
    DownloadCloud, UserCheck, Star, Award, Trophy, Info
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import Sidebar from '../../Sidebar';
import { AdminDashboardSkeleton } from '../../skeletons/AdminSkeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';

const AdminUsersAnalytics = () => {
    const { isMounted } = useSSR();
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
    const router = useRouter();
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

    const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table');
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

    const fetchStudents = useCallback(async (pg = 1) => {
        try {
            setLoading(true);
            setError(null);
            const params = { page: pg, limit: itemsPerPage, ...(search.trim() && { search: search.trim() }), ...(subscription && { subscriptionStatus: subscription }) };
            const res = await API.getAdminUsersWithEarnings(params);

            if (res?.success !== false) {
                const list = res?.students || res?.data || res || [];
                const pag = res?.pagination || {};
                setStudents(Array.isArray(list) ? list : []);
                setTotalPages(pag.totalPages || Math.ceil((pag.totalUsers || list.length) / itemsPerPage));
                setTotalUsers(pag.totalUsers || list.length);
                setPage(pg);
            } else {
                setError(res?.message || 'Failed to load data. Please try again.');
            }
        } catch (err) {
            setError(err?.message || 'Failed to load student data');
        } finally {
            setLoading(false);
        }
    }, [search, subscription, itemsPerPage]);

    useEffect(() => {
        fetchStudents(1);
        API.getAdminAllUsersSummary()
            .then(res => { if (res?.success && res.data) setSummary(res.data); })
            .catch(() => { });
    }, [subscription, itemsPerPage, fetchStudents]);

    const handleSearch = (e) => { e?.preventDefault(); fetchStudents(1); };

    const goToUser = (id) => router.push(`/admin/user-details?id=${id}`);

    const exportCSV = () => {
        if (!students.length) return;
        const headers = ['Name', 'Email', 'Level', 'Subscription', 'Earnings', 'Joined'];
        const rows = students.map(s => [
            s.name, s.email, 0, s.subscriptionStatus, s.totalEarnings, 
            s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'student_analytics.csv'; a.click();
    };

    const usersTableColumns = [
        {
            key: 'name',
            header: 'User Profile',
            render: (_, s) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">{(s.name || 'U')[0]}</div>
                    <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1 group-hover:text-primary-600 transition-colors tracking-tight">{s.name || 'Anonymous'}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate max-w-[150px]">{s.email || 'N/A'}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'subscriptionStatus',
            header: 'Tier',
            align: 'center',
            render: (_, s) => (
                <div className="text-center">
                    <span className={`px-4 py-1.5 rounded-lg lg:rounded-xl border-2 text-[9px] font-black uppercase tracking-widest inline-block ${s.subscriptionStatus === 'PRO' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>{s.subscriptionStatus || 'FREE'}</span>
                </div>
            )
        },
        {
            key: 'level',
            header: 'Level',
            align: 'center',
            render: () => (
                <div className="text-center">
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest italic">Student</span>
                    <div className="w-16 h-1 bg-slate-100 dark:bg-white/10 rounded-full mx-auto"><div className="h-full bg-primary-600" style={{ width: '0%' }} /></div>
                </div>
            )
        },
        {
            key: 'totalEarnings',
            header: 'Earnings',
            align: 'right',
            render: (_, s) => (
                <div className="text-right font-black text-primary-600 tabular-nums italic text-sm">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</div>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (_, s) => (
                <div className="flex justify-end">
                    <motion.button onClick={() => goToUser(s._id)} whileHover={{ scale: 1.1 }} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-sm hover:bg-primary-700 hover:text-white transition-colors"><ArrowRight className="w-5 h-5" /></motion.button>
                </div>
            )
        }
    ];

    if (!isMounted) return null;

    return (<div className="h-[calc(100vh-64px)] max-md:h-[calc(100vh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
                <Sidebar />
                <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><Users className="w-6 h-6 text-primary-600 shrink-0" /> Growth <span className="text-slate-400 dark:text-slate-500">({summary.totalUsers || totalUsers})</span></h1>

                        <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
                            <div className="relative col-span-2 sm:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
                            </div>
                            <select value={subscription} onChange={e => setSubscription(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm">
                                <option value="">All Tiers</option>
                                <option value="FREE">FREE</option>
                                <option value="PRO">PRO</option>
                            </select>
                            <div className="flex items-center gap-1">
                                {[{ icon: TableIcon, id: 'table', label: 'Table View' }, { icon: List, id: 'list', label: 'List View' }, { icon: LayoutGrid, id: 'grid', label: 'Grid View' }].map((mode) => (
                                    <button key={mode.id} onClick={() => setViewMode(mode.id)} title={mode.label} className={`p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                                        <mode.icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => router.push('/admin/expenses')} className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm shrink-0">
                                <Wallet className="w-4 h-4" /> Expenses
                            </button>
                            <button onClick={exportCSV} title="Export CSV" className="flex items-center justify-center bg-primary-50 dark:bg-primary-950/30 text-primary-600 p-2 rounded-lg lg:rounded-xl shrink-0">
                                <DownloadCloud className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Summary Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-700 mb-4 shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 lg:p-0 p-2">
                        {[
                             { label: 'Total Users', val: summary.totalUsers || totalUsers, icon: Users, color: 'primary' },
                             { label: 'Monthly Revenue', val: summary.totalRevenue || 0, icon: TrendingUp, color: 'primary', isCurrency: true },
                             { label: 'Total Earnings', val: summary.totalEarnings || 0, icon: Gift, color: 'primary', isCurrency: true },
                             { label: 'Other Expenses', val: summary.totalCustomExpenses || 0, icon: Target, color: 'primary', isCurrency: true },
                             { label: 'Net Profit', val: summary.netPlatform || 0, icon: Activity, color: summary.netPlatform >= 0 ? 'primary' : 'rose', isCurrency: true, isNet: true }
                         ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-2 px-3 py-2">
                                <div className={`p-1.5 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-lg shrink-0`}><stat.icon className="w-3.5 h-3.5" /></div>
                                <div className="min-w-0">
                                    <div className="flex items-baseline gap-0.5">
                                        {stat.isCurrency && <IndianRupee className="w-2.5 h-2.5 text-slate-400" />}
                                        <div className={`text-sm font-black tabular-nums tracking-tight ${stat.isNet ? (stat.val >= 0 ? 'text-primary-600' : 'text-black dark:text-white') : 'text-slate-900 dark:text-white'}`}>
                                            {new Intl.NumberFormat('en-IN').format(stat.val)}
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {loading ? (
                             <div className="flex items-center justify-center py-32"><AdminDashboardSkeleton /></div>
                        ) : error ? (
                            <div className="text-center py-32">
                                <div className="p-3 lg:p-8 bg-black/10 dark:bg-white/10 rounded-lg lg:rounded-xl xl:rounded-[3rem] mb-6 inline-block text-black dark:text-white text-2xl lg:text-6xl">!</div>
                                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Something went wrong</h3>
                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
                                <Globe className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tighter italic">No Users Found</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Try adjusting your search or filters.</p>
                            </div>
        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                <div className="flex-1 min-h-0 overflow-hidden">
                                {viewMode === 'table' && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
                                        <ResponsiveTable
                                            data={students}
                                            columns={usersTableColumns}
                                            viewModes={['table']}
                                            defaultView={'table'}
                                            showPagination={false}
                                            showViewToggle={false}
                                            fillHeight
                                        />
                                    </div>
                                )}

                                {viewMode === 'grid' && (
                                    <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
                                        {students.map((s, idx) => (
                                            <div key={s._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black text-sm">{(s.name || 'U')[0]}</div>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${s.subscriptionStatus === 'PRO' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{s.subscriptionStatus || 'FREE'}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name || 'Anonymous'}</h3>
                                                    <p className="text-[10px] text-slate-400 truncate">{s.email || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                                                    <span className="text-slate-400">Earnings</span>
                                                    <span className="font-black text-primary-600">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                <button onClick={() => goToUser(s._id)} className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-primary-700 transition-all">View Details</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {viewMode === 'list' && (
                                    <div className="h-full overflow-auto space-y-3">
                                        {students.map((s, idx) => (
                                            <div key={s._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black text-sm shrink-0">{(s.name || 'U')[0]}</div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name || 'User'}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email || 'N/A'}</span>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border border-primary-500/20 text-primary-600`}>{s.subscriptionStatus || 'FREE'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-black text-primary-600">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Earnings</div>
                                                </div>
                                                <button onClick={() => goToUser(s._id)} className="p-2 bg-slate-100 dark:bg-slate-700 text-primary-600 rounded-lg shrink-0"><ArrowUpRight className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </div>

                                {totalUsers > 0 && (
                                    <div className="shrink-0">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            onPageChange={(p) => fetchStudents(p)}
                                            totalItems={totalUsers}
                                            itemsPerPage={itemsPerPage}
                                            onItemsPerPageChange={(val) => { setItemsPerPage(val); }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    </div>
                </div>
            </div>
    );
};

export default AdminUsersAnalytics;
const Gift = (props) => <Award {...props} />;

