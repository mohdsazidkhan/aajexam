'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, MousePointerClick, LogOut, UserPlus, LogIn, Activity, Info } from 'lucide-react';
import Sidebar from '../../Sidebar';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const RANGES = [7, 14, 30, 90];

const fmtDay = (d) => new Date(`${d}T00:00:00+05:30`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' });
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');

const Stat = ({ label, value, sub, Icon, tone }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
    <div className={`p-2 rounded-lg ${tone}`}><Icon className="w-4 h-4" /></div>
    <div>
      <div className="text-lg font-black tabular-nums text-slate-900 dark:text-white leading-none">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</div>
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
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.getAdminTraffic(days);
      setData(res.data);
    } catch (e) {
      setError(e?.message || 'Failed to load traffic');
    }
    setLoading(false);
  }, [days]);

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
            <Activity className="w-4 h-4" /> Traffic · website visitors, IST days
          </div>
          <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
            {RANGES.map((n) => (
              <button key={n} onClick={() => setDays(n)} className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition ${days === n ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white dark:hover:bg-white/10'}`}>{n}d</button>
            ))}
          </div>
        </div>

        {error ? <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 text-sm font-bold">{error}</div> : null}

        {data?.trackingSince ? (
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 rounded-xl p-3">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Tracking started on <b>{data.trackingSince}</b>; earlier days show 0. Bots are filtered out. Google signup and normal signup are counted from the website only; "DB signups" counts every new account including the mobile app.</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-500/10 rounded-xl p-3">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>No visits recorded yet. Data appears once this version is live and people browse the site.</span>
          </div>
        )}

        {[['Today', rows[0]], ['Yesterday', rows[1]]].map(([label, r]) => {
          const x = r || {};
          return (
            <div key={label} className="flex flex-col gap-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label} ({x.day ? fmtDay(x.day) : '—'})</div>
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
                <Stat label="Visitors" value={x.visitors ?? 0} sub={`${x.alreadyLoggedIn || 0} already logged in`} Icon={Users} tone="bg-sky-500/10 text-sky-600" />
                <Stat label="Opened login / register" value={x.sawAuthPage ?? 0} sub={`${pct(x.sawAuthPage, x.newVisitors)} of new`} Icon={MousePointerClick} tone="bg-violet-500/10 text-violet-600" />
                <Stat label="Left without login/signup" value={x.leftWithoutAuth ?? 0} sub={`${pct(x.leftWithoutAuth, x.newVisitors)} of new`} Icon={LogOut} tone="bg-rose-500/10 text-rose-600" />
                <Stat label="Signups" value={(x.signupGoogle || 0) + (x.signupPassword || 0)} sub={`Google ${x.signupGoogle || 0} · Normal ${x.signupPassword || 0} · DB ${x.dbSignups || 0}`} Icon={UserPlus} tone="bg-emerald-500/10 text-emerald-600" />
                <Stat label="Logins" value={(x.loginGoogle || 0) + (x.loginPassword || 0)} sub={`Google ${x.loginGoogle || 0} · Normal ${x.loginPassword || 0}`} Icon={LogIn} tone="bg-amber-500/10 text-amber-600" />
              </div>
            </div>
          );
        })}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="min-w-full">
            <thead>
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
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">New visitors by source ({days}d)</div>
            {(data?.sources || []).length === 0 ? <div className="text-sm text-slate-400">No data yet</div> : (data.sources.map((s) => (
              <div key={s.source} className="flex justify-between text-sm py-1">
                <span className="font-bold">{s.source}</span>
                <span className="tabular-nums">{s.visitors} visitors · {s.signups} signed up</span>
              </div>
            )))}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Devices ({days}d)</div>
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
