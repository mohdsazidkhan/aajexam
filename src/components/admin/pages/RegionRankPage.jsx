'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { m as motion } from 'framer-motion';
import { Trophy, Map as MapIcon, Building2, Users, Target } from 'lucide-react';
import API from '../../../lib/api';
import { toast } from 'react-hot-toast';
import ResponsiveTable from '../../common/ResponsiveTable';
import StyledSelect from '../../common/ui/StyledSelect';
import { AdminTableSkeleton } from '../Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';
import { formatTimeSpent } from '../../../lib/utils/timeFormat';
import { RANK_SORT_OPTIONS } from '../../../lib/utils/rankSort';

// Admin State Rank / City Rank. Admins have no state or city of their own, so they pick one
// (default: the place with the most students). Same ordering as All India Rank.
const KINDS = {
  state: { title: 'State Rank', noun: 'State', Icon: MapIcon, fetch: (p) => API.getAdminStateRank(p) },
  city: { title: 'City Rank', noun: 'City', Icon: Building2, fetch: (p) => API.getAdminCityRank(p) },
};

const LIMITS = [10, 25, 50, 100].map((n) => ({ value: String(n), label: `TOP ${n}` }));

const RegionRankPage = ({ kind }) => {
  const cfg = KINDS[kind];
  const { isMounted } = useSSR();
  const [data, setData] = useState([]);
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState('all');
  const [sort, setSort] = useState('time');
  const [limit, setLimit] = useState('100');
  const [place, setPlace] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.getAllExams();
        setExams(res?.success ? res.data || [] : (Array.isArray(res) ? res : []));
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    })();
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cfg.fetch({ limit, ...(value && { value }), ...(examId !== 'all' && { examId }), ...(sort !== 'time' && { sort }) });
      setOptions(res.options || []);
      setData(res.data || []);
      setPlace(res.place || '');
      setTotalUsers(res.totalUsers || 0);
      if (!value && res.value) setValue(res.value);
    } catch (error) {
      console.error(`Error fetching admin ${kind} rank:`, error);
      toast.error(`Unable to load ${cfg.title}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [cfg, kind, limit, value, examId, sort]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: 'rank', header: 'Rank', render: (_, row) => (
        <div className={`w-8 xl:w-12 h-8 xl:h-12 rounded-lg xl:rounded-xl flex items-center justify-center font-black italic text-sm ${row.rank <= 3 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
          #{row.rank}
        </div>
      )
    },
    {
      key: 'name', header: 'Student', render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-black text-xs uppercase shrink-0">{row.name?.charAt(0) || 'U'}</div>
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900 dark:text-white break-words">{row.name || 'Unknown'}</div>
            <div className="text-[10px] font-bold text-slate-400 break-words">{row.username ? `@${row.username}` : '—'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'location', header: 'Location', render: (_, row) => (
        <div className="text-sm font-semibold text-primary-600 dark:text-primary-300">{[row.city, row.state].filter(Boolean).join(', ') || '—'}</div>
      )
    },
    {
      key: 'totalTimeSpent', header: 'Total Time Spent', align: 'center', render: (_, row) => (
        <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums whitespace-nowrap">{formatTimeSpent(row.totalTimeSpent, 'exam')}</div>
      )
    },
    { key: 'totalExams', header: 'Exams', align: 'center', render: (_, row) => <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{row.totalExams}</div> },
    { key: 'totalScore', header: 'Score', align: 'center', render: (_, row) => <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{row.totalScore}/{row.totalMarks}</div> },
    {
      key: 'avgAccuracy', header: 'Accuracy', align: 'center', render: (_, row) => (
        <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-flex items-center bg-primary-500/10 text-primary-600 dark:text-primary-300 border border-primary-500/20">{row.avgAccuracy || 0}%</div>
      )
    },
    {
      key: 'subscriptionStatus', header: 'Plan', align: 'right', render: (_, row) => (
        <span className={`inline-flex px-2 py-1 text-[10px] font-black rounded-full ${row.subscriptionStatus === 'PRO' ? 'bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-slate-900 dark:text-gray-200'}`}>
          {row.subscriptionStatus || 'FREE'}
        </span>
      )
    },
  ];

  const placeSelect = (
    <StyledSelect
      icon={cfg.Icon}
      value={value}
      onChange={setValue}
      options={options.map((o) => ({ value: o.value, label: `${o.label.toUpperCase()} (${o.count})` }))}
      placeholder={`Select ${cfg.noun}`}
      className="w-full"
    />
  );
  const examSelect = (
    <StyledSelect
      icon={Target}
      value={examId}
      onChange={setExamId}
      options={[{ value: 'all', label: 'OVERALL (ALL EXAMS)' }, ...exams.map((e) => ({ value: e._id, label: e.name.toUpperCase() }))]}
      className="w-full"
    />
  );
  const sortSelect = (
    <StyledSelect
      value={sort}
      onChange={setSort}
      options={RANK_SORT_OPTIONS.map((o) => ({ value: o.value, label: `RANK BASED ON: ${o.label.toUpperCase()}` }))}
      className="w-full"
    />
  );
  const limitSelect = <StyledSelect icon={Trophy} value={limit} onChange={setLimit} options={LIMITS} className="w-full" />;

  useAdminMobileHeader({
    title: cfg.title,
    count: totalUsers,
    filters: (<>{placeSelect}{examSelect}{sortSelect}{limitSelect}</>),
  });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-3">
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
          {placeSelect}
          {examSelect}
          {sortSelect}
          {limitSelect}
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2">
            <span className="flex items-center gap-1.5 text-xs font-black text-primary-600 dark:text-primary-300"><Users className="w-4 h-4" />{totalUsers} ranked</span>
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-500"><cfg.Icon className="w-4 h-4" />{place || '—'}</span>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-primary-700 dark:text-primary-300"><Trophy className="w-3.5 h-3.5 shrink-0" />Top 100 Student Rankings</p>

        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
              <cfg.Icon className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-lg font-black text-slate-500 uppercase">No Rankings Found</h3>
            <p className="text-sm text-slate-400 mt-2">No completed exam attempts for this {cfg.noun.toLowerCase()} yet.</p>
          </div>
        ) : (
          <motion.div key={`${value}-${limit}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-md relative before:content-[''] before:absolute before:inset-x-3 before:top-0 before:h-[3px] before:rounded-b-full before:bg-gradient-to-r before:from-primary-500/70 before:via-primary-300/70 before:to-primary-500/70">
            <ResponsiveTable data={data} columns={columns} viewModes={['table', 'grid']} currentView="table" showPagination={false} showViewToggle={false} fillHeight />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegionRankPage;
