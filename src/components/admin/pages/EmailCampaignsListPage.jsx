'use client';

import Select from '../../common/ui/Select';
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Plus, Table2, List, LayoutGrid, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import API from '../../../lib/api';
import { useSSR } from '../../../hooks/useSSR';
import { buildEmailHtml, personalize } from '../../../utils/emailTemplate';
import ResponsiveTable from '../../common/ResponsiveTable';
import { AdminTableSkeleton } from '../Skeletons';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const STATUS_STYLES = {
  draft: 'bg-background-surface-secondary text-content-secondary',
  published: 'bg-background-surface-secondary text-content-primary',
  active: 'bg-background-surface-secondary text-content-primary',
  paused: 'bg-background-surface-secondary text-content-primary',
  completed: 'text-primary-600'
};
const STATUS_LABEL = {
  draft: '📝 Draft', published: '✅ Published', active: '📤 Sending',
  paused: '⏸️ Paused', completed: '🎉 Sent to all'
};
const FILTERS = ['all', 'draft', 'published', 'active', 'paused', 'completed'];
const VIEWS = [
  { key: 'table', icon: Table2, label: 'Table' },
  { key: 'list', icon: List, label: 'List' },
  { key: 'grid', icon: LayoutGrid, label: 'Grid' }
];

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
};

const pctOf = (c) => {
  const processed = (c.sentCount || 0) + (c.failedCount || 0);
  return c.totalTargeted ? Math.min(100, Math.round((processed / c.totalTargeted) * 100)) : 0;
};

// Preview is only offered once a campaign has actually gone out to everyone.
const canPreview = (c) => c.status === 'completed';

// A campaign can be deleted straight from the list any time before it starts
// sending. Once it is mid-send or done, deleting it would throw away progress
// or the record of who was emailed — do that from inside the campaign instead.
const canDelete = (c) => c.status === 'draft' || c.status === 'published';

