'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, ShieldAlert, Zap, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Sidebar from '../../Sidebar';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import { useSSR } from '../../../hooks/useSSR';
import config from '@/lib/config/appConfig';
import { Clock } from 'lucide-react';

const AdminCompetitionResets = () => {
    const { router } = useSSR();
    const [loading, setLoading] = useState(false);
    const [dryRun, setDryRun] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const schedules = {
        daily: config.CRON_CONFIG.DAILY_RESET,
        weekly: config.CRON_CONFIG.WEEKLY_RESET,
        monthly: config.CRON_CONFIG.MONTHLY_RESET
    };

    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
    const isOpen = useSelector((state) => state.sidebar.isOpen);

    const handleReset = async (type) => {
        const confirmMsg = dryRun
            ? `Run a DRY RUN reset for ${type}? No data will be modified.`
            : `WARNING: This will PERMANENTLY reset all ${type} progress and clear attempts. Are you sure?`;

        if (!confirm(confirmMsg)) return;

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch('/api/admin/competition-resets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, dryRun })
            });

            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                setError(data.message || 'Failed to trigger reset');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const ResetCard = ({ title, type, description, icon: Icon, color }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
                {!dryRun && (
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        <ShieldAlert className="w-3 h-3" /> LIVE MODE
                    </span>
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>

            <div className="flex items-center gap-2 text-xs font-medium text-secondary-600 dark:text-secondary-400 mb-2 bg-secondary-50 dark:bg-secondary-900/20 w-fit px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Auto: {schedules[type]} ({config.CRON_CONFIG.TIMEZONE})
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow">{description}</p>

            <button
                onClick={() => handleReset(type)}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${loading
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : dryRun
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                    }`}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {dryRun ? `Simulate ${title}` : `RUN ${title}`}
            </button>
        </div>
    );


    return (
        <AdminMobileAppWrapper title="Manage Resets">
            <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
                {user?.role === 'admin' && isAdminRoute && <Sidebar />}
                <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
                    <div className="mx-auto max-w-6xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                    <Calendar className="w-8 h-8 text-secondary-600" />
                                    Competition Reset Manager
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Manually trigger competition resets and historical data preservation.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setDryRun(true)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${dryRun ? 'bg-white dark:bg-gray-700 text-secondary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Dry Run (Safe)
                                </button>
                                <button
                                    onClick={() => setDryRun(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!dryRun ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-red-500'
                                        }`}
                                >
                                    Live Reset
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {result && (
                            <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-4">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <h2 className="text-lg font-bold">Reset Successfully Triggered!</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-black">Period</div>
                                        <div className="text-lg font-bold">{result.type}</div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-black">Winners</div>
                                        <div className="text-lg font-bold">{result.winnersCount || result.winners?.length || 0}</div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-black">Snapshots</div>
                                        <div className="text-lg font-bold">{result.savedCount || 'N/A'}</div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-black">Mode</div>
                                        <div className="text-lg font-bold">{result.isDryRun ? 'Simulation' : 'Live'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ResetCard
                                title="Daily Reset"
                                type="daily"
                                description="Clears daily progress, saves snapshots to PrevDailyPlayedUsers, and awards top performers."
                                icon={Zap}
                                color="amber"
                            />
                            <ResetCard
                                title="Weekly Reset"
                                type="weekly"
                                description="Clears weekly progress, saves snapshots to PrevWeeklyPlayedUsers, and resets weekly competition."
                                icon={Calendar}
                                color="blue"
                            />
                            <ResetCard
                                title="Monthly Reset"
                                type="monthly"
                                description="Full system reset: Levels, quiz records, and monthly progress. Preservation in PrevMonthPlayedUsers."
                                icon={ShieldAlert}
                                color="purple"
                            />
                        </div>

                        {!dryRun && (
                            <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-200 dark:border-red-800 rounded-2xl">
                                <h3 className="text-red-800 dark:text-red-300 font-black flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5" /> DANGER ZONE
                                </h3>
                                <p className="text-sm text-primary-600/80 dark:text-red-400/80 leading-relaxed font-medium">
                                    Live resets are irreversible. Ensure you have verified the potential winners using **Dry Run** mode before proceeding.
                                    Data is protected by database transactions: if the historical snapshot fails, the reset will NOT proceed.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminMobileAppWrapper>
    );
};

export default AdminCompetitionResets;
