'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, ShieldAlert, Zap, Loader2, CircleCheck, TriangleAlert } from 'lucide-react';
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
            ? `Preview ${type} reset? This is a safe simulation — no data will be changed.`
            : `Are you sure you want to run a live ${type} reset? This will save current standings, then clear all ${type} progress and attempts. This action cannot be undone.`;

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
                setError(data.message || 'Reset failed. Please try again or check the server logs.');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please check your connection and try again.');
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
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-700 dark:text-primary-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        <ShieldAlert className="w-3 h-3" /> LIVE — Changes Apply
                    </span>
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>

            <div className="flex items-center gap-2 text-xs font-medium text-primary-700 dark:text-primary-400 mb-2 bg-primary-50 dark:bg-primary-900/20 w-fit px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Scheduled: {schedules[type]} ({config.CRON_CONFIG.TIMEZONE})
            </div>

            <p className="text-sm text-slate-700 dark:text-gray-400 mb-6 flex-grow">{description}</p>

            <button
                onClick={() => handleReset(type)}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${loading
                    ? 'bg-gray-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 cursor-not-allowed'
                    : dryRun
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                    }`}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {dryRun ? `Preview ${title}` : `Execute ${title}`}
            </button>
        </div>
    );


    return (
        <AdminMobileAppWrapper title="Manage Resets">
            <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
                {user?.role === 'admin' && isAdminRoute && <Sidebar />}
                <div className="adminContent p-2 lg:p-6 w-full text-gray-900 dark:text-white">
                    <div className="mx-auto max-w-6xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-8">
                            <div>
                                <h1 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                    <Calendar className="w-8 h-8 text-primary-700 dark:text-primary-500" />
                                    Competition Reset Manager
                                </h1>
                                <p className="text-slate-700 dark:text-gray-400 mt-1">
                                    Trigger competition resets and manage historical data preservation.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setDryRun(true)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${dryRun ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-500 shadow-sm' : 'text-slate-700 dark:text-gray-400 hover:text-gray-700'
                                        }`}
                                >
                                    Dry Run (Preview)
                                </button>
                                <button
                                    onClick={() => setDryRun(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!dryRun ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 dark:text-gray-400 hover:text-red-500'
                                        }`}
                                >
                                    Live Reset (Execute)
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 lg:mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                                <TriangleAlert className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {result && (
                            <div className="mb-4 lg:mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-4">
                                    <CircleCheck className="w-6 h-6" />
                                    <h2 className="text-lg font-bold">Reset Completed Successfully</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-black">Reset Type</div>
                                        <div className="text-lg font-bold">{result.type}</div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-black">Winners</div>
                                        <div className="text-lg font-bold">{result.winnersCount || result.winners?.length || 0}</div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-black">Records Saved</div>
                                        <div className="text-lg font-bold">{result.savedCount || 'N/A'}</div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-black">Mode</div>
                                        <div className="text-lg font-bold">{result.isDryRun ? 'Preview Only' : 'Applied'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                            <ResetCard
                                title="Daily Reset"
                                type="daily"
                                description="Saves today's standings to history, awards top performers, then clears all daily progress and attempts."
                                icon={Zap}
                                color="amber"
                            />
                            <ResetCard
                                title="Weekly Reset"
                                type="weekly"
                                description="Saves this week's standings to history, awards top performers, then clears all weekly progress and attempts."
                                icon={Calendar}
                                color="blue"
                            />
                            <ResetCard
                                title="Monthly Reset"
                                type="monthly"
                                description="Full reset: saves monthly standings to history, then clears all levels, quiz records, and monthly progress."
                                icon={ShieldAlert}
                                color="purple"
                            />
                        </div>

                        {!dryRun && (
                            <div className="mt-4 lg:mt-8 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-200 dark:border-red-800 rounded-2xl">
                                <h3 className="text-red-800 dark:text-red-300 font-black flex items-center gap-2 mb-2">
                                    <TriangleAlert className="w-5 h-5" /> Caution — Live Mode Active
                                </h3>
                                <p className="text-sm text-primary-700 dark:text-red-400/80 leading-relaxed font-medium">
                                    Live resets cannot be undone. Always preview results with Dry Run first to verify winners before executing.
                                    Your data is protected by safe transactions — if saving historical records fails, the reset will be cancelled automatically.
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


