'use client';
/**
 * NearWinBanner
 * Shown when user is within 1-3 quizzes of qualifying for a competition reward.
 * Drives urgency and retention loop.
 *
 * Props:
 *   message Ã¢â‚¬â€ string from API: "2 more high-score quizzes to qualify!"
 *   type    Ã¢â‚¬â€ 'daily' | 'weekly' | 'monthly'
 *   onPlay  Ã¢â‚¬â€ optional callback to navigate to quiz list
 */
import { useState } from 'react';

const TYPE_STYLES = {
    daily:   'bg-white dark:bg-slate-900 border-rose-500 text-rose-500 shadow-rose-200/50 dark:shadow-rose-900/20',
    weekly:  'bg-white dark:bg-slate-900 border-primary-500 text-primary-700 dark:text-primary-500 shadow-primary-200/50 dark:shadow-primary-900/20',
    monthly: 'bg-white dark:bg-slate-900 border-primary-500 text-primary-700 dark:text-primary-500 shadow-primary-200/50 dark:shadow-primary-900/20',
};

export default function NearWinBanner({ message, type = 'monthly', onPlay }) {
    const [dismissed, setDismissed] = useState(false);
    if (!message || dismissed) return null;

    const styles = TYPE_STYLES[type] || TYPE_STYLES.monthly;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 border-4 border-b-[12px] rounded-[2.5rem] px-8 py-6 shadow-2xl ${styles} animate-bounce-in relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="flex items-center gap-6 min-w-0 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-3xl shadow-duo border-2 border-slate-100 dark:border-slate-700 rotate-3 group-hover:rotate-6 transition-transform">
                    {type === 'daily' ? 'Ã°Å¸â€Â¥' : type === 'weekly' ? 'Ã¢Å¡Â¡' : 'Ã°Å¸â€™Å½'}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Mission Alert</span>
                    <p className="text-sm lg:text-base font-black uppercase tracking-tight leading-none truncate">{message}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0 relative z-10 w-full sm:w-auto">
                {onPlay && (
                    <button
                        onClick={onPlay}
                        className="flex-1 sm:flex-none bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl shadow-duo-primary border-b-4 border-primary-700 transition-all active:translate-y-1 active:border-b-0 whitespace-nowrap"
                    >
                        Continue Training
                    </button>
                )}
                <button
                    onClick={() => setDismissed(true)}
                    className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-b-4 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-all active:translate-y-1 shadow-sm"
                    aria-label="Dismiss"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}


