'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';
import Sidebar from '../Sidebar';
import Pagination from '../../common/Pagination';
import useDebounce from '../../../hooks/useDebounce';
import { useSSR } from '../../../hooks/useSSR';
import { m as motion, AnimatePresence } from 'framer-motion';
import { AdminTableSkeleton } from '../Skeletons';
import ResponsiveTable from '../../common/ResponsiveTable';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';
import {
  ShieldAlert, AlertTriangle, Users, Banknote, Search,
  ChevronDown, ChevronUp, Fingerprint, ShieldCheck,
  LayoutGrid, List, Table as TableIcon, Eye
} from 'lucide-react';

const PAGE_LIMIT = DEFAULT_PAGE_SIZE;

const RISK_STYLES = {
  high: { chip:'bg-black/15 dark:bg-white/15 text-content-primary border-black/30', bar:'bg-primary-600', label:'HIGH'},
  medium: { chip:'bg-black/15 dark:bg-white/15 text-content-primary border-black/30', bar:'bg-primary-600', label:'MEDIUM'},
  low: { chip:'bg-black/15 dark:bg-white/15 text-content-primary border-black/30', bar:'bg-primary-600', label:'LOW'},
};

const SIGNAL_LABELS = {
  self_referral: 'Self-referral',
  reciprocal_ring: 'Reciprocal ring',
  velocity_burst: 'Signup burst',
  dormant_invitees: 'Dormant invitees',
  duplicate_contact: 'Duplicate contact',
  email_pattern: 'Email pattern',
  suspended_invitees: 'Suspended invitees',
};

