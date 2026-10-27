'use client';

import Select from '../../common/ui/Select';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Pagination from "../../common/Pagination";
import ResponsiveTable from "../../common/ResponsiveTable";
import API from '../../../lib/api';
import { AdminDetailSkeleton } from "../Skeletons";
import { useSSR } from '../../../hooks/useSSR';
import Link from 'next/link';
import { m as motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar';
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
            'plan99': 'PRO Plan Reward',
        };
        return labels[type] || type.toUpperCase();
    };

    const getRewardTypeColor = (type) => {
        const colors = {
            'plan99': 'text-content-primary bg-black/10 dark:bg-white/10 border-border-primary',
        };
        return colors[type] || 'text-content-muted bg-slate-500/10 border-slate-500/20';
    };

    const columns = [
        {
            key: 'date', header: 'DATE', render: (_, tx) => (
                <div className="flex flex-col">
                    <div className="text-[10px] font-bold text-content-primary uppercase tracking-tight leading-none mb-1">{formatDate(tx.date)}</div>
                    <div className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em] italic">{formatTime(tx.date)}</div>
                </div>
            )
        },
        {
            key: 'invitee', header: 'REFERRED USER', render: (_, tx) => (
                tx.invitee ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 text-on-primary rounded-lg xl:rounded-xl flex items-center justify-center font-bold text-xs bg-primary-600">
                            {tx.invitee.name?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-content-primary uppercase italic tracking-tight leading-none mb-1 group-hover:text-primary-600 transition-colors">{tx.invitee.name}</div>
                            <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">{tx.invitee.email}</div>
                        </div>
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-slate-300 italic">Unknown</span>
                )
            )
        },
        {
            key: 'rewardType', header: 'REWARD TYPE', render: (_, tx) => (
                <div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.08em] inline-block border ${getRewardTypeColor(tx.rewardType)}`}>
                    {getRewardTypeLabel(tx.rewardType)}
                </div>
            )
        },
        {
            key: 'amount', header: 'AMOUNT', render: (_, tx) => (
                <div className="text-sm font-bold text-primary-600 tabular-nums italic">+₹{tx.amount}</div>
            )
        },
        {
            key: 'balance', header: 'BALANCE', render: (_, tx) => (
                <div className="text-sm font-bold text-content-primary tabular-nums italic tracking-tight">₹{tx.balance?.toLocaleString() || 0}</div>
            )
        }
    ];

    useAdminMobileHeader({ title: loading ? 'Loading...' : (user?.name || 'Referral Detail') });

    if (loading) {
        return (
            <div className="min-h-screen p-3 xl:p-5">
                <AdminDetailSkeleton />
            </div>
        );
    }

    if (!userId || error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-3 xl:p-5">
                <div className="p-4 xl:p-10 bg-background-surface dark:bg-white/5 rounded-lg xl:rounded-xl xl:rounded-3xl border-b-2 border-border-primary mb-4 xl:mb-4">
                    <Zap className="w-16 h-16 text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="text-xl xl:text-3xl font-bold text-content-primary tracking-tight mb-4 italic">{error ? 'Error' : 'User Not Found'}</h3>
                <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em] mb-4 xl:mb-4">{error || 'No user ID was provided. Please go back and select a user.'}</p>
                <button
                    onClick={() => router.push('/admin/referral-history')}
                    className="px-4 xl:px-5 py-2.5 text-on-primary rounded-lg xl:rounded-3xl text-[10px] font-bold uppercase tracking-[0.08em] flex items-center gap-3 transition-transform hover:scale-105 bg-primary-600"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to History
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-sans text-content-primary">
            {isMounted && <Sidebar />}
            <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 shrink-0"
                >
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3 xl:gap-4 mb-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-4 rounded-3xl border border-border-primary w-fit">
                                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-on-primary font-bold text-lg">
                                    {user?.name?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.08em] leading-none mb-1">{user?.name}</div>
                                    <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] italic">{user?.email}</div>
                                    <div className="text-[8px] font-bold text-primary-600 uppercase tracking-[0.08em] mt-2">Referral Code: {user?.referralCode}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => router.push('/admin/referral-history')}
                                className="px-4 xl:px-4 py-2.5 bg-background-surface dark:bg-white/5 border border-border-primary text-content-primary rounded-lg xl:rounded-xl text-[10px] font-bold uppercase tracking-[0.08em] hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4 text-primary-600" /> Back to History
                            </button>
                        </div>
                    </div>

                    {/* Metric Overview */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-3">
                        {[
                            { label: 'Total Earnings', value: `₹${(user?.referralRewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0).toLocaleString()}`, icon: Wallet, color: 'primary' },
                            { label: 'People Referred', value: user?.referralCount || 0, icon: Users, color: 'primary' },
                            { label: 'Total Rewards', value: user?.referralRewards?.length || 0, icon: Award, color: 'primary' },
                            { label: 'Referred By', value: user?.referredBy || 'Direct Signup', icon: Zap, color: 'primary' }
                        ].map((stat, i) => (
                            <div
                                key={stat.label}
                                className="p-3 xl:p-5 rounded-lg xl:rounded-xl xl:rounded-3xl border border-border-primary transition-all hover:scale-[1.02]"
                            >
                                <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 w-fit mb-4`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="text-2xl xl:text-4xl font-bold text-content-primary tabular-nums mb-2 tracking-tight italic leading-none">{stat.value}</div>
                                <div className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Earnings Breakdown */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 xl:gap-3 mb-4 shrink-0">
                    {[
                        { id: 'total', label: 'Total Earned', amount: user?.referralRewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.length || 0, icon: PieChart, color: 'slate' },
                        { id: 'plan99', label: 'Plan 99', amount: user?.referralRewards?.filter(r => r.type === 'plan99').reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.filter(r => r.type === 'plan99').length || 0, icon: ShieldCheck, color: 'primary' }
                    ].map((tier) => (
                        <div key={tier.id} className="p-4 rounded-lg xl:rounded-xl xl:rounded-3xl border border-border-primary group hover:border-primary-500/30 transition-all">
                            <div className="p-3 rounded-lg xl:rounded-xl bg-background-surface-secondary text-content-muted mb-4 w-fit">
                                <tier.icon className="w-5 h-5" />
                            </div>
                            <div className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1">{tier.label}</div>
                            <div className="text-xl font-bold text-content-primary tabular-nums tracking-tight italic leading-none mb-2">₹{tier.amount.toLocaleString()}</div>
                            <div className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em] opacity-60 italic">{tier.count} rewards</div>
                        </div>
                    ))}
                </div>

                {/* Table Controller */}
                <div className="rounded-2xl xl:rounded-3xl border border-border-primary p-4 xl:p-10 mb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 text-on-primary rounded-lg xl:rounded-xl bg-primary-600">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted mb-1">TRANSACTIONS</div>
                            <div className="text-sm font-bold italic uppercase tracking-tight">Referral Reward History</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
                            <Select
                                className="pl-14 pr-10 py-2.5 bg-background-surface border border-border-primary rounded-xl text-[10px] font-bold uppercase tracking-[0.08em] outline-none appearance-none cursor-pointer hover:border-primary-500/30 transition-all font-outfit"
                            >
                                <option>Filter by Date</option>
                            </Select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted rotate-90 pointer-events-none" />
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
                            className="flex flex-col items-center justify-center py-10 xl:py-20 text-center rounded-2xl xl:rounded-3xl border border-dashed border-border-primary"
                        >
                            <div className="p-4 xl:p-10 bg-slate-100/50 dark:bg-white/5 rounded-lg xl:rounded-xl xl:rounded-3xl mb-4 xl:mb-4">
                                <Wallet className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl xl:text-3xl font-bold text-content-primary italic tracking-tight mb-3">NO TRANSACTIONS YET</h3>
                            <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em]">This user has no referral reward transactions yet.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl xl:rounded-3xl border border-border-primary overflow-hidden h-auto flex flex-col"
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

