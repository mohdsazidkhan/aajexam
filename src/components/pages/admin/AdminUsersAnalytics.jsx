'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from '../../Sidebar';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import API from '../../../lib/api';
import {
    FaSearch, FaDownload, FaChartBar, FaUsers,
    FaEye, FaFilter, FaSyncAlt, FaRupeeSign, FaArrowUp, FaArrowDown,
    FaThLarge, FaList, FaTable, FaTag
} from 'react-icons/fa';

// ─── Main Component ────────────────────────────────────────────────────────────
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

    const [viewMode, setViewMode] = useState(() =>
        typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table'
    );
    const LIMIT = 20;

    const fetchStudents = useCallback(async (pg = 1) => {
        try {
            setLoading(true);
            setError(null);
            const params = { page: pg, limit: LIMIT };
            if (search.trim()) params.search = search.trim();
            if (subscription) params.subscriptionStatus = subscription;
            const res = await API.getAdminUsersWithEarnings(params);
            if (res?.success !== false) {
                const list = res?.students || res?.data || res || [];
                const pagination = res?.pagination || {};
                setStudents(Array.isArray(list) ? list : []);
                setTotalPages(pagination.totalPages || Math.ceil((pagination.totalUsers || list.length) / LIMIT));
                setTotalUsers(pagination.totalUsers || list.length);
                setPage(pg);
            } else {
                setError(res?.message || 'Failed to load students');
            }
        } catch (err) {
            setError(err?.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    }, [search, subscription]);

    useEffect(() => {
        fetchStudents(1);
        API.getAdminAllUsersSummary()
            .then(res => { if (res?.success && res.data) setSummary(res.data); })
            .catch(() => { });
    }, [subscription]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchStudents(1);
    };

    const exportCSV = () => {
        if (!students.length) return;
        const headers = ['Name', 'Email', 'Level', 'Subscription', 'Total Earnings (₹)', 'Joined'];
        const rows = students.map(s => [
            s.name || '',
            s.email || '',
            s.level?.currentLevel ?? 0,
            s.subscriptionStatus || 'free',
            s.totalEarnings ?? 0,
            s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : ''
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'users_analytics.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const subBadge = (status) => {
        const map = {
            free: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
            basic: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300',
            premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
            pro: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
        };
        return map[status] || map.free;
    };

    const avatar = (name) => (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-primary-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(name || 'U').charAt(0).toUpperCase()}
        </div>
    );

    const viewBtn = (mode, Icon, label) => (
        <button
            title={label}
            onClick={() => setViewMode(mode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition border
                ${viewMode === mode
                    ? 'bg-gradient-to-r from-red-500 to-primary-500 text-white border-transparent shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-400'
                }`}
        >
            <Icon className="text-sm" /> <span className="hidden sm:inline">{label}</span>
        </button>
    );

    const goToUser = (id) => router.push(`/admin/analytics/users-overview/${id}`);

    if (!isMounted) return null;

    // ── Pagination ──────────────────────────────────────────────────────────────
    const Pagination = () => totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => fetchStudents(page - 1)} disabled={page <= 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                ← Prev
            </button>
            <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p;
                    if (totalPages <= 7) p = i + 1;
                    else if (page <= 4) p = i + 1;
                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = page - 3 + i;
                    return (
                        <button key={p} onClick={() => fetchStudents(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition ${p === page ? 'bg-gradient-to-r from-red-500 to-primary-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            {p}
                        </button>
                    );
                })}
            </div>
            <button onClick={() => fetchStudents(page + 1)} disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Next →
            </button>
        </div>
    ) : null;

    return (
        <AdminMobileAppWrapper title="All Users Analytics">
            <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen`}>
                {user?.role === 'admin' && isAdminRoute && <Sidebar />}

                <div className="adminContent p-3 md:p-6 w-full">
                    {/* Page Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-primary-500 to-secondary-500 dark:from-red-600 dark:via-primary-600 dark:to-secondary-600 rounded-2xl shadow-xl mb-6">
                        <div className="absolute inset-0 bg-black opacity-10" />
                        <div className="relative px-6 py-5 flex flex-col gap-5">
                            {/* Title row */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-lg">
                                        <FaUsers className="text-3xl text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">All Users Analytics</h1>
                                        <p className="text-white/80 text-sm mt-1">View detailed analytics for every user</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <button onClick={() => router.push('/admin/expenses')}
                                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white px-4 py-2.5 rounded-xl transition font-medium shadow-lg whitespace-nowrap">
                                        <FaRupeeSign /> Manage Expenses
                                    </button>
                                    <button onClick={exportCSV}
                                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white px-4 py-2.5 rounded-xl transition font-medium shadow-lg whitespace-nowrap">
                                        <FaDownload /> Export CSV
                                    </button>
                                </div>

                            </div>

                            {/* Aggregate stat cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-5 py-4 text-white shadow-lg flex items-center gap-4">
                                    <div className="bg-white/30 rounded-xl p-2.5 flex-shrink-0"><FaUsers className="text-xl" /></div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider">Total Users</div>
                                        <div className="text-xl font-bold truncate">{(summary.totalUsers || totalUsers).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-5 py-4 text-white shadow-lg flex items-center gap-4 border-l-4 border-green-400">
                                    <div className="bg-white/30 rounded-xl p-2.5 flex-shrink-0"><FaArrowDown className="text-xl rotate-180" /></div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider">Total Revenue</div>
                                        <div className="text-xl font-bold flex items-baseline gap-1 truncate">
                                            <FaRupeeSign className="text-sm" />
                                            {(summary.totalRevenue || 0).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[10px] opacity-70">Subscriptions</div>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-5 py-4 text-white shadow-lg flex items-center gap-4 border-l-4 border-red-400">
                                    <div className="bg-white/30 rounded-xl p-2.5 flex-shrink-0"><FaArrowUp className="text-xl rotate-180" /></div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider">User Payouts</div>
                                        <div className="text-xl font-bold flex items-baseline gap-1 truncate">
                                            <FaRupeeSign className="text-sm" />
                                            {(summary.totalEarnings || 0).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[10px] opacity-70">Paid to users</div>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-5 py-4 text-white shadow-lg flex items-center gap-4 border-l-4 border-primary-400">
                                    <div className="bg-white/30 rounded-xl p-2.5 flex-shrink-0"><FaTag className="text-xl" /></div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider">Other Expenses</div>
                                        <div className="text-xl font-bold flex items-baseline gap-1 truncate">
                                            <FaRupeeSign className="text-sm" />
                                            {(summary.totalCustomExpenses || 0).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[10px] opacity-70">Manual entries</div>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-5 py-4 text-white shadow-lg flex items-center gap-4 border-l-4 border-secondary-400">
                                    <div className="bg-white/30 rounded-xl p-2.5 flex-shrink-0"><FaChartBar className="text-xl" /></div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider">Net Balance</div>
                                        <div className={`text-xl font-bold flex items-baseline gap-1 truncate ${summary.netPlatform >= 0 ? 'text-green-300' : 'text-red-100'}`}>
                                            <FaRupeeSign className="text-sm" />
                                            {(summary.netPlatform || 0).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[10px] opacity-70">Platform profit</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Filters + View Toggle */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-4 mb-6">
                        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <FaFilter className="text-sm" />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>

                            <div className="relative flex-1 min-w-[200px]">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                                />
                            </div>

                            <select
                                value={subscription}
                                onChange={e => setSubscription(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                            >
                                <option value="">All Plans</option>
                                <option value="free">Free</option>
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                                <option value="pro">Pro</option>
                            </select>

                            <button type="submit"
                                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-primary-500 hover:from-red-600 hover:to-primary-600 text-white px-5 py-2 rounded-lg font-medium transition shadow-md text-sm">
                                <FaSearch /> Search
                            </button>

                            <button type="button" onClick={() => fetchStudents(page)}
                                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition text-sm">
                                <FaSyncAlt /> Refresh
                            </button>

                            {/* View toggle */}
                            <div className="ml-auto flex items-center gap-2">
                                {viewBtn('list', FaList, 'List')}
                                {viewBtn('grid', FaThLarge, 'Grid')}
                                {viewBtn('table', FaTable, 'Table')}
                            </div>
                        </form>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <Loading fullScreen={false} size="lg" color="yellow" message="Loading users..." />
                    ) : error ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center">
                            <div className="text-5xl mb-3">❌</div>
                            <p className="text-red-500 font-semibold mb-4">{error}</p>
                            <button onClick={() => fetchStudents(1)} className="bg-gradient-to-r from-red-500 to-primary-500 text-white px-6 py-2 rounded-xl font-medium hover:from-red-600 hover:to-primary-600 transition">
                                Try Again
                            </button>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center text-gray-500 dark:text-gray-400">
                            <FaUsers className="text-5xl mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No users found</p>
                        </div>
                    ) : (
                        <>
                            {/* ── TABLE VIEW ──────────────────────────────────────────── */}
                            {viewMode === 'table' && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-red-500 to-primary-500 text-white">
                                                    <th className="px-4 py-3 text-left font-semibold">#</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                                                    <th className="px-4 py-3 text-center font-semibold">Level</th>
                                                    <th className="px-4 py-3 text-center font-semibold">Plan</th>
                                                    <th className="px-4 py-3 text-center font-semibold">Total Earnings</th>
                                                    <th className="px-4 py-3 text-center font-semibold">Joined</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-xs">Daily / Weekly / Monthly Wins</th>
                                                    <th className="px-4 py-3 text-center font-semibold">Analytics</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {students.map((s, idx) => (
                                                    <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono">{(page - 1) * LIMIT + idx + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {avatar(s.name)}
                                                                <span className="font-medium text-gray-800 dark:text-white truncate max-w-[140px]">{s.name || '—'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[180px]">{s.email || '—'}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                                Lv {s.level?.currentLevel ?? 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${subBadge(s.subscriptionStatus)}`}>
                                                                {s.subscriptionStatus || 'free'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-semibold text-green-600 dark:text-green-400">
                                                            <span className="flex items-center justify-center gap-1">
                                                                <FaRupeeSign className="text-xs" />
                                                                {(s.totalEarnings || 0).toLocaleString('en-IN')}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold" title="Daily Wins">
                                                                    D: {s.dailyProgress?.highScoreWins || 0}
                                                                </span>
                                                                <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-bold" title="Weekly Wins">
                                                                    W: {s.weeklyProgress?.highScoreWins || 0}
                                                                </span>
                                                                <span className="text-xs bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 px-2 py-0.5 rounded-full font-bold" title="Monthly Wins">
                                                                    M: {s.monthlyProgress?.highScoreWins || 0}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-xs">
                                                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button onClick={() => goToUser(s._id)}
                                                                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-primary-500 hover:from-red-600 hover:to-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-md hover:shadow-lg transform hover:scale-105">
                                                                <FaEye className="text-xs" /> View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ── GRID VIEW ───────────────────────────────────────────── */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {students.map((s, idx) => (
                                        <div key={s._id}
                                            className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                                            {/* Header */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-primary-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                                                    {(s.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-800 dark:text-white truncate">{s.name || '—'}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.email || '—'}</div>
                                                </div>
                                            </div>

                                            {/* Badges */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                    Lv {s.level?.currentLevel ?? 0}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${subBadge(s.subscriptionStatus)}`}>
                                                    {s.subscriptionStatus || 'free'}
                                                </span>
                                            </div>

                                            {/* Earnings */}
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-green-700 dark:text-green-400">Total Earnings</span>
                                                <span className="font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                                                    <FaRupeeSign className="text-xs" />
                                                    {(s.totalEarnings || 0).toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            {/* Breakdown pills */}
                                            {s.earningsBreakdown && (
                                                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                                                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg py-1.5 px-1">
                                                        <div className="font-bold text-primary-700 dark:text-primary-400">
                                                            ₹{(s.earningsBreakdown.monthlyPrizes || 0).toLocaleString('en-IN')}
                                                        </div>
                                                        <div className="text-gray-500 dark:text-gray-400 text-[10px]">Monthly</div>
                                                    </div>
                                                    <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-lg py-1.5 px-1">
                                                        <div className="font-bold text-secondary-700 dark:text-secondary-400">
                                                            ₹{(s.earningsBreakdown.referralEarnings || 0).toLocaleString('en-IN')}
                                                        </div>
                                                        <div className="text-gray-500 dark:text-gray-400 text-[10px]">Referral</div>
                                                    </div>
                                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg py-1.5 px-1 col-span-3 mt-2">
                                                        <div className="flex items-center justify-around">
                                                            <div>
                                                                <div className="font-bold text-primary-600 dark:text-red-400">{s.dailyProgress?.highScoreWins || 0}</div>
                                                                <div className="text-[10px] text-gray-500 lowercase">Daily</div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-secondary-600 dark:text-primary-400">{s.weeklyProgress?.highScoreWins || 0}</div>
                                                                <div className="text-[10px] text-gray-500 lowercase">Weekly</div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-secondary-600 dark:text-secondary-400">{s.monthlyProgress?.highScoreWins || 0}</div>
                                                                <div className="text-[10px] text-gray-500 lowercase">Monthly</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-1">Challenge Wins</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
                                                <span className="text-xs text-gray-400">
                                                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                </span>
                                                <button onClick={() => goToUser(s._id)}
                                                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-primary-500 hover:from-red-600 hover:to-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm hover:shadow-md">
                                                    <FaEye className="text-xs" /> View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── LIST VIEW ───────────────────────────────────────────── */}
                            {viewMode === 'list' && (
                                <div className="flex flex-col gap-2">
                                    {students.map((s, idx) => (
                                        <div key={s._id}
                                            className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-150">
                                            {/* Rank */}
                                            <div className="text-gray-400 font-mono text-sm w-7 text-center flex-shrink-0">
                                                {(page - 1) * LIMIT + idx + 1}
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-primary-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {(s.name || 'U').charAt(0).toUpperCase()}
                                            </div>

                                            {/* Name + Email */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-800 dark:text-white truncate">{s.name || '—'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.email || '—'}</div>
                                            </div>

                                            {/* Level */}
                                            <span className="hidden sm:inline-flex items-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0">
                                                Lv {s.level?.currentLevel ?? 0}
                                            </span>

                                            {/* Plan */}
                                            <span className={`hidden md:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${subBadge(s.subscriptionStatus)}`}>
                                                {s.subscriptionStatus || 'free'}
                                            </span>

                                            {/* Earnings */}
                                            <div className="text-right flex-shrink-0">
                                                <div className="font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5 justify-end">
                                                    <FaRupeeSign className="text-xs" />
                                                    {(s.totalEarnings || 0).toLocaleString('en-IN')}
                                                </div>
                                                <div className="text-[10px] text-gray-400">earnings</div>
                                            </div>

                                            {/* Joined */}
                                            <div className="hidden lg:block text-xs text-gray-400 flex-shrink-0 text-right w-24">
                                                {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </div>

                                            {/* View */}
                                            <button onClick={() => goToUser(s._id)}
                                                className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-primary-500 hover:from-red-600 hover:to-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm flex-shrink-0">
                                                <FaEye className="text-xs" /> View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Pagination />
                        </>
                    )}
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
};

export default AdminUsersAnalytics;
