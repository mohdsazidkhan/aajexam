'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Medal, Crown, Flame, Target, TrendingUp,
  ChevronRight, Users, RefreshCw, Globe, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import SubscriptionGuard from '../components/SubscriptionGuard';
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

// ─── Rank visual config ────────────────────────────────────────────────────────
const rankConfig = {
  1: { gradient: 'from-yellow-400 to-amber-500', ringColor: 'ring-yellow-400 dark:ring-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
  2: { gradient: 'from-slate-300 to-slate-500', ringColor: 'ring-slate-400 dark:ring-slate-500', textColor: 'text-slate-500 dark:text-slate-400' },
  3: { gradient: 'from-orange-300 to-amber-500', ringColor: 'ring-orange-400 dark:ring-orange-500', textColor: 'text-orange-600 dark:text-orange-400' },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500'];

const Avatar = ({ entry, size = 'md', ring = false }) => {
  const sizes = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-16 h-16 text-xl' };
  const initial = ((entry?.name || entry?.username) || 'A').charAt(0).toUpperCase();
  const colorIdx = initial.charCodeAt(0) % AVATAR_COLORS.length;
  const rc = rankConfig[entry?.rank];
  const ringClass = ring && rc ? `ring-4 ${rc.ringColor} ring-offset-2 ring-offset-background-surface` : '';

  return entry?.profilePicture ? (
    <img src={entry.profilePicture} alt={entry.name || 'User'} className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${ringClass}`} />
  ) : (
    <div className={`${sizes[size]} ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center font-black text-white flex-shrink-0 ${ringClass}`}>
      {initial}
    </div>
  );
};

// ─── Top 3 Podium ─────────────────────────────────────────────────────────────
const Podium = ({ top3, currentUserId }) => {
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumH = { 1: 'h-20 lg:h-24', 2: 'h-14 lg:h-16', 3: 'h-10 lg:h-12' };
  const podiumGradient = { 1: 'from-yellow-400 to-amber-500', 2: 'from-slate-300 to-slate-400', 3: 'from-orange-300 to-amber-400' };

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 pt-6 pb-0 px-2">
      {ordered.map((entry) => {
        if (!entry) return null;
        const isMe = String(entry.userId) === String(currentUserId);
        const isFirst = entry.rank === 1;

        return (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * entry.rank, type: 'spring', stiffness: 120 }}
            className={`flex flex-col items-center gap-1.5 ${isFirst ? 'scale-105 sm:scale-110 -mb-1' : ''}`}
          >
            {isFirst && <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce" />}
            <Avatar entry={entry} size={isFirst ? 'xl' : 'lg'} ring />
            {isMe && <span className="text-[9px] font-black uppercase bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">You</span>}
            <div className="text-center max-w-[72px] sm:max-w-[88px]">
              <p className={`text-[11px] sm:text-xs font-black truncate ${isMe ? 'text-blue-300' : 'text-white'}`}>
                {entry.name || entry.username || 'User'}
              </p>
              <p className="text-[10px] font-bold text-white/60">{entry.avgPercentage}% avg</p>
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
const LeaderboardRow = ({ entry, index, currentUserId }) => {
  const rc = rankConfig[entry.rank];
  const isMe = String(entry.userId) === String(currentUserId);
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index * 0.025, 0.5) }}>
      <Link href={entry.username ? `/u/${entry.username}` : '#'}>
        <div className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border-2 border-b-4 transition-all group cursor-pointer
          ${isMe ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 border-b-blue-400 dark:border-b-blue-600' : 'border-border-primary bg-background-surface hover:border-primary-300 dark:hover:border-primary-700'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs
            ${isTop3 ? `bg-gradient-to-br ${rc.gradient} text-white shadow-md` : 'bg-slate-100 dark:bg-slate-800 text-content-muted'}`}>
            {entry.rank}
          </div>
          <Avatar entry={entry} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`text-sm font-black truncate leading-tight ${isMe ? 'text-blue-600 dark:text-blue-400' : 'text-content-primary'}`}>
                {entry.name || entry.username || 'Anonymous'}
              </p>
              {isMe && <span className="text-[9px] font-black uppercase bg-blue-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">You</span>}
              {entry.subscriptionStatus === 'PRO' && <span className="text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full flex-shrink-0">PRO</span>}
            </div>
            <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
              <span className="text-[10px] font-bold text-content-muted flex items-center gap-1">
                <Target className="w-3 h-3" />{entry.totalExams} exams
              </span>
              {entry.currentStreak > 0 && (
                <span className="text-[10px] font-bold text-orange-500 dark:text-orange-400 flex items-center gap-1">
                  <Flame className="w-3 h-3" />{entry.currentStreak} day streak
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-base font-black ${isTop3 ? rc?.textColor : 'text-content-primary'}`}>{entry.avgPercentage}%</p>
            <p className="text-[10px] font-bold text-content-muted">{entry.avgAccuracy}% acc</p>
          </div>
          <ChevronRight className="w-4 h-4 text-border-primary group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 hidden sm:block" />
        </div>
      </Link>
    </motion.div>
  );
};

// ─── My Rank Sticky Card ──────────────────────────────────────────────────────
const MyRankCard = ({ entry }) => {
  if (!entry) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4 z-30 px-1">
      <Card variant="primary" padded={false} className="p-3 sm:p-4 flex items-center gap-3 shadow-duo-primary bg-blue-500 border-blue-600 dark:bg-blue-600 dark:border-blue-700">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-base flex-shrink-0">#{entry.rank}</div>
        <Avatar entry={entry} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">Your Rank</p>
          <p className="text-[10px] font-bold text-white/70">{entry.totalExams} exams · {entry.avgPercentage}% avg score</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-black text-white">#{entry.rank}</p>
        </div>
      </Card>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AllIndiaRankPage = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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
      const url = `/api/air?limit=50${selectedExamId ? `&examId=${selectedExamId}` : ''}`;
      const res = await API.request(url);
      if (res?.success) setData(res.data || []);
    } catch (e) {
      console.error('AIR fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedExamId]);

  useEffect(() => { fetchAIR(); }, [fetchAIR]);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const myEntry = data.find(e => String(e.userId) === String(currentUserId));

  return (
    <div className="min-h-screen pb-32 font-outfit">
      <Seo
        title="All India Rank (AIR) | AajExam"
        description="Check your overall All India Rank and exam-specific rankings. Exclusive feature for PRO users."
        canonical="/all-india-rank"
        noIndex={true}
      />

      <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6 space-y-6">
        <SubscriptionGuard message="All India Rank (AIR) is a PRO feature. Upgrade to see where you stand globally and by exam!">
          <div className="space-y-5 lg:space-y-8">
            
            {/* ── Hero Banner ── */}
            <section className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-b-8 border-blue-600/20 dark:border-blue-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-700 dark:from-blue-900 dark:via-cyan-900 dark:to-slate-900" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

              <div className="relative z-10 px-5 sm:px-8 pt-6 sm:pt-8 pb-0 text-center">
                
                {/* AIR Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-3"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-300" /> PRO EXCLUSIVE
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight leading-tight"
                >
                  All India Rank
                </motion.h1>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1 mb-6">
                  {selectedExamId ? 'Exam Filtered Rankings' : 'Overall Platform Rankings'}
                </p>

                {/* Exam Filter Dropdown */}
                <div className="max-w-xs mx-auto mb-6 relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Target className="w-4 h-4 text-blue-200" />
                  </div>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full appearance-none bg-black/20 border border-white/20 text-white text-sm font-bold rounded-2xl py-2.5 pl-9 pr-10 outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-md cursor-pointer transition-all"
                  >
                    <option value="" className="bg-slate-800 text-white">🌍 All Exams (Overall AIR)</option>
                    {exams.map(e => (
                      <option key={e._id} value={e._id} className="bg-slate-800 text-white">
                        {e.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-blue-200" />
                  </div>
                </div>

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

            {/* ── List Actions ── */}
            <div className="flex justify-between items-center px-1">
               <h3 className="text-sm font-black text-content-primary uppercase">
                  {selectedExamId ? 'Filtered Ranks' : 'Global Ranks'}
               </h3>
               <button
                onClick={() => fetchAIR(true)}
                disabled={refreshing || loading}
                title="Refresh Ranks"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-[10px] uppercase border-2 border-b-4 border-border-primary bg-background-surface text-content-muted hover:border-blue-300 dark:hover:border-blue-700 transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* ── Quick Stats ── */}
            {!loading && data.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Ranked Users', value: `${data.length}+`, icon: Users, color: 'text-blue-500 dark:text-blue-400' },
                  { label: 'Top Score', value: `${data[0]?.totalScore ?? 0}`, icon: TrendingUp, color: 'text-emerald-500 dark:text-emerald-400' },
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
                <Globe className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
                <h3 className="text-lg sm:text-xl font-black text-content-muted uppercase">No Ranks Found</h3>
                <p className="text-sm text-content-muted font-bold">No test attempts match the current filter.</p>
                <button 
                  onClick={() => setSelectedExamId('')}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-black text-xs uppercase mt-2 transition-colors"
                >
                  View All Exams
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={selectedExamId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <div className="flex items-center gap-3 px-3.5 pb-1">
                    <p className="w-8 text-[10px] font-black text-content-muted uppercase text-center">#</p>
                    <div className="w-10 flex-shrink-0" />
                    <p className="text-[10px] font-black text-content-muted uppercase flex-1">Player</p>
                    <p className="text-[10px] font-black text-content-muted uppercase">Accuracy</p>
                    <div className="w-4 hidden sm:block" />
                  </div>
                  {data.map((entry, i) => (
                    <LeaderboardRow key={entry.userId} entry={entry} index={i} currentUserId={currentUserId} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* ── My Rank — sticky bottom ── */}
          {!loading && myEntry && <MyRankCard entry={myEntry} />}
        </SubscriptionGuard>
      </div>
    </div>
  );
};

export default AllIndiaRankPage;
