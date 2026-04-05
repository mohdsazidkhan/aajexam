'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from '../../Sidebar';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import API from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, LayoutDashboard, IndianRupee, Trophy, TrendingUp,
    Wallet, Users, UserPlus, GraduationCap,
    HelpCircle, Folder, Layers, Book, Coins,
    ArrowUp, ArrowDown, PieChart, Activity, Zap, Cpu, Mail, Star
} from 'lucide-react';

// --- Professional Metric Card ---
function MetricCard({ icon: Icon, label, value, sub, color = "primary", i = 0 }) {
    const colors = {
        primary: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        secondary: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 + 0.3 }}
            className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 hover:border-indigo-500/30 transition-all shadow-xl overflow-hidden cursor-default"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
            <div className="space-y-1">
                <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none group-hover:text-indigo-500 transition-colors">
                    {value}
                </div>
                {sub && (
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        {sub}
                    </div>
                )}
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
        </motion.div>
    );
}

const AdminUserAnalyticsDetail = () => {
    const router = useRouter();
    const { id: userId } = router.query;
    const { isMounted, isRouterReady } = useSSR();
    const isOpen = useSelector(state => state.sidebar.isOpen);
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
    const isAdminRoute = router?.pathname?.startsWith('/admin') || false;

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
        <AdminMobileAppWrapper title="User Analytics">
            <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'} bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white min-h-screen font-sans selection:bg-indigo-500/30`}>
                {user?.role === 'admin' && isAdminRoute && <Sidebar />}

                <div className="adminContent p-4 lg:p-12 w-full max-w-[1600px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-4 md:p-8 lg:p-12 mb-12 shadow-2xl overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <PieChart className="w-64 h-64 text-indigo-500 -rotate-12" />
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.1, x: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => router.push('/admin/analytics/users-overview')}
                                        className="p-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl hover:text-indigo-500 transition-colors"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </motion.button>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                                            <LayoutDashboard className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">User Analytics // Performance Analysis</span>
                                    </div>
                                </div>

                                <h1 className="text-xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                    {loading ? 'LOADING_DATA...' : (userData.name || 'USER_PERFORMANCE')}
                                </h1>

                                 {!loading && (
                                     <div className="flex flex-wrap items-center gap-6">
                                         <div className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl border-2 border-slate-200/50 dark:border-white/5">
                                             <Mail className="w-4 h-4 text-slate-400" />
                                             <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{userData.email || 'N/A'}</span>
                                         </div>
                                         <div className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 rounded-2xl border-2 border-indigo-500/20">
                                             <TrendingUp className="w-4 h-4 text-indigo-500" />
                                             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic tracking-tighter">LVL_{userData.level?.currentLevel ?? 0} // {userData.subscriptionStatus?.toUpperCase() || 'STANDARD'}</span>
                                         </div>
                                     </div>
                                 )}
                            </div>

                            {!loading && data && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`relative px-10 py-8 rounded-[2.5rem] border-4 shadow-2xl overflow-hidden
                                        ${netEarnings >= 0 ? "bg-emerald-500 border-emerald-400/50" : "bg-rose-500 border-rose-400/50"}`}
                                >
                                     <div className="relative z-10 flex flex-col items-center">
                                         <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mb-2">{netEarnings >= 0 ? 'NET_SURPLUS' : 'NET_DEFICIT'}</span>
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
                                className="flex flex-col items-center justify-center py-32 space-y-8"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="w-24 h-24 border-4 border-indigo-500/20 rounded-[2rem]"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-t-4 border-indigo-500 rounded-[2rem]"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu className="w-8 h-8 text-indigo-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">PREPARING_ANALYTICS</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Fetching user metrics...</div>
                                </div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-2xl mx-auto bg-rose-500/10 border-4 border-rose-500/20 rounded-[3.5rem] p-12 text-center shadow-2xl"
                            >
                                <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/30">
                                    <Zap className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">DATA_LOAD_FAILED</h3>
                                <p className="text-rose-500 font-bold uppercase text-sm tracking-widest mb-12">{error}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/admin/analytics/users-overview')}
                                    className="px-8 py-4 bg-rose-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/20"
                                >
                                    Back_To_Users
                                </motion.button>
                            </motion.div>
                        ) : data && (
                            <div className="space-y-12">
                                 {/* Financial Matrix */}
                                 <motion.section
                                     initial={{ opacity: 0, y: 20 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: 0.1 }}
                                     className="space-y-8"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className="p-4 bg-emerald-500/20 text-emerald-600 rounded-2xl shadow-inner">
                                             <Coins className="w-6 h-6" />
                                         </div>
                                         <div>
                                             <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">REVENUE & EXPENDITURE</h3>
                                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Aggregate fiscal performance tracking</p>
                                         </div>
                                     </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                         <MetricCard i={0} color="emerald" icon={ArrowUp} label="Agg_Gross_Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} sub="Cumulative_Volume" />
                                         <MetricCard i={1} color="rose" icon={ArrowDown} label="Disbursement_Vol" value={`₹${totalExpenses.toLocaleString('en-IN')}`} sub="Transaction_Costs" />
                                         <MetricCard i={2} color={netEarnings >= 0 ? "emerald" : "rose"} icon={Wallet} label="Net_Variance" value={`₹${Math.abs(netEarnings).toLocaleString('en-IN')}`} sub={netEarnings >= 0 ? "SURPLUS_ALIGNED" : "DEFICIT_ALIGNED"} />
                                         <MetricCard i={3} color="amber" icon={Book} label="Authoring_Rewards" value={`₹${blogEarnings.toLocaleString('en-IN')}`} sub="Editorial_Incentives" />
                                         <MetricCard i={4} color="cyan" icon={Zap} label="Assessment_Rewards" value={`₹${quizEarnings.toLocaleString('en-IN')}`} sub="Engagement_Incentives" />
                                     </div>
                                 </motion.section>

                                 {/* Performance Alignment */}
                                 <motion.section
                                     initial={{ opacity: 0, y: 20 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: 0.2 }}
                                     className="space-y-8"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl shadow-inner">
                                             <Trophy className="w-6 h-6" />
                                         </div>
                                         <div>
                                             <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">ENGAGEMENT & EFFICACY</h3>
                                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assessment accuracy and cohort positioning</p>
                                         </div>
                                     </div>
                                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                         <MetricCard i={0} color="purple" icon={Star} label="Tier_Positioning" value={totalHighScoreWins.toLocaleString('en-IN')} sub="Leaderboard_Dominance" />
                                         <MetricCard i={1} color="indigo" icon={TrendingUp} label="Aggregate_Accuracy" value={`${averageAccuracy.toFixed(2)}%`} sub="Protocol_Correctness" />
                                         <MetricCard i={2} color="cyan" icon={GraduationCap} label="Completed_Ass_Cycles" value={testAttemptsCount.toLocaleString('en-IN')} sub="Registry_Execution" />
                                     </div>
                                 </motion.section>

                                 {/* Temporal Activity Analysis */}
                                 <motion.section
                                     initial={{ opacity: 0, y: 20 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: 0.3 }}
                                     className="space-y-8"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl shadow-inner">
                                             <Activity className="w-6 h-6" />
                                         </div>
                                         <div>
                                             <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">TEMPORAL ACTIVITY</h3>
                                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Time-series engagement monitoring</p>
                                         </div>
                                     </div>
                                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                         <MetricCard i={0} color="rose" icon={Zap} label="Diurnal_Output" value={`${userData.dailyProgress?.highScoreWins || 0} Wins`} sub={`${userData.dailyProgress?.totalQuizAttempts || 0} Att (${userData.dailyProgress?.accuracy || 0}%_ACC)`} />
                                         <MetricCard i={1} color="indigo" icon={Zap} label="Weekly_Output" value={`${userData.weeklyProgress?.highScoreWins || 0} Wins`} sub={`${userData.weeklyProgress?.totalQuizAttempts || 0} Att (${userData.weeklyProgress?.accuracy || 0}%_ACC)`} />
                                         <MetricCard i={2} color="indigo" icon={Zap} label="Monthly_Output" value={`${userData.monthlyProgress?.highScoreWins || 0} Wins`} sub={`${userData.monthlyProgress?.totalQuizAttempts || 0} Att (${userData.monthlyProgress?.accuracy || 0}%_ACC)`} />
                                     </div>
                                 </motion.section>

                                 {/* Community Integration Matrix */}
                                 <motion.section
                                     initial={{ opacity: 0, y: 20 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: 0.4 }}
                                     className="space-y-8"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className="p-4 bg-pink-500/10 text-pink-600 rounded-2xl shadow-inner">
                                             <Users className="w-6 h-6" />
                                         </div>
                                         <div>
                                             <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">ECOSYSTEM CONNECTIVITY</h3>
                                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Network reach and referral mapping</p>
                                         </div>
                                     </div>
                                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                         <MetricCard i={0} color="rose" icon={Users} label="Cohort_Reach" value={followersCount.toLocaleString('en-IN')} sub="Follower_Base" />
                                         <MetricCard i={1} color="cyan" icon={Users} label="Inter_Connectivity" value={followingCount.toLocaleString('en-IN')} sub="Following_Nodes" />
                                         <MetricCard i={2} color="amber" icon={UserPlus} label="Network_Expansion" value={referralCount.toLocaleString('en-IN')} sub="Inbound_Referrals" />
                                     </div>
                                 </motion.section>

                                 {/* Authoring & Contribution Interface */}
                                 <motion.section
                                     initial={{ opacity: 0, y: 20 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: 0.5 }}
                                     className="space-y-8"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className="p-4 bg-purple-500/10 text-purple-600 rounded-2xl shadow-inner">
                                             <Book className="w-6 h-6" />
                                         </div>
                                         <div>
                                             <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">AUTHORING & CONTRIBUTION</h3>
                                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Platform genesis and metadata expandsion</p>
                                         </div>
                                     </div>
                                     <div className="grid grid-cols-2 lg:grid-cols-3 lg:grid-cols-5 gap-6">
                                         <MetricCard i={0} color="purple" icon={HelpCircle} label="Knowledge_Units" value={questionsPostedCount.toLocaleString('en-IN')} sub="Inquiry_Assets" />
                                         <MetricCard i={1} color="rose" icon={Folder} label="Curriculum_Roots" value={categoriesCreatedCount.toLocaleString('en-IN')} sub="Classification_Nodes" />
                                         <MetricCard i={2} color="emerald" icon={Layers} label="Sub_Taxonomy_Nodes" value={subcategoriesCreatedCount.toLocaleString('en-IN')} sub="Granular_Mapping" />
                                         <MetricCard i={3} color="indigo" icon={Book} label="Assessment_Matrices" value={quizzesCreatedCount.toLocaleString('en-IN')} sub="Module_Structs" />
                                         <MetricCard i={4} color="amber" icon={Book} label="Editorial_Syncs" value={blogsCreatedCount.toLocaleString('en-IN')} sub="Publication_Registry" />
                                     </div>
                                 </motion.section>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
};

export default AdminUserAnalyticsDetail;


