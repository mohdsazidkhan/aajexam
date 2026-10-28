'use client';

import React, { useEffect, useState, useCallback } from 'react';
import API from '../../../lib/api';
import { toast } from 'react-hot-toast';
import {
    Users,
    UserCheck,
    Download,
    LayoutGrid,
    Table as TableIcon,
    List,
    Mail,
    Zap,
    Clock,
    Flame,
    BookOpen,
    FileText,
    Trophy,
    Eye,
    Search
} from 'lucide-react';
import { AdminDashboardSkeleton } from '../Skeletons';
import { isMobile } from 'react-device-detect';
import { m as motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../Sidebar";
import ResponsiveTable from '../../common/ResponsiveTable';
import StyledSelect from '../../common/ui/StyledSelect';
import Modal from '../../common/ui/Modal';
import Pagination from '../../common/Pagination';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const PERIODS = [
    { value: 'all-time', label: 'All Time' },
    { value: '5y', label: 'Last 5 Years' },
    { value: '1y', label: 'Last 1 Year' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '3m', label: 'Last 3 Months' },
    { value: 'monthly', label: 'Last 30 Days' },
    { value: 'weekly', label: 'Last 7 Days' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'today', label: 'Today' }
];

const formatDuration = (seconds = 0) => {
    const s = Math.round(seconds);
    if (s < 60) return `${s}s`;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-');
const formatDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-');

const AdminMostActiveUsers = () => {
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({});
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState('quizzes');
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('monthly');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await API.getAdminMostActiveUsers({ period, ...(searchTerm.trim() && { search: searchTerm.trim() }) });
            setUsers(response.data || []);
            setSummary(response.summary || {});
            setPage(1);
        } catch (error) {
            console.error('Error fetching most active users:', error);
            toast.error('Failed to fetch most active students');
        } finally {
            setLoading(false);
        }
    }, [period, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const totalPages = Math.max(1, Math.ceil(users.length / limit));
    const pagedUsers = users.slice((page - 1) * limit, page * limit);

    const openDetail = async (u) => {
        setSelected(u);
        setDetail(null);
        setDetailTab('quizzes');
        setDetailLoading(true);
        try {
            const res = await API.getAdminMostActiveUserDetail(u.userId, { period });
            setDetail(res);
        } catch (error) {
            console.error('Error fetching student activity:', error);
            toast.error('Failed to fetch student activity');
            setSelected(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setSelected(null);
        setDetail(null);
    };

    const viewButton = (u) => (
        <button
            onClick={() => openDetail(u)}
            title="View quiz & exam attempts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary-600 text-[10px] font-bold uppercase tracking-[0.08em] transition-all"
        >
            <Eye className="w-3.5 h-3.5" /> Details
        </button>
    );

    const exportToCSV = () => {
        const label = PERIODS.find((p) => p.value === period)?.label || period;
        const headers = ['Rank', 'Name', 'Email', 'Quizzes', 'Exams', 'Total Activities', 'Time Spent', 'Current Streak', 'Longest Streak', 'Last Active'];
        const rows = users.map((u) => [
            u.rank,
            `"${(u.name || '').replace(/"/g, '""')}"`,
            u.email,
            u.quizzes,
            u.exams,
            u.totalActivities,
            formatDuration(u.totalTimeSpent),
            u.currentStreak,
            u.longestStreak,
            formatDate(u.lastActive)
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `most-active-users-${label.replace(/\s+/g, '-').toLowerCase()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully!');
    };

    const columns = [
        {
            key: 'rank', header: '#', align: 'center', render: (_, u) => (
                <span className="text-sm font-bold text-primary-600 tabular-nums">{u.rank}</span>
            )
        },
        {
            key: 'user', header: 'User', render: (_, u) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 text-on-primary rounded-lg xl:rounded-xl flex items-center justify-center font-bold text-xs uppercase bg-primary-600">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-content-primary uppercase tracking-[0.08em] leading-none mb-1">{u.name}</div>
                        <div className="text-[10px] font-bold text-content-primary uppercase tracking-[0.08em] italic">{u.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'quizzes', header: 'Quizzes', align: 'center', render: (_, u) => (
                <div className="text-sm font-bold text-primary-600 tabular-nums">{u.quizzes}</div>
            )
        },
        {
            key: 'exams', header: 'Exams', align: 'center', render: (_, u) => (
                <div className="text-sm font-bold text-primary-600 tabular-nums">{u.exams}</div>
            )
        },
        {
            key: 'totalActivities', header: 'Total', align: 'center', render: (_, u) => (
                <div>
                    <div className="text-sm font-bold text-primary-600 tabular-nums">{u.totalActivities}</div>
                    <div className="text-[9px] font-bold text-content-muted uppercase">Activities</div>
                </div>
            )
        },
        {
            key: 'totalTimeSpent', header: 'Time Spent', align: 'center', render: (_, u) => (
                <span className="text-[11px] font-bold text-content-secondary tabular-nums">{formatDuration(u.totalTimeSpent)}</span>
            )
        },
        {
            key: 'streak', header: 'Streak', align: 'center', render: (_, u) => (
                <div>
                    <div className="text-sm font-bold text-primary-600 tabular-nums">{u.currentStreak}</div>
                    <div className="text-[9px] font-bold text-content-muted uppercase">Best {u.longestStreak}</div>
                </div>
            )
        },
        {
            key: 'lastActive', header: 'Last Active', align: 'center', render: (_, u) => (
                <span className="text-[10px] font-bold text-content-muted">{formatDate(u.lastActive)}</span>
            )
        },
        {
            key: 'details', header: '', align: 'right', render: (_, u) => viewButton(u)
        }
    ];

    const searchInput = (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
                type="text"
                placeholder="Search name, username, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm"
            />
        </div>
    );

    const periodSelect = (
        <StyledSelect
            value={period}
            onChange={(val) => setPeriod(val)}
            options={PERIODS}
            className="w-full"
        />
    );

    const viewToggleButtons = (
        <div className="flex items-center gap-1 w-full">
            {[
                { icon: TableIcon, id: 'table', label: 'Table View' },
                { icon: List, id: 'list', label: 'List View' },
                { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
            ].map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    title={mode.label}
                    className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
                >
                    <mode.icon className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
                </button>
            ))}
        </div>
    );

    const exportButton = (
        <button
            onClick={exportToCSV}
            disabled={users.length === 0}
            className="w-full flex items-center justify-center gap-2 text-primary-600 px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm shrink-0 disabled:opacity-30"
        >
            <Download className="w-4 h-4" /> Export to CSV
        </button>
    );

    const paginationControl = users.length > 0 && (
        <Pagination
            compact
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={users.length}
            itemsPerPage={limit}
            onItemsPerPageChange={(n) => { setLimit(n); setPage(1); }}
        />
    );

    useAdminMobileHeader({
        title: `Most Active - ${PERIODS.find((p) => p.value === period)?.label || ''}`,
        count: users.length,
        filters: (
            <>
                {searchInput}
                {periodSelect}
                {viewToggleButtons}
                {exportButton}
                {paginationControl}
            </>
        )
    });

    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen p-3 xl:p-5">
                <AdminDashboardSkeleton />
            </div>
        );
    }

    return (
        <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
            <Sidebar />
            <Modal
                isOpen={!!selected}
                onClose={closeDetail}
                title={selected?.name || 'Student'}
                subtitle={`${selected?.email || ''} · ${PERIODS.find((p) => p.value === period)?.label || ''}`}
                size="xl"
                bodyClassName="p-2 xl:p-4 pt-2 xl:pt-4"
                bodyMaxHeight="min-h-[70vh] max-h-[70vh]"
                headerClassName="p-2 xl:p-4 pb-4 xl:pb-4"
            >
                {detailLoading || !detail ? (
                    <div className="py-10 text-center text-xs font-bold text-content-muted uppercase tracking-[0.08em]">Loading...</div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="sticky top-0 z-10 flex items-center gap-1 bg-background-surface pb-2">
                            {[
                                { id: 'quizzes', label: 'Quizzes', count: detail.quizzes.length, icon: BookOpen },
                                { id: 'exams', label: 'Exams', count: detail.exams.length, icon: FileText }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setDetailTab(t.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${detailTab === t.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
                                >
                                    <t.icon className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{t.label} ({t.count})</span>
                                </button>
                            ))}
                        </div>

                        {detail.capped && (
                            <p className="text-[10px] font-bold text-content-muted">Showing the latest 300 attempts per type.</p>
                        )}

                        {(detailTab === 'quizzes' ? detail.quizzes : detail.exams).length === 0 ? (
                            <div className="py-10 text-center text-xs font-bold text-content-muted uppercase tracking-[0.08em]">
                                No {detailTab === 'quizzes' ? 'quiz' : 'exam'} attempts in this period
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {(detailTab === 'quizzes' ? detail.quizzes : detail.exams).map((a) => (
                                    <div key={a.id} className="bg-background-surface rounded-xl border border-border-primary p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 relative">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-content-primary truncate">{a.title}</div>
                                            <div className="text-[10px] text-content-muted">{formatDateTime(a.date)}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 shrink-0">
                                            {[
                                                { label: 'Total', value: a.totalMarks },
                                                { label: 'Score', value: `${a.score} / ${a.totalMarks}` },
                                                { label: 'Time Spent', value: formatDuration(a.timeSpent) }
                                            ].map((c) => (
                                                <div key={c.label} className="px-2.5 py-1 rounded-lg border border-border-primary text-center min-w-[72px]">
                                                    <div className="text-xs font-bold text-primary-600 tabular-nums">{c.value}</div>
                                                    <div className="text-[9px] font-bold text-content-muted uppercase">{c.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">
                <div className="flex-1 min-h-0 overflow-auto flex flex-col transition-all duration-500">

                    {/* Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 xl:gap-0 xl:divide-x divide-border-primary mb-4 shrink-0 bg-background-surface rounded-xl border border-border-primary xl:p-0 p-2">
                        {[
                            { label: "Total Students", value: summary.totalUsers ?? 0, icon: Users },
                            { label: "Total Active", value: summary.totalActiveUsers ?? 0, icon: UserCheck },
                            { label: "Total Activities", value: summary.totalActivities ?? 0, icon: Zap },
                            { label: "Quiz Attempts", value: summary.quizzes ?? 0, icon: BookOpen },
                            { label: "Exam Attempts", value: summary.exams ?? 0, icon: FileText },
                            { label: "Time Spent", value: formatDuration(summary.totalTimeSpent), icon: Clock }
                        ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-2 px-3 py-2">
                                <div className="p-1.5 text-on-primary rounded-lg shrink-0 bg-primary-600"><stat.icon className="w-3.5 h-3.5" /></div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-content-primary tabular-nums tracking-tight">{stat.value}</div>
                                    <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] truncate">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 min-h-0 overflow-auto">
                        <AnimatePresence mode="wait">
                            {users.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-10 xl:py-20 text-center rounded-2xl xl:rounded-3xl border border-dashed border-border-primary"
                                >
                                    <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 xl:mb-4" />
                                    <h3 className="text-xl xl:text-3xl font-bold text-content-primary italic tracking-tight mb-3">NO DATA FOUND</h3>
                                    <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em]">No activity found for this period.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-auto flex flex-col"
                                >
                                    {viewMode === 'grid' && (
                                        <div className="grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                                            {pagedUsers.map((u) => (
                                                <section key={u.userId} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3 relative">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="relative w-10 h-10 text-on-primary rounded-xl flex items-center justify-center font-bold text-sm bg-primary-600">
                                                            {u.name?.[0]?.toUpperCase() || 'U'}
                                                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800">{u.rank}</span>
                                                        </div>
                                                        {u.rank <= 3 && <Trophy className="w-4 h-4 text-primary-600" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-content-primary truncate">{u.name || 'Unknown'}</h3>
                                                        <p className="text-[10px] text-content-muted truncate">{u.email || 'No email'}</p>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-center">
                                                        {[
                                                            { label: 'Quizzes', value: u.quizzes },
                                                            { label: 'Exams', value: u.exams },
                                                            { label: 'Total', value: u.totalActivities }
                                                        ].map((s) => (
                                                            <div key={s.label} className="p-2 rounded-lg border border-border-primary">
                                                                <div className="text-sm font-bold text-primary-600 tabular-nums">{s.value}</div>
                                                                <div className="text-[9px] font-bold text-content-muted uppercase">{s.label}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-content-muted pt-2 border-t border-border-primary">
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(u.totalTimeSpent)}</span>
                                                        <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{u.currentStreak} (best {u.longestStreak})</span>
                                                        <span>{formatDate(u.lastActive)}</span>
                                                    </div>
                                                    <div className="flex justify-center">{viewButton(u)}</div>
                                                </section>
                                            ))}
                                        </div>
                                    )}

                                    {viewMode === 'list' && (
                                        <div className="space-y-3">
                                            {pagedUsers.map((u) => (
                                                <section key={u.userId} className="bg-background-surface rounded-xl border border-border-primary p-4 flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-3 relative">
                                                    <div className="relative w-10 h-10 text-on-primary rounded-xl flex items-center justify-center shrink-0 font-bold text-sm bg-primary-600">
                                                        {u.name?.[0]?.toUpperCase() || 'U'}
                                                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800">{u.rank}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-sm font-bold text-content-primary">{u.name || 'Unknown'}</h3>
                                                            {u.rank <= 3 && <Trophy className="w-4 h-4 text-primary-600" />}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-content-muted">
                                                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {u.email}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last active {formatDate(u.lastActive)}</span>
                                                            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {u.currentStreak} (best {u.longestStreak})</span>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0">{viewButton(u)}</div>
                                                    <div className="flex flex-wrap gap-2 shrink-0">
                                                        {[
                                                            { label: 'Quizzes', value: u.quizzes },
                                                            { label: 'Exams', value: u.exams },
                                                            { label: 'Total', value: u.totalActivities },
                                                            { label: 'Time', value: formatDuration(u.totalTimeSpent) }
                                                        ].map((s) => (
                                                            <div key={s.label} className="px-3 py-1.5 rounded-lg border border-border-primary text-center min-w-[72px]">
                                                                <div className="text-sm font-bold text-primary-600 tabular-nums">{s.value}</div>
                                                                <div className="text-[9px] font-bold text-content-muted uppercase">{s.label}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            ))}
                                        </div>
                                    )}

                                    {viewMode === 'table' && (
                                        <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
                                            <ResponsiveTable data={pagedUsers} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} emptyMessage="No activity found" fillHeight />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMostActiveUsers;
