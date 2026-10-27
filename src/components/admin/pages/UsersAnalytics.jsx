'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import {
    Search, Download, BarChart3, Users, Eye, Filter, RefreshCcw, IndianRupee,
    TrendingUp, TrendingDown, LayoutGrid, List, Table as TableIcon, Tag,
    Wallet, PieChart, Activity, ShieldCheck, Mail, Calendar,
    Zap, Target, ExternalLink, Cpu, Globe, ArrowRight, ArrowUpRight, ArrowDownRight, Layers,
    UserCheck, Star, Award, Trophy, Info
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import ResponsiveTable from '../../common/ResponsiveTable';
import Pagination from '../../common/Pagination';
import Sidebar from '../Sidebar';
import StyledSelect from '../../common/ui/StyledSelect';
import { AdminDashboardSkeleton } from '../Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

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

    const [viewMode, setViewMode] = useState('table');
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

    useEffect(() => {
        if (window.innerWidth < 768) setViewMode('grid');
    }, []);

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

    const goToUser = (s) => router.push(`/admin/user-details/${s.username || s._id}`);

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
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 text-on-primary rounded-2xl flex items-center justify-center font-bold text-lg bg-primary-600">{(s.name || 'U')[0]}</div>
                    <div>
                        <div className="text-sm font-bold text-content-primary uppercase leading-none mb-1 group-hover:text-primary-600 transition-colors tracking-tight">{s.name || 'Anonymous'}</div>
                        <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] leading-none truncate max-w-[150px]">{s.email || 'N/A'}</div>
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
                    <span className={`px-4 py-1.5 rounded-lg xl:rounded-xl border text-[9px] font-bold uppercase tracking-[0.08em] inline-block ${s.subscriptionStatus === 'PRO' ? 'bg-black/10 dark:bg-white/10 text-content-primary border-border-primary' : 'bg-slate-500/10 text-content-muted border-slate-500/20'}`}>{s.subscriptionStatus || 'FREE'}</span>
                </div>
            )
        },
        {
            key: 'level',
            header: 'Level',
            align: 'center',
            render: () => (
                <div className="text-center">
                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em] italic">Student</span>
                    <div className="w-16 h-1 bg-background-surface-secondary rounded-full mx-auto"><div className="h-full bg-primary-600" style={{ width: '0%' }} /></div>
                </div>
            )
        },
        {
            key: 'totalEarnings',
            header: 'Earnings',
            align: 'right',
            render: (_, s) => (
                <div className="text-right font-bold text-primary-600 tabular-nums italic text-sm">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</div>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (_, s) => (
                <div className="flex justify-end">
                    <motion.button onClick={() => goToUser(s)} whileHover={{ scale: 1.1 }} className="p-4 text-on-primary rounded-2xl hover:bg-primary-700 hover:text-white transition-colors bg-primary-600"><ArrowRight className="w-5 h-5" /></motion.button>
                </div>
            )
        }
    ];

    const statCardsSection = (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 xl:gap-3 mb-4 shrink-0">
            {[
                 { label: 'Total Users', val: summary.totalUsers || totalUsers, icon: Users, color: 'primary' },
                 { label: 'Monthly Revenue', val: summary.totalRevenue || 0, icon: TrendingUp, color: 'primary', isCurrency: true },
                 { label: 'Total Earnings', val: summary.totalEarnings || 0, icon: Gift, color: 'primary', isCurrency: true },
                 { label: 'Other Expenses', val: summary.totalCustomExpenses || 0, icon: Target, color: 'primary', isCurrency: true },
                 { label: 'Net Profit', val: summary.netPlatform || 0, icon: Activity, color: summary.netPlatform >= 0 ? 'primary' : 'rose', isCurrency: true, isNet: true }
             ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 p-3 bg-background-surface rounded-xl xl:rounded-2xl border border-border-primary relative">
                    <div className={`p-2 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-lg shrink-0`}><stat.icon className="w-4 h-4" /></div>
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-0.5">
                            {stat.isCurrency && <IndianRupee className="w-3 h-3 text-content-muted" />}
                            <div className={`text-sm xl:text-base font-bold tabular-nums tracking-tight whitespace-nowrap ${stat.isNet ? (stat.val >= 0 ? 'text-primary-600' : 'text-content-primary') : 'text-content-primary'}`}>
                                {new Intl.NumberFormat('en-IN').format(stat.val)}
                            </div>
                        </div>
                        <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] whitespace-nowrap">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );

    const searchInput = (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
        </div>
    );

    const subscriptionSelect = (
        <StyledSelect
            value={subscription}
            onChange={val => setSubscription(val)}
            options={[
                { value: '', label: 'All Tiers' },
                { value: 'FREE', label: 'FREE' },
                { value: 'PRO', label: 'PRO' }
            ]}
            className="w-full"
        />
    );

    const viewToggleButtons = (
        <div className="flex items-center gap-1 w-full">
            {[{ icon: TableIcon, id: 'table', label: 'Table View' }, { icon: List, id: 'list', label: 'List View' }, { icon: LayoutGrid, id: 'grid', label: 'Grid View' }].map((mode) => (
                <button key={mode.id} onClick={() => setViewMode(mode.id)} title={mode.label} className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}>
                    <mode.icon className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
                </button>
            ))}
        </div>
    );

    const expensesButton = (
        <button onClick={() => router.push('/admin/expenses')} className="w-full flex items-center justify-center gap-2 text-on-primary px-4 py-2 rounded-lg xl:rounded-xl text-sm font-bold bg-primary-600">
            <Wallet className="w-4 h-4" /> Expenses
        </button>
    );

    const exportButton = (
        <button onClick={exportCSV} className="w-full flex items-center justify-center gap-2 text-primary-600 px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm">
            <Download className="w-4 h-4" /> Export to CSV
        </button>
    );

    const paginationControl = totalUsers > 0 && (
        <Pagination
      compact
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchStudents(p)}
            totalItems={totalUsers}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); }}
        />
    );

    useAdminMobileHeader({
        title: 'Growth',
        count: summary.totalUsers || totalUsers,
        filters: (
            <>
                {searchInput}
                {subscriptionSelect}
                {viewToggleButtons}
                {expensesButton}
                {exportButton}
                {paginationControl}
            </>
        )
    });

    if (!isMounted) return null;

    return (<div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
                <Sidebar />
                <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

                    {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

                    {statCardsSection}

                    <div className="flex-1 min-h-0 overflow-auto">
                    <AnimatePresence mode="wait">
                        {loading ? (
                             <div className="flex items-center justify-center py-32"><AdminDashboardSkeleton /></div>
                        ) : error ? (
                            <div className="text-center py-32">
                                <div className="p-3 xl:p-5 bg-black/10 dark:bg-white/10 rounded-lg xl:rounded-xl xl:rounded-3xl mb-4 inline-block text-content-primary text-2xl xl:text-6xl">!</div>
                                 <h3 className="text-2xl font-bold text-content-primary mb-2">Something went wrong</h3>
                                 <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em]">{error}</p>
                            </div>
                        ) : students.length === 0 ? (
                            <section className="rounded-2xl xl:rounded-3xl border border-dashed border-border-primary p-24 text-center">
                                <Globe className="w-20 h-20 text-slate-300 mx-auto mb-4 xl:mb-4 opacity-20" />
                                 <h3 className="text-xl xl:text-3xl font-bold text-content-primary mb-4 tracking-tight italic">No Users Found</h3>
                                <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em]">Try adjusting your search or filters.</p>
                            </section>
        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-auto flex flex-col">
                                <div className="flex-1 min-h-0 overflow-auto">
                                {viewMode === 'table' && (
                                    <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
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
                                    <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
                                        {students.map((s, idx) => (
                                            <div key={s._id} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3 relative">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="relative w-10 h-10 text-on-primary rounded-xl flex items-center justify-center font-bold text-sm bg-primary-600">
                                                        {(s.name || 'U')[0]}
                                                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
                                                    </div>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${s.subscriptionStatus === 'PRO' ? 'bg-black/10 text-content-primary' : 'bg-background-surface-secondary text-content-muted'}`}>{s.subscriptionStatus || 'FREE'}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-content-primary truncate">{s.name || 'Anonymous'}</h3>
                                                    <p className="text-[10px] text-content-muted truncate">{s.email || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-border-primary text-xs">
                                                    <span className="text-content-muted">Earnings</span>
                                                    <span className="font-bold text-primary-600">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                <button onClick={() => goToUser(s)} className="w-full py-2 text-on-primary rounded-lg text-xs font-bold hover:bg-primary-700 transition-all bg-primary-600">View Details</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {viewMode === 'list' && (
                                    <div className="h-full overflow-auto space-y-3">
                                        {students.map((s, idx) => (
                                            <section key={s._id} className="bg-background-surface rounded-xl border border-border-primary p-4 flex items-center gap-3 relative">
                                                <div className="relative w-10 h-10 text-on-primary rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-primary-600">
                                                    {(s.name || 'U')[0]}
                                                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold text-content-primary truncate">{s.name || 'User'}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-content-muted flex-wrap">
                                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email || 'N/A'}</span>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border border-primary-500/20 text-primary-600`}>{s.subscriptionStatus || 'FREE'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-bold text-primary-600">₹{(s.totalEarnings || 0).toLocaleString('en-IN')}</div>
                                                    <div className="text-[9px] font-bold text-content-muted uppercase">Earnings</div>
                                                </div>
                                                <button aria-label="Open" onClick={() => goToUser(s)} className="p-2 bg-background-surface-secondary text-primary-600 rounded-lg shrink-0"><ArrowUpRight className="w-4 h-4" /></button>
                                            </section>
                                        ))}
                                    </div>
                                )}
                                </div>
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

