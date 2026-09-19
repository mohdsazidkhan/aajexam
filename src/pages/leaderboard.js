'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Medal, Crown, Flame, Target, TrendingUp,
  Star, Zap, ChevronRight, ChevronLeft, Users, RefreshCw, FileText, BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import { getCurrentUser } from '../lib/utils/authUtils';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl ${className}`} />
);

const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-background-surface rounded-2xl border-2 border-border-primary border-b-4">
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
  1: {
    gradient: 'from-black dark:from-white to-black dark:to-white',
    ringColor: 'ring-black/10 dark:ring-white/10 dark:ring-white/10',
    textColor: 'text-black dark:text-white dark:text-white',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white dark:text-white',
    pillBg: 'bg-gradient-to-r from-black dark:from-white to-black dark:to-white text-white dark:text-black',
    icon: Crown,
  },
  2: {
    gradient: 'from-slate-300 to-slate-500',
    ringColor: 'ring-slate-400 dark:ring-slate-500',
    textColor: 'text-slate-500 dark:text-slate-400',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    pillBg: 'bg-gradient-to-r from-slate-300 to-slate-500 text-white',
    icon: Medal,
  },
  3: {
    gradient: 'from-slate-100 dark:from-slate-800 to-black dark:to-white',
    ringColor: 'ring-black/10 dark:ring-white/10 dark:ring-white/10',
    textColor: 'text-black dark:text-white dark:text-white',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white dark:text-white',
    pillBg: 'bg-gradient-to-r from-slate-100 dark:from-slate-800 to-black dark:to-white text-white',
    icon: Medal,
  },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['bg-black dark:bg-white', 'bg-black dark:bg-white', 'bg-primary-500', 'bg-black dark:bg-white', 'bg-black dark:bg-white', 'bg-black dark:bg-white', 'bg-black dark:bg-white', 'bg-black dark:bg-white'];

const Avatar = ({ entry, size = 'md', ring = false }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const sizes = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-16 h-16 text-xl',
  };
  const initial = ((entry?.name || entry?.username) || 'A').charAt(0).toUpperCase();
  const colorIdx = initial.charCodeAt(0) % AVATAR_COLORS.length;
  const rc = rankConfig[entry?.rank];

  const ringClass = ring && rc ? `ring-4 ${rc.ringColor} ring-offset-2 ring-offset-background-surface` : '';

  return entry?.profilePicture && !imgFailed ? (
    <img
      src={entry.profilePicture}
      alt={entry.name || 'User'}
      onError={() => setImgFailed(true)}
      className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${ringClass}`}
    />
  ) : (
    <div className={`${sizes[size]} ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center font-black text-white flex-shrink-0 ${ringClass}`}>
      {initial}
    </div>
  );
};

