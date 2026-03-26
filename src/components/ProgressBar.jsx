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
    orange: 'bg-gradient-to-r from-orange-500 to-yellow-400',
    blue:   'bg-gradient-to-r from-blue-500 to-cyan-400',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-400',
    green:  'bg-gradient-to-r from-green-500 to-emerald-400',
    red:    'bg-gradient-to-r from-red-500 to-orange-400',
};

const HEIGHT_MAP = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
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
    const barColor   = COLOR_MAP[color] || COLOR_MAP.purple;
    const barHeight  = HEIGHT_MAP[height] || HEIGHT_MAP.md;

    return (
        <div className={`w-full ${className}`}>
            <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${barHeight}`}>
                <div
                    className={`${barHeight} ${barColor} rounded-full ${animate ? 'transition-all duration-700 ease-out' : ''}`}
                    style={{ width: `${clampedPct}%` }}
                    role="progressbar"
                    aria-valuenow={clampedPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">0%</span>
                    <span className="text-xs font-bold text-white">{clampedPct}%</span>
                    <span className="text-xs text-gray-500">100%</span>
                </div>
            )}
        </div>
    );
}
