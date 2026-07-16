'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';
import Sidebar from '../../Sidebar';
import Pagination from '../../Pagination';
import SearchFilter from '../../SearchFilter';
import useDebounce from '../../../hooks/useDebounce';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, AlertTriangle, Users, Banknote, Filter, Activity,
  ChevronDown, ChevronUp, Fingerprint, ShieldCheck
} from 'lucide-react';

const PAGE_LIMIT = 20;

const RISK_STYLES = {
  high: { chip: 'bg-rose-500/15 text-rose-500 border-rose-500/30', bar: 'bg-rose-500', label: 'HIGH' },
  medium: { chip: 'bg-amber-500/15 text-amber-500 border-amber-500/30', bar: 'bg-amber-500', label: 'MEDIUM' },
  low: { chip: 'bg-sky-500/15 text-sky-500 border-sky-500/30', bar: 'bg-sky-500', label: 'LOW' },
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
  const [risk, setRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({});
  const [expanded, setExpanded] = useState(null);
  const debouncedSearch = useDebounce(searchTerm, 800);

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [debouncedSearch, page, risk]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.getReferralFraud({ page, limit: PAGE_LIMIT, risk, search: debouncedSearch });
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

  const stats = summary ? [
    { label: 'Flagged Referrers', value: summary.flaggedReferrers, icon: ShieldAlert, tone: 'text-primary-500 bg-primary-500/10' },
    { label: 'High Risk', value: summary.highRisk, icon: AlertTriangle, tone: 'text-rose-500 bg-rose-500/10' },
    { label: 'Medium Risk', value: summary.mediumRisk, icon: Fingerprint, tone: 'text-amber-500 bg-amber-500/10' },
    { label: 'Reward At Risk', value: inr(summary.rewardAtRisk), icon: Banknote, tone: 'text-emerald-500 bg-emerald-500/10' },
  ] : [];

  return (
    <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">
        <div className="transition-all duration-500 p-4 lg:p-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="space-y-3 mb-5">
              <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-none italic flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 lg:w-10 lg:h-10 text-rose-500" />
                REFERRAL <span className="text-rose-500">FRAUD</span>
                <span className="text-slate-300 dark:text-white/10 italic tracking-widest text-2xl lg:text-4xl">({pagination.total || 0})</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Graph &amp; behaviour signals over the referral network. No IP/device data is stored — detection is pattern-based.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-5">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-3xl border-4 border-slate-100 dark:border-white/10 p-4 lg:p-6 shadow-xl">
                  <div className={`inline-flex p-2.5 rounded-xl mb-3 ${s.tone}`}><s.icon className="w-5 h-5" /></div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tighter">{s.value ?? 0}</div>
                  <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Signal breakdown */}
            {summary && Object.keys(summary.signalCounts || {}).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {Object.entries(summary.signalCounts).sort((a, b) => b[1] - a[1]).map(([k, c]) => (
                  <span key={k} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    {SIGNAL_LABELS[k] || k} · {c}
                  </span>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-3xl border-4 border-slate-100 dark:border-white/10 p-4 lg:p-6 mb-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-primary-500/10 text-primary-500 rounded-xl"><Filter className="w-4 h-4" /></div>
                {['all', 'high', 'medium', 'low'].map(r => (
                  <button key={r} onClick={() => { setRisk(r); setPage(1); }}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border transition-all ${risk === r
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}>
                    {r}
                  </button>
                ))}
              </div>
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={(v) => { setSearchTerm(v); setPage(1); }}
                placeholder="Search name / email / code..."
                className="bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl py-2 w-full lg:w-80"
              />
            </div>
          </motion.div>

          {/* Loading */}
          {loading && rows.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 border-4 border-rose-500/10 border-t-rose-500 rounded-full" />
              <div className="mt-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Scanning referral graph...</div>
            </div>
          ) : rows.length === 0 ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-14 h-14 text-emerald-500 mb-4" />
              <div className="text-lg font-black uppercase tracking-tight">No suspicious referrers</div>
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Nothing matched the current filter.</div>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {rows.map((u) => {
                  const rs = RISK_STYLES[u.riskLevel] || RISK_STYLES.low;
                  const open = expanded === u._id;
                  return (
                    <motion.div key={u._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-3xl border-4 border-slate-100 dark:border-white/10 shadow-xl overflow-hidden">
                      <div className="p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Risk score dial */}
                        <div className="flex items-center gap-4 lg:w-64">
                          <div className="relative w-16 h-16 shrink-0">
                            <div className="absolute inset-0 rounded-2xl bg-slate-100 dark:bg-white/5" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-black tracking-tighter">{u.riskScore}</span>
                              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">risk</span>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-black truncate">{u.name || 'Unknown'}</div>
                            <div className="text-slate-400 text-[10px] font-bold truncate">{u.email}</div>
                            <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${rs.chip}`}>{rs.label} RISK</span>
                          </div>
                        </div>

                        {/* Signals */}
                        <div className="flex-1 flex flex-wrap gap-2">
                          {u.signals.map((s) => (
                            <span key={s.key} title={s.detail}
                              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              {s.label}: <span className="normal-case font-bold opacity-80">{s.detail}</span>
                            </span>
                          ))}
                        </div>

                        {/* Numbers */}
                        <div className="flex items-center gap-5 lg:gap-6">
                          <div className="text-center">
                            <div className="text-lg font-black">{u.referralCount}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">invites</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-black text-emerald-500">{inr(u.referralEarnings)}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">earned</div>
                          </div>
                          <button onClick={() => setExpanded(open ? null : u._id)}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Invitee drill-down */}
                      <AnimatePresence>
                        {open && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="border-t-4 border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
                            <div className="p-4 lg:p-6">
                              <div className="flex items-center gap-2 mb-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <Users className="w-3.5 h-3.5" /> Invitees ({u.refereeCount}{u.refereeCount > 25 ? ' — showing 25' : ''})
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                {u.referees.map((r) => {
                                  const created = r.createdAt ? new Date(r.createdAt).getTime() : 0;
                                  const dormant = !r.lastLoginDate || (new Date(r.lastLoginDate).getTime() - created < 3 * 60 * 1000);
                                  return (
                                    <div key={r._id} className="flex items-center justify-between gap-2 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2">
                                      <div className="min-w-0">
                                        <div className="text-[11px] font-black truncate">{r.name || 'Unknown'}</div>
                                        <div className="text-[9px] text-slate-400 font-bold truncate">{r.email}</div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {['suspended', 'banned'].includes(r.status) && (
                                          <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500">{r.status}</span>
                                        )}
                                        {dormant && (
                                          <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">dormant</span>
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

              {pagination.totalPages > 1 && (
                <div className="pt-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(p) => setPage(p)}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit || PAGE_LIMIT}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
