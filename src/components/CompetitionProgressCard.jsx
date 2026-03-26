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
    daily:   { label: 'Today',      icon: '☀️', color: 'from-orange-500 to-yellow-400',  ring: 'ring-orange-400' },
    weekly:  { label: 'This Week',  icon: '📅', color: 'from-blue-500 to-cyan-400',      ring: 'ring-blue-400'   },
    monthly: { label: 'This Month', icon: '🏆', color: 'from-purple-600 to-indigo-400',  ring: 'ring-purple-400' },
};

export default function CompetitionProgressCard({ type = 'monthly', className = '' }) {
    const [data, setData]       = useState(null);
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
        <div className={`relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl ${className}`}>
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${cfg.color} p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{cfg.icon}</span>
                        <div>
                            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Competition</p>
                            <p className="text-white text-lg font-bold">{cfg.label}</p>
                        </div>
                    </div>
                    {rewardEligible && (
                        <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                            ✅ Eligible
                        </span>
                    )}
                    {hoursLeft !== null && hoursLeft <= 12 && !rewardEligible && (
                        <span className="bg-red-500/80 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            ⏰ {hoursLeft}h left
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Near-win banner */}
                {nearWin && <NearWinBanner message={nearWinMessage} type={type} />}

                {/* Progress bar */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Progress to eligibility</span>
                        <span className="text-white text-sm font-bold">
                            {highScoreWins}/{threshold}
                            <span className="text-gray-500 font-normal"> high scores</span>
                        </span>
                    </div>
                    <ProgressBar
                        percent={progressPercent}
                        color={type === 'daily' ? 'orange' : type === 'weekly' ? 'blue' : 'purple'}
                        showLabel
                    />
                    {!rewardEligible && quizzesRemaining > 0 && (
                        <p className="text-gray-500 text-xs mt-1">
                            {quizzesRemaining} more quiz{quizzesRemaining > 1 ? 'zes' : ''} to qualify
                        </p>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                    <StatBox label="Attempts" value={totalAttempts} />
                    <StatBox label="Accuracy" value={`${accuracy}%`} highlight={accuracy >= 70} />
                    <StatBox label="Level" value={currentLevel} sub={levelName} />
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, sub, highlight }) {
    return (
        <div className="bg-gray-800 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</p>
            {sub && <p className="text-purple-400 text-xs">{sub}</p>}
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
        </div>
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
