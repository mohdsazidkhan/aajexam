'use client';
/**
 * ProgressBar
 * Animated progress bar with label and color variants.
 * Props:
 *   percent  Ã¢â‚¬â€ 0-100
 *   color    Ã¢â‚¬â€ 'orange' | 'blue' | 'purple' | 'green'
 *   showLabel Ã¢â‚¬â€ bool
 *   height   Ã¢â‚¬â€ 'sm' | 'md' | 'lg'
 */

const COLOR_MAP = {
    orange: 'bg-primary-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]',
    blue: 'bg-primary-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]',
    purple: 'bg-purple-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]',
    green: 'bg-emerald-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]',
    red: 'bg-rose-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]',
};

const HEIGHT_MAP = {
    sm: 'h-2',
    lg: 'h-4',
    lg: 'h-6',
};

export default function ProgressBar({
    percent = 0,
    color = 'purple',
    showLabel = false,
    height = 'md',
    className = '',
    animate = true,
}) {
    const clampedPct = Math.min(100, Math.max(0, percent));
    const barColor = COLOR_MAP[color] || COLOR_MAP.purple;
    const barHeight = HEIGHT_MAP[height] || HEIGHT_MAP.md;

    return (
        <div className={`w-full ${className} font-outfit`}>
            <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${barHeight} shadow-inner border-2 border-slate-200 dark:border-slate-700`}>
                <div
                    className={`${barHeight} ${barColor} rounded-full ${animate ? 'transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)' : ''} border-r-4 border-white/20`}
                    style={{ width: `${clampedPct}%` }}
                    role="progressbar"
                    aria-valuenow={clampedPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between mt-2 px-1">
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">0%</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">{clampedPct}% COMPLETED</span>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">100%</span>
                </div>
            )}
        </div>
    );
}


