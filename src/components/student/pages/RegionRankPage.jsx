'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Users, Clock, RefreshCw, MapPin, Sparkles, Map as MapIcon, Building2, Settings as SettingsIcon, Target } from 'lucide-react';
import { m as motion } from 'framer-motion';
import Link from '@/components/common/AppLink';
import API from '../../../lib/api';
import Seo from '../../common/Seo';
import SubscriptionGuard from '../SubscriptionGuard';
import { getCurrentUser } from '../../../lib/utils/authUtils';
import useTranslate from '../../../hooks/useTranslate';
import { formatSecondsExact } from '../../../lib/utils/timeFormat';
import useRequireLogin from '../../../hooks/useRequireLogin';
import { LeaderboardSkeleton, Podium, LeaderboardRow, MyRankCard, RankSortSelect, TABLE_GRID_COLS } from '../rank/RankParts';
import SearchableSelect from '../../common/SearchableSelect';

// State Rank / City Rank — the All India Rank ordering (total exam time first) limited to the
// logged-in student's own state or city, top 10 only. Same layout as All India Rank (shared
// components in ../rank/RankParts), so it follows whichever theme the student picked.
const KINDS = {
  state: {
    api: '/api/state-rank',
    title: 'State Rank',
    seoPath: '/student/state-rank',
    guard: 'State Rank is a PRO feature. Upgrade to see how you rank in your state!',
    needs: 'Add your state in Settings to see your State Rank.',
    Icon: MapIcon,
  },
  city: {
    api: '/api/city-rank',
    title: 'City Rank',
    seoPath: '/student/city-rank',
    guard: 'City Rank is a PRO feature. Upgrade to see how you rank in your city!',
    needs: 'Add your city in Settings to see your City Rank.',
    Icon: Building2,
  },
};

