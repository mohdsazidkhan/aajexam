'use client';

import { useState, useEffect } from 'react';
import { FaFire, FaUsers, FaArrowRight, FaTrophy, FaCalendarDay, FaCalendarAlt, FaCalendarCheck } from 'react-icons/fa';
import Link from 'next/link';
import API from '../lib/api';
import config from '../lib/config/appConfig';

const LivePrizePool = ({ isLandingPage = false }) => {
    const [prizepools, setPrizepools] = useState(null);
    const [activeType, setActiveType] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await API.getPrizePools();
            if (res.success) {
                setPrizepools(res.prizepools);
            }
        } catch (error) {
            console.error("Error fetching prize pool stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !prizepools) {
        return (
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl mb-8"></div>
        );
    }

    const currentPool = { ...prizepools[activeType] };
    const minPool = activeType === 'daily' ? config.QUIZ_CONFIG.MIN_DAILY_POOL :
        activeType === 'weekly' ? config.QUIZ_CONFIG.MIN_WEEKLY_POOL :
            config.QUIZ_CONFIG.MIN_MONTHLY_POOL;

    if (currentPool.total < minPool) {
        currentPool.total = minPool;
        // Recalculate distribution if total was below min
        currentPool.distribution = currentPool.distribution.map(d => ({
            ...d,
            amount: Math.round(minPool * (d.percentage / 100))
        }));
    }

    const types = [
        { id: 'daily', label: 'Daily', icon: FaCalendarDay, color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20', accent: 'blue' },
        { id: 'weekly', label: 'Weekly', icon: FaCalendarAlt, color: 'from-purple-500 to-indigo-500', glow: 'shadow-purple-500/20', accent: 'purple' },
        { id: 'monthly', label: 'Monthly', icon: FaCalendarCheck, color: 'from-yellow-400 via-orange-500 to-red-500', glow: 'shadow-orange-500/20', accent: 'orange' }
    ];

    const activeConfig = types.find(t => t.id === activeType);

    const getRankStyles = (rank) => {
        if (rank === 1) return {
            bg: 'bg-yellow-50/80 dark:bg-yellow-500/10',
            border: 'border-yellow-200 dark:border-yellow-500/30',
            accent: 'bg-yellow-500',
            text: 'text-yellow-700 dark:text-yellow-400',
            badge: '🥇'
        };
        if (rank === 2) return {
            bg: 'bg-slate-50/80 dark:bg-slate-400/10',
            border: 'border-slate-200 dark:border-slate-400/30',
            accent: 'bg-slate-400',
            text: 'text-slate-600 dark:text-slate-300',
            badge: '🥈'
        };
        if (rank === 3) return {
            bg: 'bg-orange-50/80 dark:bg-orange-500/10',
            border: 'border-orange-200 dark:border-orange-500/30',
            accent: 'bg-orange-500',
            text: 'text-orange-700 dark:text-orange-400',
            badge: '🥉'
        };
        return {
            bg: 'bg-gray-50/80 dark:bg-gray-800/30',
            border: 'border-gray-100 dark:border-gray-700/50',
            accent: 'bg-gray-300 dark:bg-gray-600',
            text: 'text-gray-600 dark:text-gray-400',
            badge: rank === 4 ? '🏅' : '🎖️'
        };
    };

    return (
        <div className="relative group w-full mx-auto">
            {/* Type Selector Tabs - Elevated Design */}
            <div className="flex justify-center gap-3 mb-0">
                <div className="flex gap-1.5 p-1.5 bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                    {types.map((type) => {
                        const Icon = type.icon;
                        const isActive = activeType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id)}
                                className={`flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive
                                    ? `bg-white dark:bg-gray-800 text-${type.accent}-600 dark:text-${type.accent}-400 shadow-sm scale-[1.02] border border-gray-200/50 dark:border-gray-700/50`
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30'
                                    }`}
                            >
                                <Icon className={`${isActive ? 'scale-110' : ''} transition-transform`} />
                                {type.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Prize Pool Container - Multi-layered Glassmorphism */}
            <div className={`relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800/80  shadow-xl lg:shadow-2xl p-3 lg:p-6 transition-all duration-700 group-hover:shadow-3xl`}>

                {/* Dynamic Background Glows */}
                <div className={`absolute -top-24 -right-24 w-96 h-96 blur-[120px] rounded-full opacity-30 transition-all duration-1000 bg-gradient-to-br ${activeConfig.color}`}></div>
                <div className={`absolute -bottom-24 -left-24 w-96 h-96 blur-[120px] rounded-full opacity-20 transition-all duration-1000 bg-gradient-to-br ${activeConfig.color}`}></div>

                <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">

                    {/* Left Section: Live Visuals & Stats */}
                    <div className="text-center xl:text-left flex-1 space-y-6">
                        <div className="flex flex-col items-center xl:items-start">
                            <div className="relative inline-block mb-2">
                                {/* Radar Pulse Effect */}
                                <span className={`absolute inset-0 rounded-full animate-ping opacity-25 ${activeType === 'daily' ? 'bg-blue-500' : activeType === 'weekly' ? 'bg-purple-500' : 'bg-orange-500'}`}></span>
                                <span className={`relative flex items-center gap-2 px-4 py-1.5 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${activeType === 'daily' ? 'bg-blue-600' : activeType === 'weekly' ? 'bg-purple-600' : 'bg-red-600'}`}>
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                    Live Pool
                                </span>
                            </div>

                            <div className="relative py-2 pb-4">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-3 max-w-sm mx-auto xl:mx-0 leading-relaxed">
                                    {activeType === 'daily' ? (
                                        <>Compete daily for amazing rewards! Top <span className="font-bold text-blue-500 dark:text-blue-400">{config.QUIZ_CONFIG.DAILY_WINNER_COUNT}</span> PRO performers with <span className="font-bold text-blue-500 dark:text-blue-400">{config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT}</span> high-score quizzes share a dynamic prize pool every day.</>
                                    ) : activeType === 'weekly' ? (
                                        <>Compete weekly for amazing rewards! Top <span className="font-bold text-purple-600 dark:text-purple-400">{config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT}</span> PRO performers with <span className="font-bold text-purple-600 dark:text-purple-400">{config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT}</span> high-score quizzes share a dynamic prize pool every week.</>
                                    ) : (
                                        <>Compete monthly for amazing rewards! Top <span className="font-bold text-orange-600 dark:text-orange-400">{config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT}</span> PRO performers with <span className="font-bold text-orange-600 dark:text-orange-400">{config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT}</span> high-score quizzes share a dynamic prize pool every month.</>
                                    )}
                                </p>
                                <h3 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter flex items-center justify-center xl:justify-start">
                                    <span className={`text-transparent bg-clip-text bg-gradient-to-br leading-tight ${activeConfig.color}`}>
                                        ₹{currentPool.total.toLocaleString('en-IN')}
                                    </span>
                                </h3>
                                {/* Reflection effect Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/0 pointer-events-none mix-blend-overlay"></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center xl:justify-start gap-2 font-semibold">
                                <FaUsers className="text-gray-400" />
                                {activeType === 'daily' ? `Daily @ 10:00 PM • Top ${config.QUIZ_CONFIG.DAILY_WINNER_COUNT} Wins` :
                                    activeType === 'weekly' ? `Sundays @ 10:00 PM • Top ${config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT} Win` :
                                        `Monthly @ 10:00 PM • Top ${config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT} Win`}
                            </p>

                            <Link
                                href={isLandingPage ? "/register" : "/levels"}
                                className={`inline-flex items-center gap-3 px-5 lg:px-10 py-2.5 lg:py-5 text-white rounded-[1.5rem] font-black text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl bg-gradient-to-br ${activeConfig.color} ${activeConfig.glow} hover:brightness-110 border border-white/20`}
                            >
                                <FaTrophy className="text-white drop-shadow-sm" />
                                <span>{isLandingPage ? "START WINNING" : "COMPETE NOW"}</span>
                                <FaArrowRight className="text-white/80 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Section: Prize Distribution Grid */}
                    <div className="w-full xl:w-[450px]">
                        <div className="grid grid-cols-1 gap-3 relative">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-800 px-2">
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400">Awarded Positions</span>
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400">Winning Amount</span>
                            </div>

                            {currentPool.distribution.map((prize, idx) => {
                                const styles = getRankStyles(prize.rank || idx + 1);
                                return (
                                    <div
                                        key={idx}
                                        className={`group/rank relative flex items-center justify-between p-4 rounded-2xl border ${styles.border} ${styles.bg} transition-all duration-300 hover:translate-x-1 animate-stagger-fade-in overflow-hidden`}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        {/* Rank Accent Bar */}
                                        <div className={`absolute inset-y-0 left-0 w-1 ${styles.accent}`}></div>

                                        <div className="flex items-center gap-5">
                                            <span className="text-3xl filter drop-shadow-md transform transition-transform group-hover/rank:scale-110 duration-300">
                                                {styles.badge}
                                            </span>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 text-left">
                                                    Official Rank
                                                </div>
                                                <div className={`text-xl font-black ${styles.text} leading-none text-left`}>
                                                    #{prize.rank || idx + 1}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                Prize Amount
                                            </div>
                                            <div className="text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums leading-none">
                                                ₹{prize.amount.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Footnote */}
                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <FaFire className="text-orange-500" />
                        Live calculation based on {activeType} pro users
                    </div>
                    <div className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest animate-pulse">
                        Next reset: {activeType === 'daily' ? 'Tonight' : activeType === 'weekly' ? 'Sunday' : 'End of Month'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePrizePool;
