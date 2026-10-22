/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Crown, Flame, Target, TrendingUp,
  Star, Zap, ChevronRight, Users, RefreshCw, FileText, BrainCircuit, Clock, MapPin, Sparkles
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/common/AppLink';
import API from '../../lib/api';
import Seo from '../../components/common/Seo';
import { getCurrentUser } from '../../lib/utils/authUtils';
import { formatTimeSpent } from '../../lib/utils/timeFormat';
import useTranslate from '../../hooks/useTranslate';
import Pagination from '../../components/common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../lib/constants/pagination';
import useRequireLogin from '../../hooks/useRequireLogin';
import { ProBadge } from '../../components/common/ui';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`container mx-auto animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg xl:rounded-xl ${className}`} />
);

const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-background-surface rounded-2xl border-2 border-slate-200 dark:border-slate-800">
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

// ─── Period Tabs ───────────────────────────────────────────────────────────────
const PERIODS = [
  { id: 'all-time', label: 'All Time', icon: Crown },
  { id: 'monthly', label: 'This Month', icon: Star },
  { id: 'weekly', label: 'This Week', icon: Zap },
];

// ─── Rank visual config ────────────────────────────────────────────────────────
const rankConfig = {
  1: { gradient: 'bg-gradient-to-br from-amber-300 to-amber-500', ringColor: 'ring-amber-300', textColor: 'text-amber-600 dark:text-amber-400', accent: 'border-l-amber-400', badgeText: 'text-amber-950', rowBg: 'border-amber-300 dark:border-amber-500/50 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-50 dark:from-amber-500/30 dark:via-amber-500/15 dark:to-amber-500/5 hover:shadow-md' },
  2: { gradient: 'bg-gradient-to-br from-slate-200 to-slate-400', ringColor: 'ring-slate-200', textColor: 'text-slate-500 dark:text-slate-300', accent: 'border-l-slate-400', badgeText: 'text-slate-800', rowBg: 'border-slate-300 dark:border-slate-400/50 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-50 dark:from-slate-400/30 dark:via-slate-400/15 dark:to-slate-400/5 hover:shadow-md' },
  3: { gradient: 'bg-gradient-to-br from-orange-300 to-orange-500', ringColor: 'ring-orange-300', textColor: 'text-orange-600 dark:text-orange-400', accent: 'border-l-orange-400', badgeText: 'text-orange-950', rowBg: 'border-orange-300 dark:border-orange-500/50 bg-gradient-to-r from-orange-200 via-orange-100 to-orange-50 dark:from-orange-500/30 dark:via-orange-500/15 dark:to-orange-500/5 hover:shadow-md' },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: 'bg-primary-600', text: 'text-white' },
  { bg: 'bg-blue-600', text: 'text-white' },
  { bg: 'bg-rose-600', text: 'text-white' },
  { bg: 'bg-amber-600', text: 'text-white' },
  { bg: 'bg-violet-600', text: 'text-white' },
  { bg: 'bg-cyan-600', text: 'text-white' },
  { bg: 'bg-orange-600', text: 'text-white' },
  { bg: 'bg-emerald-600', text: 'text-white' },
];

