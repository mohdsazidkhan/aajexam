'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";
import API from '../../../lib/api';
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    TrendingUp,
    Users,
    Wallet,
    Award,
    Zap,
    Search,
    ChevronRight,
    Smartphone,
    Landmark,
    Clock,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    Star,
    Crown,
    Mail
} from 'lucide-react';

const PAGE_LIMIT = 20;

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
    const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
    const isOpen = useSelector((state) => state.sidebar.isOpen);

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

    const fetchUserReferralHistory = async (page = 1, limit = 20) => {
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
            'registration': 'Identity Activation',
            'plan9': 'Basic Payout',
            'plan49': 'Premium Payout',
            'plan99': 'Elite Payout',
        };
        return labels[type] || type.toUpperCase();
    };

    const getRewardTypeColor = (type) => {
        const colors = {
            'registration': 'text-primary-500 bg-primary-500/10 border-primary-500/20',
            'plan9': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            'plan49': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
            'plan99': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        };
        return colors[type] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    };

    if (loading) {
        return (
            <AdminMobileAppWrapper title="Economic Intelligence">
                <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-8">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-28 h-28 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full shadow-2xl"
                        />
                        <Wallet className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Syncing Treasury Logs...</div>
                </div>
            </AdminMobileAppWrapper>
        );
    }

    if (!userId || error) {
        return (
            <AdminMobileAppWrapper title="Economic Intelligence">
                <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-8">
                    <div className="p-10 bg-white dark:bg-white/5 rounded-[3rem] shadow-xl border-b-8 border-slate-100 dark:border-white/5 mb-8">
                        <Zap className="w-16 h-16 text-slate-200 dark:text-slate-700" />
                    </div>
                    <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">{error ? 'ACCESS_DENIED' : 'IDENTIFIER_MISSING'}</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">{error || 'The requested referral stream could not be localized.'}</p>
                    <button
                        onClick={() => router.push('/admin/referral-history')}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 transition-transform hover:scale-105"
                    >
                        <ArrowLeft className="w-4 h-4" /> RETURN_COLLECTOR
                    </button>
                </div>
            </AdminMobileAppWrapper>
        );
    }

    return (
        <AdminMobileAppWrapper title="Economic Intelligence">
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-sans text-slate-900 dark:text-white pb-20">
                {isMounted && <Sidebar />}
                <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-80' : 'lg:pl-24'} p-4 lg:p-10 pt-16 lg:pt-10`}>

                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">FINANCIAL INSTRUMENTS // REFERRAL STREAM</span>
                                </div>
                                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                                    PROFITS <span className="text-emerald-500">SCHEMATIC</span>
                                </h1>
                                <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-3xl border-2 border-slate-100 dark:border-white/5 backdrop-blur-3xl w-fit">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                                        {user?.name?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{user?.name}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{user?.email}</div>
                                        <div className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-2">REF_CODE: {user?.referralCode}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() => router.push('/admin/referral-history')}
                                    className="px-8 py-4 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4 text-emerald-500" /> EXIT_TO_HISTORY
                                </button>
                            </div>
                        </div>

                        {/* Metric Overview */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Liquid Assets', value: `₹${(user?.referralRewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0).toLocaleString()}`, icon: Wallet, color: 'emerald' },
                                { label: 'Affiliate Network', value: user?.referralCount || 0, icon: Users, color: 'indigo' },
                                { label: 'Accumulated Rewards', value: user?.referralRewards?.length || 0, icon: Award, color: 'amber' },
                                { label: 'Upline Identifier', value: user?.referredBy || 'SYSTEM', icon: Zap, color: 'rose' }
                            ].map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className="p-8 bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-xl transition-all hover:scale-[1.02]"
                                >
                                    <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 w-fit mb-6 shadow-inner`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tabular-nums mb-2 tracking-tighter italic leading-none">{stat.value}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Earnings Breakdown Spectral */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
                        {[
                            { id: 'total', label: 'GROSS VOLUME', amount: user?.referralRewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.length || 0, icon: PieChart, color: 'slate' },
                            { id: 'registration', label: 'ACTIVATE_TX', amount: user?.referralRewards?.filter(r => r.type === 'registration').reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.filter(r => r.type === 'registration').length || 0, icon: CheckCircle2, color: 'primary' },
                            { id: 'plan9', label: 'BASIC_STREAM', amount: user?.referralRewards?.filter(r => r.type === 'plan9').reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.filter(r => r.type === 'plan9').length || 0, icon: Star, color: 'emerald' },
                            { id: 'plan49', label: 'PREMIUM_OPS', amount: user?.referralRewards?.filter(r => r.type === 'plan49').reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.filter(r => r.type === 'plan49').length || 0, icon: Crown, color: 'indigo' },
                            { id: 'plan99', label: 'Plan 99', amount: user?.referralRewards?.filter(r => r.type === 'plan99').reduce((sum, r) => sum + (r.amount || 0), 0) || 0, count: user?.referralRewards?.filter(r => r.type === 'plan99').length || 0, icon: ShieldCheck, color: 'primary' }
                        ].map((tier) => (
                            <div key={tier.id} className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-xl group hover:border-emerald-500/30 transition-all">
                                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 mb-6 w-fit`}>
                                    <tier.icon className="w-5 h-5" />
                                </div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{tier.label}</div>
                                <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic leading-none mb-2">₹{tier.amount.toLocaleString()}</div>
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-60 italic">{tier.count} UNITS</div>
                            </div>
                        ))}
                    </div>

                    {/* Table Controller */}
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-12 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">TRANSACTION_FLUX</div>
                                <div className="text-sm font-black italic uppercase tracking-tighter">Affiliate Disbursement Ledger</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative group">
                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-emerald-500/30 transition-all font-outfit"
                                >
                                    <option>FILTER_BY_TIMELINE</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Results Interface */}
                    <AnimatePresence mode="wait">
                        {transactions.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-40 text-center bg-white/50 dark:bg-white/5 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
                            >
                                <div className="p-10 bg-slate-100/50 dark:bg-white/5 rounded-[3rem] mb-8 shadow-xl">
                                    <Wallet className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">ZERO_TRANSACTIONS</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No Recorded financial dissemination detected in current stream.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl"
                            >
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left">
                                            <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal_Stamp</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient_Identification</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reward_Category</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Disbursement</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aggregate_Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {transactions.map((tx, i) => (
                                            <motion.tr
                                                key={tx._id || i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group hover:bg-emerald-500/5 transition-all"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{formatDate(tx.date)}</div>
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(tx.date)}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {tx.invitee ? (
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg">
                                                                {tx.invitee.name?.[0].toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-emerald-500 transition-colors uppercase">{tx.invitee.name}</div>
                                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.invitee.email}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-300 italic">Unknown</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block border ${getRewardTypeColor(tx.rewardType)}`}>
                                                        {getRewardTypeLabel(tx.rewardType)}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="text-sm font-black text-emerald-500 tabular-nums italic">+₹{tx.amount}</div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums italic tracking-tighter">₹{tx.balance?.toLocaleString() || 0}</div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Spectral Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center pt-12">
                            <Pagination
                                currentPage={page}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                                totalItems={pagination.totalItems}
                                itemsPerPage={limit}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
}

