'use client';
/**
 * ProgressBar
 * Animated progress bar with label and color variants.
 * Props:
 *   percent  — 0-100
 *   color    — 'orange' | 'blue' | 'purple' | 'green'
 *   showLabel — bool
 *   height   — 'sm' | 'md' | 'lg'
 */

const COLOR_MAP = {
    orange: 'bg-primary-600',
    blue: 'bg-primary-600',
    purple:'bg-primary-600',
    green: 'bg-primary-600',
    red:'bg-primary-600',
};

const HEIGHT_MAP = {
    sm: 'h-2',
    xl: 'h-4',
    xl: 'h-6',
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
            <div className={`w-full bg-background-surface-secondary rounded-full overflow-hidden ${barHeight} border border-border-primary`}>
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
                    <span className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em]">0%</span>
                    <span className="text-xs font-bold text-content-secondary">{clampedPct}% COMPLETED</span>
                    <span className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em]">100%</span>
                </div>
            )}
        </div>
    );
}


