'use client';

import React, { useEffect, useState, useCallback } from 'react';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import {
    Users,
    Calendar,
    Search,
    Download,
    UserPlus,
    LayoutGrid,
    List,
    Table as TableIcon,
    User,
    Filter,
    ChevronRight,
    ArrowRight,
    TrendingUp,
    Award,
    Zap,
    Clock,
    ChevronLeft,
    Mail,
    ShieldCheck,
    Hash
} from 'lucide-react';
import Loading from '../../Loading';
import { isMobile } from 'react-device-detect';
import Button from '../../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../../Sidebar";


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
        limit: 20,
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

    if (loading && analytics.length === 0) {
        return (
            <div className="min-h-screen  flex flex-col items-center justify-center p-3 lg:p-8">
                <div className="relative">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-28 h-28 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full shadow-2xl"
                    />
                    <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-emerald-500" />
                </div>
                <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Loading referral analytics...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
            <Sidebar />
            <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">
                <div className="transition-all duration-500 p-4 lg:p-8">

                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4">
                            <div className="space-y-4">

                                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                                    REFERRAL <span className="text-emerald-500">ANALYTICS</span>
                                </h1>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Track referral performance, user activity, and monthly growth trends.</p>
                            </div>

                            <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-4 border-slate-100 dark:border-white/10 shadow-xl w-full lg:w-auto">
                                {[
                                    { icon: TableIcon, id: 'table', label: 'Table' },
                                    { icon: List, id: 'list', label: 'List' },
                                    { icon: LayoutGrid, id: 'grid', label: 'Grid' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setViewMode(mode.id)}
                                        className={`p-4 rounded-full transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none ${viewMode === mode.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <mode.icon className="w-4 h-4" />
                                        {viewMode === mode.id && <span className="text-[8px] font-black uppercase tracking-widest pr-1">{mode.label}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary Visualization */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-4">
                            {[
                                { label: "TOTAL USERS", value: pagination.total, icon: Users, color: "bg-indigo-500", shadow: "shadow-indigo-500/20" },
                                { label: "ACTIVE REFERRERS", value: summary.usersWithReferrals, icon: UserPlus, color: "bg-emerald-500", shadow: "shadow-emerald-500/20" },
                                { label: "TOTAL REFERRALS", value: summary.totalReferralsSum, icon: Award, color: "bg-rose-500", shadow: "shadow-rose-500/20" },
                                { label: "THIS MONTH", value: summary.monthlyReferralsSum, icon: Zap, color: "bg-amber-500", shadow: "shadow-amber-500/20" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative overflow-hidden ${stat.color} rounded-xl lg:rounded-[2.5rem] p-3 lg:p-8 text-white shadow-2xl ${stat.shadow}`}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <stat.icon className="w-20 h-20 -rotate-12 translate-x-6 translate-y-2 text-white" />
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{stat.label}</div>
                                        <div className="text-3xl lg:text-4xl font-black italic tracking-tighter tabular-nums">{stat.value}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-4 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-3 lg:gap-8 text-[10px] font-black">
                            <div className="grid grid-cols-1 lg:flex lg:items-center gap-3 lg:gap-6 flex-1 w-full lg:w-auto">
                                <div className="relative group w-full lg:max-w-md">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="w-full pl-14 pr-8 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:flex lg:items-center gap-3 w-full lg:w-auto">
                                    <div className="relative w-full lg:w-auto">
                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={selectedYear}
                                            onChange={handleYearChange}
                                            className="w-full lg:w-auto pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-emerald-500/30 transition-all font-outfit"
                                        >
                                            <option value="all">All Years</option>
                                            {availableYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>

                                    <div className="relative w-full lg:w-auto">
                                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={selectedMonth}
                                            onChange={handleMonthChange}
                                            className="w-full lg:w-auto pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-emerald-500/30 transition-all font-outfit"
                                        >
                                            <option value="all">All Months</option>
                                            {months.map((month, index) => (
                                                <option key={index + 1} value={(index + 1).toString().padStart(2, '0')}>
                                                    {month.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={exportToCSV}
                                disabled={analytics.length === 0}
                                className="w-full lg:w-auto px-4 lg:px-8 py-5 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 text-emerald-600 rounded-xl lg:rounded-[2.5rem] shadow-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95 outline-none"
                            >
                                <Download className="w-5 h-5" /> Export CSV
                            </button>
                        </div>
                    </motion.div>

                    {/* Analytics Data */}
                    <AnimatePresence mode="wait">
                        {analytics.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-10 lg:py-20  text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
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
                                className="space-y-4 lg:space-y-12"
                            >
                                {/* Grid Visualization */}
                                {viewMode === 'grid' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-8">
                                        {analytics.map((user, i) => (
                                            <motion.div
                                                key={user._id || i}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-10 hover:border-emerald-500/30 transition-all shadow-xl flex flex-col items-center text-center overflow-hidden"
                                            >
                                                <div className="relative mb-4 lg:mb-8">
                                                    <div className="w-20 h-20 bg-slate-900 dark:bg-white/10 text-white rounded-lg lg:rounded-[2rem] flex items-center justify-center border-4 border-slate-100 dark:border-white/10 shadow-lg group-hover:scale-110 group-hover:bg-emerald-500 transition-all uppercase font-black text-xl">
                                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-white dark:border-[#060813]">
                                                        <Award className="w-4 h-4" />
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-1 uppercase">{user.name || 'Unknown'}</h3>
                                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 lg:mb-8 italic">{user.email || 'No email'}</div>

                                                <div className="grid grid-cols-2 gap-4 w-full mb-4 lg:mb-10 text-[9px] font-black uppercase tracking-widest">
                                                    <div className="p-5 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/5 group-hover:border-emerald-500/20 transition-all">
                                                        <div className="text-slate-400 mb-2">Total Referrals</div>
                                                        <div className="text-xl italic text-primary-500 tabular-nums">{user.totalReferrals}</div>
                                                    </div>
                                                    <div className="p-5 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/5 group-hover:border-emerald-500/20 transition-all">
                                                        <div className="text-slate-400 mb-2">Monthly Growth</div>
                                                        <div className="text-xl italic text-emerald-500 tabular-nums">{user.monthlyReferrals}</div>
                                                    </div>
                                                </div>

                                                <div className="w-full flex items-center justify-between pt-8 border-t-2 border-slate-50 dark:border-white/5 mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{user.referralCode}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase text-slate-400 italic">Joined: {new Date(user.createdAt).getFullYear()}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* List Visualization */}
                                {viewMode === 'list' && (
                                    <div className="space-y-3 lg:space-y-6">
                                        {analytics.map((user, i) => (
                                            <motion.div
                                                key={user._id || i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 hover:border-emerald-500/30 transition-all shadow-xl flex flex-col lg:flex-row lg:items-center gap-10"
                                            >
                                                <div className="w-20 h-20 bg-slate-900 dark:bg-white/10 text-white rounded-lg lg:rounded-[2rem] flex items-center justify-center shrink-0 border-4 border-slate-100 dark:border-white/10 shadow-xl group-hover:scale-110 group-hover:bg-emerald-500 transition-all uppercase font-black text-2xl">
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-emerald-500 transition-colors uppercase">{user.name || 'Unknown'}</h3>
                                                        <div className="px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 italic">{user.referralCode}</div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-slate-300" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{user.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-slate-300" />
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <div className="p-6 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 text-center min-w-[140px] group-hover:border-primary-500/20 transition-all">
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL REFERRALS</div>
                                                        <div className="text-2xl font-black italic tracking-tighter text-primary-500 tabular-nums">{user.totalReferrals}</div>
                                                    </div>
                                                    <div className="p-6 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 text-center min-w-[140px] group-hover:border-emerald-500/20 transition-all">
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MONTHLY GROWTH</div>
                                                        <div className="text-2xl font-black italic tracking-tighter text-emerald-500 tabular-nums">{user.monthlyReferrals}</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Table Visualization */}
                                {viewMode === 'table' && (
                                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left">
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">#</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">USER</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">REFERRAL CODE</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">TOTAL REFERRALS</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">MONTHLY GROWTH</th>
                                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">JOINED</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                {analytics.map((user, i) => (
                                                    <motion.tr
                                                        key={user._id || i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="group hover:bg-emerald-500/5 transition-all"
                                                    >
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                                            <span className="text-[10px] font-black text-slate-400 tabular-nums">#{i + 1 + (pagination.page - 1) * pagination.limit}</span>
                                                        </td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-emerald-500 transition-all uppercase">
                                                                    {user.name?.[0]?.toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{user.name}</div>
                                                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-black text-emerald-500 italic">
                                                                <Hash className="w-3 h-3" /> {user.referralCode}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                                            <div className="text-xl font-black italic tracking-tighter text-indigo-500 tabular-nums">{user.totalReferrals}</div>
                                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">All Time</div>
                                                        </td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                                            <div className="text-xl font-black italic tracking-tighter text-emerald-500 tabular-nums">{user.monthlyReferrals}</div>
                                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{selectedMonth === 'all' ? 'All Months' : months[parseInt(selectedMonth) - 1].toUpperCase()}</div>
                                                        </td>
                                                        <td className="px-4 lg:px-8 py-3 lg:py-6 text-right font-black text-[10px] text-slate-400 uppercase tracking-widest tabular-nums">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-16 text-[10px] font-black uppercase tracking-widest">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="p-6 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-full text-slate-400 hover:text-emerald-500 disabled:opacity-20 transition-all shadow-xl active:scale-90"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="px-4 lg:px-8 py-4 bg-emerald-600 text-white rounded-lg lg:rounded-[2rem] shadow-2xl italic tracking-tighter shadow-emerald-500/40">
                                            Page {pagination.page} <span className="text-emerald-200 mx-2">/</span> {pagination.totalPages}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="p-6 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-full text-slate-400 hover:text-emerald-500 disabled:opacity-20 transition-all shadow-xl active:scale-90"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
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

export default AdminReferralAnalytics;

