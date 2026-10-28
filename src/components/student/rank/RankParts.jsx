/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
import { Trophy, Crown, Flame, Target, ChevronRight, MapPin, Clock } from 'lucide-react';
import { m as motion } from 'framer-motion';
import Link from '@/components/common/AppLink';
import { useSelector } from 'react-redux';
import { ProBadge } from '../../common/ui';
import { formatTimeExact } from '../../../lib/utils/timeFormat';
import useTranslate from '../../../hooks/useTranslate';
import SearchableSelect from '../../common/SearchableSelect';
import { RANK_SORT_OPTIONS } from '../../../lib/utils/rankSort';

// Shared by All India Rank, State Rank and City Rank so the three pages stay visually identical.
// ─── "Rank based on" dropdown (value is the ?sort= key understood by rankSort.js) ───
export { RANK_SORT_OPTIONS };

export const RankSortSelect = ({ value, onChange }) => {
  const { translate } = useTranslate();
  return (
    <SearchableSelect
      prefix={translate('Rank Based on')}
      value={value}
      onChange={onChange}
      options={RANK_SORT_OPTIONS.map((o) => ({ value: o.value, label: translate(o.label) }))}
      placeholder={translate('Rank Based on')}
      className="ring-2 ring-primary-400/60 border-primary-500"
    />
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`container mx-auto animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg xl:rounded-xl ${className}`} />
);

export const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-background-surface rounded-2xl border border-border-primary">
        <Sh className="w-8 h-8 rounded-full flex-shrink-0" />
        <Sh className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Sh className="h-3.5 w-2/5 rounded" />
          <Sh className="h-2.5 w-1/4 rounded" />
        </div>
        <Sh className="w-14 h-6 rounded-full" />
      </div>
    ))}
  </div>
);

