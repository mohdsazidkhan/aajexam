/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Crown, Flame, Target, TrendingUp,
  ChevronRight, Users, RefreshCw, Globe, ChevronDown, MapPin, Sparkles, Clock
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/common/AppLink';
import { useSelector } from 'react-redux';
import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Seo from '../../components/common/Seo';
import { ProBadge } from '../../components/common/ui';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';
import { getCurrentUser } from '../../lib/utils/authUtils';
import { formatTimeSpent, formatSecondsSpent } from '../../lib/utils/timeFormat';
import useTranslate from '../../hooks/useTranslate';
import Pagination from '../../components/common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../lib/constants/pagination';
import useRequireLogin from '../../hooks/useRequireLogin';

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

// ─── Rank visual config ────────────────────────────────────────────────────────
const rankConfig = {
  1: { gradient: 'bg-gradient-to-br from-amber-300 to-amber-500', ringColor: 'ring-amber-300', textColor: 'text-amber-600 dark:text-amber-400', accent: 'border-l-amber-400', badgeText: 'text-amber-950', rowBg: 'border-amber-300 dark:border-primary-500/50 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-50 dark:from-amber-500/30 dark:via-amber-500/15 dark:to-amber-500/5 hover:shadow-md' },
  2: { gradient: 'bg-gradient-to-br from-slate-200 to-slate-400', ringColor: 'ring-slate-200', textColor: 'text-slate-500 dark:text-slate-300', accent: 'border-l-slate-400', badgeText: 'text-slate-800', rowBg: 'border-slate-300 dark:border-slate-400/50 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-50 dark:from-slate-400/30 dark:via-slate-400/15 dark:to-slate-400/5 hover:shadow-md' },
  3: { gradient: 'bg-gradient-to-br from-orange-300 to-orange-500', ringColor: 'ring-orange-300', textColor: 'text-orange-600 dark:text-orange-400', accent: 'border-l-orange-400', badgeText: 'text-orange-950', rowBg: 'border-orange-300 dark:border-orange-500/50 bg-gradient-to-r from-orange-200 via-orange-100 to-orange-50 dark:from-orange-500/30 dark:via-orange-500/15 dark:to-orange-500/5 hover:shadow-md' },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['bg-primary-600', 'bg-blue-600', 'bg-rose-600', 'bg-amber-600', 'bg-violet-600', 'bg-cyan-600', 'bg-orange-600', 'bg-emerald-600'];

const Avatar = ({ entry, size = 'md', ring = false }) => {
  const liteMode = useSelector((s) => s.display?.liteMode);
  const sizes = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base', xl: 'w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg' };
  const initial = ((entry?.name || entry?.username) || 'A').charAt(0).toUpperCase();
  const colorIdx = initial.charCodeAt(0) % AVATAR_COLORS.length;
  const rc = rankConfig[entry?.rank];
  const ringClass = ring && rc ? `ring-2 ${rc.ringColor} shadow-md` : '';

  return entry?.profilePicture && !liteMode ? (
    <img src={entry.profilePicture} alt={entry.name || 'User'} className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${ringClass}`} />
  ) : (
    <div className={`${sizes[size]} ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center font-black text-white flex-shrink-0 ${ringClass}`}>
      {initial}
    </div>
  );
};

// ─── Top 3 Podium ─────────────────────────────────────────────────────────────
const Podium = ({ top3, currentUserId }) => {
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
          <Link href={entry.username ? `/u/${entry.username}` : '#'} key={entry.rank}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * entry.rank, type: 'spring', stiffness: 120 }}
              className="flex flex-col items-center gap-0.5"
            >
              {isFirst && <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)] animate-bounce" />}
              <Avatar entry={entry} size="lg" ring />
              {isMe && <span className="text-[9px] font-black uppercase bg-white text-primary-700 px-1.5 py-0.5 rounded-full">{translate('You')}</span>}
              <div className="text-center w-[76px] sm:w-24 px-1 mt-1.5 mb-1">
                <p className="text-[10px] sm:text-[11px] font-black leading-tight break-words text-white">
                  {entry.name || entry.username || translate('User')}
                </p>
              </div>
              <div className={`w-[76px] sm:w-24 ${stepH[entry.rank] || 'h-9'} ${rc?.gradient || 'bg-slate-400'} flex flex-col items-center justify-center shadow-[0_-4px_24px_rgba(0,0,0,0.18)]`} style={{ borderRadius: '8px 8px 0 0' }}>
                <span className={`font-black text-xs sm:text-sm leading-none ${rc?.badgeText || 'text-white'}`}>#{entry.rank}</span>
                <span className={`mt-0.5 text-[9px] sm:text-[10px] font-black uppercase leading-none opacity-80 ${rc?.badgeText || 'text-white'}`}>{formatTimeSpent(entry.totalTimeSpent, 'exam')}</span>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
};

// ─── Shared table column template (desktop only; mobile uses a stacked card) ──
const TABLE_GRID_COLS = 'grid-cols-[40px_1fr_84px_84px_84px_84px_84px_84px_84px_20px]';

// ─── List Row — table row on desktop (lg+), stacked card on mobile ────────────
const LeaderboardRow = ({ entry, index, currentUserId }) => {
  const { translate, translateData } = useTranslate();
  const rc = rankConfig[entry.rank];
  const isMe = String(entry.userId) === String(currentUserId);
  const isTop3 = entry.rank <= 3;

  const rankBadge = (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs
      ${isTop3 ? `${rc.gradient} ${rc.badgeText} shadow-md ring-2 ring-white/70 dark:ring-white/10` : 'bg-slate-100 dark:bg-slate-800 text-content-muted'}`}>
      {entry.rank}
    </div>
  );

  const identity = (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <p className={`text-sm font-black truncate leading-tight ${isMe ? 'text-black dark:text-white' : 'text-content-primary'}`}>
          {entry.name || entry.username || translate('Anonymous')}
        </p>
        {isMe && <span className="text-[9px] font-black uppercase bg-primary-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{translate('You')}</span>}
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
      <Link href={entry.username ? `/u/${entry.username}` : '#'}>
        {/* ── Desktop: table row ── */}
        <div className={`hidden xl:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 py-3 rounded-2xl border-2 transition-all group cursor-pointer
          ${isTop3 ? rc.rowBg : isMe ? 'border-slate-200 dark:border-slate-800 dark:border-white bg-slate-100 dark:bg-black border-b-primary-400 dark:border-b-primary-600' : 'border-slate-200 dark:border-slate-800 bg-background-surface hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'} ${isTop3 ? `border-l-4 ${rc.accent}` : ''}`}>
          {rankBadge}
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar entry={entry} size="md" />
            {identity}
          </div>
          <p className="text-xs font-black text-content-primary text-center flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-content-muted" />{formatTimeSpent(entry.totalTimeSpent, 'exam')}
          </p>
          <p className="text-xs font-black text-content-primary text-center flex items-center justify-center gap-1">
            <Target className="w-3 h-3 text-content-muted" />{entry.totalExams}
          </p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalMarks ?? 0}</p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalCorrect ?? 0}</p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalScore ?? 0}</p>
          <p className={`text-sm font-black text-center ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgAccuracy}%</p>
          <p className="text-sm font-black text-center text-content-primary">{entry.avgPercentage}%</p>
          <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>

        {/* ── Mobile: stacked card — every stat carries its own heading ── */}
        <div className={`flex xl:hidden flex-col gap-3 px-3.5 py-3 rounded-2xl border-2 transition-all group cursor-pointer
          ${isTop3 ? rc.rowBg : isMe ? 'border-slate-200 dark:border-slate-800 dark:border-white bg-slate-100 dark:bg-black border-b-primary-400 dark:border-b-primary-600' : 'border-slate-200 dark:border-slate-800 bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'} ${isTop3 ? `border-l-4 ${rc.accent}` : ''}`}>
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
              <p className="text-sm font-black text-content-primary">{formatTimeSpent(entry.totalTimeSpent, 'exam')}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{translate('Exams')}</p>
              <p className="text-sm font-black text-content-primary">{entry.totalExams}</p>
            </div>
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
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{translate('Accuracy')}</p>
              <p className={`text-sm font-black ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgAccuracy}%</p>
              <div className="mt-1 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, Math.max(0, entry.avgAccuracy || 0))}%` }} /></div>
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

