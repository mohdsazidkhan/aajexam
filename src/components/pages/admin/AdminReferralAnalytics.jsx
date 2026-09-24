'use client';

import React, { useEffect, useState, useCallback } from 'react';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import {
    Users,
    Search,
    Download,
    UserPlus,
    LayoutGrid,
    List,
    Table as TableIcon,
    Award,
    Zap,
    Clock,
    Mail,
    Hash
} from 'lucide-react';
import { AdminDashboardSkeleton } from '../../skeletons/AdminSkeletons';
import { isMobile } from 'react-device-detect';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../../Sidebar";
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';


const AdminReferralAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0
    });

    const [summary, setSummary] = useState({
        totalUsers: 0,
        usersWithReferrals: 0,
        totalReferralsSum: 0,
        monthlyReferralsSum: 0
    });
    const availableYears = [];
    for (let i = 0; i < 6; i++) {
        availableYears.push(currentYear - i);
    }

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(searchTerm && { search: searchTerm }),
                ...(selectedYear !== 'all' && { year: selectedYear }),
                ...(selectedMonth !== 'all' && { month: selectedMonth })
            });

            const response = await API.request(`/api/admin/referral-analytics?${params.toString()}`);

            setAnalytics(response.analytics || []);
            setSummary(response.summary || {
                totalUsers: 0,
                usersWithReferrals: 0,
                totalReferralsSum: 0,
                monthlyReferralsSum: 0
            });
            setPagination(prev => ({
                ...prev,
                total: response.pagination.total,
                totalPages: response.pagination.totalPages
            }));
        } catch (error) {
            console.error('Error fetching referral analytics:', error);
            toast.error('Failed to fetch referral analytics');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm, selectedYear, selectedMonth]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAnalytics();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchAnalytics]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleYearChange = (e) => {
        const value = e.target.value;
        setSelectedYear(value === 'all' ? 'all' : parseInt(value));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit) => {
        setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const exportToCSV = () => {
        const monthName = selectedMonth === 'all' ? 'All Months' : months[parseInt(selectedMonth) - 1];
        const yearText = selectedYear === 'all' ? 'All Years' : selectedYear;
        const headers = ['S.No.', 'Name', 'Email', 'Referral Code', 'Total Referrals', `Monthly Referrals (${monthName} ${yearText})`];
        const csvData = analytics.map((user, index) => [
            index + 1 + (pagination.page - 1) * pagination.limit,
            user.name,
            user.email,
            user.referralCode,
            user.totalReferrals,
            user.monthlyReferrals
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `referral-analytics-${yearText}-${monthName}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully!');
    };

    const columns = [
        {
            key: 'user', header: 'User', render: (_, user) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-lg lg:rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-primary-700 transition-all uppercase">
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{user.name}</div>
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest italic">{user.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'referralCode', header: 'Referral Code', render: (_, user) => (
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-black text-primary-600 italic">
                    <Hash className="w-3 h-3" /> {user.referralCode}
                </div>
            )
        },
        {
            key: 'totalReferrals', header: 'Total Referrals', align: 'center', render: (_, user) => (
                <div>
                    <div className="text-sm font-black text-primary-600 tabular-nums">{user.totalReferrals}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">All Time</div>
                </div>
            )
        },
        {
            key: 'monthlyReferrals', header: 'Monthly Growth', align: 'center', render: (_, user) => (
                <div>
                    <div className="text-sm font-black text-primary-600 tabular-nums">{user.monthlyReferrals}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">{selectedMonth === 'all' ? 'All Months' : months[parseInt(selectedMonth) - 1]}</div>
                </div>
            )
        },
        {
            key: 'joined', header: 'Joined', align: 'right', render: (_, user) => (
                <span className="text-[10px] font-bold text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
            )
        }
    ];

    if (loading && analytics.length === 0) {
        return (
            <div className="min-h-screen p-3 lg:p-8">
                <AdminDashboardSkeleton />
            </div>
        );
    }

    return (
        <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
            <Sidebar />
            <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 flex flex-col transition-all duration-500">

                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><Users className="w-6 h-6 text-primary-600 shrink-0" /> Referrals <span className="text-slate-400 dark:text-slate-500">({pagination.total})</span></h1>

                        <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
                            <div className="relative col-span-2 sm:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
                                />
                            </div>
                            <select
                                value={selectedYear}
                                onChange={handleYearChange}
                                className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
                            >
                                <option value="all">All Years</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
                            >
                                <option value="all">All Months</option>
                                {months.map((month, index) => (
                                    <option key={index + 1} value={(index + 1).toString().padStart(2, '0')}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1">
                                {[
                                    { icon: TableIcon, id: 'table', label: 'Table View' },
                                    { icon: List, id: 'list', label: 'List View' },
                                    { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setViewMode(mode.id)}
                                        title={mode.label}
                                        className={`p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                    >
                                        <mode.icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={exportToCSV}
                                disabled={analytics.length === 0}
                                title="Export CSV"
                                className="flex items-center justify-center bg-primary-50 dark:bg-primary-950/30 text-primary-600 p-2 rounded-lg lg:rounded-xl shrink-0 disabled:opacity-30"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Summary Visualization */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-700 mb-4 shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 lg:p-0 p-2">
                        {[
                            { label: "Total Users", value: pagination.total, icon: Users },
                            { label: "Active Referrers", value: summary.usersWithReferrals, icon: UserPlus },
                            { label: "Total Referrals", value: summary.totalReferralsSum, icon: Award },
                            { label: "This Month", value: summary.monthlyReferralsSum, icon: Zap }
                        ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-2 px-3 py-2">
                                <div className="p-1.5 bg-primary-500/10 text-primary-600 rounded-lg shrink-0"><stat.icon className="w-3.5 h-3.5" /></div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{stat.value}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analytics Data */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {analytics.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-10 lg:py-20 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm"
                            >
                                <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 lg:mb-8" />
                                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">NO DATA FOUND</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No referral data found for the selected filters.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex-1 min-h-0 overflow-hidden">
                                {/* Grid Visualization */}
                                {viewMode === 'grid' && (
                                    <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                                        {analytics.map((user, i) => (
                                            <div key={user._id || i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center font-black text-sm">{user.name?.[0]?.toUpperCase() || 'U'}</div>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-600 text-[10px] font-black"><Hash className="w-3 h-3" />{user.referralCode}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name || 'Unknown'}</h3>
                                                    <p className="text-[10px] text-slate-400 truncate">{user.email || 'No email'}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-center">
                                                    <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                                        <div className="text-sm font-black text-primary-600 tabular-nums">{user.totalReferrals}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Total</div>
                                                    </div>
                                                    <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                                        <div className="text-sm font-black text-primary-600 tabular-nums">{user.monthlyReferrals}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Monthly</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* List Visualization */}
                                {viewMode === 'list' && (
                                    <div className="h-full overflow-auto space-y-3">
                                        {analytics.map((user, i) => (
                                            <div key={user._id || i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                                                <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-sm">{user.name?.[0]?.toUpperCase() || 'U'}</div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{user.name || 'Unknown'}</h3>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-600 text-[10px] font-black"><Hash className="w-3 h-3" />{user.referralCode}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400">
                                                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 text-center min-w-[90px]">
                                                        <div className="text-sm font-black text-primary-600 tabular-nums">{user.totalReferrals}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Total</div>
                                                    </div>
                                                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 text-center min-w-[90px]">
                                                        <div className="text-sm font-black text-primary-600 tabular-nums">{user.monthlyReferrals}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Monthly</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Table Visualization */}
                                {viewMode === 'table' && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
                                        <ResponsiveTable data={analytics} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} emptyMessage="No referral data found" fillHeight />
                                    </div>
                                )}
                                </div>

                                {/* Pagination */}
                                {pagination.total > 0 && (
                                    <div className="shrink-0">
                                        <Pagination
                                            currentPage={pagination.page}
                                            totalPages={pagination.totalPages}
                                            onPageChange={handlePageChange}
                                            totalItems={pagination.total}
                                            itemsPerPage={pagination.limit}
                                            onItemsPerPageChange={handleLimitChange}
                                        />
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

export default AdminReferralAnalytics;

