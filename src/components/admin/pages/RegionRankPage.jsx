'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { m as motion } from 'framer-motion';
import { Map as MapIcon, Building2, Target } from 'lucide-react';
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


const RegionRankPage = ({ kind }) => {
  const cfg = KINDS[kind];
  const { isMounted } = useSSR();
  const [data, setData] = useState([]);
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState('all');
  const [sort, setSort] = useState('time');
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
      const res = await cfg.fetch({ limit: 100, ...(value && { value }), ...(examId !== 'all' && { examId }), ...(sort !== 'time' && { sort }) });
      setOptions(res.options || []);
      setData(res.data || []);
      setTotalUsers(res.totalUsers || 0);
      if (!value && res.value) setValue(res.value);
    } catch (error) {
      console.error(`Error fetching admin ${kind} rank:`, error);
      toast.error(`Unable to load ${cfg.title}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [cfg, kind, value, examId, sort]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: 'rank', header: 'Rank', render: (_, row) => (
        <div className={`w-8 xl:w-12 h-8 xl:h-12 rounded-lg xl:rounded-xl flex items-center justify-center font-bold italic text-sm ${row.rank <= 3 ? 'bg-primary-600 text-on-primary' : 'bg-background-surface-secondary text-content-muted'}`}>
          #{row.rank}
        </div>
      )
    },
    {
      key: 'name', header: 'Student', render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-on-primary font-bold text-xs uppercase shrink-0">{row.name?.charAt(0) || 'U'}</div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-content-primary break-words">{row.name || 'Unknown'}</div>
            <div className="text-[10px] font-bold text-content-muted break-words">{row.username ? `@${row.username}` : '—'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'location', header: 'Location', render: (_, row) => (
        <div className="text-sm font-semibold text-primary-600">{[row.city, row.state].filter(Boolean).join(', ') || '—'}</div>
      )
    },
    {
      key: 'totalTimeSpent', header: 'Total Time Spent', align: 'center', render: (_, row) => (
        <div className="text-sm font-bold text-content-primary tabular-nums whitespace-nowrap">{formatTimeSpent(row.totalTimeSpent, 'exam')}</div>
      )
    },
    { key: 'totalExams', header: 'Exams', align: 'center', render: (_, row) => <div className="text-sm font-bold text-content-primary tabular-nums">{row.totalExams}</div> },
    { key: 'totalScore', header: 'Score', align: 'center', render: (_, row) => <div className="text-sm font-bold text-content-primary tabular-nums">{row.totalScore}/{row.totalMarks}</div> },
    {
      key: 'avgAccuracy', header: 'Accuracy', align: 'center', render: (_, row) => (
        <div className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase inline-flex items-center text-primary-600 border border-primary-500/20">{row.avgAccuracy || 0}%</div>
      )
    },
    {
      key: 'subscriptionStatus', header: 'Plan', align: 'right', render: (_, row) => (
        <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${row.subscriptionStatus === 'PRO' ? 'text-primary-600 dark:bg-primary-600 dark:text-primary-600' : 'bg-background-surface-secondary text-content-primary'}`}>
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
      options={[...options].sort((a, b) => a.label.localeCompare(b.label)).map((o) => ({ value: o.value, label: `${o.label.toUpperCase()} (${o.count})` }))}
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

  useAdminMobileHeader({
    title: cfg.title,
    count: totalUsers,
    filters: (<>{placeSelect}{examSelect}{sortSelect}</>),
  });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-3">
        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-md flex items-center justify-center mx-auto mb-4 border border-primary-600">
              <cfg.Icon className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-content-muted">No Rankings Found</h3>
            <p className="text-sm text-content-muted mt-2">No completed exam attempts for this {cfg.noun.toLowerCase()} yet.</p>
          </div>
        ) : (
          <motion.div key={value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden flex flex-col relative">
            <ResponsiveTable data={data} columns={columns} viewModes={['table', 'grid']} currentView="table" showPagination={false} showViewToggle={false} fillHeight />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegionRankPage;
