'use client';

import { useState, useEffect } from 'react';
import {
    Flame,
    Users,
    ArrowRight,
    Trophy,
    Calendar,
    Clock,
    Zap,
    Sparkles,
    TrendingUp,
    Award,
    IndianRupee
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
            <div className="w-full h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-700"></div>
        );
    }

    const currentPool = { ...prizepools[activeType] };
    const minPool = activeType === 'daily' ? config.QUIZ_CONFIG.MIN_DAILY_POOL :
        activeType === 'weekly' ? config.QUIZ_CONFIG.MIN_WEEKLY_POOL :
            config.QUIZ_CONFIG.MIN_MONTHLY_POOL;

    if (currentPool.total < minPool) {
        currentPool.total = minPool;
        currentPool.distribution = currentPool.distribution.map(d => ({
            ...d,
            amount: Math.round(minPool * (d.percentage / 100))
        }));
    }

    const types = [
        { id: 'daily', label: 'Daily', icon: Clock, color: 'from-primary-400 to-primary-600', glow: 'shadow-duo-secondary', accent: 'secondary' },
        { id: 'weekly', label: 'Weekly', icon: Zap, color: 'from-purple-500 to-purple-700', glow: 'shadow-duo-accent', accent: 'purple' },
        { id: 'monthly', label: 'Monthly', icon: Trophy, color: 'from-primary-400 to-primary-600', glow: 'shadow-duo-primary', accent: 'primary' }
    ];

    const activeConfig = types.find(t => t.id === activeType);

    const getRankStyles = (rank) => {
        if (rank === 1) return {
            bg: 'bg-primary-50 dark:bg-primary-900/10',
            border: 'border-primary-200 dark:border-primary-900/30 shadow-duo-primary',
            accent: 'bg-primary-500',
            text: 'text-primary-700 dark:text-primary-500 dark:text-primary-400',
            icon: <Award className="w-8 h-8 fill-current" />
        };
        if (rank === 2) return {
            bg: 'bg-slate-50 dark:bg-slate-400/10',
            border: 'border-slate-200 dark:border-slate-400/30 shadow-duo-secondary',
            accent: 'bg-slate-400',
            text: 'text-slate-600 dark:text-slate-300',
            icon: <Award className="w-8 h-8 fill-current opacity-70" />
        };
        if (rank === 3) return {
            bg: 'bg-amber-50 dark:bg-amber-900/10',
            border: 'border-amber-200 dark:border-amber-900/30 shadow-duo-accent',
            accent: 'bg-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            icon: <Award className="w-8 h-8 fill-current opacity-50" />
        };
        return {
            bg: 'bg-slate-50 dark:bg-slate-800/50',
            border: 'border-slate-100 dark:border-slate-700/50',
            accent: 'bg-slate-300 dark:bg-slate-600',
            text: 'text-slate-700 dark:text-slate-400',
            icon: <TrendingUp className="w-8 h-8" />
        };
    };

    return (
        <div className="relative group w-full mx-auto font-outfit">
            {/* Type Selector Tabs */}
            <div className="flex justify-center mb-8 relative z-20">
                <div className="flex gap-2 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-[1.8rem] border-2 border-slate-200/50 dark:border-slate-700/30 shadow-inner">
                    {types.map((type) => {
                        const Icon = type.icon;
                        const isActive = activeType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${isActive
                                    ? `bg-white dark:bg-slate-800 text-${type.accent === 'primary' ? 'primary' : type.accent === 'secondary' ? 'secondary' : 'purple'}-600 shadow-duo border-b-4 border-slate-100 dark:border-slate-700`
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 group'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                {type.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Prize Pool Container */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-white dark:bg-slate-900 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-2xl p-4 md:p-8 lg:p-12 transition-all duration-500 hover:border-primary-500/20">

                {/* Decorative Accents */}
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] rounded-full opacity-10 bg-gradient-to-br ${activeConfig.color} pointer-events-none`}></div>

                <div className="flex flex-col xl:flex-row items-center justify-between gap-16 relative z-10">

                    {/* Left Section */}
                    <div className="text-center xl:text-left flex-1 space-y-8">
                        <div className="flex flex-col items-center xl:items-start space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`absolute inset-0 rounded-full animate-ping opacity-25 bg-${activeConfig.accent === 'primary' ? 'primary' : activeConfig.accent === 'secondary' ? 'secondary' : 'purple'}-500`}></div>
                                    <div className={`relative w-3 h-3 rounded-full bg-${activeConfig.accent === 'primary' ? 'primary' : activeConfig.accent === 'secondary' ? 'secondary' : 'purple'}-500 shadow-lg`}></div>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] text-${activeConfig.accent === 'primary' ? 'primary' : activeConfig.accent === 'secondary' ? 'secondary' : 'purple'}-500`}>
                                    Live Prize Synchronization
                                </span>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-slate-900 dark:text-white uppercase font-outfit flex items-center justify-center xl:justify-start gap-2">
                                    <span className={`text-transparent bg-clip-text bg-gradient-to-br ${activeConfig.color} flex items-center gap-2`}>
                                        <IndianRupee className={`w-12 h-12 lg:w-20 lg:h-20 text-primary-500`} />{currentPool.total.toLocaleString('en-IN')}
                                    </span>
                                </h2>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 max-w-md mx-auto xl:mx-0 leading-relaxed uppercase tracking-widest">
                                    {activeType === 'daily' ? (
                                        <>Mission Alpha: Top core Users share the daily bounty pool through peak performance metrics.</>
                                    ) : activeType === 'weekly' ? (
                                        <>Sector Weekly: Master high-tier evaluations to synchronize with the weekly asset yield.</>
                                    ) : (
                                        <>Grand Matrix: The ultimate monthly objective for elite performers. Secure your rank among legends.</>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                            <Link href={isLandingPage ? "/register" : "/levels"}>
                                <button className={`inline-flex items-center gap-4 px-10 py-5 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-br ${activeConfig.color} ${activeConfig.glow} shadow-xl border-b-4 border-black/20`}>
                                    <Award className="w-5 h-5 fill-current" />
                                    <span>{isLandingPage ? "JOIN PROTOCOL" : "SECURE RANK"}</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </Link>

                            <div className="flex flex-col items-center sm:items-start">
                                <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Target Threshold</p>
                                <p className="text-xs font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{activeType === 'daily' ? 'DAILY 22:00 IST' : activeType === 'weekly' ? 'WEEKLY SUNDAY' : 'MONTHLY RESET'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Prize Grid */}
                    <div className="w-full xl:w-[480px] space-y-4">
                        <div className="flex items-center justify-between px-6 pb-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">Rank Protocol</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">Yield Amount</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {currentPool.distribution.slice(0, 4).map((prize, idx) => {
                                const styles = getRankStyles(prize.rank || idx + 1);
                                return (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ x: 6 }}
                                        className={`flex items-center justify-between p-6 rounded-[2rem] border-2 ${styles.border} ${styles.bg} transition-all`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${styles.text}`}>
                                                {styles.icon}
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">Rank Tier</p>
                                                <p className={`text-xl lg:text-2xl font-black ${styles.text} uppercase tracking-tighter font-outfit`}>
                                                    #{prize.rank || idx + 1}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">Asset Allocation</p>
                                            <p className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums uppercase tracking-tighter font-outfit">
                                                ₹{prize.amount.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footnote */}
                <div className="mt-12 pt-8 border-t-2 border-slate-50 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                            <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <p className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">
                            Network Active: Synchronizing live with {activeType} Users
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <p className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest animate-pulse">
                            Node Reset: {activeType === 'daily' ? 'Tonight' : activeType === 'weekly' ? 'Sunday Cycle' : 'End of Cycle'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePrizePool;