const EmailCampaignsListPage = () => {
  const { isMounted } = useSSR();
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [sendingCampaign, setSendingCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [deletingId, setDeletingId] = useState(null);

  // Remember the admin's preferred view between visits.
  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('emailCampaignsView');
    if (saved && VIEWS.some((v) => v.key === saved)) setView(saved);
  }, []);
  const changeView = (v) => {
    setView(v);
    if (typeof window !== 'undefined') localStorage.setItem('emailCampaignsView', v);
  };

  const load = useCallback(async (p = 1, f = 'all', l = DEFAULT_PAGE_SIZE) => {
    setLoading(true);
    try {
      const data = await API.request(`/api/admin/email-campaign?page=${p}&limit=${l}&status=${f}`);
      setCampaigns(data.campaigns || []);
      setPagination(data.pagination || null);
      setSendingCampaign(data.sendingCampaign || null);
    } catch (e) {
      toast.error(e?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, filter, itemsPerPage); }, [load, page, filter, itemsPerPage]);

  // Render the saved campaign exactly as it went out, in a new tab.
  const preview = (c) => {
    const inner = personalize(
      buildEmailHtml({
        heading: c.heading, body: c.content, rawHtml: c.rawHtml,
        ctaText: c.ctaText, ctaUrl: c.ctaUrl
      }),
      { name: 'Rahul', email: 'rahul@example.com' }
    );
    const html = `<!doctype html><html><head><meta charset="utf-8">`
      + `<title>${String(c.subject || 'Email preview').replace(/[<>]/g, '')}</title>`
      + `<meta name="viewport" content="width=device-width,initial-scale=1">`
      + `</head><body style="margin:0;padding:24px;background:#f3f4f6;">${inner}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const win = window.open(url, '_blank');
    if (!win) toast.error('Popup blocked — allow popups to preview.');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.subject}"? This cannot be undone.`)) return;
    setDeletingId(c._id);
    try {
      await API.request('/api/admin/email-campaign/control', {
        method: 'POST',
        body: JSON.stringify({ campaignId: c._id, action: 'delete' })
      });
      toast.success('Campaign deleted.');
      // Stay on this page unless it was the last row on it.
      const isLastOnPage = campaigns.length === 1 && page > 1;
      if (isLastOnPage) setPage((p) => p - 1); else load(page, filter, itemsPerPage);
    } catch (e) {
      toast.error(e?.message || 'Failed to delete campaign');
    } finally {
      setDeletingId(null);
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );

  const PreviewBtn = ({ c, className = '' }) => (
    <button
      onClick={() => preview(c)}
      disabled={!canPreview(c)}
      title={canPreview(c) ? 'Preview this email in a new tab' : 'Preview is available once the campaign has been sent to all users'}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
        canPreview(c)
          ? 'bg-background-surface-secondary text-content-secondary hover:bg-background-surface-secondary'
          : 'bg-background-surface-secondary text-slate-300 dark:text-slate-600 cursor-not-allowed'
      } ${className}`}
    >
      <Eye size={12} /> Preview
    </button>
  );

  const DeleteBtn = ({ c }) => (
    <button
      onClick={() => remove(c)}
      disabled={!canDelete(c) || deletingId === c._id}
      title={canDelete(c)
        ? 'Delete this campaign'
        : 'Already sending or sent — open the campaign to delete it'}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
        canDelete(c)
          ? 'bg-background-surface-secondary text-content-primary hover:bg-background-surface-secondary'
          : 'bg-background-surface-secondary text-slate-300 dark:text-slate-600 cursor-not-allowed'
      }`}
    >
      <Trash2 size={12} /> {deletingId === c._id ? '…' : 'Delete'}
    </button>
  );

  const Progress = ({ c }) => (
    <div className="min-w-[120px]">
      <div className="w-full bg-background-surface-secondary rounded-full h-1.5 overflow-hidden">
        <div className="bg-primary-600 h-1.5" style={{ width: `${pctOf(c)}%` }} />
      </div>
      <div className="text-[10px] text-content-muted mt-1">
        {(c.sentCount || 0) + (c.failedCount || 0)} / {c.totalTargeted || 0} ({pctOf(c)}%)
      </div>
    </div>
  );

  const campaignColumns = [
    {
      key: 'subject',
      header: 'Subject',
      render: (_, c) => (
        <>
          <Link href={`/admin/email-campaigns/${c._id}`} className="font-medium text-content-primary hover:text-primary-600 dark:hover:text-primary-600">
            {c.subject}
          </Link>
          <div className="text-[10px] font-mono text-content-muted">#{String(c._id).slice(-6)}</div>
        </>
      )
    },
    { key: 'status', header: 'Status', render: (_, c) => <StatusBadge status={c.status} /> },
    { key: 'progress', header: 'Progress', render: (_, c) => <Progress c={c} /> },
    { key: 'sentCount', header: 'Sent', render: (_, c) => <span className="text-primary-600 font-semibold">{c.sentCount || 0}</span> },
    { key: 'failedCount', header: 'Failed', render: (_, c) => <span className="text-content-primary font-semibold">{c.failedCount || 0}</span> },
    { key: 'createdAt', header: 'Created', render: (_, c) => <span className="text-content-muted text-xs whitespace-nowrap">{fmtDate(c.createdAt)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, c) => (
        <div className="flex justify-end gap-2">
          <PreviewBtn c={c} />
          <DeleteBtn c={c} />
          <Link href={`/admin/email-campaigns/${c._id}`} className="px-2 py-1 rounded text-xs bg-background-surface-secondary text-content-primary hover:bg-background-surface-secondary">
            Open
          </Link>
        </div>
      )
    }
  ];

  const newCampaignButton = (
    <Link href="/admin/email-campaigns/new"
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium hover:bg-primary-600 text-on-primary bg-primary-600">
      <Plus size={20} /> New Campaign
    </Link>
  );

  const filterPillButtons = (
    <div className="flex flex-wrap gap-1">
      {FILTERS.map((f) => (
        <button key={f} onClick={() => { setFilter(f); setPage(1); }}
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            filter === f ? 'bg-primary-600 text-on-primary' : 'bg-background-surface-secondary text-content-secondary hover:bg-background-surface-secondary'
          }`}>
          {f === 'completed' ? 'Sent to all' : f}
        </button>
      ))}
    </div>
  );

  const viewSwitcherButtons = (
    <div className="flex items-center gap-1 w-full">
      {VIEWS.map((v) => (
        <button key={v.key} onClick={() => changeView(v.key)} title={`${v.label} View`}
          className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${
            view === v.key ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'
          }`}>
          <v.icon size={16} />
        </button>
      ))}
    </div>
  );

  const paginationControl = pagination && pagination.total > 0 && (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      {pagination.totalPages > 1 && (
        <>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg bg-background-surface-secondary disabled:opacity-40">Prev</button>
          <span className="text-content-muted">Page {pagination.page} / {pagination.totalPages} · {pagination.total} campaigns</span>
          <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages || loading}
            className="px-3 py-1.5 rounded-lg bg-background-surface-secondary disabled:opacity-40">Next</button>
        </>
      )}
      <Select
        value={itemsPerPage}
        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
        className="px-3 py-1.5 rounded-lg border border-border-primary"
      >
        {PAGE_SIZE_OPTIONS.map(v => <option key={v} value={v}>{v} per page</option>)}
      </Select>
    </div>
  );

  useAdminMobileHeader({
    title: 'Campaigns',
    count: pagination?.total ?? null,
    filters: (
      <>
        {newCampaignButton}
        {filterPillButtons}
        {viewSwitcherButtons}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return <div className="py-4 w-full mx-auto"><AdminTableSkeleton /></div>;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          {sendingCampaign && (
            <div className="shrink-0 mb-4 p-3 rounded-lg border border-border-primary dark:border-white text-xs text-content-primary">
              📤 &ldquo;{sendingCampaign.subject}&rdquo; is mid-send. Only one campaign can send at a time — finish it before starting another.
            </div>
          )}

          {/* --- Content --- */}
          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : campaigns.length === 0 ? (
            <div className="p-10 text-center bg-background-surface rounded-2xl border border-border-primary">
              <p className="text-content-muted mb-4">
                {filter === 'all' ? 'No campaigns yet.' : `No ${filter} campaigns.`}
              </p>
              <Link href="/admin/email-campaigns/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-600 text-on-primary text-sm bg-primary-600">
                <Plus size={16} /> Create your first campaign
              </Link>
            </div>
          ) : view === 'table' ? (
            /* ---------- TABLE ---------- */
            <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden flex-1 min-h-0 overflow-auto flex flex-col">
              <ResponsiveTable
                data={campaigns}
                columns={campaignColumns}
                viewModes={['table']}
                defaultView={'table'}
                showPagination={false}
                showViewToggle={false}
                fillHeight
              />
            </div>
          ) : view === 'list' ? (
            /* ---------- LIST ---------- */
            <div className="flex-1 min-h-0 overflow-auto space-y-2">
              {campaigns.map((c, idx) => (
                <div key={c._id} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-background-surface-secondary text-content-muted text-[9px] font-bold flex items-center justify-center">{(page - 1) * itemsPerPage + idx + 1}</span>
                      <Link href={`/admin/email-campaigns/${c._id}`} className="font-semibold text-content-primary hover:text-primary-600 dark:hover:text-primary-600">
                        {c.subject}
                      </Link>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-xs text-content-muted mt-1">
                      #{String(c._id).slice(-6)} · {fmtDate(c.createdAt)} · {c.sentCount || 0} sent
                      {(c.failedCount || 0) > 0 && ` · ${c.failedCount} failed`}
                    </div>
                  </div>
                  <Progress c={c} />
                  <div className="flex gap-2">
                    <PreviewBtn c={c} />
                          <DeleteBtn c={c} />
                    <Link href={`/admin/email-campaigns/${c._id}`} className="px-3 py-1 rounded text-xs bg-background-surface-secondary text-content-primary hover:bg-background-surface-secondary">
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ---------- GRID ---------- */
            <div className="flex-1 min-h-0 overflow-auto grid content-start items-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {campaigns.map((c, idx) => (
                <div key={c._id} className="relative bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col">
                  <span className="absolute top-2 left-2 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 bg-primary-600">{(page - 1) * itemsPerPage + idx + 1}</span>
                  <div className="flex items-start justify-between gap-2 mb-2 pl-6">
                    <StatusBadge status={c.status} />
                    <span className="text-[10px] font-mono text-content-muted">#{String(c._id).slice(-6)}</span>
                  </div>
                  <Link href={`/admin/email-campaigns/${c._id}`} className="font-semibold text-content-primary hover:text-primary-600 dark:hover:text-primary-600 line-clamp-2 mb-1">
                    {c.subject}
                  </Link>
                  {c.heading && <p className="text-xs text-content-muted line-clamp-2 mb-3">{c.heading}</p>}

                  <div className="mt-auto space-y-3">
                    <Progress c={c} />
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div><div className="text-primary-600 font-bold text-sm">{c.sentCount || 0}</div><div className="text-[9px] text-content-muted uppercase">Sent</div></div>
                      <div><div className="text-content-primary font-bold text-sm">{c.failedCount || 0}</div><div className="text-[9px] text-content-muted uppercase">Failed</div></div>
                      <div><div className="text-content-primary font-bold text-sm">{c.totalTargeted || 0}</div><div className="text-[9px] text-content-muted uppercase">Total</div></div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-primary">
                      <span className="text-[10px] text-content-muted">{fmtDate(c.createdAt)}</span>
                      <div className="flex gap-2">
                        <PreviewBtn c={c} />
                          <DeleteBtn c={c} />
                        <Link href={`/admin/email-campaigns/${c._id}`} className="px-2 py-1 rounded text-xs bg-background-surface-secondary text-content-primary hover:bg-background-surface-secondary">
                          Open
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      </div>
    </div>
  );
};

export default EmailCampaignsListPage;
