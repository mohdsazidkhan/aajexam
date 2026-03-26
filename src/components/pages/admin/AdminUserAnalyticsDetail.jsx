'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from '../../Sidebar';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import API from '../../../lib/api';
import {
    FaArrowLeft, FaChartBar, FaRupeeSign, FaTrophy, FaChartLine,
    FaWallet, FaUsers, FaUserFriends, FaUserPlus, FaGraduationCap,
    FaQuestionCircle, FaFolder, FaLayerGroup, FaBook, FaCoins,
    FaArrowUp, FaArrowDown
} from 'react-icons/fa';

// ─── Stat Card (matches /my-analytics style) ──────────────────────────────────
function StatCard({ gradient, icon: Icon, label, value, sub, small }) {
    return (
        <div className={`group relative bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-3 xl:p-5 text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden`}>
            <div className="absolute top-0 right-0 w-28 h-28 bg-white dark:bg-gray-800 opacity-20 dark:opacity-10 rounded-full -mr-14 -mt-14" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-2.5 shadow-lg">
                        <Icon className="text-xl" />
                    </div>
                    <span className="text-xs font-semibold bg-white dark:bg-gray-800 bg-opacity-40 dark:bg-opacity-30 backdrop-blur-sm px-2.5 py-1 rounded-full">{label}</span>
                </div>
                <div className="mt-3">
                    <span className={`${small ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold drop-shadow-lg`}>{value}</span>
                    {sub && <p className="text-xs mt-2 font-medium opacity-80">{sub}</p>}
                </div>
            </div>
        </div>
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

    // The backend returns the user info inside data.user
    const userData = d.user || {};

    return (
        <AdminMobileAppWrapper title="User Analytics">
            <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen`}>
                {user?.role === 'admin' && isAdminRoute && <Sidebar />}

                <div className="adminContent p-3 md:p-6 w-full">
                    {/* Page Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-primary-500 to-secondary-500 dark:from-red-600 dark:via-primary-600 dark:to-secondary-600 rounded-2xl shadow-xl mb-6">
                        <div className="absolute inset-0 bg-black opacity-10" />
                        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.push('/admin/analytics/users-overview')}
                                    className="hidden sm:flex bg-white/20 hover:bg-white/30 text-white rounded-xl p-2.5 transition flex-shrink-0"
                                >
                                    <FaArrowLeft className="text-lg" />
                                </button>
                                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-lg flex-shrink-0">
                                    <FaChartBar className="text-2xl text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                                        {loading ? 'Loading...' : (userData.name || 'User Analytics')}
                                    </h1>
                                    <p className="text-white/80 text-sm mt-0.5">
                                        {loading ? '' : `${userData.email || ''} · Level ${userData.level?.currentLevel ?? 0} · ${userData.subscriptionStatus || 'free'}`}
                                    </p>
                                </div>
                            </div>
                            {!loading && data && (
                                <div className={`hidden sm:block bg-${netEarnings >= 0 ? 'green' : 'red'}-500 rounded-xl px-5 py-2.5 shadow-lg text-white text-center flex-shrink-0`}>
                                    <div className="text-xs font-bold">{netEarnings >= 0 ? 'Net Profit' : 'Net Loss'}</div>
                                    <div className="flex items-baseline gap-1 justify-center mt-0.5">
                                        <FaRupeeSign className="text-sm" />
                                        <span className="text-2xl font-bold">{Math.abs(netEarnings).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* State: loading */}
                    {loading && <Loading fullScreen={false} size="lg" color="yellow" message="Loading user analytics..." />}

                    {/* State: error */}
                    {!loading && error && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center">
                            <div className="text-5xl mb-3">❌</div>
                            <p className="text-red-500 font-semibold mb-4">{error}</p>
                            <button
                                onClick={() => router.push('/admin/analytics/users-overview')}
                                className="bg-gradient-to-r from-red-500 to-primary-500 text-white px-6 py-2 rounded-xl font-medium hover:from-red-600 hover:to-primary-600 transition"
                            >
                                ← Back to Users
                            </button>
                        </div>
                    )}

                    {/* State: data */}
                    {!loading && !error && data && (
                        <div className="space-y-6">
                            {/* Financial */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-1.5">
                                        <FaCoins className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Financial Metrics</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                                    <StatCard gradient="from-green-400 via-emerald-400 to-green-500 dark:from-green-600 dark:via-emerald-600 dark:to-green-700" icon={FaArrowUp} label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} sub="Monthly + Referral + Blog + Quiz" />
                                    <StatCard gradient="from-red-400 via-rose-400 to-secondary-500 dark:from-red-600 dark:via-rose-600 dark:to-red-700" icon={FaArrowDown} label="Total Expenses" value={`₹${totalExpenses.toLocaleString('en-IN')}`} sub="Subscription payments" />
                                    <StatCard gradient={netEarnings >= 0 ? 'from-secondary-400 via-cyan-400 to-secondary-500 dark:from-secondary-600 dark:via-cyan-600 dark:to-secondary-700' : 'from-red-400 via-rose-400 to-secondary-500 dark:from-red-600 dark:via-rose-600 dark:to-red-700'} icon={FaWallet} label={netEarnings >= 0 ? 'Net Profit' : 'Net Loss'} value={`₹${Math.abs(netEarnings).toLocaleString('en-IN')}`} sub="Earnings minus expenses" />
                                    <StatCard gradient="from-primary-400 via-amber-400 to-primary-500 dark:from-primary-600 dark:via-amber-600 dark:to-primary-700" icon={FaBook} label="Blog Earnings" value={`₹${blogEarnings.toLocaleString('en-IN')}`} sub="From approved blogs" />
                                    <StatCard gradient="from-secondary-400 via-cyan-400 to-secondary-500 dark:from-secondary-600 dark:via-cyan-600 dark:to-secondary-700" icon={FaQuestionCircle} label="Quiz Earnings" value={`₹${quizEarnings.toLocaleString('en-IN')}`} sub="From approved quizzes" />
                                </div>
                            </section>

                            {/* Performance */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-1.5">
                                        <FaTrophy className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Performance Metrics</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <StatCard gradient="from-purple-400 via-violet-400 to-purple-500 dark:from-purple-600 dark:via-violet-600 dark:to-purple-700" icon={FaTrophy} label="High Score Wins" value={totalHighScoreWins.toLocaleString('en-IN')} sub="Combined challenge wins" />
                                    <StatCard gradient="from-primary-400 via-secondary-400 to-indigo-500 dark:from-primary-600 dark:via-secondary-600 dark:to-indigo-700" icon={FaChartLine} label="Avg Accuracy" value={`${averageAccuracy.toFixed(2)}%`} sub="Overall performance" />
                                    <StatCard gradient="from-cyan-400 via-teal-400 to-cyan-500 dark:from-cyan-600 dark:via-teal-600 dark:to-cyan-700" icon={FaGraduationCap} label="Test Attempts" value={testAttemptsCount.toLocaleString('en-IN')} sub="Govt exam tests" />
                                </div>
                            </section>

                            {/* Challenge Performance */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-gradient-to-r from-primary-500 to-primary-500 rounded-lg p-1.5">
                                        <FaTrophy className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Challenge Performance</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <StatCard
                                        gradient="from-red-400 to-primary-500 dark:from-red-600 dark:to-primary-700"
                                        icon={FaTrophy}
                                        label="Daily Challenge"
                                        value={`${userData.dailyProgress?.highScoreWins || 0} Wins`}
                                        sub={`${userData.dailyProgress?.totalQuizAttempts || 0} Attempts (${userData.dailyProgress?.accuracy || 0}% Acc)`}
                                    />
                                    <StatCard
                                        gradient="from-primary-400 to-primary-500 dark:from-primary-600 dark:to-primary-700"
                                        icon={FaTrophy}
                                        label="Weekly Challenge"
                                        value={`${userData.weeklyProgress?.highScoreWins || 0} Wins`}
                                        sub={`${userData.weeklyProgress?.totalQuizAttempts || 0} Attempts (${userData.weeklyProgress?.accuracy || 0}% Acc)`}
                                    />
                                    <StatCard
                                        gradient="from-secondary-400 to-indigo-500 dark:from-secondary-600 dark:to-indigo-700"
                                        icon={FaTrophy}
                                        label="Monthly Challenge"
                                        value={`${userData.monthlyProgress?.highScoreWins || 0} Wins`}
                                        sub={`${userData.monthlyProgress?.totalQuizAttempts || 0} Attempts (${userData.monthlyProgress?.accuracy || 0}% Acc)`}
                                    />
                                </div>
                            </section>

                            {/* Social */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-1.5">
                                        <FaUsers className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Social Metrics</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <StatCard gradient="from-pink-400 via-rose-400 to-pink-500 dark:from-pink-600 dark:via-rose-600 dark:to-pink-700" icon={FaUsers} label="Followers" value={followersCount.toLocaleString('en-IN')} sub="Total followers" />
                                    <StatCard gradient="from-teal-400 via-cyan-400 to-teal-500 dark:from-teal-600 dark:via-cyan-600 dark:to-teal-700" icon={FaUserFriends} label="Following" value={followingCount.toLocaleString('en-IN')} sub="Users followed" />
                                    <StatCard gradient="from-amber-400 via-primary-400 to-amber-500 dark:from-amber-600 dark:via-primary-600 dark:to-amber-700" icon={FaUserPlus} label="Referrals" value={referralCount.toLocaleString('en-IN')} sub="Users referred" />
                                </div>
                            </section>

                            {/* Content */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg p-1.5">
                                        <FaBook className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Content Creation</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <StatCard small gradient="from-violet-400 via-purple-400 to-violet-500 dark:from-violet-600 dark:via-secondary-500 dark:to-violet-700" icon={FaQuestionCircle} label="Questions" value={questionsPostedCount.toLocaleString('en-IN')} sub="Posted" />
                                    <StatCard small gradient="from-rose-400 via-pink-400 to-rose-500 dark:from-rose-600 dark:via-pink-600 dark:to-rose-700" icon={FaFolder} label="Categories" value={categoriesCreatedCount.toLocaleString('en-IN')} sub="Created" />
                                    <StatCard small gradient="from-emerald-400 via-green-400 to-emerald-500 dark:from-emerald-600 dark:via-green-600 dark:to-emerald-700" icon={FaLayerGroup} label="Subcategories" value={subcategoriesCreatedCount.toLocaleString('en-IN')} sub="Created" />
                                    <StatCard small gradient="from-sky-400 via-secondary-400 to-sky-500 dark:from-sky-600 dark:via-secondary-600 dark:to-sky-700" icon={FaBook} label="Quizzes" value={quizzesCreatedCount.toLocaleString('en-IN')} sub="Created" />
                                    <StatCard small gradient="from-primary-400 via-amber-400 to-primary-500 dark:from-primary-600 dark:via-amber-600 dark:to-primary-700" icon={FaBook} label="Blogs" value={blogsCreatedCount.toLocaleString('en-IN')} sub="Created" />
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
};

export default AdminUserAnalyticsDetail;