export default function ReferralFraudDashboard() {
  useSSR();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [risk, setRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const debouncedSearch = useDebounce(searchTerm, 800);

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  const openInvitees = (id) => { setExpanded(id); setViewMode('list'); };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [debouncedSearch, page, limit, risk]);

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.getReferralFraud({ page, limit, risk, search: debouncedSearch });
      if (res?.success) {
        setRows(res.data || []);
        setSummary(res.summary || null);
        setPagination(res.pagination || {});
      }
    } catch (e) {
      // surfaced via empty state
    } finally {
      setLoading(false);
    }
  };

  const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const columns = [
    {
      key: 'user', header: 'User', render: (_, u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl text-on-primary flex items-center justify-center font-bold text-xs shrink-0 bg-primary-600">{u.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-content-primary truncate">{u.name || 'Unknown'}</div>
            <div className="text-[10px] text-content-muted truncate">{u.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'risk', header: 'Risk', align: 'center', render: (_, u) => {
        const rs = RISK_STYLES[u.riskLevel] || RISK_STYLES.low;
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-bold tabular-nums">{u.riskScore}</span>
            <span className={`text-[8px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border ${rs.chip}`}>{rs.label}</span>
          </div>
        );
      }
    },
    {
      key: 'signals', header: 'Signals', render: (_, u) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {u.signals.slice(0, 2).map((s) => (
            <span key={s.key} title={s.detail} className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-background-surface-secondary text-content-secondary">{s.label}</span>
          ))}
          {u.signals.length > 2 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-background-surface-secondary text-content-muted">+{u.signals.length - 2}</span>}
        </div>
      )
    },
    {
      key: 'referralCount', header: 'Invites', align: 'center', render: (_, u) => (
        <span className="text-sm font-bold text-content-primary tabular-nums">{u.referralCount}</span>
      )
    },
    {
      key: 'referralEarnings', header: 'Earned', align: 'right', render: (_, u) => (
        <span className="text-sm font-bold text-primary-600 tabular-nums">{inr(u.referralEarnings)}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, u) => (
        <div className="flex justify-end">
          <button onClick={() => openInvitees(u._id)} title="View invitees" className="p-1.5 rounded-lg bg-background-surface-secondary text-primary-600 hover:bg-primary-700 hover:text-white transition-all">
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const stats = summary ? [
    { label: 'Flagged Referrers', value: summary.flaggedReferrers, icon: ShieldAlert, tone: 'text-primary-600' },
    { label: 'High Risk', value: summary.highRisk, icon: AlertTriangle, tone: 'text-content-primary bg-black/10 dark:bg-white/10' },
    { label: 'Medium Risk', value: summary.mediumRisk, icon: Fingerprint, tone: 'text-content-primary bg-black/10 dark:bg-white/10' },
    { label: 'Reward At Risk', value: inr(summary.rewardAtRisk), icon: Banknote, tone: 'text-primary-600' },
  ] : [];

  const signalBadges = (
    summary && Object.keys(summary.signalCounts || {}).length > 0 && (
      <div className="flex flex-wrap gap-2">
        {Object.entries(summary.signalCounts).sort((a, b) => b[1] - a[1]).map(([k, c]) => (
          <span key={k} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-background-surface border border-border-primary text-content-muted">
            {SIGNAL_LABELS[k] || k} · {c}
          </span>
        ))}
      </div>
    )
  );

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        placeholder="Search name / email / code..."
        className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm"
      />
    </div>
  );

  const riskFilterButtons = (
    <div className="flex items-center gap-1">
      {['all', 'high', 'medium', 'low'].map(r => (
        <button key={r} onClick={() => { setRisk(r); setPage(1); }}
          className={`px-3 py-2 rounded-lg xl:rounded-xl text-xs font-bold uppercase transition-all ${risk === r
            ? 'bg-primary-600 text-on-primary'
            : 'bg-background-surface border border-border-primary text-content-muted'}`}>
          {r}
        </button>
      ))}
    </div>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: List, id: 'list', label: 'List View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
      ].map((mode) => (
        <button key={mode.id} onClick={() => setViewMode(mode.id)} title={mode.label}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}>
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      onPageChange={(p) => setPage(p)}
      totalItems={pagination.total}
      itemsPerPage={limit}
      onItemsPerPageChange={handleLimitChange}
    />
  );

  useAdminMobileHeader({
    title: 'Referral Fraud',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {riskFilterButtons}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 xl:gap-0 xl:divide-x divide-border-primary mb-4 shrink-0 bg-background-surface rounded-xl border border-border-primary xl:p-0 p-2">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-2">
                <div className={`p-1.5 rounded-lg shrink-0 ${s.tone}`}><s.icon className="w-3.5 h-3.5" /></div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-content-primary tabular-nums tracking-tight truncate">{s.value ?? 0}</div>
                  <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] truncate">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {signalBadges && <div className="mb-4 shrink-0">{signalBadges}</div>}

          {/* Loading */}
          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading && rows.length === 0 ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : rows.length === 0 ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-14 h-14 text-primary-600 mb-4" />
              <div className="text-lg font-bold tracking-tight">No suspicious referrers</div>
              <div className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em] mt-1">Nothing matched the current filter.</div>
            </div>
          ) : (
            <>
            <div className="flex-1 min-h-0 overflow-auto">
            {viewMode === 'table' && (
              <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
                <ResponsiveTable data={rows} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                {rows.map((u, idx) => {
                  const rs = RISK_STYLES[u.riskLevel] || RISK_STYLES.low;
                  const serialNumber = (pagination.page - 1) * limit + idx + 1;
                  return (
                    <div key={u._id} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3 relative">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 rounded-xl text-on-primary flex items-center justify-center font-bold text-sm shrink-0 bg-primary-600">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800">{serialNumber}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-content-primary truncate">{u.name || 'Unknown'}</div>
                            <div className="text-[10px] text-content-muted truncate">{u.email}</div>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[8px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border ${rs.chip}`}>{rs.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {u.signals.slice(0, 3).map((s) => (
                          <span key={s.key} title={s.detail} className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-background-surface-secondary text-content-secondary">{s.label}</span>
                        ))}
                        {u.signals.length > 3 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-background-surface-secondary text-content-muted">+{u.signals.length - 3}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-background-surface-secondary rounded-lg border border-border-primary">
                          <div className="text-sm font-bold text-content-primary tabular-nums">{u.referralCount}</div>
                          <div className="text-[9px] font-bold text-content-muted uppercase">Invites</div>
                        </div>
                        <div className="p-2 bg-background-surface-secondary rounded-lg border border-border-primary">
                          <div className="text-sm font-bold text-primary-600 tabular-nums">{inr(u.referralEarnings)}</div>
                          <div className="text-[9px] font-bold text-content-muted uppercase">Earned</div>
                        </div>
                      </div>
                      <button onClick={() => openInvitees(u._id)} className="w-full py-2 text-on-primary rounded-lg text-xs font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-1.5 bg-primary-600"><Eye className="w-3.5 h-3.5" /> View Invitees</button>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'list' && (
            <div className="h-full overflow-auto space-y-3">
              <AnimatePresence>
                {rows.map((u, idx) => {
                  const rs = RISK_STYLES[u.riskLevel] || RISK_STYLES.low;
                  const open = expanded === u._id;
                  const serialNumber = (pagination.page - 1) * limit + idx + 1;
                  return (
                    <motion.div key={u._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-background-surface rounded-xl border border-border-primary overflow-hidden">
                      <div className="p-4 flex flex-col xl:flex-row xl:items-center gap-3">
                        {/* Risk score dial */}
                        <div className="flex items-center gap-3 xl:w-64">
                          <div className="relative w-16 h-16 shrink-0">
                            <div className="absolute inset-0 rounded-2xl bg-background-surface-secondary" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-bold tracking-tight">{u.riskScore}</span>
                              <span className="text-[7px] font-bold uppercase tracking-[0.08em] text-content-muted">risk</span>
                            </div>
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800">{serialNumber}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold truncate">{u.name || 'Unknown'}</div>
                            <div className="text-content-muted text-[10px] font-bold truncate">{u.email}</div>
                            <span className={`inline-block mt-1 text-[8px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border ${rs.chip}`}>{rs.label} RISK</span>
                          </div>
                        </div>

                        {/* Signals */}
                        <div className="flex-1 flex flex-wrap gap-2">
                          {u.signals.map((s) => (
                            <span key={s.key} title={s.detail}
                              className="text-[9px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10 text-content-primary border border-border-primary">
                              {s.label}: <span className="normal-case font-bold opacity-80">{s.detail}</span>
                            </span>
                          ))}
                        </div>

                        {/* Numbers */}
                        <div className="flex items-center gap-3 xl:gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold">{u.referralCount}</div>
                            <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-content-muted">invites</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary-600">{inr(u.referralEarnings)}</div>
                            <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-content-muted">earned</div>
                          </div>
                          <button onClick={() => setExpanded(open ? null : u._id)}
                            className="p-2.5 rounded-lg xl:rounded-xl bg-background-surface-secondary border border-border-primary">
                            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Invitee drill-down */}
                      <AnimatePresence>
                        {open && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border-primary bg-slate-50/50 dark:bg-black/20">
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3 text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted">
                                <Users className="w-3.5 h-3.5" /> Invitees ({u.refereeCount}{u.refereeCount > 25 ? ' — showing 25' : ''})
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                {u.referees.map((r) => {
                                  const created = r.createdAt ? new Date(r.createdAt).getTime() : 0;
                                  const dormant = !r.lastLoginDate || (new Date(r.lastLoginDate).getTime() - created < 3 * 60 * 1000);
                                  return (
                                    <div key={r._id} className="flex items-center justify-between gap-2 bg-background-surface dark:bg-white/5 rounded-lg xl:rounded-xl border border-border-primary px-3 py-2">
                                      <div className="min-w-0">
                                        <div className="text-[11px] font-bold truncate">{r.name || 'Unknown'}</div>
                                        <div className="text-[9px] text-content-muted font-bold truncate">{r.email}</div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {['suspended', 'banned'].includes(r.status) && (
                                          <span className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-content-primary">{r.status}</span>
                                        )}
                                        {dormant && (
                                          <span className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-content-primary">Inactive</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            )}
            </div>
            </>
          )}
          </div>
      </div>
    </div>
  );
}
