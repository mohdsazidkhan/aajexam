'use client';
/**
 * CompetitionProgressCard
 * Shows daily/weekly/monthly progress toward reward eligibility.
 * Data source: GET /api/competition/progress?type=daily|weekly|monthly
 */
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import NearWinBanner from './NearWinBanner';
import ProgressBar from './ProgressBar';

const TYPE_CONFIG = {
    daily: { label: 'Today', icon: 'Ã¢Ëœâ‚¬Ã¯Â¸Â', color: 'from-primary-500 to-primary-400', ring: 'ring-primary-400' },
    weekly: { label: 'This Week', icon: 'Ã°Å¸â€œâ€¦', color: 'from-primary-500 to-cyan-400', ring: 'ring-primary-400' },
    monthly: { label: 'This Month', icon: 'Ã°Å¸Ââ€ ', color: 'from-purple-600 to-indigo-400', ring: 'ring-purple-400' },
};

export default function CompetitionProgressCard({ type = 'monthly', className = '' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        try {
            const res = await axios.get(`/api/competition/progress?type=${type}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setData(res.data.data);
        } catch (e) {
            console.error('CompetitionProgressCard fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => { fetch(); }, [fetch]);

    const cfg = TYPE_CONFIG[type];

    if (loading) return <CompetitionProgressSkeleton />;
    if (!data) return null;

    const {
        highScoreWins, totalAttempts, accuracy, progressPercent,
        quizzesRemaining, threshold, rewardEligible, nearWin, nearWinMessage,
        currentLevel, levelName, periodEndsAt
    } = data;

    const hoursLeft = periodEndsAt
        ? Math.max(0, Math.round((new Date(periodEndsAt) - new Date()) / 3_600_000))
        : null;

    return (
        <div className={`relative bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 overflow-hidden shadow-duo-primary ${className} group`}>
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${cfg.color} p-6 relative overflow-hidden`}>
                {/* Decorative Pattern */}
                <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none -skew-x-12 translate-x-12" />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner-duo">
                            {cfg.icon}
                        </div>
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Competition Protocol</p>
                            <p className="text-white text-xl font-black font-outfit uppercase tracking-tighter">{cfg.label}</p>
                        </div>
                    </div>
                    {rewardEligible ? (
                        <div className="bg-white/95 dark:bg-slate-900/90 text-primary-700 dark:text-primary-500 text-[10px] font-black px-4 py-2 rounded-xl border-b-4 border-slate-200 dark:border-slate-800 uppercase tracking-widest flex items-center gap-1.5 shadow-pop-in">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                            ELIGIBLE
                        </div>
                    ) : (
                        hoursLeft !== null && hoursLeft <= 12 && (
                            <div className="bg-rose-500 text-white text-[10px] font-black px-4 py-2 rounded-xl border-b-4 border-rose-700 uppercase tracking-widest animate-pulse">
                                Ã¢ÂÂ° {hoursLeft}H LEFT
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Near-win banner */}
                {nearWin && <NearWinBanner message={nearWinMessage} type={type} />}

                {/* Progress bar section */}
                <div className="space-y-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Eligibility Meter</p>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Mission Mastery Progress</h4>
                        </div>
                        <div className="text-right">
                            <span className="text-xl lg:text-2xl font-black text-primary-700 dark:text-primary-500 font-outfit">{highScoreWins}</span>
                            <span className="text-sm font-black text-slate-300 dark:text-slate-600 mx-1">/</span>
                            <span className="text-sm font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{threshold} UNITS</span>
                        </div>
                    </div>

                    <div className="relative h-6 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden border-b-4 border-black/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${cfg.color} rounded-full`}
                        />
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-white/10 opacity-30 skew-x-[45deg] animate-pulse" />
                    </div>

                    {!rewardEligible && quizzesRemaining > 0 && (
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">
                            Initiate <span className="text-primary-700 dark:text-primary-500">{quizzesRemaining}</span> operational units to synchronize
                        </p>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <StatBox label="Questions" value={totalAttempts} color="blue" />
                    <StatBox label="Precision" value={`${accuracy}%`} color={accuracy >= 70 ? 'green' : 'amber'} highlight={accuracy >= 70} />
                    <StatBox label="Protocol" value={currentLevel} color="purple" sub={levelName} />
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, sub, highlight, color = 'blue' }) {
    const colors = {
        blue: 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-500 border-primary-200 dark:border-primary-900/30',
        green: 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-500 border-primary-200 dark:border-primary-900/30',
        purple: 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 border-purple-200 dark:border-purple-900/30',
        amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-amber-200 dark:border-amber-900/30'
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`${colors[color]} rounded-3xl p-5 border-2 border-b-6 flex flex-col items-center justify-center text-center transition-all`}
        >
            <span className="text-xl font-black font-outfit uppercase tracking-tighter">{value}</span>
            {sub && <p className="text-[8px] font-black uppercase tracking-widest opacity-70 truncate w-full">{sub}</p>}
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">{label}</p>
        </motion.div>
    );
}

function CompetitionProgressSkeleton() {
    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden animate-pulse">
            <div className="h-20 bg-gray-800" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded" />
                <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map(i => <div key={i} className="h-16 bg-gray-800 rounded-xl" />)}
                </div>
            </div>
        </div>
    );
}


