'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import { AdminDashboardSkeleton } from '../../admin/Skeletons';
import API from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../../Sidebar";
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

import {
    ArrowLeft, IndianRupee, Trophy, TrendingUp,
    Wallet, Users, UserPlus, GraduationCap,
    HelpCircle, Folder, Layers, Book, Coins,
    ArrowUp, ArrowDown, PieChart, Activity, Zap, Cpu, Mail, Star
} from 'lucide-react';

// --- Professional Metric Card ---
function MetricCard({ icon: Icon, label, value, sub, color = "primary", i = 0 }) {
    const colors = {
        primary: "text-primary-600 bg-primary-500/10 border-primary-500/20",
        secondary: "text-primary-600 bg-primary-500/10 border-primary-500/20",
        emerald: "text-primary-600 bg-primary-500/10 border-primary-500/20",
        amber: "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20",
        rose: "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20",
        purple: "text-primary-600 bg-primary-500/10 border-primary-500/20",
        cyan: "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 + 0.3 }}
            className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 p-6 hover:border-primary-500/30 transition-all shadow-sm overflow-hidden cursor-default"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
            <div className="space-y-1">
                <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none group-hover:text-primary-600 transition-colors">
                    {value}
                </div>
                {sub && (
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        {sub}
                    </div>
                )}
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors" />
        </motion.div>
    );
}