const Avatar = ({ entry, size = 'md', ring = false }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const sizes = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base',
    xl: 'w-16 h-16 text-xl',
  };
  const initial = ((entry?.name || entry?.username) || 'A').charAt(0).toUpperCase();
  const colorIdx = initial.charCodeAt(0) % AVATAR_COLORS.length;
  const avatarStyle = AVATAR_COLORS[colorIdx];
  const rc = rankConfig[entry?.rank];

  const ringClass = ring && rc ? `ring-2 ${rc.ringColor} shadow-md` : '';

  return entry?.profilePicture && !imgFailed ? (
    <img
      src={entry.profilePicture}
      alt={entry.name || 'User'}
      onError={() => setImgFailed(true)}
      className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${ringClass}`}
    />
  ) : (
    <div className={`${sizes[size]} ${avatarStyle.bg} rounded-full flex items-center justify-center font-black ${avatarStyle.text} flex-shrink-0 ${ringClass}`}>
      {initial}
    </div>
  );
};

// ─── Top 3 Podium ─────────────────────────────────────────────────────────────
const Podium = ({ top3, currentUserId, type }) => {
  const { translate } = useTranslate();
  // #1, #2, #3 left to right: equal-height steps with a small gap between them.
  // NB: the step has no `rounded-*` class on purpose — styles/index.css forces every
  // [class*="rounded"] to a flat 8px radius with !important, which would round the bottom corners.
  const ordered = [top3[0], top3[1], top3[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-1.5 sm:gap-2 pt-0 px-2">
      {ordered.map((entry) => {
        if (!entry) return null;
        const rc = rankConfig[entry.rank] || {};
        const isMe = String(entry.userId) === String(currentUserId);
        const isFirst = entry.rank === 1;

        return (
          <Link href={entry.username ? `/u/${entry.username}` : '#'} key={entry.rank}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * entry.rank, type: 'spring', stiffness: 120 }}
              className="flex flex-col items-center gap-0.5"
            >
              {isFirst && <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)] animate-bounce" />}
              <Avatar entry={entry} size="lg" ring />
              {isMe && (
                <span className="text-[9px] font-black uppercase bg-white text-primary-700 px-1.5 py-0.5 rounded-full">{translate('You')}</span>
              )}
              <div className="text-center w-[76px] sm:w-24 px-1 mt-1.5 mb-1">
                <p className="text-[10px] sm:text-[11px] font-black leading-tight break-words text-white">
                  {entry.name || entry.username || translate('User')}
                </p>
              </div>
              <div
                className={`w-[76px] sm:w-24 h-9 sm:h-10 ${rc.gradient || 'bg-slate-400'} flex flex-col items-center justify-center shadow-[0_-4px_24px_rgba(0,0,0,0.18)]`}
                style={{ borderRadius: '8px 8px 0 0' }}
              >
                <span className={`font-black text-xs sm:text-sm leading-none ${rc.badgeText || 'text-white'}`}>#{entry.rank}</span>
                <span className={`mt-0.5 text-[9px] sm:text-[10px] font-black uppercase leading-none opacity-80 ${rc.badgeText || 'text-white'}`}>{formatTimeSpent(entry.totalTimeSpent, type)}</span>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
};

// ─── Shared table column template (kept identical between header & rows so
// everything lines up on desktop) — desktop only; mobile uses a stacked card. ──
const TABLE_GRID_COLS = 'grid-cols-[40px_1fr_84px_84px_84px_84px_84px_84px_84px_20px]';

// ─── List Row — table row on desktop (lg+), stacked card on mobile ────────────
const LeaderboardRow = ({ entry, index, currentUserId, type }) => {
  const { translate } = useTranslate();
  const rc = rankConfig[entry.rank];
  const isMe = String(entry.userId) === String(currentUserId);
  const isTop3 = entry.rank <= 3;

  const rankBadge = (
    <div className={`
      w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs
      ${isTop3 ? `${rc.gradient} ${rc.badgeText} shadow-md ring-2 ring-white/70 dark:ring-white/10` : 'bg-slate-100 dark:bg-slate-800 text-content-muted'}
    `}>
      {entry.rank}
    </div>
  );

  const identity = (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <p className={`text-sm font-black truncate leading-tight ${isMe ? 'text-black dark:text-white' : 'text-content-primary'}`}>
          {entry.name || entry.username || translate('Anonymous')}
        </p>
        {isMe && (
          <span className="text-[9px] font-black uppercase bg-primary-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{translate('You')}</span>
        )}
        {entry.subscriptionStatus === 'PRO' && (
          <ProBadge size="xs" className="flex-shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {entry.username && (
          <p className="text-[10px] font-bold text-content-muted/80 truncate">@{entry.username}</p>
        )}
        {entry.city && (
          <span className="text-[10px] font-bold text-primary-600 truncate flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />{entry.city}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.5) }}
    >
      <Link href={entry.username ? `/u/${entry.username}` : '#'}>
        {/* ── Desktop: table row ── */}
        <div className={`
          hidden xl:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 py-3 rounded-2xl border-2 transition-all group cursor-pointer
          ${isTop3 ? `${rc.rowBg} border-l-4 ${rc.accent}` : isMe
            ? 'border-slate-200 dark:border-slate-800 dark:border-white bg-slate-100 dark:bg-black border-b-primary-400 dark:border-b-primary-600'
            : 'border-slate-200 dark:border-slate-800 bg-background-surface hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
          }
        `}>
          {rankBadge}
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar entry={entry} size="md" />
            {identity}
          </div>
          <p className="text-xs font-black text-content-primary text-center flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-content-muted" />{formatTimeSpent(entry.totalTimeSpent, type)}
          </p>
          <p className="text-xs font-black text-content-primary text-center flex items-center justify-center gap-1">
            <Target className="w-3 h-3 text-content-muted" />{entry.totalQuizzes}
          </p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalMarks ?? 0}</p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalCorrect ?? 0}</p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalScore ?? 0}</p>
          <p className={`text-sm font-black text-center ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgAccuracy}%</p>
          <p className="text-sm font-black text-center text-content-primary">{entry.avgPercentage}%</p>
          <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>

        {/* ── Mobile: stacked card — every stat carries its own heading ── */}
        <div className={`
          flex xl:hidden flex-col gap-3 px-3.5 py-3 rounded-2xl border-2 transition-all group cursor-pointer
          ${isTop3 ? `${rc.rowBg} border-l-4 ${rc.accent}` : isMe
            ? 'border-slate-200 dark:border-slate-800 dark:border-white bg-slate-100 dark:bg-black border-b-primary-400 dark:border-b-primary-600'
            : 'border-slate-200 dark:border-slate-800 bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'
          }
        `}>
          <div className="flex items-center gap-3">
            {rankBadge}
            <Avatar entry={entry} size="md" />
            <div className="flex-1 min-w-0">
              {identity}
              {entry.currentStreak > 0 && (
                <span className="text-[10px] font-bold text-black dark:text-white flex items-center gap-1 mt-0.5">
                  <Flame className="w-3 h-3" />{translate('{count} day streak', { count: entry.currentStreak })}
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </div>

          <div className="grid grid-cols-3 gap-2 pl-[52px]">
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide whitespace-nowrap">{translate('Total Time Spent')}</p>
              <p className="text-sm font-black text-content-primary">{formatTimeSpent(entry.totalTimeSpent, type)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{type === 'quiz' ? translate('Quizzes') : translate('Exams')}</p>
              <p className="text-sm font-black text-content-primary">{entry.totalQuizzes}</p>
            </div>
            {type === 'quiz' && (
              <>
                <div>
                  <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{translate('Marks')}</p>
                  <p className="text-sm font-black text-content-primary">{entry.totalMarks ?? 0}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{translate('Correct')}</p>
                  <p className="text-sm font-black text-content-primary">{entry.totalCorrect ?? 0}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{translate('Score')}</p>
                  <p className="text-sm font-black text-content-primary">{entry.totalScore ?? 0}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{translate('Accuracy')}</p>
              <p className={`text-sm font-black ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgAccuracy}%</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{translate('Avg Score')}</p>
              <p className="text-sm font-black text-content-primary">{entry.avgPercentage}%</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── My Rank Card ─────────────────────────────────────────────────────────────
const MyRankCard = ({ entry, type }) => {
  const { translate } = useTranslate();
  if (!entry) return null;
  const chips = [
    { label: type === 'quiz' ? translate('Quizzes') : translate('Exams'), value: entry.totalQuizzes },
    { label: translate('Accuracy'), value: `${entry.avgAccuracy}%` },
    { label: translate('Avg Score'), value: `${entry.avgPercentage}%` },
    { label: translate('Total Time Spent'), value: formatTimeSpent(entry.totalTimeSpent, type) },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-1">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 text-white shadow-lg ring-1 ring-white/20 px-3 py-2">
        <Trophy className="pointer-events-none absolute -right-2 -bottom-4 w-20 h-20 text-white/10 -rotate-12" />
        {/* One row on desktop (rank · avatar · name · stats); wraps on small screens */}
        <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex items-baseline gap-1.5 rounded-xl bg-white/15 px-2.5 py-1 ring-1 ring-white/25">
            <span className="text-sm sm:text-base font-black uppercase tracking-wide text-white">{translate('Your Rank')}</span>
            <span className="text-xl sm:text-2xl font-black leading-none text-amber-200">#{entry.rank}</span>
          </div>
          <Avatar entry={entry} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-black truncate leading-tight">{entry.name || entry.username}</p>
              {entry.subscriptionStatus === 'PRO' && <ProBadge size="xs" className="flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {entry.username && <p className="text-[10px] font-bold text-white/70 truncate">@{entry.username}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 xl:ml-auto">
            {chips.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-black/30 ring-1 ring-white/25 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-white">
                <span className="text-white/90">{c.label}</span>
                <span className="font-black text-amber-200">{c.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const LeaderboardContent = () => {
  const { translate } = useTranslate();
  const [type, setType] = useState('quiz'); // 'quiz' or 'exam'
  const [period, setPeriod] = useState('all-time');
  const [data, setData] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  const ROWS_PER_PAGE = pageSize;
  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await API.request(`/api/leaderboard?type=${type}&period=${period}&limit=1000`);
      if (res?.success) {
        setData(res.data || []);
        setMyEntry(res.myEntry || null);
      }
    } catch (e) {
      console.error('Leaderboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, type]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);
  useEffect(() => { setPage(1); }, [type, period]);

  const top3 = data.slice(0, 3);
  // Table shows every ranked user, including the top 3 already on the podium above.
  const totalPages = Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE));
  const pagedRest = data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <div className="min-h-screen pb-32 pt-2 xl:pt-4 font-outfit">
      <div className="space-y-3 xl:space-y-4">

        {/* ── Hero Banner — green gradient with gold podium (same look as All India Rank) ── */}
        <section className="relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
          <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 right-8 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl" />
          <Trophy className="pointer-events-none absolute right-3 top-2 w-28 h-28 text-white/5 rotate-12" />

          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 items-end gap-2 xl:gap-6 px-3 xl:px-6 pt-3 xl:pt-4 pb-0">
            <div className="space-y-2 xl:space-y-2.5 text-center xl:text-left pb-3 xl:pb-4">
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 xl:gap-3">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-xl xl:text-3xl font-black uppercase text-white tracking-tight leading-tight"
                >
                  {translate('Leaderboard')}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-300 to-amber-400 text-amber-950 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-[0_2px_12px_rgba(251,191,36,0.4)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {translate('PRO Exclusive')}
                </motion.div>
              </div>

              <p className="text-[11px] xl:text-xs font-bold text-white/80 max-w-md mx-auto xl:mx-0 flex items-center justify-center xl:justify-start gap-1.5">
                <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                {translate('Top 1000 students ranking based on total time spent')}
              </p>

              {/* Controls: type + period + refresh, one compact row */}
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                <div className="flex p-0.5 bg-black/25 ring-1 ring-white/25 rounded-xl">
                  {[
                    { id: 'quiz', label: 'Quizzes', icon: BrainCircuit },
                    { id: 'exam', label: 'Exams', icon: FileText },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      title={translate('Ranked by: Total Time Spent')}
                      className={`flex items-center gap-1 px-3 h-8 rounded-lg text-[11px] font-black uppercase transition-all ${
                        type === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-white/90 hover:bg-white/15'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex p-0.5 bg-black/25 ring-1 ring-white/25 rounded-xl">
                  {PERIODS.map((pd) => {
                    const Icon = pd.icon;
                    return (
                      <button
                        key={pd.id}
                        onClick={() => setPeriod(pd.id)}
                        className={`flex items-center gap-1 px-3 h-8 rounded-lg text-[11px] font-black uppercase whitespace-nowrap transition-all ${
                          period === pd.id ? 'bg-white text-primary-700 shadow-sm' : 'text-white/90 hover:bg-white/15'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {translate(pd.label)}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => fetchLeaderboard(true)}
                  disabled={refreshing || loading}
                  title={translate('Refresh')}
                  className="h-9 w-9 flex items-center justify-center bg-black/25 ring-1 ring-white/25 hover:bg-white/15 text-white transition-all disabled:opacity-40"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Podium */}
            {loading ? (
              <div className="h-24 flex items-end justify-center gap-3 animate-pulse">
                <div className="w-16 h-14 bg-white/15 rounded-t-xl" />
                <div className="w-16 h-20 bg-white/20 rounded-t-xl" />
                <div className="w-16 h-10 bg-white/15 rounded-t-xl" />
              </div>
            ) : top3.length > 0 ? (
              <Podium top3={top3} currentUserId={currentUserId} type={type} />
            ) : null}
          </div>
        </section>

        {/* ── My Rank ── */}
        {!loading && myEntry && <MyRankCard entry={myEntry} type={type} />}

        {/* ── Quick Stats ── */}
        {!loading && data.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-2 xl:gap-3">
            {[
              { label: 'Players', value: `${data.length}+`, icon: Users, tile: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300' },
              { label: 'Top Score', value: `${data[0]?.avgPercentage ?? 0}%`, icon: TrendingUp, tile: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
              { label: 'Top Streak', value: `${Math.max(0, ...data.map(d => d.currentStreak || 0))}🔥`, icon: Flame, tile: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-background-surface border-2 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.tile}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-xl font-black text-content-primary leading-tight truncate">{stat.value}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-content-muted uppercase leading-tight truncate">{translate(stat.label)}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Leaderboard List ── */}
        {loading ? (
          <LeaderboardSkeleton />
        ) : data.length === 0 ? (
          <div className="py-16 sm:py-20 text-center space-y-2 xl:space-y-4">
            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
            <h3 className="text-lg sm:text-xl font-black text-content-muted uppercase">{translate('No data yet for this period')}</h3>
            <p className="text-sm text-content-muted font-bold">{translate('Attempt quizzes to appear on the leaderboard!')}</p>
            <Link href="/quizzes">
              <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-800 text-white rounded-full font-black text-xs uppercase mt-2 transition-colors">
                {translate('Start a Quiz')}
              </button>
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={period}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {/* Column header — desktop table only; mobile list has no header row */}
              <div className={`hidden xl:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 pb-1`}>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">#</p>
                <p className="text-[10px] font-black text-content-muted uppercase">{translate('Player')}</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center whitespace-nowrap">{translate('Total Time Spent')}</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">{type === 'quiz' ? translate('Quizzes') : translate('Exams')}</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Marks')}</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Correct')}</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Score')}</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Accuracy')}</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Avg Score')}</p>
                <div />
              </div>

              {/* Rows — includes ranks 1-3 too, even though they're already on the podium above */}
              {pagedRest.map((entry, i) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  index={(page - 1) * ROWS_PER_PAGE + i}
                  currentUserId={currentUserId}
                  type={type}
                />
              ))}

              <p className="pt-3 text-center text-[10px] sm:text-xs font-bold text-content-muted">{translate('Ranked pool is capped at the top 1000 players.')}</p>

              {/* Pagination */}
              <div className="pt-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} itemsPerPage={ROWS_PER_PAGE} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} totalItems={data.length} sticky={false} /></div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

    </div>
  );
};

// PRO-only, like All India Rank. The guard wraps the content component so non-PRO users
// never trigger the leaderboard fetch.
const LeaderboardPage = () => {
  useRequireLogin();
  return (
    <>
      <Seo
        title="Leaderboard – Top Rankers | AajExam"
        description="See who is topping the AajExam leaderboard. Compete with thousands of students preparing for govt exams."
        canonical="/student/leaderboard"
        noIndex={true}
      />
      <SubscriptionGuard message="Leaderboard is a PRO feature. Upgrade to see the top rankers and where you stand!">
        <LeaderboardContent />
      </SubscriptionGuard>
    </>
  );
};

export default LeaderboardPage;
