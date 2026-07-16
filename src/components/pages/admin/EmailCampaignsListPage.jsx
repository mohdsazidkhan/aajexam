'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Plus, Table2, List, LayoutGrid, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import API from '../../../lib/api';
import { useSSR } from '../../../hooks/useSSR';
import { buildEmailHtml, personalize } from '../../../utils/emailTemplate';

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  published: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  active: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
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

  const load = useCallback(async (p = 1, f = 'all') => {
    setLoading(true);
    try {
      const data = await API.request(`/api/admin/email-campaign?page=${p}&limit=20&status=${f}`);
      setCampaigns(data.campaigns || []);
      setPagination(data.pagination || null);
      setSendingCampaign(data.sendingCampaign || null);
    } catch (e) {
      toast.error(e?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, filter); }, [load, page, filter]);

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
      if (isLastOnPage) setPage((p) => p - 1); else load(page, filter);
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
          ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20'
          : 'bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed'
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
          ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50'
          : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
      }`}
    >
      <Trash2 size={12} /> {deletingId === c._id ? '…' : 'Delete'}
    </button>
  );

  const Progress = ({ c }) => (
    <div className="min-w-[120px]">
      <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5" style={{ width: `${pctOf(c)}%` }} />
      </div>
      <div className="text-[10px] text-slate-500 mt-1">
        {(c.sentCount || 0) + (c.failedCount || 0)} / {c.totalTargeted || 0} ({pctOf(c)}%)
      </div>
    </div>
  );

  if (!isMounted) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">

          {/* --- Header: title + New Campaign at the right end --- */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Mail className="text-primary-500" /> Email Campaigns
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                All campaigns you have created. Preview is available once a campaign has been sent to all users.
              </p>
            </div>
            <Link href="/admin/email-campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-primary-500 hover:bg-primary-600 text-white shadow-md">
              <Plus size={20} /> New Campaign
            </Link>
          </div>

          {sendingCampaign && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              📤 &ldquo;{sendingCampaign.subject}&rdquo; is mid-send. Only one campaign can send at a time — finish it before starting another.
            </div>
          )}

          {/* --- Filters + view switcher --- */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    filter === f ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                  }`}>
                  {f === 'completed' ? 'Sent to all' : f}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-white/10">
              {VIEWS.map((v) => (
                <button key={v.key} onClick={() => changeView(v.key)} title={v.label}
                  className={`px-3 py-1.5 flex items-center gap-1 text-xs ${
                    view === v.key ? 'bg-primary-500 text-white' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}>
                  <v.icon size={14} /> <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* --- Content --- */}
          {loading ? (
            <div className="p-10 text-center text-slate-500">Loading campaigns…</div>
          ) : campaigns.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {filter === 'all' ? 'No campaigns yet.' : `No ${filter} campaigns.`}
              </p>
              <Link href="/admin/email-campaigns/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm">
                <Plus size={16} /> Create your first campaign
              </Link>
            </div>
          ) : view === 'table' ? (
            /* ---------- TABLE ---------- */
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-slate-50 dark:bg-white/5 text-left">
                  <tr className="text-xs uppercase text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Sent</th>
                    <th className="px-4 py-3">Failed</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c._id} className="border-t border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3">
                        <Link href={`/admin/email-campaigns/${c._id}`} className="font-medium text-slate-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                          {c.subject}
                        </Link>
                        <div className="text-[10px] font-mono text-slate-400">#{String(c._id).slice(-6)}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3"><Progress c={c} /></td>
                      <td className="px-4 py-3 text-green-600 dark:text-green-400 font-semibold">{c.sentCount || 0}</td>
                      <td className="px-4 py-3 text-red-500 font-semibold">{c.failedCount || 0}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <PreviewBtn c={c} />
                          <DeleteBtn c={c} />
                          <Link href={`/admin/email-campaigns/${c._id}`} className="px-2 py-1 rounded text-xs bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-900/60">
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : view === 'list' ? (
            /* ---------- LIST ---------- */
            <div className="space-y-2">
              {campaigns.map((c) => (
                <div key={c._id} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/email-campaigns/${c._id}`} className="font-semibold text-slate-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                        {c.subject}
                      </Link>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      #{String(c._id).slice(-6)} · {fmtDate(c.createdAt)} · {c.sentCount || 0} sent
                      {(c.failedCount || 0) > 0 && ` · ${c.failedCount} failed`}
                    </div>
                  </div>
                  <Progress c={c} />
                  <div className="flex gap-2">
                    <PreviewBtn c={c} />
                          <DeleteBtn c={c} />
                    <Link href={`/admin/email-campaigns/${c._id}`} className="px-3 py-1 rounded text-xs bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-900/60">
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ---------- GRID ---------- */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {campaigns.map((c) => (
                <div key={c._id} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <StatusBadge status={c.status} />
                    <span className="text-[10px] font-mono text-slate-400">#{String(c._id).slice(-6)}</span>
                  </div>
                  <Link href={`/admin/email-campaigns/${c._id}`} className="font-semibold text-slate-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 mb-1">
                    {c.subject}
                  </Link>
                  {c.heading && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{c.heading}</p>}

                  <div className="mt-auto space-y-3">
                    <Progress c={c} />
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div><div className="text-green-600 dark:text-green-400 font-bold text-sm">{c.sentCount || 0}</div><div className="text-[9px] text-slate-500 uppercase">Sent</div></div>
                      <div><div className="text-red-500 font-bold text-sm">{c.failedCount || 0}</div><div className="text-[9px] text-slate-500 uppercase">Failed</div></div>
                      <div><div className="text-blue-600 dark:text-blue-400 font-bold text-sm">{c.totalTargeted || 0}</div><div className="text-[9px] text-slate-500 uppercase">Total</div></div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                      <span className="text-[10px] text-slate-400">{fmtDate(c.createdAt)}</span>
                      <div className="flex gap-2">
                        <PreviewBtn c={c} />
                          <DeleteBtn c={c} />
                        <Link href={`/admin/email-campaigns/${c._id}`} className="px-2 py-1 rounded text-xs bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-900/60">
                          Open
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- Pagination --- */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 disabled:opacity-40">Prev</button>
              <span className="text-slate-500">Page {pagination.page} / {pagination.totalPages} · {pagination.total} campaigns</span>
              <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages || loading}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 disabled:opacity-40">Next</button>
            </div>
          )}
      </div>
    </div>
  );
};

export default EmailCampaignsListPage;