const AdminUserAnalyticsDetail = () => {
    const router = useRouter();
    const { id: userId } = router.query;
    const { isMounted, isRouterReady } = useSSR();
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isRouterReady || !userId) return;
        setLoading(true);
        setError(null);
        API.getIndividualUserAnalytics(userId)
            .then(res => {
                if (res?.success) setData(res.data);
                else setError(res?.message || 'Failed to load analytics');
            })
            .catch(err => setError(err?.message || 'Failed to load analytics'))
            .finally(() => setLoading(false));
    }, [userId, isRouterReady]);

    useAdminMobileHeader({ title: loading ? 'Loading...' : (data?.user?.name || 'User Performance') });

    if (!isMounted) return null;

    const d = data || {};
    const {
        userInfo,
        totalEarnings = 0, referralRewards = 0, blogEarnings = 0, quizEarnings = 0,
        totalExpenses = 0, netEarnings = 0, totalHighScoreWins = 0, averageAccuracy = 0,
        followersCount = 0, followingCount = 0, referralCount = 0, testAttemptsCount = 0,
        questionsPostedCount = 0, categoriesCreatedCount = 0, subcategoriesCreatedCount = 0,
        quizzesCreatedCount = 0, blogsCreatedCount = 0
    } = d;

    const userData = d.user || {};

    return (
        <div className="text-slate-900 dark:text-white min-h-screen font-sans selection:bg-primary-500/30">
            <Sidebar />
            <div className="w-full mx-auto text-slate-900 dark:text-white font-outfit adminContent">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 p-4 md:p-8 lg:p-12 mb-4 shadow-sm overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-3 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PieChart className="w-64 h-64 text-primary-600 -rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-12">
                        <div className="space-y-3 lg:space-y-6">
                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.push('/admin/analytics/users-overview')}
                                    className="p-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl hover:text-primary-600 transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {!loading && (
                                <div className="flex flex-wrap items-center gap-3 lg:gap-6">
                                    <div className="flex items-center gap-3 px-3 lg:px-6 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl border-2 border-slate-200/50 dark:border-white/5">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{userData.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 px-3 lg:px-6 py-3 bg-primary-500/10 rounded-2xl border-2 border-primary-500/20">
                                        <TrendingUp className="w-4 h-4 text-primary-600" />
                                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest italic tracking-tighter">{userData.subscriptionStatus?.toUpperCase() || 'FREE'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!loading && data && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`relative px-4 lg:px-10 py-4 lg:py-8 rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 shadow-sm overflow-hidden
                                        ${netEarnings >= 0 ?"bg-primary-600 border-primary-400/50":"bg-primary-600 border-black/50"}`}
                            >
                                <div className="relative z-10 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mb-2">{netEarnings >= 0 ? 'Net Earnings' : 'Net Loss'}</span>
                                    <div className="flex items-center gap-2 text-2xl lg:text-5xl font-black text-white tabular-nums tracking-tighter italic">
                                        <IndianRupee className="w-8 h-8 lg:w-10 lg:h-10" />
                                        {Math.abs(netEarnings).toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <AdminDashboardSkeleton />
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto bg-black/10 dark:bg-white/10 border-2 border-black/20 dark:border-white/20 rounded-2xl lg:rounded-[3.5rem] p-4 lg:p-12 text-center shadow-sm"
                        >
                            <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-8 shadow-sm">
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Failed to load data. Please try again.</h3>
                            <p className="text-black dark:text-white font-bold uppercase text-sm tracking-widest mb-4">{error}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/admin/analytics/users-overview')}
                                className="px-4 lg:px-8 py-4 bg-primary-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-sm"
                            >
                                Back to Users
                            </motion.button>
                        </motion.div>
                    ) : data && (
                        <div className="space-y-2 lg:space-y-4 lg:space-y-12">
                            {/* Financial Matrix */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-2 lg:space-y-4 lg:space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-primary-500/20 text-primary-600 rounded-2xl shadow-sm">
                                        <Coins className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">Revenue & Spending</h3>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Earnings and expenses overview</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-6">
                                    <MetricCard i={0} color="emerald" icon={ArrowUp} label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} sub="All-time earnings" />
                                    <MetricCard i={1} color="rose" icon={ArrowDown} label="Total Payouts" value={`₹${totalExpenses.toLocaleString('en-IN')}`} sub="Withdrawals" />
                                    <MetricCard i={2} color={netEarnings >= 0 ? "emerald" : "rose"} icon={Wallet} label="Net Balance" value={`₹${Math.abs(netEarnings).toLocaleString('en-IN')}`} sub={netEarnings >= 0 ? "Positive balance" : "Negative balance"} />
                                    <MetricCard i={3} color="amber" icon={Book} label="Blog Rewards" value={`₹${blogEarnings.toLocaleString('en-IN')}`} sub="From blog posts" />
                                    <MetricCard i={4} color="cyan" icon={Zap} label="Quiz Rewards" value={`₹${quizEarnings.toLocaleString('en-IN')}`} sub="From quiz scores" />
                                </div>
                            </motion.section>

                            {/* Performance Alignment */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2 lg:space-y-4 lg:space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-primary-500/10 text-primary-600 rounded-2xl shadow-sm">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">Engagement & Performance</h3>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Quiz accuracy and leaderboard standing</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                                    <MetricCard i={0} color="purple" icon={Star} label="High Score Wins" value={totalHighScoreWins.toLocaleString('en-IN')} sub="Leaderboard wins" />
                                    <MetricCard i={1} color="indigo" icon={TrendingUp} label="Avg. Accuracy" value={`${averageAccuracy.toFixed(2)}%`} sub="Overall correctness" />
                                    <MetricCard i={2} color="cyan" icon={GraduationCap} label="Quiz Attempts" value={testAttemptsCount.toLocaleString('en-IN')} sub="Total attempts" />
                                </div>
                            </motion.section>

                            {/* Temporal Activity Analysis */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2 lg:space-y-4 lg:space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-2xl shadow-sm">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">Activity Timeline</h3>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Daily, weekly, and monthly progress</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                                    <MetricCard i={0} color="rose" icon={Zap} label="Status" value={`Student`} sub={'Active'} />
                                    <MetricCard i={1} color="indigo" icon={Zap} label="Tests Taken" value={`0`} sub="Total tests completed" />
                                    <MetricCard i={2} color="indigo" icon={Zap} label="Average Score" value={`0%`} sub="Overall accuracy" />
                                </div>
                            </motion.section>

                            {/* Community Integration Matrix */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-2 lg:space-y-4 lg:space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-2xl shadow-sm">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">Referral Network</h3>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Followers, following, and referrals</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                                    <MetricCard i={0} color="rose" icon={Users} label="Followers" value={followersCount.toLocaleString('en-IN')} sub="People following this user" />
                                    <MetricCard i={1} color="cyan" icon={Users} label="Following" value={followingCount.toLocaleString('en-IN')} sub="People this user follows" />
                                    <MetricCard i={2} color="amber" icon={UserPlus} label="Referrals" value={referralCount.toLocaleString('en-IN')} sub="Users referred" />
                                </div>
                            </motion.section>

                            {/* Authoring & Contribution Interface */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-2 lg:space-y-4 lg:space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-primary-500/10 text-primary-600 rounded-2xl shadow-sm">
                                        <Book className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">Content Contributions</h3>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Questions, categories, quizzes, and blogs created</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
                                    <MetricCard i={0} color="purple" icon={HelpCircle} label="Questions" value={questionsPostedCount.toLocaleString('en-IN')} sub="Questions posted" />
                                    <MetricCard i={1} color="rose" icon={Folder} label="Categories" value={categoriesCreatedCount.toLocaleString('en-IN')} sub="Categories created" />
                                    <MetricCard i={2} color="emerald" icon={Layers} label="Subcategories" value={subcategoriesCreatedCount.toLocaleString('en-IN')} sub="Subcategories created" />
                                    <MetricCard i={3} color="indigo" icon={Book} label="Quizzes" value={quizzesCreatedCount.toLocaleString('en-IN')} sub="Quizzes created" />
                                    <MetricCard i={4} color="amber" icon={Book} label="Blog Posts" value={blogsCreatedCount.toLocaleString('en-IN')} sub="Articles published" />
                                </div>
                            </motion.section>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminUserAnalyticsDetail;


