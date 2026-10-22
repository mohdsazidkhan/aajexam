/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Medal, Crown, Flame, Target, TrendingUp,
  ChevronRight, Users, RefreshCw, Globe, ChevronDown, MapPin, Sparkles, Clock
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/common/AppLink';
import { useSelector } from 'react-redux';
import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Seo from '../../components/common/Seo';
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
  1: { gradient: 'bg-primary-600', ringColor: 'ring-primary-700/10', textColor: 'text-white' },
  2: { gradient: 'bg-slate-400', ringColor: 'ring-slate-400 dark:ring-slate-500', textColor: 'text-slate-500 dark:text-slate-400' },
  3: { gradient: 'bg-slate-100 dark:bg-slate-800', ringColor: 'ring-black/10 dark:ring-white/10 ', textColor: 'text-black dark:text-white' },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['bg-primary-600', 'bg-blue-600', 'bg-rose-600', 'bg-amber-600', 'bg-violet-600', 'bg-cyan-600', 'bg-orange-600', 'bg-emerald-600'];

const Avatar = ({ entry, size = 'md', ring = false }) => {
  const liteMode = useSelector((s) => s.display?.liteMode);
  const sizes = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-11 h-11 sm:w-14 sm:h-14 text-base sm:text-lg', xl: 'w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl' };
  const initial = ((entry?.name || entry?.username) || 'A').charAt(0).toUpperCase();
  const colorIdx = initial.charCodeAt(0) % AVATAR_COLORS.length;
  const rc = rankConfig[entry?.rank];
  const ringClass = ring && rc ? `ring-4 ${rc.ringColor} ring-offset-2 ring-offset-background-surface` : '';

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
  const { translate, translateData } = useTranslate();
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumH = { 1: 'h-12 sm:h-20 xl:h-24', 2: 'h-9 sm:h-14 xl:h-16', 3: 'h-7 sm:h-10 xl:h-12' };
  const podiumGradient = { 1: 'bg-primary-600', 2: 'bg-slate-400', 3: 'bg-slate-100 dark:bg-slate-800' };
  const podiumTextColor = { 1: 'text-white', 2: 'text-white', 3: 'text-black dark:text-white' };

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 pt-1 sm:pt-4 pb-0 px-2">
      {ordered.map((entry) => {
        if (!entry) return null;
        const isMe = String(entry.userId) === String(currentUserId);
        const isFirst = entry.rank === 1;

        return (
          <Link href={entry.username ? `/u/${entry.username}` : '#'} key={entry.rank}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * entry.rank, type: 'spring', stiffness: 120 }}
              className={`flex flex-col items-center gap-1 sm:gap-1.5 ${isFirst ? 'sm:scale-110 -mb-1' : ''}`}
            >
              {isFirst && <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-black dark:text-white animate-bounce" />}
              <Avatar entry={entry} size={isFirst ? 'xl' : 'lg'} ring />
              {isMe && <span className="text-[9px] font-black uppercase bg-primary-600 text-white px-1.5 py-0.5 rounded-full">{translate('You')}</span>}
              <div className="text-center max-w-[76px] sm:max-w-[96px]">
                <p className="text-[11px] sm:text-xs font-black leading-tight break-words text-black dark:text-white">
                  {entry.name || entry.username || translate('User')}
                </p>
                <p className="text-[10px] font-bold text-black/60 dark:text-white/60">{formatTimeSpent(entry.totalTimeSpent, 'exam')}</p>
              </div>
              <div className={`w-14 sm:w-20 ${podiumH[entry.rank] || 'h-10'} ${podiumGradient[entry.rank] || 'bg-slate-400'} rounded-t-xl sm:rounded-t-2xl flex items-end justify-center pb-2`}>
                <span className={`font-black text-sm ${podiumTextColor[entry.rank] || 'text-white'}`}>#{entry.rank}</span>
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
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs
      ${isTop3 ? `${rc.gradient} text-white shadow-sm` : 'bg-slate-100 dark:bg-slate-800 text-content-muted'}`}>
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
        {entry.subscriptionStatus === 'PRO' && <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-black dark:text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{translate('PRO')}</span>}
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
          ${isMe ? 'border-slate-200 dark:border-slate-800 dark:border-white bg-slate-100 dark:bg-black border-b-primary-400 dark:border-b-primary-600' : 'border-slate-200 dark:border-slate-800 bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'}`}>
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
          ${isMe ? 'border-slate-200 dark:border-slate-800 dark:border-white bg-slate-100 dark:bg-black border-b-primary-400 dark:border-b-primary-600' : 'border-slate-200 dark:border-slate-800 bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'}`}>
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
const MyRankCard = ({ entry }) => {
  const { translate, translateData } = useTranslate();
  if (!entry) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4 z-30 px-1 mt-4">
      <Card variant="primary" padded={false} className="p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-base flex-shrink-0">#{entry.rank}</div>
          <Avatar entry={entry} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate">{translate('Your Rank')}</p>
            <p className="text-[10px] font-bold text-white/70">{translate('{exams} exams · {accuracy}% accuracy · {score}% avg score · {time} spent', { exams: entry.totalExams, accuracy: entry.avgAccuracy, score: entry.avgPercentage, time: formatTimeSpent(entry.totalTimeSpent, 'exam') })}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-black text-white">#{entry.rank}</p>
          </div>
        </div>
      </Card>
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
      const url = `/api/air?limit=100${selectedExamId ? `&examId=${selectedExamId}` : ''}`;
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
            
            {/* ── Hero Banner — gold-accented premium treatment, distinct from the free Leaderboard page ── */}
            <section className="relative rounded-2xl overflow-hidden shadow-sm border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">

              <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 items-center gap-2 xl:gap-6 px-3 xl:px-6 pt-2 xl:pt-4 pb-0">
                <div className="space-y-1.5 xl:space-y-3 text-center xl:text-left pb-1 xl:pb-4">
                
                <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 xl:gap-3">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-lg xl:text-3xl font-black uppercase text-black dark:text-white tracking-tight leading-tight"
                >
                  {translate('All India Rank')}
                </motion.h1>
                {/* AIR Badge — gold, animated shimmer to read as a genuine PRO perk */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-black/10 dark:bg-white/20 border border-black/20 dark:border-white/40 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-black dark:text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                >
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}>
                    <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                  </motion.span>
                  {translate('PRO Exclusive')}
                </motion.div>
                </div>

                {/* Exam Filter Dropdown */}
                <div className="max-w-sm mx-auto xl:mx-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Target className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full appearance-none bg-black/10 dark:bg-black border border-black/20 dark:border-slate-700 text-black dark:text-white text-sm font-bold rounded-xl h-9 sm:h-10 pl-9 pr-10 outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/50 focus:border-black/30 dark:focus:border-white/50 backdrop-blur-md cursor-pointer transition-all"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-black dark:text-white">{translate('🌍 All Exams (Overall AIR)')}</option>
                    {exams.map(e => (
                      <option key={e._id} value={e._id} className="bg-white dark:bg-slate-800 text-black dark:text-white">
                        {translateData(e.name)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-black dark:text-white" />
                  </div>
                </div>
                <p className="mt-1 text-[9px] xl:text-xs font-bold text-black/70 dark:text-white/70 uppercase tracking-wider text-center xl:text-left">{translate('Ranking based on total time spent')}</p>
                </div>

                </div>

                {/* Podium */}
                {loading ? (
                  <div className="h-36 flex items-end justify-center gap-4 animate-pulse">
                    <div className="w-16 h-24 bg-black/10 dark:bg-white/20 rounded-t-2xl" />
                    <div className="w-16 h-32 bg-black/10 dark:bg-white/20 rounded-t-2xl" />
                    <div className="w-16 h-20 bg-black/10 dark:bg-white/20 rounded-t-2xl" />
                  </div>
                ) : top3.length > 0 ? (
                  <Podium top3={top3} currentUserId={currentUserId} />
                ) : null}
              </div>
            </section>

            {/* ── My Rank ── */}
            {!loading && myEntry && <MyRankCard entry={myEntry} />}

            {/* ── List Actions ── */}
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-black text-content-primary uppercase">
                  {selectedExamId ? translate('Filtered Ranks') : translate('All Student Ranks')}
               </h3>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
                {[
                  { label: 'Ranked Users', value: `${totalUsers}+`, icon: Users, color: 'text-black dark:text-white' },
                  { label: 'Total Exams Attempted', value: `${totalAttempts}`, icon: Target, color: 'text-black dark:text-white' },
                  { label: selectedExamId ? 'Time Spent On This Exam' : 'Total All Exams Time Spent', value: formatSecondsSpent(totalTimeSpentSeconds), icon: Clock, color: 'text-black dark:text-white' },
                  { label: 'Top Score', value: `${data[0]?.totalScore ?? 0}`, icon: TrendingUp, color: 'text-primary-600 dark:text-primary-400' },
                  { label: 'Top Streak', value: `${Math.max(0, ...data.map(d => d.currentStreak || 0))}🔥`, icon: Flame, color: 'text-black dark:text-white' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-background-surface border-2 border-slate-200 dark:border-slate-800 shadow-sm min-w-0">
                    <stat.icon className={`w-4 h-4 shrink-0 ${stat.color}`} />
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-black text-content-primary leading-tight truncate">{stat.value}</p>
                      <p className="text-[8px] sm:text-[9px] font-bold text-content-muted uppercase leading-tight truncate">{translate(stat.label)}</p>
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
