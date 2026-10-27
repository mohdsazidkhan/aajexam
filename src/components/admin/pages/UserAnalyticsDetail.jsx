'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSSR } from '../../../hooks/useSSR';
import { AdminDashboardSkeleton } from '../Skeletons';
import API from '../../../lib/api';
import { m as motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../Sidebar";
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
        primary: "text-primary-600 border-primary-500/20",
        secondary: "text-primary-600 border-primary-500/20",
        emerald: "text-primary-600 border-primary-500/20",
        amber: "text-content-primary bg-black/10 dark:bg-white/10 border-border-primary",
        rose: "text-content-primary bg-black/10 dark:bg-white/10 border-border-primary",
        purple: "text-primary-600 border-primary-500/20",
        cyan: "text-content-primary bg-black/10 dark:bg-white/10 border-border-primary",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 + 0.3 }}
            className="group relative rounded-lg xl:rounded-xl xl:rounded-3xl border border-border-primary p-4 hover:border-primary-500/30 transition-all overflow-hidden cursor-default"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">{label}</div>
            </div>
            <div className="space-y-1">
                <div className="text-md md:text-xl xl:text-2xl font-bold text-content-primary tabular-nums tracking-tight leading-none group-hover:text-primary-600 transition-colors">
                    {value}
                </div>
                {sub && (
                    <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] leading-tight">
                        {sub}
                    </div>
                )}
            </div>
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
        <div className="text-content-primary min-h-screen font-sans">
            <Sidebar />
            <div className="w-full mx-auto text-content-primary font-outfit py-4">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl xl:rounded-3xl border border-border-primary p-4 md:p-5 xl:p-12 mb-4 overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-3 xl:p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PieChart className="w-64 h-64 text-primary-600" />
                    </div>

                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-12">
                        <div className="space-y-3 xl:space-y-3">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.push('/admin/analytics/users-overview')}
                                    className="p-4 bg-background-surface-secondary text-content-secondary rounded-2xl hover:text-primary-600 transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {!loading && (
                                <div className="flex flex-wrap items-center gap-3 xl:gap-3">
                                    <div className="flex items-center gap-3 px-3 xl:px-4 py-2 bg-background-surface-secondary rounded-2xl border border-border-primary">
                                        <Mail className="w-4 h-4 text-content-muted" />
                                        <span className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em]">{userData.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 px-3 xl:px-4 py-2 rounded-2xl border border-primary-500/20">
                                        <TrendingUp className="w-4 h-4 text-primary-600" />
                                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em] italic tracking-tight">{userData.subscriptionStatus?.toUpperCase() || 'FREE'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!loading && data && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`relative px-4 xl:px-10 py-4 xl:py-8 rounded-lg xl:rounded-xl xl:rounded-3xl border overflow-hidden
                                        ${netEarnings >= 0 ?"bg-primary-600 border-primary-400/50":"bg-primary-600 border-black/50"}`}
                            >
                                <div className="relative z-10 flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.08em] mb-2">{netEarnings >= 0 ? 'Net Earnings' : 'Net Loss'}</span>
                                    <div className="flex items-center gap-2 text-2xl xl:text-5xl font-bold text-white tabular-nums tracking-tight italic">
                                        <IndianRupee className="w-8 h-8 xl:w-10 xl:h-10" />
                                        {Math.abs(netEarnings).toLocaleString('en-IN')}
                                    </div>
                                </div>
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
                            className="max-w-2xl mx-auto bg-black/10 dark:bg-white/10 border border-border-primary rounded-2xl xl:rounded-3xl p-4 xl:p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 xl:mb-4">
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-md md:text-xl xl:text-2xl font-bold text-content-primary italic tracking-tight mb-4">Failed to load data. Please try again.</h3>
                            <p className="text-content-primary font-bold uppercase text-sm tracking-[0.08em] mb-4">{error}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/admin/analytics/users-overview')}
                                className="px-4 xl:px-5 py-2.5 text-on-primary font-bold uppercase tracking-[0.08em] rounded-2xl bg-primary-600"
                            >
                                Back to Users
                            </motion.button>
                        </motion.div>
                    ) : data && (
                        <div className="space-y-2 xl:space-y-3 xl:space-y-12">
                            {/* Financial Matrix */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-2 xl:space-y-3 xl:space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-4 text-on-primary rounded-2xl bg-primary-600">
                                        <Coins className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm xl:text-xl font-bold text-content-primary italic tracking-tight leading-none mb-1">Revenue & Spending</h3>
                                        <p className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em]">Earnings and expenses overview</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:grid-cols-5 gap-3 xl:gap-3">
                                    <MetricCard i={0} color="emerald" icon={ArrowUp} label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} sub="All-time earnings" />
                                    <MetricCard i={1} color="rose" icon={ArrowDown} label="Total Withdraw" value={`₹${totalExpenses.toLocaleString('en-IN')}`} sub="Withdrawals" />
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
                                className="space-y-2 xl:space-y-3 xl:space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-4 text-on-primary rounded-2xl bg-primary-600">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm xl:text-xl font-bold text-content-primary italic tracking-tight leading-none mb-1">Engagement & Performance</h3>
                                        <p className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em]">Quiz accuracy and leaderboard standing</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-3">
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
                                className="space-y-2 xl:space-y-3 xl:space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-4 bg-black/10 dark:bg-white/10 text-content-primary rounded-2xl">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm xl:text-xl font-bold text-content-primary italic tracking-tight leading-none mb-1">Activity Timeline</h3>
                                        <p className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em]">Daily, weekly, and monthly progress</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-3">
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
                                className="space-y-2 xl:space-y-3 xl:space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-4 bg-black/10 dark:bg-white/10 text-content-primary rounded-2xl">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm xl:text-xl font-bold text-content-primary italic tracking-tight leading-none mb-1">Referral Network</h3>
                                        <p className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em]">Followers, following, and referrals</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-3">
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
                                className="space-y-2 xl:space-y-3 xl:space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-4 text-on-primary rounded-2xl bg-primary-600">
                                        <Book className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm xl:text-xl font-bold text-content-primary italic tracking-tight leading-none mb-1">Content Contributions</h3>
                                        <p className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em]">Questions, categories, quizzes, and blogs created</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 xl:gap-3">
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