const RegionRankPage = ({ kind }) => {
  useRequireLogin();
  const cfg = KINDS[kind];
  const { translate, translateData } = useTranslate();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [sort, setSort] = useState('time');
  const [state, setState] = useState({ data: [], me: null, place: '', totalUsers: 0, totalAttempts: 0, totalTimeSpentSeconds: 0, needsPlace: false, airUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    (async () => {
      try {
        const res = await API.request('/api/real-exams/all-exams');
        if (res?.success && res.data) setExams(res.data);
      } catch (e) {
        console.error('Failed to load exams', e);
      }
    })();
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const qs = new URLSearchParams();
      if (selectedExamId) qs.set('examId', selectedExamId);
      if (sort !== 'time') qs.set('sort', sort);
      const airQs = new URLSearchParams({ limit: '1' });
      if (selectedExamId) airQs.set('examId', selectedExamId);
      // "Total Active Users" is the All India figure on every rank page.
      const [res, air] = await Promise.all([
        API.request(`${cfg.api}${qs.toString() ? `?${qs}` : ''}`),
        API.request(`/api/air?${airQs}`).catch(() => null),
      ]);
      if (res?.success) {
        setState({ airUsers: air?.success ? air.totalUsers || 0 : 0, data: res.data || [], me: res.me || null, place: res.place || '', totalUsers: res.totalUsers || 0, totalAttempts: res.totalAttempts || 0, totalTimeSpentSeconds: res.totalTimeSpentSeconds || 0, needsPlace: !!res.needsPlace });
      }
    } catch (e) {
      console.error(`${kind} rank fetch error:`, e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cfg.api, kind, selectedExamId, sort]);

  useEffect(() => { load(); }, [load]);

  const { data, me, place, airUsers, totalUsers, totalAttempts, totalTimeSpentSeconds, needsPlace } = state;
  const top3 = data.slice(0, 3);
  const meOutside = me && me.rank > data.length;
  const Icon = cfg.Icon;

  return (
    <div className="min-h-screen pb-32 font-outfit">
      <Seo title={`${cfg.title} | AajExam`} description={`${cfg.title} on AajExam.`} canonical={cfg.seoPath} noIndex={true} />

      <div className="py-2 xl:py-4 space-y-3 xl:space-y-4">
        <SubscriptionGuard message={cfg.guard}>
          <div className="space-y-3 xl:space-y-4">

            {/* ── Hero Banner — same as All India Rank ── */}
            <section className="relative rounded-2xl shadow-md bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-32 right-8 w-96 h-96 rounded-full bg-primary-300/20 blur-3xl" />
              <Trophy className="absolute right-3 top-2 w-28 h-28 text-white/5 rotate-12" />
              </div>

              <div className="relative z-40 grid grid-cols-1 xl:grid-cols-2 items-end gap-2 xl:gap-6 px-3 xl:px-6 pt-3 xl:pt-4 pb-0">
                <div className="space-y-2 xl:space-y-2.5 text-center xl:text-left pb-3 xl:pb-4">
                  <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 xl:gap-3">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="text-xl xl:text-3xl font-black uppercase text-white tracking-tight leading-tight"
                    >
                      {translate(cfg.title)}
                    </motion.h1>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-[0_2px_12px_rgba(251,191,36,0.4)]"
                    >
                      <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </motion.span>
                      {translate('PRO Exclusive')}
                    </motion.div>
                  </div>

                  <p className="text-[11px] xl:text-xs font-bold text-white/80 max-w-md mx-auto xl:mx-0 flex items-center justify-center xl:justify-start gap-1.5">
                    <Trophy className="w-3.5 h-3.5 shrink-0 text-primary-300" />
                    {translate('Top 100 Student Rankings')}
                  </p>

                  {/* Place chip + exam filter, one row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full max-w-xl mx-auto xl:mx-0 text-left">
                    {place && (
                      <div className="inline-flex max-w-full sm:max-w-[45%] shrink-0 items-center gap-2 bg-white/15 border border-white/30 text-white text-sm font-bold rounded-xl h-10 px-3 backdrop-blur-md">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{place}</span>
                      </div>
                    )}
                    <div className="w-full max-w-[260px] min-w-0">
                      <SearchableSelect
                        icon={Target}
                        value={selectedExamId}
                        onChange={setSelectedExamId}
                        options={[{ value: '', label: translate('All Exams ({label})', { label: translate(cfg.title) }) }, ...exams.map((e) => ({ value: e._id, label: translateData(e.name) }))]}
                        placeholder={translate('All Exams ({label})', { label: translate(cfg.title) })}
                      />
                    </div>
                  </div>
                </div>

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

            {/* ── Quick Stats ── */}
            {!loading && data.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 xl:gap-3">
                {[
                  { label: 'Total Active Users', value: `${airUsers}`, icon: Users, tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
                  { label: 'Top Ranked Users', value: `${Math.min(totalUsers, 100)}`, icon: Users, tile: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300' },
                  { label: 'Total Exams Attempted', value: `${totalAttempts}`, icon: Target, tile: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
                  { label: selectedExamId ? 'Time Spent On This Exam' : 'Total Time Spent', value: formatSecondsExact(totalTimeSpentSeconds), icon: Clock, tile: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
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

            {/* ── My Rank ── */}
            {!loading && me && <MyRankCard entry={me} totalUsers={totalUsers} />}

            {/* ── List Actions ── */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-primary-600" />
                <h3 className="text-sm xl:text-base font-black text-content-primary uppercase">{translate('Students')}</h3>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-44 sm:w-72 min-w-0"><RankSortSelect value={sort} onChange={setSort} /></div>
              <button
                onClick={() => load(true)}
                disabled={refreshing || loading}
                title={translate('Refresh Ranks')}
                className="flex items-center gap-1.5 px-3 h-9 rounded-xl font-black text-[10px] uppercase border-2 border-slate-200 dark:border-slate-800 bg-background-surface text-content-muted hover:border-slate-200 dark:hover:border-white transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{translate('Refresh')}</span>
              </button>
              </div>
            </div>

            {/* ── Leaderboard List ── */}
            {loading ? (
              <LeaderboardSkeleton />
            ) : needsPlace ? (
              <div className="py-16 sm:py-20 text-center space-y-2 xl:space-y-4">
                <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
                <p className="text-sm text-content-muted font-bold max-w-sm mx-auto">{translate(cfg.needs)}</p>
                <Link href="/student/settings">
                  <span className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary-600 hover:bg-primary-800 text-white rounded-full font-black text-xs uppercase mt-2 transition-colors">
                    <SettingsIcon className="w-3.5 h-3.5" />{translate('Settings')}
                  </span>
                </Link>
              </div>
            ) : data.length === 0 ? (
              <div className="py-16 sm:py-20 text-center space-y-2 xl:space-y-4">
                <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
                <h3 className="text-lg sm:text-xl font-black text-content-muted uppercase">{translate('No Ranks Found')}</h3>
                <p className="text-sm text-content-muted font-bold">{translate('No test attempts match the current filter.')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`hidden xl:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 pb-1`}>
                  <p className="text-[10px] font-black text-content-muted uppercase text-center">#</p>
                  <p className="text-[10px] font-black text-content-muted uppercase">{translate('Player')}</p>
                  <p className="text-[10px] font-black text-content-muted uppercase text-center whitespace-nowrap">{translate('Time Spent')}</p>
                  <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Exams')}</p>
                  <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Marks')}</p>
                  <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Correct')}</p>
                  <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Score')}</p>
                  <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Accuracy')}</p>
                  <p className="text-[10px] font-black text-content-muted uppercase text-center">{translate('Avg Score')}</p>
                  <div />
                </div>
                {data.map((entry, i) => (
                  <LeaderboardRow key={entry.userId} entry={entry} index={i} currentUserId={currentUserId} />
                ))}
                {meOutside && (
                  <>
                    <p className="text-center text-xs font-black text-content-muted">···</p>
                    <LeaderboardRow entry={me} index={data.length} currentUserId={currentUserId} />
                  </>
                )}
              </div>
            )}
          </div>
        </SubscriptionGuard>
      </div>
    </div>
  );
};

export default RegionRankPage;
