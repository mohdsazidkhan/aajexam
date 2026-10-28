'use client';

import Select from '../../common/ui/Select';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { isMobile } from 'react-device-detect';
import {
  Bug, Server, Monitor, Smartphone, Globe, Trash2, CheckCircle2, Eye, EyeOff, RotateCcw,
  LayoutGrid, Table as TableIcon, Search, X, Clock, Users
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../common/Pagination';
import ResponsiveTable from '../../common/ResponsiveTable';
import Sidebar from '../Sidebar';
import { AdminTableSkeleton } from '../Skeletons';
import useDebounce from '../../../hooks/useDebounce';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'ignored', label: 'Ignored' },
];
const ORIGIN_TABS = [
  { id: '', label: 'Backend + Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'frontend', label: 'Frontend' },
];
const TYPE_OPTIONS = ['api', 'render', 'js', 'promise', 'network', 'other'];

const fmt = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return `${x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${x.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
};

const OriginBadge = ({ origin }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.08em] ${origin === 'backend' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-sky-500/10 text-sky-600 border border-sky-500/20'}`}>
    {origin === 'backend' ? <Server className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
    {origin === 'backend' ? 'Backend' : 'Frontend'}
  </span>
);

const StatusBadge = ({ status }) => {
  const cls = status === 'open' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    : status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      : 'bg-slate-500/10 text-content-muted border-slate-500/20';
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.08em] border ${cls}`}>{status}</span>;
};

/**
 * Admin list of errors reported by clients.
 *   kind="mobile" -> /admin/app-errors  (data from POST /api/mobile-errors)
 *   kind="web"    -> /admin/web-errors  (data from POST /api/web-errors)
 */
export default function ClientErrors({ kind = 'mobile' }) {
  const isApp = kind === 'mobile';
  const title = isApp ? 'App Errors' : 'Web Errors';
  const { isMounted } = useSSR();

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState('open');
  const [origin, setOrigin] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
  const [selected, setSelected] = useState(null);
  const debouncedSearch = useDebounce(searchTerm, 600);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: String(page), limit: String(itemsPerPage), sort };
      if (status) params.status = status;
      if (origin) params.origin = origin;
      if (type) params.type = type;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await API.getClientErrors(kind, params);
      setItems(res.errors || []);
      setSummary(res.summary || {});
      setPagination(res.pagination || {});
    } catch (e) {
      setError(e?.message || 'Failed to load errors');
    }
    setLoading(false);
  }, [kind, page, itemsPerPage, status, origin, type, sort, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const setItemStatus = async (item, next) => {
    try {
      await API.updateClientError(kind, item._id, { status: next });
      toast.success(next === 'open' ? 'Reopened' : `Marked ${next}`);
      if (selected?._id === item._id) setSelected({ ...selected, status: next });
      load();
    } catch (e) { toast.error('Could not update'); }
  };

  const remove = async (item) => {
    if (!window.confirm('Delete this error report?')) return;
    try {
      await API.deleteClientError(kind, item._id);
      toast.success('Deleted');
      if (selected?._id === item._id) setSelected(null);
      load();
    } catch (e) { toast.error('Could not delete'); }
  };

  const purge = async () => {
    if (!window.confirm('Delete ALL resolved errors?')) return;
    try {
      const res = await API.purgeResolvedClientErrors(kind);
      toast.success(`Deleted ${res.deleted || 0} resolved errors`);
      load();
    } catch (e) { toast.error('Could not purge'); }
  };

  const deleteAll = async () => {
    const total = pagination.total || 0;
    if (!window.confirm(`Delete ALL ${isApp ? 'app' : 'web'} error reports (open, resolved and ignored)? This cannot be undone.`)) return;
    if (total > 0 && !window.confirm(`Really delete everything? ${total} report(s) will be removed.`)) return;
    try {
      const res = await API.deleteAllClientErrors(kind);
      toast.success(`Deleted ${res.deleted || 0} errors`);
      setPage(1);
      load();
    } catch (e) { toast.error('Could not delete'); }
  };

  const columns = [
    { key: 'origin', header: 'ORIGIN', render: (_, e) => <OriginBadge origin={e.origin} /> },
    {
      key: 'message', header: 'ERROR', render: (_, e) => (
        <button onClick={() => setSelected(e)} className="text-left max-w-md">
          <div className="text-xs font-bold text-content-primary leading-snug line-clamp-2">{e.message}</div>
          <div className="text-[10px] font-bold text-content-muted mt-0.5 uppercase tracking-[0.08em]">
            {e.type}{e.statusCode ? ` · HTTP ${e.statusCode}` : ''}{e.errorName ? ` · ${e.errorName}` : ''}
          </div>
        </button>
      )
    },
    {
      key: 'where', header: isApp ? 'SCREEN / ENDPOINT' : 'PAGE / ENDPOINT', render: (_, e) => (
        <div className="text-[10px] font-bold text-content-secondary leading-snug">
          <div className="truncate max-w-[220px]">{e.screen || '—'}</div>
          {e.endpoint ? <div className="text-content-muted truncate max-w-[220px]">{e.method} {e.endpoint}</div> : null}
        </div>
      )
    },
    {
      key: 'count', header: 'COUNT', align: 'center', render: (_, e) => (
        <span className="text-sm font-bold tabular-nums text-content-primary">{e.count}</span>
      )
    },
    {
      key: 'env', header: isApp ? 'VERSION / OS' : 'BROWSER', render: (_, e) => (
        <div className="text-[10px] font-bold text-content-secondary">
          {isApp ? `${e.appVersion || '—'} · ${e.platform || ''} ${e.osVersion || ''}` : (e.platform || '—')}
        </div>
      )
    },
    { key: 'user', header: 'USER', render: (_, e) => <div className="text-[10px] font-bold text-content-secondary truncate max-w-[160px]">{e.userEmail || e.userName || 'Guest'}</div> },
    { key: 'last', header: 'LAST SEEN', align: 'right', render: (_, e) => <div className="text-[10px] font-bold text-content-muted tabular-nums">{fmt(e.lastSeenAt)}</div> },
    { key: 'status', header: 'STATUS', align: 'center', render: (_, e) => <StatusBadge status={e.status} /> },
    {
      key: 'actions', header: 'ACTIONS', align: 'center', render: (_, e) => (
        <div className="flex justify-center gap-1">
          <button onClick={() => setSelected(e)} title="View details" className="p-1.5 rounded-lg text-on-primary hover:bg-primary-600 hover:text-white transition bg-primary-600"><Eye className="w-4 h-4" /></button>
          {e.status !== 'resolved'
            ? <button onClick={() => setItemStatus(e, 'resolved')} title="Mark resolved" className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"><CheckCircle2 className="w-4 h-4" /></button>
            : <button onClick={() => setItemStatus(e, 'open')} title="Reopen" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white transition"><RotateCcw className="w-4 h-4" /></button>}
          {e.status !== 'ignored' ? <button onClick={() => setItemStatus(e, 'ignored')} title="Ignore" className="p-1.5 rounded-lg bg-slate-500/10 text-content-muted hover:bg-slate-600 hover:text-white transition"><EyeOff className="w-4 h-4" /></button> : null}
          <button onClick={() => remove(e)} title="Delete" className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-content-primary hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  const filters = (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search message, screen, endpoint, user..."
            className="w-full pl-9 pr-3 py-2 bg-background-surface border border-border-primary rounded-lg text-xs font-semibold outline-none focus:border-primary-500"
          />
        </div>
        <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="px-2.5 py-2 bg-background-surface border border-border-primary rounded-lg text-xs font-bold">
          <option value="">All types</option>
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="px-2.5 py-2 bg-background-surface border border-border-primary rounded-lg text-xs font-bold">
          <option value="recent">Most recent</option>
          <option value="count">Most frequent</option>
        </Select>
        <button onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')} className="px-2.5 py-2 rounded-lg border border-border-primary text-xs font-bold flex items-center gap-1.5 hover:border-primary-400 transition-colors">
          {viewMode === 'table' ? <><LayoutGrid className="w-4 h-4" /> Grid</> : <><TableIcon className="w-4 h-4" /> Table</>}
        </button>
        <button onClick={purge} className="px-2.5 py-2 rounded-lg border border-border-primary text-xs font-bold flex items-center gap-1.5 hover:border-primary-400 transition-colors"><Trash2 className="w-4 h-4" /> Purge resolved</button>
        <button onClick={deleteAll} className="px-2.5 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-red-600 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /> Delete all</button>
      </div>
    </div>
  );

  useAdminMobileHeader({ title, count: pagination.total || 0, filters });

  if (loading && items.length === 0 && !error) {
    return <div className="min-h-screen p-3 xl:p-5"><AdminTableSkeleton showHeader={false} showFilters={false} /></div>;
  }

  const stat = (label, value, Icon) => (
    <div className="bg-background-surface rounded-xl border border-border-primary px-2.5 py-2 flex items-center gap-2.5 hover:-translate-y-0.5 transition-all min-w-0">
      <span className="w-7 h-7 shrink-0 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}><Icon className="w-3.5 h-3.5" /></span>
      <div className="min-w-0">
        <div className="text-base font-bold tabular-nums text-content-primary leading-none">{value ?? 0}</div>
        <div className="text-[8px] font-bold uppercase tracking-[0.08em] text-content-muted mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      {isMounted && <Sidebar />}
      <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-3">

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
          {stat('Open', summary.open, Bug)}
          {stat('Open · Backend', summary.openBackend, Server)}
          {stat('Open · Frontend', summary.openFrontend, Monitor)}
          {stat('Last 24h', summary.last24h, Clock)}
          {stat('Total occurrences', summary.totalOccurrences, Users)}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-background-surface-secondary p-1 rounded-xl max-w-full overflow-x-auto no-scrollbar">
            {STATUS_TABS.map((t) => (
              <button key={t.id} onClick={() => { setStatus(t.id); setPage(1); }} className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.08em] transition ${status === t.id ? 'text-on-primary bg-primary-600' : 'text-content-muted hover:bg-background-surface dark:hover:bg-white/10'}`}>{t.label}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-background-surface-secondary p-1 rounded-xl max-w-full overflow-x-auto no-scrollbar">
            {ORIGIN_TABS.map((t) => (
              <button key={t.id} onClick={() => { setOrigin(t.id); setPage(1); }} className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.08em] transition ${origin === t.id ? 'text-on-primary bg-primary-600' : 'text-content-muted hover:bg-background-surface dark:hover:bg-white/10'}`}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="hidden xl:block">{filters}</div>

        {error ? <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 text-sm font-bold">{error}</div> : null}

        <div className={`flex-1 min-h-0 ${viewMode === 'table' && items.length > 0 ? 'overflow-hidden flex flex-col' : 'overflow-auto'}`}>
          {items.length === 0 ? (
            <section className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border-primary">
              <Bug className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold tracking-tight mb-1">No errors found</h3>
              <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em]">Nothing reported for these filters. That is good news.</p>
            </section>
          ) : viewMode === 'table' ? (
            <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden flex flex-col flex-1 min-h-0 relative">
              <ResponsiveTable data={items} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 items-start pb-4">
              {items.map((e) => (
                <div key={e._id} className="bg-background-surface rounded-xl border border-border-primary p-3 flex flex-col gap-2 transition-shadow relative">
                  <div className="flex items-center justify-between gap-2">
                    <OriginBadge origin={e.origin} />
                    <span className="text-sm font-bold tabular-nums">×{e.count}</span>
                  </div>
                  <button onClick={() => setSelected(e)} className="text-left">
                    <div className="text-xs font-bold leading-snug line-clamp-3">{e.message}</div>
                    <div className="text-[10px] font-bold text-content-muted mt-1 uppercase tracking-[0.08em]">{e.type}{e.statusCode ? ` · HTTP ${e.statusCode}` : ''} · {e.screen || e.endpoint || '—'}</div>
                  </button>
                  <div className="flex items-center justify-between pt-2 border-t border-border-primary mt-auto">
                    <StatusBadge status={e.status} />
                    <span className="text-[10px] font-bold text-content-muted">{fmt(e.lastSeenAt)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setSelected(e)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-primary-600 hover:bg-primary-600 hover:text-white transition text-[11px] font-bold uppercase tracking-wide"><Eye className="w-3.5 h-3.5" /> View</button>
                    {e.status !== 'resolved'
                      ? <button onClick={() => setItemStatus(e, 'resolved')} aria-label="Mark resolved" className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"><CheckCircle2 className="w-4 h-4" /></button>
                      : <button onClick={() => setItemStatus(e, 'open')} aria-label="Reopen" className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white transition"><RotateCcw className="w-4 h-4" /></button>}
                    <button onClick={() => remove(e)} aria-label="Delete" className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="shrink-0">
            <Pagination
        compact
        inline
        currentPage={page}
        totalPages={pagination.totalPages || 1}
        onPageChange={setPage}
        totalItems={pagination.total || 0}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(n) => { setItemsPerPage(n); setPage(1); }}
      />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              onClick={(ev) => ev.stopPropagation()}
              className="bg-background-surface w-full sm:max-w-3xl max-h-[92dvh] overflow-auto rounded-t-2xl sm:rounded-2xl border border-border-primary p-3 sm:p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <OriginBadge origin={selected.origin} />
                  <StatusBadge status={selected.status} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted">{selected.type}{selected.statusCode ? ` · HTTP ${selected.statusCode}` : ''}</span>
                </div>
                <button aria-label="Close" onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-background-surface-secondary"><X className="w-5 h-5" /></button>
              </div>
              <h2 className="text-sm sm:text-base font-bold leading-snug mb-3 break-words">{selected.message}</h2>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-4">
                {[
                  ['Occurrences', selected.count],
                  ['Reopened', selected.reopenedCount || 0],
                  ['First seen', fmt(selected.firstSeenAt)],
                  ['Last seen', fmt(selected.lastSeenAt)],
                  [isApp ? 'Screen' : 'Page', selected.screen || '—'],
                  ['Endpoint', selected.endpoint ? `${selected.method} ${selected.endpoint}` : '—'],
                  [isApp ? 'App version' : 'Browser', isApp ? (selected.appVersion || '—') : (selected.platform || '—')],
                  ['Platform / OS', `${selected.platform || '—'} ${selected.osVersion || ''}`],
                  ['Device', selected.device || '—'],
                  ['Last user', selected.userEmail || selected.userName || 'Guest'],
                ].map(([k, v]) => (
                  <div key={k}><dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted">{k}</dt><dd className="font-bold break-words">{v}</dd></div>
                ))}
              </dl>

              {selected.stack ? (<><div className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted mb-1">Stack trace</div>
                <pre className="text-[10px] leading-relaxed bg-background-surface rounded-xl p-3 overflow-auto max-h-56 mb-3 whitespace-pre-wrap break-words">{selected.stack}</pre></>) : null}
              {selected.componentStack ? (<><div className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted mb-1">Component stack</div>
                <pre className="text-[10px] leading-relaxed bg-background-surface rounded-xl p-3 overflow-auto max-h-40 mb-3 whitespace-pre-wrap break-words">{selected.componentStack}</pre></>) : null}
              {selected.extra ? (<><div className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted mb-1">Extra</div>
                <pre className="text-[10px] leading-relaxed bg-background-surface rounded-xl p-3 overflow-auto max-h-40 mb-3 whitespace-pre-wrap break-words">{JSON.stringify(selected.extra, null, 2)}</pre></>) : null}
              {selected.userAgent ? <div className="text-[10px] text-content-muted break-words mb-4">UA: {selected.userAgent}</div> : null}

              <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-border-primary">
                {selected.status !== 'resolved'
                  ? <button onClick={() => setItemStatus(selected, 'resolved')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-[0.08em]">Mark resolved</button>
                  : <button onClick={() => setItemStatus(selected, 'open')} className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold uppercase tracking-[0.08em]">Reopen</button>}
                {selected.status !== 'ignored' ? <button onClick={() => setItemStatus(selected, 'ignored')} className="px-4 py-2 rounded-xl bg-background-surface-secondary text-xs font-bold uppercase tracking-[0.08em]">Ignore</button> : null}
                <button onClick={() => remove(selected)} className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-[0.08em]">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
