'use client';

import Select from '../../common/ui/Select';
import { useEffect, useState, useCallback } from 'react';
import { Users, MousePointerClick, LogOut, UserPlus, LogIn, Activity, X } from 'lucide-react';
import Sidebar from '../Sidebar';
import { AdminTableSkeleton } from '../Skeletons';
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
  { id: 'bots', label: 'Bots', hint: 'Suspected bots only: single-page direct visits from outside India' },
  { id: 'india', label: 'From India', hint: 'Real users in India only' },
  { id: 'outside', label: 'Outside India', hint: 'Real users outside India only' },];

const fmtDay =(d) => new Date(`${d}T00:00:00+05:30`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' });
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');

// GA-style change vs the previous period. `inverse`: a rise is bad (e.g. people leaving), so up = red.
const Delta = ({ cur, prev, inverse }) => {
  if (!cur && !prev) return <span className="text-[10px] font-bold text-content-muted">— vs prev</span>;
  const up = cur >= prev;
  const flat = cur === prev;
  const good = flat ? null : up !== !!inverse;
  const color = flat ? 'text-content-muted' : good ? 'text-emerald-600' : 'text-rose-600';
  const text = !prev ? 'new' : `${Math.abs(((cur - prev) / prev) * 100).toFixed(1)}%`;
  return (
    <span className={`text-[10px] font-bold ${color}`}>
      {flat ? '→' : up ? '▲' : '▼'} {flat ? '0.0%' : text}
      <span className="text-content-muted font-bold"> vs {prev}</span>
    </span>
  );
};

const Stat = ({ label, value, sub, Icon, tone, cur, prev, inverse, onClick }) => {
  const Wrap = onClick ? 'button' : 'div';
  return (
    <Wrap
      {...(onClick ? { type: 'button', onClick, title: 'Click to see who' } : {})}
      style={{ borderRadius: 14 }}
      className={`group relative isolate overflow-hidden w-full px-2.5 py-2 text-left border border-border-primary hover:-translate-y-0.5 transition-all bg-background-surface ${onClick ? 'cursor-pointer' : ''}`}
    >
      <Icon className="pointer-events-none absolute -right-2 -bottom-2 w-14 h-14 text-primary-600/10 dark:text-white/10 rotate-12" />
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 leading-tight">{label}</div>
        <span className="shrink-0 w-7 h-7 flex items-center justify-center text-primary-600 group-hover:rotate-0 transition-transform border border-border-primary" style={{ borderRadius: 8 }}><Icon className="w-3.5 h-3.5" /></span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold font-outfit tabular-nums leading-none text-primary-600">{value}</div>
        {cur !== undefined ? <Delta cur={cur} prev={prev} inverse={inverse} /> : null}
      </div>
      {sub ? <div className="mt-1.5 pt-1.5 border-t border-dashed border-border-primary text-[10px] font-bold text-content-secondary dark:text-white/70 leading-tight">{sub}</div> : null}
    </Wrap>
  );
};

const fmtWhen = (d) => (d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : '—');

// Logins recorded before we started saving the user id can't be matched to an account.
const UserName = ({ u, prefix = '', className = '' }) => (u.id
  ? <a href={`/admin/user-details/${u.username || u.id}`} className={`text-primary-600 ${className}`}>{prefix}{u.name || '—'}</a>
  : <span className={`text-content-muted italic ${className}`}>{prefix}Not recorded (earlier login)</span>);

// Who signed up / logged in during the selected period (accounts from the users collection, web + app).
const UsersModal = ({ kind, range, segment, onClose }) => {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, error: '', data: null });
    API.getAdminTrafficUsers(kind, range.days, range.offset, segment)
      .then((res) => { if (alive) setState({ loading: false, error: '', data: res.data }); })
      .catch((e) => { if (alive) setState({ loading: false, error: e?.message || 'Failed to load users', data: null }); });
    return () => { alive = false; };
  }, [kind, range, segment]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isSignup = kind === 'signup';
  const users = state.data?.users || [];
  const th = 'px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-primary text-left whitespace-nowrap';
  const td = 'px-2 py-1.5 text-xs whitespace-nowrap';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-3" onClick={onClose}>
      <div className="w-full max-w-4xl h-[70vh] min-h-[70vh] max-h-[70vh] flex flex-col overflow-hidden bg-background-surface rounded-2xl border border-border-primary relative" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between gap-3 p-4 border-b border-border-primary">
          <div>
            <div className="text-sm font-bold text-content-primary">{isSignup ? 'Signed up' : 'Logged in'} · {range.label}</div>
            <div className="text-[11px] text-content-muted mt-0.5">
              {state.data ? `${state.data.total} user${state.data.total === 1 ? '' : 's'}${state.data.total > users.length ? ` (showing latest ${users.length})` : ''}` : 'Loading…'}
              {isSignup ? ' · all new accounts incl. mobile app' : ' · same logins the card counts'}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-content-muted hover:text-content-primary dark:hover:text-white hover:bg-background-surface-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
          {state.error ? <div className="m-4 p-3 rounded-xl bg-rose-500/10 text-rose-600 text-sm font-bold">{state.error}</div> : null}
          {state.loading ? <div className="p-4 text-xs text-content-muted">Loading…</div> : null}
          {!state.loading && !state.error && users.length === 0 ? <div className="p-4 text-xs text-content-muted">No users in this period.</div> : null}
          {users.length > 0 ? (
            <div className="md:hidden grid grid-cols-1 gap-2 p-2">
              {users.map((u, i) => (
                <div key={`${u.id}-${i}`} className="min-w-0 p-2.5 text-xs rounded-xl border border-border-primary">
                  <div className="flex flex-col gap-0.5">
                    <UserName u={u} prefix={`${i + 1}. `} className="font-bold break-words min-w-0" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted">{u.method}{u.referred ? ' · referred' : ''}</span>
                  </div>
                  <div className="text-content-secondary break-all mt-0.5">{u.email}</div>
                  <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-content-muted">
                    {u.phone ? <span>{u.phone}</span> : null}
                    {[u.city, u.state].filter(Boolean).length ? <span>{[u.city, u.state].filter(Boolean).join(', ')}</span> : null}
                    {isSignup && u.heardFrom ? <span>Heard: {u.heardFrom}</span> : null}
                    {!isSignup ? <span>Joined {fmtWhen(u.createdAt)}</span> : null}
                    <span>{isSignup ? 'Signed up' : 'Last login'} {fmtWhen(isSignup ? u.createdAt : u.lastLoginDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {users.length > 0 ? (
            <table className="w-full max-md:hidden">
              <thead className="sticky top-0 z-10 bg-background-surface border-b border-border-primary">
                <tr className="border-b border-border-primary">
                  <th className={th}>#</th>
                  <th className={th}>Name</th>
                  <th className={th}>Email</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Via</th>
                  <th className={th}>Location</th>
                  {isSignup ? <th className={th}>Heard from</th> : <th className={th}>Joined</th>}
                  <th className={th}>{isSignup ? 'Signed up' : 'Last login'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {users.map((u, i) => (
                  <tr key={`${u.id}-${i}`}>
                    <td className={`${td} text-content-muted`}>{i + 1}</td>
                    <td className={`${td} font-bold`}><UserName u={u} className="hover:underline" /></td>
                    <td className={td}>{u.email}</td>
                    <td className={td}>{u.phone || '—'}</td>
                    <td className={`${td} capitalize`}>{u.method}{u.referred ? ' · referred' : ''}</td>
                    <td className={td}>{[u.city, u.state].filter(Boolean).join(', ') || '—'}</td>
                    {isSignup ? <td className={td}>{u.heardFrom || '—'}</td> : <td className={td}>{fmtWhen(u.createdAt)}</td>}
                    <td className={td}>{fmtWhen(isSignup ? u.createdAt : u.lastLoginDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  );
};

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
  <div className="relative overflow-hidden bg-background-surface border border-border-primary h-52 max-lg:h-auto flex flex-col" style={{ borderRadius: 14 }}>
    <div className="shrink-0 px-3 py-2 border-b border-border-primary dark:border-transparent text-[10px] font-bold uppercase tracking-[0.08em] text-content-primary bg-background-surface">{title}</div>
    <div className="min-h-0 flex-1 overflow-y-auto max-lg:overflow-visible px-3 py-1">
      {rows.length === 0 ? <div className="py-2 text-xs text-content-muted">No data yet</div> : rows.map((r) => (
        <div key={r.k} className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-dashed border-border-primary last:border-0">
          <span className={`font-bold ${r.cap ? 'capitalize' : ''}`}>{r.k}</span>
          <span className="tabular-nums text-right font-bold text-primary-600">{r.v}</span>
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
  const [usersModal, setUsersModal] = useState(null); // 'signup' | 'login' | null

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
    return <div className="min-h-screen p-3 xl:p-5"><AdminTableSkeleton showHeader={false} showFilters={false} /></div>;
  }

  const rows = data?.days || [];
  const sum = (k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
  const th = 'px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-primary text-right leading-tight';
  const td = 'px-2 py-1.5 text-xs tabular-nums text-right';

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      {isMounted && <Sidebar />}
      {usersModal ? <UsersModal kind={usersModal} range={range} segment={segment} onClose={() => setUsersModal(null)} /> : null}
      <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="order-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-content-secondary">
            <span className="w-8 h-8 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 10 }}><Activity className="w-4 h-4" /></span> Traffic          </div>
          <div className="order-3 md:order-2 w-full md:w-auto flex gap-1 p-1 bg-background-surface border border-border-primary max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={segment === s.id}
                title={s.hint}
                onClick={() => setSegment(s.id)}
                style={{ borderRadius: 999 }} className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] whitespace-nowrap transition-all ${segment === s.id ? 'text-on-primary bg-primary-600' : 'text-content-muted dark:hover:bg-white/10 hover:text-content-primary dark:hover:text-white'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Select
            value={rangeId}
            onChange={(e) => setRangeId(e.target.value)}
            aria-label="Date range"
            className="order-2 md:order-3 px-3 py-2 rounded-xl border bg-background-surface text-xs font-bold uppercase tracking-[0.08em] text-content-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 border-border-primary"
          >
            {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </Select>
        </div>

        {error ? <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 text-sm font-bold">{error}</div> : null}

        {(() => {
          const c = data?.summary?.current || {};
          const p = data?.summary?.previous || {};
          const signups = (o) => (o.signupGoogle || 0) + (o.signupPassword || 0);
          const logins = (o) => (o.loginGoogle || 0) + (o.loginPassword || 0);
          return (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
                <Stat label="Visitors" value={c.visitors ?? 0} cur={c.visitors || 0} prev={p.visitors || 0} sub={`${c.alreadyLoggedIn || 0} already logged in · ${data?.uniqueIps || 0} unique IPs`} Icon={Users} tone="bg-sky-500/10 text-sky-600" />
                <Stat label="Opened login / register" value={c.sawAuthPage ?? 0} cur={c.sawAuthPage || 0} prev={p.sawAuthPage || 0} sub={`${pct(c.sawAuthPage, c.newVisitors)} of new`} Icon={MousePointerClick} tone="bg-violet-500/10 text-violet-600" />
                <Stat label="Left without login/signup" value={c.leftWithoutAuth ?? 0} cur={c.leftWithoutAuth || 0} prev={p.leftWithoutAuth || 0} inverse sub={`${pct(c.leftWithoutAuth, c.newVisitors)} of new`} Icon={LogOut} tone="bg-rose-500/10 text-rose-600" />
                <Stat label="Signups" value={signups(c)} cur={signups(c)} prev={signups(p)} sub={`Google ${c.signupGoogle || 0} · Normal ${c.signupPassword || 0} · DB ${c.dbSignups || 0}`} Icon={UserPlus} tone="bg-emerald-500/10 text-emerald-600" onClick={() => setUsersModal('signup')} />
                <Stat label="Logins" value={logins(c)} cur={logins(c)} prev={logins(p)} sub={`Google ${c.loginGoogle || 0} · Normal ${c.loginPassword || 0}`} Icon={LogIn} tone="bg-amber-500/10 text-amber-600" onClick={() => setUsersModal('login')} />
              </div>
            </div>
          );
        })()}

        <div className="bg-background-surface rounded-xl border border-border-primary overflow-y-auto max-h-[42vh]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[13%]" />
              <col className="w-[8%]" /><col className="w-[8%]" /><col className="w-[9%]" /><col className="w-[8%]" />
              <col className="w-[11%]" /><col className="w-[11%]" />
              <col className="w-[10%]" /><col className="w-[10%]" /><col className="w-[12%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-background-surface border-b border-border-primary">
              <tr className="border-b border-border-primary">
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
            <tbody className="divide-y divide-border-primary">
              {rows.map((r) => (
                <tr key={r.day}>
                  <td className={`${td} text-left font-bold`}>{fmtDay(r.day)}</td>
                  <td className={`${td} font-bold`}>{r.visitors}</td>
                  <td className={td}>{r.pageViews}</td>
                  <td className={td}>{r.alreadyLoggedIn}</td>
                  <td className={td}>{r.newVisitors}</td>
                  <td className={td}>{r.sawAuthPage} <span className="text-content-muted">({pct(r.sawAuthPage, r.newVisitors)})</span></td>
                  <td className={`${td} text-rose-600`}>{r.leftWithoutAuth} <span className="text-content-muted">({pct(r.leftWithoutAuth, r.newVisitors)})</span></td>
                  <td className={td}>{r.signupGoogle} / {r.signupPassword}</td>
                  <td className={td}>{r.loginGoogle} / {r.loginPassword}</td>
                  <td className={td}>{r.dbSignups} <span className="text-content-muted">({r.dbSignupsGoogle} / {r.dbSignupsPassword})</span></td>
                </tr>
              ))}
            </tbody>
            {rows.length > 1 ? (
              <tfoot className="sticky bottom-0 bg-background-surface-secondary font-bold">
                <tr className="border-t border-border-primary">
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
