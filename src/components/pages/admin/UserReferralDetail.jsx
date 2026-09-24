'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Pagination from "../../Pagination";
import ResponsiveTable from "../../ResponsiveTable";
import API from '../../../lib/api';
import { AdminDetailSkeleton } from "../../admin/Skeletons";
import { useSSR } from '../../../hooks/useSSR';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../Sidebar';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

import {
    ArrowLeft,
    Users,
    Wallet,
    Award,
    Zap,
    ChevronRight,
    Clock,
    ShieldCheck,
    PieChart
} from 'lucide-react';

const PAGE_LIMIT = DEFAULT_PAGE_SIZE;

export default function UserReferralDetail() {
    const { isMounted, isRouterReady, router } = useSSR();
    const searchParams = useSearchParams();
    const userId = searchParams?.get('userId');

    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(PAGE_LIMIT);
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState(null);

    const userInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
    useEffect(() => {
        if (userId) {
            fetchUserDetails();
            fetchUserReferralHistory(page, limit);
        }
    }, [userId, page, limit]);

    const fetchUserDetails = async () => {
        try {
            const response = await API.getAdminUserDetails({ userId });
            if (response?.success) {
                if (response.user) {
                    setUser(response.user);
                } else if (response.data?.user) {
                    setUser(response.data.user);
                }
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    const fetchUserReferralHistory = async (page = 1, limit = DEFAULT_PAGE_SIZE) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                userId,
            };

            const response = await API.getAdminReferralHistory(params);

            if (response?.success) {
                setTransactions(response.data?.transactions || []);
                setPagination(response.data?.pagination || {});
                setSummary(response.data?.summary || null);
            } else {
                setError(response?.message || 'Failed to fetch referral history');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch referral history');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const getRewardTypeLabel = (type) => {
        const labels = {
            'plan99': '₹99 Plan Reward',
        };
        return labels[type] || type.toUpperCase();
    };

    const getRewardTypeColor = (type) => {
        const colors = {
            'plan99': 'text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20',
        };
        return colors[type] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    };

    const columns = [
        {
            key: 'date', header: 'DATE', render: (_, tx) => (
                <div className="flex flex-col">
                    <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{formatDate(tx.date)}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(tx.date)}</div>
                </div>
            )
        },
        {
            key: 'invitee', header: 'REFERRED USER', render: (_, tx) => (
                tx.invitee ? (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-lg lg:rounded-xl flex items-center justify-center font-black text-xs shadow-sm">
                            {tx.invitee.name?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-primary-600 transition-colors">{tx.invitee.name}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.invitee.email}</div>
                        </div>
                    </div>
                ) : (
                    <span className="text-[10px] font-black text-slate-300 italic">Unknown</span>
                )
            )
        },
        {
            key: 'rewardType', header: 'REWARD TYPE', render: (_, tx) => (
                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block border ${getRewardTypeColor(tx.rewardType)}`}>
                    {getRewardTypeLabel(tx.rewardType)}
                </div>
            )
        },
        {
            key: 'amount', header: 'AMOUNT', render: (_, tx) => (
                <div className="text-sm font-black text-primary-600 tabular-nums italic">+₹{tx.amount}</div>
            )
        },
        {
            key: 'balance', header: 'BALANCE', render: (_, tx) => (
                <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums italic tracking-tighter">₹{tx.balance?.toLocaleString() || 0}</div>
            )
        }
    ];

    useAdminMobileHeader({ title: loading ? 'Loading...' : (user?.name || 'Referral Detail') });

    if (loading) {
        return (
            <div className="min-h-screen p-3 lg:p-8">
                <AdminDetailSkeleton />
            </div>
        );
    }

    if (!userId || error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-3 lg:p-8">
                <div className="p-4 lg:p-10 bg-white dark:bg-white/5 rounded-lg lg:rounded-xl xl:rounded-[3rem] shadow-sm border-b-2 border-slate-100 dark:border-white/5 mb-4 lg:mb-8">
                    <Zap className="w-16 h-16 text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">{error ? 'Error' : 'User Not Found'}</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 lg:mb-8">{error || 'No user ID was provided. Please go back and select a user.'}</p>
                <button
                    onClick={() => router.push('/admin/referral-history')}
                    className="px-4 lg:px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-3 transition-transform hover:scale-105"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to History
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-sans text-slate-900 dark:text-white">
            {isMounted && <Sidebar />}
            <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col overflow-hidden">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 shrink-0"
                >
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-3xl border-2 border-slate-100 dark:border-white/5 backdrop-blur-3xl w-fit">
                                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                                    {user?.name?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{user?.name}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{user?.email}</div>
                                    <div className="text-[8px] font-black text-primary-600 uppercase tracking-[0.2em] mt-2">Referral Code: {user?.referralCode}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => router.push('/admin/referral-history')}
                                className="px-4 lg:px-6 py-2.5 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4 text-primary-600" /> Back to History
                            </button>
                        </div>
                    </div>

                    {/* Metric Overview */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                        {[
                            { label: 'Total Earnings', value: `₹${(user?.referralRewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0).toLocaleString()}`, icon: Wallet, color: 'primary' },
                            { label: 'People Referred', value: user?.referralCount || 0, icon: Users, color: 'primary' },
                            { label: 'Total Rewards', value: user?.referralRewards?.length || 0, icon: Award, color: 'primary' },
                            { label: 'Referred By', value: user?.referredBy || 'Direct Signup', icon: Zap, color: 'primary' }
                        ].map((stat, i) => (
                            <div
                                key={stat.label}
                                className="p-3 lg:p-8 bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 shadow-sm transition-all hover:scale-[1.02]"
                            >
                                <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 w-fit mb-6 shadow-sm`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tabular-nums mb-2 tracking-tighter italic leading-none">{stat.value}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Earnings Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-6 mb-4 shrink-0">
                    {[
                        { id: 'total', label: 'Total Earned', amount: user?.referralRewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.length || 0, icon: PieChart, color: 'slate' },
                        { id: 'plan99', label: 'Plan 99', amount: user?.referralRewards?.filter(r => r.type === 'plan99').reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.filter(r => r.type === 'plan99').length || 0, icon: ShieldCheck, color: 'primary' }
                    ].map((tier) => (
                        <div key={tier.id} className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 shadow-sm group hover:border-primary-500/30 transition-all">
                            <div className="p-3 rounded-lg lg:rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 mb-6 w-fit">
                                <tier.icon className="w-5 h-5" />
                            </div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{tier.label}</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic leading-none mb-2">₹{tier.amount.toLocaleString()}</div>
                            <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest opacity-60 italic">{tier.count} rewards</div>
                        </div>
                    ))}
                </div>

                {/* Table Controller */}
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500/10 text-primary-600 rounded-lg lg:rounded-xl">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">TRANSACTIONS</div>
                            <div className="text-sm font-black italic uppercase tracking-tighter">Referral Reward History</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                className="pl-14 pr-10 py-2.5 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-primary-500/30 transition-all font-outfit"
                            >
                                <option>Filter by Date</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Results Interface */}
                <div className="flex-1 min-h-0 overflow-auto">
                <AnimatePresence mode="wait">
                    {transactions.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-10 lg:py-20 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm"
                        >
                            <div className="p-4 lg:p-10 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-xl xl:rounded-[3rem] mb-4 lg:mb-8 shadow-sm">
                                <Wallet className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">NO TRANSACTIONS YET</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">This user has no referral reward transactions yet.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden shadow-sm h-auto flex flex-col"
                        >
                            <ResponsiveTable data={transactions} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                            <Pagination
      compact
                                currentPage={page}
                                totalPages={pagination.totalPages || 1}
                                onPageChange={handlePageChange}
                                totalItems={pagination.totalItems || 0}
                                itemsPerPage={limit}
                                onItemsPerPageChange={handleLimitChange}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

