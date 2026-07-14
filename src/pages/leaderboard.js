'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Medal, Crown, Flame, Target, TrendingUp,
  Star, Zap, ChevronRight, Users, RefreshCw, FileText, BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import { getCurrentUser } from '../lib/utils/authUtils';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
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
    gradient: 'from-yellow-400 to-amber-500',
    ringColor: 'ring-yellow-400 dark:ring-yellow-500',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    badgeBg: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    pillBg: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
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
    gradient: 'from-orange-300 to-amber-500',
    ringColor: 'ring-orange-400 dark:ring-orange-500',
    textColor: 'text-orange-600 dark:text-orange-400',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    pillBg: 'bg-gradient-to-r from-orange-300 to-amber-500 text-white',
    icon: Medal,
  },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500'];

const Avatar = ({ entry, size = 'md', ring = false }) => {
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

  return entry?.profilePicture ? (
    <img
      src={entry.profilePicture}
      alt={entry.name || 'User'}
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
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-orange-300 to-amber-400',
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
            {isFirst && <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce" />}
            <Avatar entry={entry} size={isFirst ? 'xl' : 'lg'} ring />
            {isMe && (
              <span className="text-[9px] font-black uppercase bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">You</span>
            )}
            <div className="text-center max-w-[72px] sm:max-w-[88px]">
              <p className={`text-[11px] sm:text-xs font-black truncate ${isMe ? 'text-indigo-300' : 'text-white'}`}>
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

// ─── List Row ─────────────────────────────────────────────────────────────────
const LeaderboardRow = ({ entry, index, currentUserId, type }) => {
  const rc = rankConfig[entry.rank];
  const isMe = String(entry.userId) === String(currentUserId);
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.5) }}
    >
      <Link href={entry.username ? `/u/${entry.username}` : '#'}>
        <div className={`
          flex items-center gap-3 px-3.5 py-3 rounded-2xl border-2 border-b-4 transition-all group cursor-pointer
          ${isMe
            ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 border-b-indigo-400 dark:border-b-indigo-600'
            : 'border-border-primary bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'
          }
        `}>
          {/* Rank badge */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs
            ${isTop3
              ? `bg-gradient-to-br ${rc.gradient} text-white shadow-md`
              : 'bg-slate-100 dark:bg-slate-800 text-content-muted'
            }
          `}>
            {entry.rank}
          </div>

          {/* Avatar */}
          <Avatar entry={entry} size="md" />

          {/* Name & Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`text-sm font-black truncate leading-tight ${isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-content-primary'}`}>
                {entry.name || entry.username || 'Anonymous'}
              </p>
              {isMe && (
                <span className="text-[9px] font-black uppercase bg-indigo-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">You</span>
              )}
              {entry.subscriptionStatus === 'PRO' && (
                <span className="text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full flex-shrink-0">PRO</span>
              )}
            </div>
            <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
              <span className="text-[10px] font-bold text-content-muted flex items-center gap-1">
                <Target className="w-3 h-3" />{entry.totalQuizzes} {type === 'quiz' ? 'quizzes' : 'exams'}
              </span>
              {entry.currentStreak > 0 && (
                <span className="text-[10px] font-bold text-orange-500 dark:text-orange-400 flex items-center gap-1">
                  <Flame className="w-3 h-3" />{entry.currentStreak} day streak
                </span>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-right flex-shrink-0">
            <p className={`text-base font-black ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>
              {entry.avgPercentage}%
            </p>
            <p className="text-[10px] font-bold text-content-muted">{entry.avgAccuracy}% acc</p>
          </div>

          <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 hidden sm:block" />
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
      className="sticky bottom-4 z-30 px-1"
    >
      <Card variant="primary" padded={false} className="p-3 sm:p-4 flex items-center gap-3 shadow-duo-primary">
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

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
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
        <section className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-b-8 border-violet-600/20 dark:border-violet-900/30">
          {/* Gradient works in both dark/light via dark: class on body (class-based dark mode) */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 dark:from-violet-900 dark:via-indigo-900 dark:to-slate-900" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 px-5 sm:px-8 pt-6 sm:pt-8 pb-0 text-center">
            
            {/* Type Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex p-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 shadow-inner">
                <button
                  onClick={() => setType('quiz')}
                  className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                    type === 'quiz' ? 'bg-white text-violet-700 shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" /> Quizzes
                </button>
                <button
                  onClick={() => setType('exam')}
                  className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                    type === 'exam' ? 'bg-white text-violet-700 shadow-md' : 'text-white/80 hover:text-white'
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
              <Trophy className="w-3.5 h-3.5 text-yellow-300" /> Hall of Fame
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
              <div className="h-36 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
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
                    ? 'bg-indigo-500 dark:bg-indigo-600 text-white border-indigo-600 dark:border-indigo-700 shadow-lg'
                    : 'bg-background-surface text-content-muted border-border-primary hover:border-indigo-300 dark:hover:border-indigo-700'
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
            className="px-3 py-2.5 rounded-2xl font-black text-[11px] uppercase border-2 border-b-4 border-border-primary bg-background-surface text-content-muted hover:border-indigo-300 dark:hover:border-indigo-700 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ── Quick Stats ── */}
        {!loading && data.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Players', value: `${data.length}+`, icon: Users, color: 'text-indigo-500 dark:text-indigo-400' },
              { label: 'Top Score', value: `${data[0]?.avgPercentage ?? 0}%`, icon: TrendingUp, color: 'text-emerald-500 dark:text-emerald-400' },
              { label: 'Top Streak', value: `${Math.max(0, ...data.map(d => d.currentStreak || 0))}🔥`, icon: Flame, color: 'text-orange-500 dark:text-orange-400' },
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
              <button className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-black text-xs uppercase mt-2 transition-colors">
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
              {/* Column header */}
              <div className="flex items-center gap-3 px-3.5 pb-1">
                <p className="w-8 text-[10px] font-black text-content-muted uppercase text-center">#</p>
                <div className="w-10 flex-shrink-0" />
                <p className="text-[10px] font-black text-content-muted uppercase flex-1">Player</p>
                <p className="text-[10px] font-black text-content-muted uppercase">Avg Score</p>
                <div className="w-4 hidden sm:block" />
              </div>

              {/* All rows */}
              {data.map((entry, i) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  index={i}
                  currentUserId={currentUserId}
                  type={type}
                />
              ))}
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
