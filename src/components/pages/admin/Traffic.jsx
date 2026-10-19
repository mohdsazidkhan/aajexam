'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, MousePointerClick, LogOut, UserPlus, LogIn, Activity } from 'lucide-react';
import Sidebar from '../../Sidebar';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const RANGES = [
  { id: 'today', label: 'Today', days: 1, offset: 0 },
  { id: 'yesterday', label: 'Yesterday', days: 1, offset: 1 },
  { id: '7', label: 'Last 7 Days', days: 7, offset: 0 },
  { id: '30', label: 'Last 30 Days', days: 30, offset: 0 },
  { id: '90', label: 'Last 90 Days', days: 90, offset: 0 },
  { id: '180', label: 'Last 180 Days', days: 180, offset: 0 },
  { id: '365', label: 'Last 1 Year', days: 365, offset: 0 },
  { id: '1095', label: 'Last 3 Years', days: 1095, offset: 0 },
];

const fmtDay = (d) => new Date(`${d}T00:00:00+05:30`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' });
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');

// GA-style change vs the previous period. `inverse`: a rise is bad (e.g. people leaving), so up = red.
const Delta = ({ cur, prev, inverse }) => {
  if (!cur && !prev) return <span className="text-[10px] font-black text-slate-400">— vs prev</span>;
  const up = cur >= prev;
  const flat = cur === prev;
  const good = flat ? null : up !== !!inverse;
  const color = flat ? 'text-slate-400' : good ? 'text-emerald-600' : 'text-rose-600';
  const text = !prev ? 'new' : `${Math.abs(((cur - prev) / prev) * 100).toFixed(1)}%`;
  return (
    <span className={`text-[10px] font-black ${color}`}>
      {flat ? '→' : up ? '▲' : '▼'} {flat ? '0.0%' : text}
      <span className="text-slate-400 font-bold"> vs {prev}</span>
    </span>
  );
};

const Stat = ({ label, value, sub, Icon, tone, cur, prev, inverse }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
    <div className={`p-2 rounded-lg ${tone}`}><Icon className="w-4 h-4" /></div>
    <div>
      <div className="text-lg font-black tabular-nums text-slate-900 dark:text-white leading-none">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</div>
      {cur !== undefined ? <div className="mt-0.5"><Delta cur={cur} prev={prev} inverse={inverse} /></div> : null}
      {sub ? <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div> : null}
    </div>
  </div>
);

/**
 * Daily visitor funnel measured by our own first-party tracker (src/lib/tracker.js -> /api/track).
 * "New" visitors = people who were NOT logged in when they arrived.
 */
export default function Traffic() {
  const { isMounted } = useSSR();
  const [rangeId, setRangeId] = useState('today');
  const range = RANGES.find((r) => r.id === rangeId) || RANGES[0];
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.getAdminTraffic(range.days, range.offset);
      setData(res.data);
    } catch (e) {
      setError(e?.message || 'Failed to load traffic');
    }
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  useAdminMobileHeader({ title: 'Traffic', count: data?.days?.length || 0, filters: null });

  if (loading && !data && !error) {
    return <div className="min-h-screen p-3 xl:p-8"><AdminTableSkeleton showHeader={false} showFilters={false} /></div>;
  }

  const rows = data?.days || [];
  const sum = (k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
  const th = 'px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right whitespace-nowrap';
  const td = 'px-3 py-2 text-sm tabular-nums text-right whitespace-nowrap';

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      {isMounted && <Sidebar />}
      <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <Activity className="w-4 h-4" /> Traffic
          </div>
          <select
            value={rangeId}
            onChange={(e) => setRangeId(e.target.value)}
            aria-label="Date range"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>

        {error ? <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 text-sm font-bold">{error}</div> : null}

        {(() => {
          const c = data?.summary?.current || {};
          const p = data?.summary?.previous || {};
          const prevLabel = range.days === 1 ? (range.offset === 1 ? 'day before' : 'yesterday') : `previous ${range.days} days`;
          const signups = (o) => (o.signupGoogle || 0) + (o.signupPassword || 0);
          const logins = (o) => (o.loginGoogle || 0) + (o.loginPassword || 0);
          return (
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{range.label} · change vs {prevLabel}</div>
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
                <Stat label="Visitors" value={c.visitors ?? 0} cur={c.visitors || 0} prev={p.visitors || 0} sub={`${c.alreadyLoggedIn || 0} already logged in`} Icon={Users} tone="bg-sky-500/10 text-sky-600" />
                <Stat label="Opened login / register" value={c.sawAuthPage ?? 0} cur={c.sawAuthPage || 0} prev={p.sawAuthPage || 0} sub={`${pct(c.sawAuthPage, c.newVisitors)} of new`} Icon={MousePointerClick} tone="bg-violet-500/10 text-violet-600" />
                <Stat label="Left without login/signup" value={c.leftWithoutAuth ?? 0} cur={c.leftWithoutAuth || 0} prev={p.leftWithoutAuth || 0} inverse sub={`${pct(c.leftWithoutAuth, c.newVisitors)} of new`} Icon={LogOut} tone="bg-rose-500/10 text-rose-600" />
                <Stat label="Signups" value={signups(c)} cur={signups(c)} prev={signups(p)} sub={`Google ${c.signupGoogle || 0} · Normal ${c.signupPassword || 0} · DB ${c.dbSignups || 0}`} Icon={UserPlus} tone="bg-emerald-500/10 text-emerald-600" />
                <Stat label="Logins" value={logins(c)} cur={logins(c)} prev={logins(p)} sub={`Google ${c.loginGoogle || 0} · Normal ${c.loginPassword || 0}`} Icon={LogIn} tone="bg-amber-500/10 text-amber-600" />
              </div>
            </div>
          );
        })()}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-auto max-h-[60vh]">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className={`${th} text-left`}>Day</th>
                <th className={th}>Visitors</th>
                <th className={th}>Page views</th>
                <th className={th}>Already logged in</th>
                <th className={th}>New (not logged in)</th>
                <th className={th}>Opened login/register</th>
                <th className={th}>Left w/o login-signup</th>
                <th className={th}>Signup Google</th>
                <th className={th}>Signup Normal</th>
                <th className={th}>Login Google</th>
                <th className={th}>Login Normal</th>
                <th className={th}>DB signups (G / N)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.day} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <td className={`${td} text-left font-bold`}>{fmtDay(r.day)}</td>
                  <td className={`${td} font-black`}>{r.visitors}</td>
                  <td className={td}>{r.pageViews}</td>
                  <td className={td}>{r.alreadyLoggedIn}</td>
                  <td className={td}>{r.newVisitors}</td>
                  <td className={td}>{r.sawAuthPage} <span className="text-slate-400 text-xs">({pct(r.sawAuthPage, r.newVisitors)})</span></td>
                  <td className={`${td} text-rose-600`}>{r.leftWithoutAuth} <span className="text-slate-400 text-xs">({pct(r.leftWithoutAuth, r.newVisitors)})</span></td>
                  <td className={td}>{r.signupGoogle}</td>
                  <td className={td}>{r.signupPassword}</td>
                  <td className={td}>{r.loginGoogle}</td>
                  <td className={td}>{r.loginPassword}</td>
                  <td className={td}>{r.dbSignups} <span className="text-slate-400 text-xs">({r.dbSignupsGoogle} / {r.dbSignupsPassword})</span></td>
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-white/5 font-black">
                <td className={`${td} text-left`}>Total</td>
                <td className={td}>{sum('visitors')}</td>
                <td className={td}>{sum('pageViews')}</td>
                <td className={td}>{sum('alreadyLoggedIn')}</td>
                <td className={td}>{sum('newVisitors')}</td>
                <td className={td}>{sum('sawAuthPage')}</td>
                <td className={td}>{sum('leftWithoutAuth')}</td>
                <td className={td}>{sum('signupGoogle')}</td>
                <td className={td}>{sum('signupPassword')}</td>
                <td className={td}>{sum('loginGoogle')}</td>
                <td className={td}>{sum('loginPassword')}</td>
                <td className={td}>{sum('dbSignups')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid xl:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">New visitors by source ({range.label})</div>
            {(data?.sources || []).length === 0 ? <div className="text-sm text-slate-400">No data yet</div> : (data.sources.map((s) => (
              <div key={s.source} className="flex justify-between text-sm py-1">
                <span className="font-bold">{s.source}</span>
                <span className="tabular-nums">{s.visitors} visitors · {s.signups} signed up</span>
              </div>
            )))}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Devices ({range.label})</div>
            {(data?.devices || []).length === 0 ? <div className="text-sm text-slate-400">No data yet</div> : (data.devices.map((s) => (
              <div key={s.device} className="flex justify-between text-sm py-1">
                <span className="font-bold capitalize">{s.device}</span>
                <span className="tabular-nums">{s.visitors}</span>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}
