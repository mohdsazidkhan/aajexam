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

const SEGMENTS = [
  { id: 'total', label: 'Total Traffic', hint: 'Real users and bots, from everywhere' },
  { id: 'real', label: 'Real Users', hint: 'Suspected bots removed, whole world' },
  { id: 'india', label: 'From India', hint: 'Real users in India only' },
  { id: 'outside', label: 'Outside India', hint: 'Real users outside India only' },
];

const fmtDay =(d) => new Date(`${d}T00:00:00+05:30`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' });
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

// Readable names for the signup entry points (the data-cta names and prompt names stored with each signup)
const CTA_LABELS = {
  exit: 'Exit-intent popup',
  welcome: 'Welcome popup (landing)',
  nudge: 'Page-view nudge bar',
  sticky: 'Sticky signup bar',
  onetap: 'Google One Tap',
  sample: 'Sample quiz result',
  promo_bar_login: 'Red strip: Login Now',
  navbar_get_started: 'Navbar: Get Started',
  bottom_nav_login: 'Mobile bottom nav: Login',
  landing_hero_start: 'Landing: Start practicing now',
  landing_pyq_start: 'Landing: Start Free PYQ Practice',
  landing_progress_card: 'Landing: Check your progress',
  landing_referral_card: 'Landing: Start referring',
  landing_final_cta: 'Landing: Join Now For Free',
  auth_page: 'Opened login / register page directly',
  untracked: 'Not tracked (before this update)',
};
const ctaLabel = (k) => CTA_LABELS[k] || k;

const countryName = (code) => {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch (e) { return code; }
};

const List = ({ title, rows }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 h-48 flex flex-col">
    <div className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</div>
    <div className="min-h-0 flex-1 overflow-y-auto">
      {rows.length === 0 ? <div className="text-xs text-slate-400">No data yet</div> : rows.map((r) => (
        <div key={r.k} className="flex justify-between gap-3 text-xs py-0.5">
          <span className={`font-bold ${r.cap ? 'capitalize' : ''}`}>{r.k}</span>
          <span className="tabular-nums text-right">{r.v}</span>
        </div>
      ))}
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
  const [segment, setSegment] = useState('total');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.getAdminTraffic(range.days, range.offset, segment);
      setData(res.data);
    } catch (e) {
      setError(e?.message || 'Failed to load traffic');
    }
    setLoading(false);
  }, [range, segment]);

  useEffect(() => { load(); }, [load]);

  useAdminMobileHeader({ title: 'Traffic', count: data?.summary?.current?.visitors || 0, filters: null });

  if (loading && !data && !error) {
    return <div className="min-h-screen p-3 xl:p-8"><AdminTableSkeleton showHeader={false} showFilters={false} /></div>;
  }

  const rows = data?.days || [];
  const sum = (k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
  const th = 'px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right leading-tight';
  const td = 'px-2 py-1.5 text-xs tabular-nums text-right';

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      {isMounted && <Sidebar />}
      <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <Activity className="w-4 h-4" /> Traffic          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 max-w-full overflow-x-auto" role="tablist">
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={segment === s.id}
                title={s.hint}
                onClick={() => setSegment(s.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-colors ${segment === s.id ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {s.label}
              </button>
            ))}
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
          const signups = (o) => (o.signupGoogle || 0) + (o.signupPassword || 0);
          const logins = (o) => (o.loginGoogle || 0) + (o.loginPassword || 0);
          return (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
                <Stat label="Visitors" value={c.visitors ?? 0} cur={c.visitors || 0} prev={p.visitors || 0} sub={`${c.alreadyLoggedIn || 0} already logged in · ${data?.uniqueIps || 0} unique IPs`} Icon={Users} tone="bg-sky-500/10 text-sky-600" />
                <Stat label="Opened login / register" value={c.sawAuthPage ?? 0} cur={c.sawAuthPage || 0} prev={p.sawAuthPage || 0} sub={`${pct(c.sawAuthPage, c.newVisitors)} of new`} Icon={MousePointerClick} tone="bg-violet-500/10 text-violet-600" />
                <Stat label="Left without login/signup" value={c.leftWithoutAuth ?? 0} cur={c.leftWithoutAuth || 0} prev={p.leftWithoutAuth || 0} inverse sub={`${pct(c.leftWithoutAuth, c.newVisitors)} of new`} Icon={LogOut} tone="bg-rose-500/10 text-rose-600" />
                <Stat label="Signups" value={signups(c)} cur={signups(c)} prev={signups(p)} sub={`Google ${c.signupGoogle || 0} · Normal ${c.signupPassword || 0} · DB ${c.dbSignups || 0}`} Icon={UserPlus} tone="bg-emerald-500/10 text-emerald-600" />
                <Stat label="Logins" value={logins(c)} cur={logins(c)} prev={logins(p)} sub={`Google ${c.loginGoogle || 0} · Normal ${c.loginPassword || 0}`} Icon={LogIn} tone="bg-amber-500/10 text-amber-600" />
              </div>
            </div>
          );
        })()}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[42vh]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[13%]" />
              <col className="w-[8%]" /><col className="w-[8%]" /><col className="w-[9%]" /><col className="w-[8%]" />
              <col className="w-[11%]" /><col className="w-[11%]" />
              <col className="w-[10%]" /><col className="w-[10%]" /><col className="w-[12%]" />
            </colgroup>
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className={`${th} text-left`}>Day</th>
                <th className={th}>Visitors</th>
                <th className={th}>Views</th>
                <th className={th}>Logged in</th>
                <th className={th}>New</th>
                <th className={th}>Opened login</th>
                <th className={th}>Left</th>
                <th className={th}>Signup G / N</th>
                <th className={th}>Login G / N</th>
                <th className={th}>DB signups G / N</th>
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
                  <td className={td}>{r.sawAuthPage} <span className="text-slate-400">({pct(r.sawAuthPage, r.newVisitors)})</span></td>
                  <td className={`${td} text-rose-600`}>{r.leftWithoutAuth} <span className="text-slate-400">({pct(r.leftWithoutAuth, r.newVisitors)})</span></td>
                  <td className={td}>{r.signupGoogle} / {r.signupPassword}</td>
                  <td className={td}>{r.loginGoogle} / {r.loginPassword}</td>
                  <td className={td}>{r.dbSignups} <span className="text-slate-400">({r.dbSignupsGoogle} / {r.dbSignupsPassword})</span></td>
                </tr>
              ))}
            </tbody>
            {rows.length > 1 ? (
              <tfoot className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 font-black">
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className={`${td} text-left`}>Total</td>
                  <td className={td}>{sum('visitors')}</td>
                  <td className={td}>{sum('pageViews')}</td>
                  <td className={td}>{sum('alreadyLoggedIn')}</td>
                  <td className={td}>{sum('newVisitors')}</td>
                  <td className={td}>{sum('sawAuthPage')}</td>
                  <td className={td}>{sum('leftWithoutAuth')}</td>
                  <td className={td}>{sum('signupGoogle')} / {sum('signupPassword')}</td>
                  <td className={td}>{sum('loginGoogle')} / {sum('loginPassword')}</td>
                  <td className={td}>{sum('dbSignups')}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2">
          <List title={`New visitors by source (${range.label})`} rows={(data?.sources || []).map((x) => ({ k: x.source, v: `${x.visitors} visitors · ${x.signups} signed up` }))} />
          <List title={`Devices (${range.label})`} rows={(data?.devices || []).map((x) => ({ k: x.device, v: x.visitors, cap: true }))} />
          <List title={`Top countries (${range.label})`} rows={(data?.countries || []).map((x) => ({ k: countryName(x.code), v: `${x.visitors} visitors · ${x.signups} signed up` }))} />
          <List title={`Top states (${range.label})`} rows={(data?.states || []).map((x) => ({ k: `${x.name}${x.country ? `, ${x.country}` : ''}`, v: `${x.visitors} visitors · ${x.signups} signed up` }))} />
          <List title={`Top cities (${range.label})`} rows={(data?.cities || []).map((x) => ({ k: `${x.city}${x.country ? `, ${x.country}` : ''}`, v: `${x.visitors} visitors · ${x.signups} signed up` }))} />
          <List title={`Operating systems (${range.label})`} rows={(data?.oses || []).map((x) => ({ k: x.name, v: x.visitors }))} />
          <List title={`Last page before leaving, no signup (${range.label})`} rows={(data?.exitPages || []).map((x) => ({ k: x.path, v: `${x.visitors} visitors` }))} />
          <List title={`Signup prompts (${range.label}): shown → clicked → signed up`} rows={(data?.prompts || []).filter((x) => x.shown || x.clicked).map((x) => ({ k: x.name, v: `${x.shown} shown · ${x.clicked} clicked (${pct(x.clicked, x.shown)}) · ${x.signups} signed up`, cap: true }))} />
          <List title={`Signups: which button / popup (${range.label})`} rows={(data?.signupFrom || []).map((x) => ({ k: ctaLabel(x.from), v: `${x.signups} signed up · Google ${x.google} · Normal ${x.password}` }))} />
          <List title={`Signups: page they clicked on (${range.label})`} rows={(data?.signupPaths || []).map((x) => ({ k: x.path, v: `${x.signups} signed up` }))} />
          <List title={`Email leads (${range.label})`} rows={[{ k: 'Emails captured', v: data?.leads ?? 0 }]} />
          <List title={`Browsers (${range.label})`} rows={(data?.browsers || []).map((x) => ({ k: x.name, v: x.visitors }))} />
        </div>
      </div>
    </div>
  );
}