// ─── My Rank Sticky Card ──────────────────────────────────────────────────────
const MyRankCard = ({ entry, totalUsers }) => {
  const { translate } = useTranslate();
  if (!entry) return null;
  const topPct = totalUsers > 0 ? Math.max(1, Math.ceil((entry.rank / totalUsers) * 100)) : null;
  const chips = [
    { label: translate('Exams'), value: entry.totalExams },
    { label: translate('Accuracy'), value: `${entry.avgAccuracy}%` },
    { label: translate('Avg Score'), value: `${entry.avgPercentage}%` },
    { label: translate('Total Time Spent'), value: formatTimeSpent(entry.totalTimeSpent, 'exam') },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4 z-30 px-1">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white shadow-lg ring-1 ring-slate-200 dark:ring-white/20 px-3 py-2">
        <Trophy className="pointer-events-none absolute -right-2 -bottom-4 w-20 h-20 text-slate-900/10 dark:text-white/10 -rotate-12" />
        {/* One row on desktop (rank · avatar · name · top % · stats); wraps on small screens */}
        <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex items-baseline gap-1.5 rounded-xl bg-white/80 dark:bg-white/15 px-2.5 py-1 ring-1 ring-slate-200 dark:ring-white/25">
            <span className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">{translate('Your Rank')}</span>
            <span className="text-xl sm:text-2xl font-black leading-none text-slate-600 dark:text-primary-200">#{entry.rank}</span>
          </div>
          <Avatar entry={entry} size="sm" />
<div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-black truncate leading-tight">{entry.name || entry.username}</p>
              {entry.subscriptionStatus === 'PRO' && <ProBadge size="xs" className="flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {entry.username && <p className="text-[10px] font-bold text-slate-700 dark:text-white/70 truncate">@{entry.username}</p>}
              {topPct !== null && (
                <p className="text-[10px] font-bold text-slate-600 dark:text-primary-200 whitespace-nowrap">{translate('Top {percent}% of {total} ranked students', { percent: topPct, total: totalUsers })}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 xl:ml-auto">
            {chips.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-black/30 ring-1 ring-slate-200 dark:ring-white/25 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-slate-900 dark:text-white">
                <span className="text-slate-700 dark:text-white/90">{c.label}</span>
                <span className="font-black text-slate-600 dark:text-primary-200">{c.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AllIndiaRankPage = () => {
  useRequireLogin();
  const { translate, translateData } = useTranslate();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [data, setData] = useState([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTimeSpentSeconds, setTotalTimeSpentSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  const ROWS_PER_PAGE = pageSize;

  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const currentUserId = currentUser?._id || currentUser?.id;

  // Fetch available exams for the dropdown
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.request('/api/real-exams/all-exams');
        if (res?.success && res.data) {
            // Flatten exam categories if needed, or if res.data is array of exams
            setExams(res.data);
        }
      } catch (e) {
        console.error('Failed to load exams', e);
      }
    };
    fetchExams();
  }, []);

  const fetchAIR = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const url = `/api/air?limit=1000${selectedExamId ? `&examId=${selectedExamId}` : ''}`;
      const res = await API.request(url);
      if (res?.success) {
        setData(res.data || []);
        setTotalAttempts(res.totalAttempts || 0);
        setTotalUsers(res.totalUsers || 0);
        setTotalTimeSpentSeconds(res.totalTimeSpentSeconds || 0);
      }
    } catch (e) {
      console.error('AIR fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedExamId]);

  useEffect(() => { fetchAIR(); }, [fetchAIR]);
  useEffect(() => { setPage(1); }, [selectedExamId]);

  const top3 = data.slice(0, 3);
  // Top 3 show on the podium AND at the top of the table below (per user's choice).
  const totalPages = Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE));
  const pagedRest = data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const myEntry = data.find(e => String(e.userId) === String(currentUserId));

  return (
    <div className="min-h-screen pb-32 font-outfit">
      <Seo
        title="All India Rank (AIR) | AajExam"
        description="Check your overall All India Rank and exam-specific rankings. Exclusive feature for PRO users."
        canonical="/student/all-india-rank"
        noIndex={true}
      />

      <div className="py-2 xl:py-4 space-y-3 xl:space-y-4">
        <SubscriptionGuard message="All India Rank (AIR) is a PRO feature. Upgrade to see where you stand globally and by exam!">
          <div className="space-y-3 xl:space-y-4">
            
            {/* ── Hero Banner — green gradient with gold podium ── */}
            <section className="relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
              <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-32 right-8 w-96 h-96 rounded-full bg-primary-300/20 blur-3xl" />
              <Trophy className="pointer-events-none absolute right-3 top-2 w-28 h-28 text-white/5 rotate-12" />

              <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 items-end gap-2 xl:gap-6 px-3 xl:px-6 pt-3 xl:pt-4 pb-0">
                <div className="space-y-2 xl:space-y-2.5 text-center xl:text-left pb-3 xl:pb-4">
                  <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 xl:gap-3">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="text-xl xl:text-3xl font-black uppercase text-white tracking-tight leading-tight"
                    >
                      {translate('All India Rank')}
                    </motion.h1>
                    {/* PRO badge — gold, animated sparkle */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-[0_2px_12px_rgba(251,191,36,0.4)]"
                    >
                      <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </motion.span>
                      {translate('PRO Exclusive')}
                    </motion.div>
                  </div>

                  <p className="text-[11px] xl:text-xs font-bold text-white/80 max-w-md mx-auto xl:mx-0 flex items-center justify-center xl:justify-start gap-1.5">
                    <Trophy className="w-3.5 h-3.5 shrink-0 text-primary-300" />
                    {translate('Top 1000 students ranking based on total time spent')}
                  </p>

                  {/* Exam Filter Dropdown */}
                  <div className="max-w-sm mx-auto xl:mx-0">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <select
                        value={selectedExamId}
                        onChange={(e) => setSelectedExamId(e.target.value)}
                        className="w-full appearance-none bg-white/15 hover:bg-white/20 border border-white/30 text-white text-sm font-bold rounded-xl h-9 pl-9 pr-9 outline-none focus:ring-2 focus:ring-white/60 backdrop-blur-md cursor-pointer transition-all"
                      >
                        <option value="" className="bg-white dark:bg-slate-800 text-black dark:text-white">{translate('🌍 All Exams (Overall AIR)')}</option>
                        {exams.map(e => (
                          <option key={e._id} value={e._id} className="bg-white dark:bg-slate-800 text-black dark:text-white">
                            {translateData(e.name)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-white" />
                      </div>
                    </div>
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
                  <Podium top3={top3} currentUserId={currentUserId} />
                ) : null}
              </div>
            </section>

            {/* ── My Rank ── */}
            {!loading && myEntry && <MyRankCard entry={myEntry} totalUsers={totalUsers} />}

            {/* ── List Actions ── */}
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2.5">
                 <span className="h-6 w-1.5 rounded-full bg-primary-600" />
                 <h3 className="text-sm xl:text-base font-black text-content-primary uppercase">
                   {selectedExamId ? translate('Filtered Ranks') : translate('All Student Ranks')}
                 </h3>
               </div>
               <button
                onClick={() => fetchAIR(true)}
                disabled={refreshing || loading}
                title={translate('Refresh Ranks')}
                className="flex items-center gap-1.5 px-3 h-9 rounded-xl font-black text-[10px] uppercase border-2 border-slate-200 dark:border-slate-800 bg-background-surface text-content-muted hover:border-slate-200 dark:hover:border-white transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{translate('Refresh')}</span>
              </button>
            </div>

            {/* ── Quick Stats ── */}
            {!loading && data.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-2 xl:gap-3">
                {[
                  { label: 'Ranked Users', value: `${totalUsers}+`, icon: Users, tile: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300' },
                  { label: 'Total Exams Attempted', value: `${totalAttempts}`, icon: Target, tile: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
                  { label: selectedExamId ? 'Time Spent On This Exam' : 'Total All Exams Time Spent', value: formatSecondsSpent(totalTimeSpentSeconds), icon: Clock, tile: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
                  { label: 'Top Score', value: `${data[0]?.totalScore ?? 0}`, icon: TrendingUp, tile: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300' },
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
                <Globe className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
                <h3 className="text-lg sm:text-xl font-black text-content-muted uppercase">{translate('No Ranks Found')}</h3>
                <p className="text-sm text-content-muted font-bold">{translate('No test attempts match the current filter.')}</p>
                <button 
                  onClick={() => setSelectedExamId('')}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-800 text-white rounded-full font-black text-xs uppercase mt-2 transition-colors"
                >
                  {translate('View All Exams')}
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={selectedExamId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  {/* Column header — desktop table only; mobile list has no header row */}
                  <div className={`hidden xl:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 pb-1`}>
                    <p className="text-[10px] font-black text-content-muted uppercase text-center">#</p>
                    <p className="text-[10px] font-black text-content-muted uppercase">{translate('Player')}</p>
                    <p className="text-[10px] font-black text-content-muted uppercase text-center whitespace-nowrap">{translate('Total Time Spent')}</p>
                    <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Exams')}</p>
                    <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Marks')}</p>
                    <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Correct')}</p>
                    <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Score')}</p>
                    <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Accuracy')}</p>
                    <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Avg Score')}</p>
                    <div />
                  </div>
                  {pagedRest.map((entry, i) => (
                    <LeaderboardRow key={entry.userId} entry={entry} index={(page - 1) * ROWS_PER_PAGE + i} currentUserId={currentUserId} />
                  ))}

                  <div className="pt-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} itemsPerPage={ROWS_PER_PAGE} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} totalItems={data.length} sticky={false} /></div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </SubscriptionGuard>
      </div>
    </div>
  );
};

export default AllIndiaRankPage;
