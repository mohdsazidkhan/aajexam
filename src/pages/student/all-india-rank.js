'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Target,
  Users, RefreshCw, Globe, Sparkles, Clock
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Seo from '../../components/common/Seo';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';
import { getCurrentUser } from '../../lib/utils/authUtils';
import { formatSecondsExact } from '../../lib/utils/timeFormat';
import useTranslate from '../../hooks/useTranslate';
import Pagination from '../../components/common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../lib/constants/pagination';
import useRequireLogin from '../../hooks/useRequireLogin';
import { LeaderboardSkeleton, Podium, LeaderboardRow, MyRankCard, RankSortSelect, TABLE_GRID_COLS } from '../../components/student/rank/RankParts';
import SearchableSelect from '../../components/common/SearchableSelect';

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AllIndiaRankPage = () => {
  useRequireLogin();
  const { translate, translateData } = useTranslate();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [sort, setSort] = useState('time');
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
      const url = `/api/air?limit=100${selectedExamId ? `&examId=${selectedExamId}` : ''}${sort !== 'time' ? `&sort=${sort}` : ''}`;
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
  }, [selectedExamId, sort]);

  useEffect(() => { fetchAIR(); }, [fetchAIR]);
  useEffect(() => { setPage(1); }, [selectedExamId, sort]);

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
            <section className="relative rounded-2xl text-on-primary bg-primary-600">
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <Trophy className="absolute right-3 top-2 w-28 h-28 text-white/5 rotate-12" />
              </div>

              <div className="relative z-40 grid grid-cols-1 xl:grid-cols-2 items-end gap-2 xl:gap-6 px-3 xl:px-6 pt-3 xl:pt-4 pb-0">
                <div className="space-y-2 xl:space-y-2.5 text-center xl:text-left pb-3 xl:pb-4">
                  <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 xl:gap-3">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="text-xl xl:text-3xl font-bold text-white tracking-tight leading-tight"
                    >
                      {translate('All India Rank')}
                    </motion.h1>
                    {/* PRO badge — gold, animated sparkle */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-1.5 text-on-primary px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.08em] bg-primary-600"
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

                  {/* Exam filter + rank-based-on, one row */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm mx-auto xl:mx-0 text-left">
                    <div className="w-full max-w-[260px] min-w-0">
                      <SearchableSelect
                        icon={Target}
                        value={selectedExamId}
                        onChange={setSelectedExamId}
                        options={[{ value: '', label: translate('All Exams ({label})', { label: 'AIR' }) }, ...exams.map((e) => ({ value: e._id, label: translateData(e.name) }))]}
                        placeholder={translate('All Exams ({label})', { label: 'AIR' })}
                      />
                    </div>
                  </div>
                </div>

                {/* Podium */}
                {loading ? (
                  <div className="h-24 flex items-end justify-center gap-3 animate-pulse">
                    <div className="w-16 h-14 rounded-t-xl" />
                    <div className="w-16 h-20 rounded-t-xl" />
                    <div className="w-16 h-10 rounded-t-xl" />
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
                  { label: 'Total Active Users', value: `${totalUsers}`, icon: Users, tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
                  { label: 'Top Ranked Users', value: `${Math.min(totalUsers, 100)}`, icon: Users, tile: 'text-primary-600' },
                  { label: 'Total Exams Attempted', value: `${totalAttempts}`, icon: Target, tile: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
                  { label: selectedExamId ? 'Time Spent On This Exam' : 'Total Time Spent', value: formatSecondsExact(totalTimeSpentSeconds), icon: Clock, tile: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-background-surface border border-border-primary transition-shadow min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.tile}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base sm:text-xl font-bold text-content-primary leading-tight truncate">{stat.value}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-content-muted uppercase leading-tight truncate">{translate(stat.label)}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── My Rank ── */}
            {!loading && myEntry && <MyRankCard entry={myEntry} totalUsers={totalUsers} />}

            {/* ── List Actions ── */}
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2.5">
                 <span className="h-6 w-1.5 rounded-full bg-primary-600" />
                 <h3 className="text-sm xl:text-base font-bold text-content-primary uppercase">
                   {selectedExamId ? translate('Filtered Ranks') : translate('Students')}
                 </h3>
               </div>
               <div className="flex items-center gap-2 min-w-0">
                 <div className="w-44 sm:w-72 min-w-0"><RankSortSelect value={sort} onChange={setSort} /></div>
               <button
                onClick={() => fetchAIR(true)}
                disabled={refreshing || loading}
                title={translate('Refresh Ranks')}
                className="flex items-center gap-1.5 px-3 h-9 rounded-xl font-bold text-[10px] uppercase border border-border-primary bg-background-surface text-content-muted hover:border-slate-200 dark:hover:border-white transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{translate('Refresh')}</span>
              </button>
               </div>
            </div>

            {/* ── Leaderboard List ── */}
            {loading ? (
              <LeaderboardSkeleton />
            ) : data.length === 0 ? (
              <div className="py-16 sm:py-20 text-center space-y-2 xl:space-y-4">
                <Globe className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
                <h3 className="text-lg sm:text-xl font-bold text-content-muted">{translate('No Ranks Found')}</h3>
                <p className="text-sm text-content-muted font-bold">{translate('No test attempts match the current filter.')}</p>
                <button 
                  onClick={() => setSelectedExamId('')}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-800 text-on-primary rounded-full font-bold text-xs uppercase mt-2 transition-colors"
                >
                  {translate('View All Exams')}
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={`${selectedExamId}:${sort}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  {/* Column header — desktop table only; mobile list has no header row */}
                  <div className={`hidden xl:grid ${TABLE_GRID_COLS} items-center gap-2 px-3.5 pb-1`}>
                    <p className="text-[10px] font-bold text-content-muted uppercase text-center">#</p>
                    <p className="text-[10px] font-bold text-content-muted uppercase">{translate('Player')}</p>
                    <p className="text-[10px] font-bold text-content-muted uppercase text-center whitespace-nowrap">{translate('Time Spent')}</p>
                    <p className="text-[10px] font-bold text-content-muted uppercase text-center">{translate('Exams')}</p>
                    <p className="text-[10px] font-bold text-content-muted uppercase text-center">{translate('Marks')}</p>
                    <p className="text-[10px] font-bold text-content-muted uppercase text-center">{translate('Correct')}</p>
                    <p className="text-[10px] font-bold text-content-muted uppercase text-center">{translate('Score')}</p>
                    <p className="text-[10px] font-bold text-content-muted uppercase text-center">{translate('Accuracy')}</p>
                    <p className="text-[10px] font-bold text-content-muted uppercase text-center">{translate('Avg Score')}</p>
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
