'use client';
/**
 * NearWinBanner
 * Shown when user is within 1-3 quizzes of qualifying for a competition reward.
 * Drives urgency and retention loop.
 *
 * Props:
 *   message — string from API: "2 more high-score quizzes to qualify!"
 *   type    — 'daily' | 'weekly' | 'monthly'
 *   onPlay  — optional callback to navigate to quiz list
 */
import { useState } from 'react';

const TYPE_STYLES = {
    daily:   'from-orange-600/20 to-yellow-500/10 border-orange-500/40 text-orange-300',
    weekly:  'from-blue-600/20 to-cyan-500/10 border-blue-500/40 text-blue-300',
    monthly: 'from-purple-600/20 to-indigo-500/10 border-purple-500/40 text-purple-300',
};

export default function NearWinBanner({ message, type = 'monthly', onPlay }) {
    const [dismissed, setDismissed] = useState(false);
    if (!message || dismissed) return null;

    const styles = TYPE_STYLES[type] || TYPE_STYLES.monthly;

    return (
        <div className={`flex items-center justify-between gap-3 bg-gradient-to-r ${styles} border rounded-xl px-4 py-3`}>
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl flex-shrink-0">🔥</span>
                <p className="text-sm font-semibold truncate">{message}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {onPlay && (
                    <button
                        onClick={onPlay}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 border border-white/20"
                    >
                        Play Now →
                    </button>
                )}
                <button
                    onClick={() => setDismissed(true)}
                    className="text-white/40 hover:text-white/80 text-lg leading-none transition-colors"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