// ─── Top 3 Podium ─────────────────────────────────────────────────────────────
const Podium = ({ top3, currentUserId }) => {
  // Reorder: 2nd | 1st | 3rd
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumH = { 1: 'h-20 lg:h-24', 2: 'h-14 lg:h-16', 3: 'h-10 lg:h-12' };
  const podiumGradient = {
    1: 'from-black dark:from-white to-black dark:to-white',
    2: 'from-slate-300 to-slate-400',
    3: 'from-slate-100 dark:from-slate-800 to-black dark:to-white',
  };

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 pt-6 pb-0 px-2">
      {ordered.map((entry) => {
        if (!entry) return null;
        const rc = rankConfig[entry.rank] || {};
        const isMe = String(entry.userId) === String(currentUserId);
        const isFirst = entry.rank === 1;

        return (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * entry.rank, type: 'spring', stiffness: 120 }}
            className={`flex flex-col items-center gap-1.5 ${isFirst ? 'scale-105 sm:scale-110 -mb-1' : ''}`}
          >
            {isFirst && <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white animate-bounce" />}
            <Avatar entry={entry} size={isFirst ? 'xl' : 'lg'} ring />
            {isMe && (
              <span className="text-[9px] font-black uppercase bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded-full">You</span>
            )}
            <div className="text-center max-w-[76px] sm:max-w-[96px]">
              <p className={`text-[11px] sm:text-xs font-black leading-tight break-words ${isMe ? 'text-black dark:text-white' : 'text-white'}`}>
                {entry.name || entry.username || 'User'}
              </p>
              <p className="text-[10px] font-bold text-white/60">{entry.avgPercentage}%</p>
            </div>
            <div className={`w-16 sm:w-20 ${podiumH[entry.rank] || 'h-10'} bg-gradient-to-b ${podiumGradient[entry.rank] || 'from-slate-300 to-slate-400'} rounded-t-xl sm:rounded-t-2xl flex items-end justify-center pb-2`}>
              <span className="text-white font-black text-sm">#{entry.rank}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Shared table column template (kept identical between header & rows so
// everything lines up on desktop) — desktop only; mobile uses a stacked card. ──
const TABLE_GRID_COLS = 'grid-cols-[40px_1fr_84px_84px_84px_84px_84px_84px_20px]';

// ─── List Row — table row on desktop (lg+), stacked card on mobile ────────────
const LeaderboardRow = ({ entry, index, currentUserId, type }) => {
  const rc = rankConfig[entry.rank];
  const isMe = String(entry.userId) === String(currentUserId);
  const isTop3 = entry.rank <= 3;

  const rankBadge = (
    <div className={`
      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs
      ${isTop3 ? `bg-gradient-to-br ${rc.gradient} text-white shadow-md` : 'bg-slate-100 dark:bg-slate-800 text-content-muted'}
    `}>
      {entry.rank}
    </div>
  );

  const identity = (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <p className={`text-sm font-black truncate leading-tight ${isMe ? 'text-black dark:text-white dark:text-white' : 'text-content-primary'}`}>
          {entry.name || entry.username || 'Anonymous'}
        </p>
        {isMe && (
          <span className="text-[9px] font-black uppercase bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded-full flex-shrink-0">You</span>
        )}
        {entry.subscriptionStatus === 'PRO' && (
          <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white px-1.5 py-0.5 rounded-full flex-shrink-0">PRO</span>
        )}
      </div>
      {entry.username && (
        <p className="text-[10px] font-bold text-content-muted/80 truncate">@{entry.username}</p>
      )}
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
          hidden lg:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 py-3 rounded-2xl border-2 border-b-4 transition-all group cursor-pointer
          ${isMe
            ? 'border-slate-200 dark:border-slate-800 dark:border-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-b-primary-400 dark:border-b-primary-600'
            : 'border-border-primary bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'
          }
        `}>
          {rankBadge}
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar entry={entry} size="md" />
            {identity}
          </div>
          <p className="text-xs font-black text-content-primary text-center flex items-center justify-center gap-1">
            <Target className="w-3 h-3 text-content-muted" />{entry.totalQuizzes}
          </p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalMarks ?? 0}</p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalCorrect ?? 0}</p>
          <p className="text-xs font-black text-content-primary text-center">{entry.totalScore ?? 0}</p>
          <p className={`text-sm font-black text-center ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgAccuracy}%</p>
          <p className="text-sm font-black text-center text-content-primary">{entry.avgPercentage}%</p>
          <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>

        {/* ── Mobile: stacked card — every stat carries its own heading ── */}
        <div className={`
          flex lg:hidden flex-col gap-3 px-3.5 py-3 rounded-2xl border-2 border-b-4 transition-all group cursor-pointer
          ${isMe
            ? 'border-slate-200 dark:border-slate-800 dark:border-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-b-primary-400 dark:border-b-primary-600'
            : 'border-border-primary bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'
          }
        `}>
          <div className="flex items-center gap-3">
            {rankBadge}
            <Avatar entry={entry} size="md" />
            <div className="flex-1 min-w-0">
              {identity}
              {entry.currentStreak > 0 && (
                <span className="text-[10px] font-bold text-black dark:text-white flex items-center gap-1 mt-0.5">
                  <Flame className="w-3 h-3" />{entry.currentStreak} day streak
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </div>

          <div className="grid grid-cols-3 gap-2 pl-[52px]">
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">{type === 'quiz' ? 'Quizzes' : 'Exams'}</p>
              <p className="text-sm font-black text-content-primary">{entry.totalQuizzes}</p>
            </div>
            {type === 'quiz' && (
              <>
                <div>
                  <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">Marks</p>
                  <p className="text-sm font-black text-content-primary">{entry.totalMarks ?? 0}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">Correct</p>
                  <p className="text-sm font-black text-content-primary">{entry.totalCorrect ?? 0}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">Score</p>
                  <p className="text-sm font-black text-content-primary">{entry.totalScore ?? 0}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">Accuracy</p>
              <p className={`text-sm font-black ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgAccuracy}%</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-content-muted uppercase tracking-wide">Avg Score</p>
              <p className="text-sm font-black text-content-primary">{entry.avgPercentage}%</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── My Rank Sticky Card ──────────────────────────────────────────────────────
const MyRankCard = ({ entry, type }) => {
  if (!entry) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-4 z-30 px-1 mt-4"
    >
      <Card variant="primary" padded={false} className="p-3 sm:p-4 shadow-aajexam-primary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-base flex-shrink-0">
            #{entry.rank}
          </div>
          <Avatar entry={entry} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate">Your Rank</p>
            <p className="text-[10px] font-bold text-white/70">{entry.totalQuizzes} {type === 'quiz' ? 'quizzes' : 'exams'} · {entry.avgPercentage}% avg score</p>
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
const LeaderboardPage = () => {
  const [type, setType] = useState('quiz'); // 'quiz' or 'exam'
  const [period, setPeriod] = useState('all-time');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 10;
  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await API.request(`/api/leaderboard?type=${type}&period=${period}&limit=50`);
      if (res?.success) setData(res.data || []);
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
  const rest = data.slice(3);
  const totalPages = Math.max(1, Math.ceil(rest.length / ROWS_PER_PAGE));
  const pagedRest = rest.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const myEntry = data.find(e => String(e.userId) === String(currentUserId));

  return (
    <div className="min-h-screen pb-32 font-outfit">
      <Seo
        title="Leaderboard – Top Rankers | AajExam"
        description="See who is topping the AajExam leaderboard. Compete with thousands of students preparing for govt exams."
        canonical="/leaderboard"
        noIndex={false}
      />

      <div className="space-y-5 lg:space-y-8">

        {/* ── Hero Banner ── */}
        <section className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-b-8 border-black/20 dark:border-white/20 dark:border-white/30">
          {/* Gradient works in both dark/light via dark: class on body (class-based dark mode) */}
          <div className="absolute inset-0 bg-gradient-to-br from-black dark:from-white via-black dark:via-white to-black dark:to-white dark:to-slate-900" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 px-5 sm:px-8 pt-6 sm:pt-8 pb-0 text-center">
            
            {/* Type Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex p-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 shadow-inner">
                <button
                  onClick={() => setType('quiz')}
                  className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                    type === 'quiz' ? 'bg-white text-black dark:text-white shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" /> Quizzes
                </button>
                <button
                  onClick={() => setType('exam')}
                  className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                    type === 'exam' ? 'bg-white text-black dark:text-white shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Exams
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-3"
            >
              <Trophy className="w-3.5 h-3.5 text-black dark:text-white" /> Hall of Fame
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight"
            >
              Leaderboard
            </motion.h1>
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mt-1">Top {type === 'quiz' ? 'Quiz' : 'Exam'} Performers</p>

            {/* Podium */}
            {loading ? (
              <div className="h-36 flex items-end justify-center gap-4 animate-pulse">
                <div className="w-16 h-24 bg-white/20 rounded-t-2xl" />
                <div className="w-16 h-32 bg-white/20 rounded-t-2xl" />
                <div className="w-16 h-20 bg-white/20 rounded-t-2xl" />
              </div>
            ) : top3.length > 0 ? (
              <Podium top3={top3} currentUserId={currentUserId} />
            ) : null}
          </div>
        </section>

        {/* ── Period Tabs ── */}
        <div className="flex gap-2 sm:gap-3">
          {PERIODS.map(p => {
            const Icon = p.icon;
            const isActive = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wide border-2 border-b-4 transition-all active:translate-y-0.5
                  ${isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg'
                    : 'bg-background-surface text-content-muted border-border-primary hover:border-slate-200 dark:border-slate-800 dark:hover:border-white'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{p.label}</span>
                <span className="sm:hidden">{p.label.split(' ')[0]}</span>
              </button>
            );
          })}
          {/* Refresh button */}
          <button
            onClick={() => fetchLeaderboard(true)}
            disabled={refreshing || loading}
            title="Refresh"
            className="px-3 py-2.5 rounded-2xl font-black text-[11px] uppercase border-2 border-b-4 border-border-primary bg-background-surface text-content-muted hover:border-slate-200 dark:border-slate-800 dark:hover:border-white transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ── Quick Stats ── */}
        {!loading && data.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Players', value: `${data.length}+`, icon: Users, color: 'text-black dark:text-white dark:text-white' },
              { label: 'Top Score', value: `${data[0]?.avgPercentage ?? 0}%`, icon: TrendingUp, color: 'text-primary-500 dark:text-primary-400' },
              { label: 'Top Streak', value: `${Math.max(0, ...data.map(d => d.currentStreak || 0))}🔥`, icon: Flame, color: 'text-black dark:text-white dark:text-white' },
            ].map((stat, i) => (
              <Card key={i} padded={false} className="p-3 sm:p-4 text-center">
                <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <p className="text-base sm:text-lg font-black text-content-primary">{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-content-muted uppercase">{stat.label}</p>
              </Card>
            ))}
          </motion.div>
        )}

        {/* ── Leaderboard List ── */}
        {loading ? (
          <LeaderboardSkeleton />
        ) : data.length === 0 ? (
          <div className="py-16 sm:py-20 text-center space-y-4">
            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
            <h3 className="text-lg sm:text-xl font-black text-content-muted uppercase">No data yet for this period</h3>
            <p className="text-sm text-content-muted font-bold">Attempt quizzes to appear on the leaderboard!</p>
            <Link href="/quizzes">
              <button className="px-6 py-2.5 bg-black dark:bg-white hover:bg-black dark:hover:bg-white text-white dark:text-black rounded-full font-black text-xs uppercase mt-2 transition-colors">
                Start a Quiz
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
              <div className={`hidden lg:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 pb-1`}>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">#</p>
                <p className="text-[10px] font-black text-content-muted uppercase">Player</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">{type === 'quiz' ? 'Quizzes' : 'Exams'}</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">Marks</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">Correct</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">Score</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">Accuracy</p>
                <p className="text-[10px] font-black text-content-muted uppercase text-center">Avg Score</p>
                <div />
              </div>

              {/* Rows — top 3 already shown on the podium above */}
              {pagedRest.map((entry, i) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  index={(page - 1) * ROWS_PER_PAGE + i}
                  currentUserId={currentUserId}
                  type={type}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-full border-2 border-border-primary bg-background-surface text-content-muted flex items-center justify-center disabled:opacity-40 hover:border-slate-200 dark:border-slate-800 dark:hover:border-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black text-content-muted uppercase">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-full border-2 border-border-primary bg-background-surface text-content-muted flex items-center justify-center disabled:opacity-40 hover:border-slate-200 dark:border-slate-800 dark:hover:border-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ── My Rank — sticky bottom ── */}
      {!loading && myEntry && <MyRankCard entry={myEntry} type={type} />}
    </div>
  );
};

export default LeaderboardPage;