// ─── Rank visual config ────────────────────────────────────────────────────────
const rankConfig = {
  1: { gradient: 'bg-amber-600', ringColor: 'ring-amber-300', textColor: 'text-amber-600 dark:text-amber-400', accent: 'border-l-amber-400', badgeText: 'text-amber-950', rowBg: 'border-amber-300 dark:border-primary-500/50 bg-background-surface' },
  2: { gradient: 'bg-background-surface', ringColor: 'ring-slate-200', textColor: 'text-content-muted', accent: 'border-l-slate-400', badgeText: 'text-content-primary', rowBg: 'border-border-primary dark:border-slate-400/50 bg-background-surface' },
  3: { gradient: 'bg-orange-600', ringColor: 'ring-orange-300', textColor: 'text-orange-600 dark:text-orange-400', accent: 'border-l-orange-400', badgeText: 'text-orange-950', rowBg: 'border-orange-300 dark:border-orange-500/50 bg-background-surface' },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['bg-primary-600', 'bg-blue-600', 'bg-rose-600', 'bg-amber-600', 'bg-violet-600', 'bg-cyan-600', 'bg-orange-600', 'bg-emerald-600'];

const Avatar = ({ entry, size = 'md', ring = false }) => {
  const liteMode = useSelector((s) => s.display?.liteMode);
  const sizes = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base', xl: 'w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg' };
  const initial = ((entry?.name || entry?.username) || 'A').charAt(0).toUpperCase();
  const colorIdx = initial.charCodeAt(0) % AVATAR_COLORS.length;
  const rc = rankConfig[entry?.rank];
  const ringClass = ring && rc ? `ring-2 ${rc.ringColor} ` : '';

  return entry?.profilePicture && !liteMode ? (
    <img src={entry.profilePicture} alt={entry.name || 'User'} className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${ringClass}`} />
  ) : (
    <div className={`${sizes[size]} ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${ringClass}`}>
      {initial}
    </div>
  );
};

// ─── Top 3 Podium ─────────────────────────────────────────────────────────────
export const Podium = ({ top3, currentUserId }) => {
  const { translate } = useTranslate();
  // #1, #2, #3 left to right, equal-height steps with a small gap between them.
  // NB: the step deliberately has no `rounded-*` class — styles/index.css forces every [class*="rounded"]
  // to a flat 8px radius with !important, which would round the bottom corners too.
  const ordered = [top3[0], top3[1], top3[2]].filter(Boolean);
  const stepH = { 1: 'h-9 sm:h-10', 2: 'h-9 sm:h-10', 3: 'h-9 sm:h-10' }; // equal-height steps

  return (
    <div className="flex items-end justify-center gap-1.5 sm:gap-2 pt-0 px-2">
      {ordered.map((entry) => {
        if (!entry) return null;
        const isMe = String(entry.userId) === String(currentUserId);
        const isFirst = entry.rank === 1;
        const rc = rankConfig[entry.rank];

        return (
          <Link href={entry.username ? `/@${entry.username}` : '#'} key={entry.rank}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * entry.rank, type: 'spring', stiffness: 120 }}
              className="flex flex-col items-center gap-0.5"
            >
              {isFirst && <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-bounce" />}
              <Avatar entry={entry} size="lg" ring />
              {isMe && <span className="text-[9px] font-bold uppercase bg-background-surface text-primary-600 px-1.5 py-0.5 rounded-full">{translate('You')}</span>}
              <div className="text-center w-[76px] sm:w-24 px-1 mt-1.5 mb-1">
                <p className="text-[10px] sm:text-[11px] font-bold leading-tight break-words text-white">
                  {entry.name || entry.username || translate('User')}
                </p>
              </div>
              <div className={`w-[76px] sm:w-24 ${stepH[entry.rank] || 'h-9'} ${rc?.gradient || 'bg-border-secondary'} flex flex-col items-center justify-center`} style={{ borderRadius: '8px 8px 0 0' }}>
                <span className={`font-bold text-xs sm:text-sm leading-none ${rc?.badgeText || 'text-white'}`}>#{entry.rank}</span>
                <span className={`mt-0.5 text-[9px] sm:text-[10px] font-bold uppercase leading-none opacity-80 ${rc?.badgeText || 'text-white'}`}>{formatTimeExact(entry.totalTimeSpent, 'exam')}</span>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
};

// ─── Shared table column template (desktop only; mobile uses a stacked card) ──
export const TABLE_GRID_COLS = 'grid-cols-[40px_1fr_130px_84px_84px_84px_84px_84px_84px_20px]';

// ─── List Row — table row on desktop (lg+), stacked card on mobile ────────────
export const LeaderboardRow = ({ entry, index, currentUserId }) => {
  const { translate, translateData } = useTranslate();
  const rc = rankConfig[entry.rank];
  const isMe = String(entry.userId) === String(currentUserId);
  const isTop3 = entry.rank <= 3;

  const rankBadge = (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs
      ${isTop3 ? `${rc.gradient} ${rc.badgeText} ring-2 ring-white/70 dark:ring-white/10` : 'bg-background-surface-secondary text-content-muted'}`}>
      {entry.rank}
    </div>
  );

  const identity = (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <p className={`text-sm font-bold truncate leading-tight ${isMe ? 'text-violet-800 dark:text-violet-200' : 'text-content-primary'}`}>
          {entry.name || entry.username || translate('Anonymous')}
        </p>
        {isMe && <span className="text-[9px] font-bold uppercase bg-violet-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{translate('You')}</span>}
        {entry.subscriptionStatus === 'PRO' && <ProBadge size="xs" className="flex-shrink-0" />}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {entry.username && <p className="text-[10px] font-bold text-content-muted/80 truncate">@{entry.username}</p>}
        {entry.city && (
          <span className="text-[10px] font-bold text-primary-600 truncate flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />{entry.city}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index * 0.025, 0.5) }}>
      <Link href={entry.username ? `/@${entry.username}` : '#'}>
        {/* ── Desktop: table row ── */}
        <div className={`hidden xl:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 py-3 rounded-2xl border transition-all group cursor-pointer
          ${isTop3 ? rc.rowBg : isMe ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/15' : 'border-border-primary bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'} ${isTop3 ? `border-l-4 ${rc.accent}` : ''} ${isMe && isTop3 ? 'ring-2 ring-violet-500' : ''}`}>
          {rankBadge}
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar entry={entry} size="md" />
            {identity}
          </div>
          <p className="text-xs font-bold text-content-primary text-center flex items-center justify-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 text-content-muted shrink-0" />{formatTimeExact(entry.totalTimeSpent, 'exam')}
          </p>
          <p className="text-xs font-bold text-content-primary text-center flex items-center justify-center gap-1">
            <Target className="w-3 h-3 text-content-muted" />{entry.totalExams}
          </p>
          <p className="text-xs font-bold text-content-primary text-center">{entry.totalMarks ?? 0}</p>
          <p className="text-xs font-bold text-content-primary text-center">{entry.totalCorrect ?? 0}</p>
          <p className="text-xs font-bold text-content-primary text-center">{entry.totalScore ?? 0}</p>
          <p className={`text-sm font-bold text-center ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgAccuracy}%</p>
          <p className="text-sm font-bold text-center text-content-primary">{entry.avgPercentage}%</p>
          <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>

        {/* ── Mobile: stacked card — every stat carries its own heading ── */}
        <div className={`flex xl:hidden flex-col gap-3 px-3.5 py-3 rounded-2xl border transition-all group cursor-pointer
          ${isTop3 ? rc.rowBg : isMe ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/15' : 'border-border-primary bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'} ${isTop3 ? `border-l-4 ${rc.accent}` : ''} ${isMe && isTop3 ? 'ring-2 ring-violet-500' : ''}`}>
          <div className="flex items-center gap-3">
            {rankBadge}
            <Avatar entry={entry} size="md" />
            <div className="flex-1 min-w-0">
              {identity}
              {entry.currentStreak > 0 && (
                <span className="text-[10px] font-bold text-content-primary flex items-center gap-1 mt-0.5">
                  <Flame className="w-3 h-3" />{translate('{count} day streak', { count: entry.currentStreak })}
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[9px] font-bold text-content-muted uppercase tracking-wide leading-tight">{translate('Time Spent')}</p>
              <p className="text-sm font-bold text-content-primary">{formatTimeExact(entry.totalTimeSpent, 'exam')}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-content-muted uppercase tracking-wide">{translate('Exams')}</p>
              <p className="text-sm font-bold text-content-primary">{entry.totalExams}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-content-muted uppercase tracking-wide">{translate('Marks')}</p>
              <p className="text-sm font-bold text-content-primary">{entry.totalMarks ?? 0}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-content-muted uppercase tracking-wide">{translate('Correct')}</p>
              <p className="text-sm font-bold text-content-primary">{entry.totalCorrect ?? 0}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-content-muted uppercase tracking-wide">{translate('Score')}</p>
              <p className="text-sm font-bold text-content-primary">{entry.totalScore ?? 0}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-content-muted uppercase tracking-wide">{translate('Accuracy')}</p>
              <p className={`text-sm font-bold ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgAccuracy}%</p>
              <div className="mt-1 h-1 rounded-full bg-background-surface-secondary overflow-hidden"><div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, Math.max(0, entry.avgAccuracy || 0))}%` }} /></div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-content-muted uppercase tracking-wide">{translate('Avg Score')}</p>
              <p className="text-sm font-bold text-content-primary">{entry.avgPercentage}%</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── My Rank Sticky Card ──────────────────────────────────────────────────────
export const MyRankCard = ({ entry, totalUsers }) => {
  const { translate } = useTranslate();
  if (!entry) return null;
  const topPct = totalUsers > 0 ? Math.max(1, Math.ceil((entry.rank / totalUsers) * 100)) : null;
  const chips = [
    { label: translate('Exams'), value: entry.totalExams },
    { label: translate('Accuracy'), value: `${entry.avgAccuracy}%` },
    { label: translate('Avg Score'), value: `${entry.avgPercentage}%` },
    { label: translate('Time Spent'), value: formatTimeExact(entry.totalTimeSpent, 'exam') },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4 z-30 px-1">
      <div className="relative overflow-hidden rounded-2xl text-on-primary px-3 py-2 bg-primary-600">
        <Trophy className="pointer-events-none absolute -right-2 -bottom-4 w-20 h-20 text-white/10" />
        {/* One row on desktop (rank · avatar · name · top % · stats); wraps on small screens */}
        <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex items-baseline gap-1.5 rounded-xl px-2.5 py-1 ring-1 ring-white/30">
            <span className="text-sm sm:text-base font-bold uppercase tracking-wide text-white">{translate('Your Rank')}</span>
            <span className="text-xl sm:text-2xl font-bold leading-none text-primary-200">#{entry.rank}</span>
          </div>
          <Avatar entry={entry} size="sm" />
<div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-bold truncate leading-tight">{entry.name || entry.username}</p>
              {entry.subscriptionStatus === 'PRO' && <ProBadge size="xs" className="flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {entry.username && <p className="text-[10px] font-bold text-white/80 truncate">@{entry.username}</p>}
              {topPct !== null && (
                <p className="text-[10px] font-bold text-primary-200 whitespace-nowrap">{translate('Top {percent}% of {total} ranked students', { percent: topPct, total: totalUsers })}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 xl:ml-auto">
            {chips.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-1 rounded-full ring-1 ring-white/30 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-white">
                <span className="text-white/90">{c.label}</span>
                <span className="font-bold text-primary-200">{c.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

