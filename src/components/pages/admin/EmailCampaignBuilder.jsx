'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Send, PenSquare, ExternalLink } from 'lucide-react';
import API from '../../../lib/api';
import Link from 'next/link';
import { useSSR } from '../../../hooks/useSSR';
import { buildEmailHtml, personalize } from '../../../utils/emailTemplate';

// Normalize a campaign (either a raw DB doc or a /process progress object)
// into one consistent shape for the UI.
const normCampaign = (c) => {
  if (!c) return null;
  const dailyLimit = c.dailyLimit || 300;
  const sentToday = c.sentToday || 0;
  const sentCount = c.sentCount || 0;
  const failedCount = c.failedCount || 0;
  const out = {
    campaignId: c.campaignId || c._id,
    status: c.status,
    totalTargeted: c.totalTargeted || 0,
    sentCount,
    failedCount,
    processed: c.processed != null ? c.processed : sentCount + failedCount,
    dailyLimit,
    sentToday,
    remainingToday: c.remainingToday != null ? c.remainingToday : Math.max(0, dailyLimit - sentToday),
    done: !!c.done,
    quotaReached: !!c.quotaReached,
    batchFailed: !!c.batchFailed,
    notStarted: !!c.notStarted
  };
  // Template fields only exist on a full campaign doc, not on a /process
  // progress ping — copy them through only when present so progress updates
  // never wipe the stored template.
  ['subject', 'heading', 'content', 'rawHtml', 'ctaText', 'ctaUrl', 'testSentAt', 'testSentTo'].forEach((k) => {
    if (c[k] !== undefined) out[k] = c[k];
  });
  return out;
};

// The admin flow: write a draft, send yourself a test, publish, then send to all.
const STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'test', label: 'Test Email' },
  { key: 'publish', label: 'Publish' },
  { key: 'send', label: 'Send to All' }
];
const stepIndex = (c) => {
  if (!c || !c.status) return 0;
  if (c.status === 'draft') return c.testSentAt ? 1 : 0;
  if (c.status === 'published') return 2;
  return 3; // active | paused | completed
};

// `campaignId` opens an existing campaign; omitted = a brand-new one.
const EmailCampaignBuilder = ({ campaignId: campaignIdProp = null }) => {
  const { isMounted, router } = useSSR();

  // ---- Template builder state ----
  const [mode, setMode] = useState('simple'); // 'simple' | 'html'
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(!!campaignIdProp);

  // ---- Campaign state ----
  const [campaign, setCampaign] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const stopRef = useRef(false);

  // ---- Test email ----
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // ---- Recipients ("who has this campaign gone to") ----
  const [showRecipients, setShowRecipients] = useState(false);
  const [recipients, setRecipients] = useState(null);
  const [recipPage, setRecipPage] = useState(1);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const status = campaign?.status || null;
  const isDraft = status === 'draft';
  const isPublished = status === 'published';
  const isSendingPhase = status === 'active' || status === 'paused';
  const isCompleted = status === 'completed';
  // The builder is only editable before a campaign exists, or while it's a draft.
  const canEditFields = !campaign || isDraft;

  // Preview resolves {{name}} with a sample value so the admin sees the real
  // thing rather than raw placeholders.
  const previewHtml = useMemo(
    () => personalize(
      buildEmailHtml({ heading, body: content, rawHtml: mode === 'html', ctaText, ctaUrl }),
      { name: 'Rahul', email: 'rahul@example.com' }
    ),
    [heading, content, mode, ctaText, ctaUrl]
  );

  // Open the exact same rendered email in a new browser tab.
  const openPreviewTab = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8">`
      + `<title>${(subject || 'Email preview').replace(/[<>]/g, '')}</title>`
      + `<meta name="viewport" content="width=device-width,initial-scale=1">`
      + `</head><body style="margin:0;padding:24px;background:#f3f4f6;">${previewHtml}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const win = window.open(url, '_blank');
    if (!win) toast.error('Popup blocked — allow popups to preview in a new tab.');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const applyCampaign = useCallback((c) => {
    const n = normCampaign(c);
    setCampaign((prev) => ({ ...(prev || {}), ...n }));
    return n;
  }, []);

  // Load the campaign's template into the builder fields.
  const fillFields = (c) => {
    setSubject(c.subject || '');
    setHeading(c.heading || '');
    setContent(c.content || '');
    setMode(c.rawHtml ? 'html' : 'simple');
    setCtaText(c.ctaText || '');
    setCtaUrl(c.ctaUrl || '');
  };

  // Load the campaign being opened. A new campaign has no id yet — blank builder.
  const loadCurrent = useCallback(async () => {
    if (!campaignIdProp) { setIsLoading(false); return; }
    try {
      const data = await API.request(`/api/admin/email-campaign?id=${campaignIdProp}`);
      if (data?.campaign) {
        setCampaign(normCampaign(data.campaign));
        fillFields(data.campaign);
      }
    } catch (e) {
      toast.error(e?.message || 'Failed to load campaign.');
    } finally {
      setIsLoading(false);
    }
  }, [campaignIdProp]);

  useEffect(() => {
    loadCurrent();
    return () => { stopRef.current = true; };
  }, [loadCurrent]);

  // ---------- Step 1: Save as Draft ----------
  const saveDraft = async () => {
    if (!subject.trim()) { toast.error('Please enter an email subject.'); return; }
    if (!content.trim()) { toast.error('Please enter the email content.'); return; }

    setIsSavingDraft(true);
    const toastId = toast.loading(campaign ? 'Updating draft...' : 'Saving draft...');
    try {
      const editing = !!campaign;
      const data = await API.request('/api/admin/email-campaign', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...(editing ? { campaignId: campaign.campaignId } : {}),
          subject, heading, content, rawHtml: mode === 'html', ctaText, ctaUrl
        })
      });
      const n = applyCampaign(data.campaign);
      toast.success(data?.message || 'Draft saved.', { id: toastId });
      // A brand-new draft now has an id — move to its own URL so a reload
      // (or the back button) lands on the same campaign.
      if (!editing && n?.campaignId) {
        router.replace(`/admin/email-campaigns/${n.campaignId}`, undefined, { shallow: true });
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save draft', { id: toastId });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ---------- Shared: status transitions ----------
  const control = async (action, confirmMsg) => {
    if (!campaign) return null;
    if (confirmMsg && !window.confirm(confirmMsg)) return null;

    setBusyAction(true);
    const toastId = toast.loading('Working...');
    try {
      const data = await API.request('/api/admin/email-campaign/control', {
        method: 'POST',
        body: JSON.stringify({ campaignId: campaign.campaignId, action })
      });
      if (action === 'delete') {
        setCampaign(null);
        setRecipients(null);
        setShowRecipients(false);
        toast.success('Campaign deleted.', { id: toastId });
        return 'deleted';
      }
      const n = applyCampaign(data.campaign);
      toast.success(data?.message || 'Done.', { id: toastId });
      return n;
    } catch (e) {
      toast.error(e?.message || 'Action failed', { id: toastId });
      return null;
    } finally {
      setBusyAction(false);
    }
  };

  // ---------- Step 2: Publish ----------
  const publishNow = () => control('publish');
  const backToDraft = () => control('unpublish');

  // ---------- Step 3: Send test ----------
  const sendTest = async () => {
    if (!campaign) return;
    if (!testEmail || !testEmail.includes('@')) { toast.error('Please enter a valid test email address.'); return; }

    setIsTesting(true);
    const toastId = toast.loading('Sending test email...');
    try {
      const data = await API.request('/api/admin/email-campaign/test', {
        method: 'POST',
        body: JSON.stringify({ campaignId: campaign.campaignId, testEmail })
      });
      if (data?.campaign) applyCampaign(data.campaign);
      toast.success(data?.message || 'Test email sent!', { id: toastId });
    } catch (e) {
      toast.error(e?.message || 'Failed to send test email', { id: toastId });
    } finally {
      setIsTesting(false);
    }
  };

  // ---------- Step 4: Send to all ----------
  const processOnce = async (id) =>
    API.request('/api/admin/email-campaign/process', {
      method: 'POST',
      body: JSON.stringify({ campaignId: id })
    });

  // The driver: repeatedly send batches until done / daily quota reached / paused.
  const runDriver = async (id) => {
    setIsRunning(true);
    stopRef.current = false;
    try {
      while (!stopRef.current) {
        let p;
        try {
          p = await processOnce(id);
        } catch (err) {
          toast.error(err?.message || 'Failed to send batch');
          break;
        }
        setCampaign((prev) => ({ ...(prev || {}), ...normCampaign(p) }));
        if (p.notStarted) { toast.error('Campaign has not been started.'); break; }
        if (p.done) { toast.success('Campaign completed! 🎉'); break; }
        if (p.quotaReached) { toast("Today's limit reached. Come back tomorrow to continue.", { icon: '⏳' }); break; }
        if (p.batchFailed) { toast.error('Sending failed (rate limit / outage). Try again later.'); break; }
        if (p.paused) break;
        await new Promise((r) => setTimeout(r, 1000));
      }
    } finally {
      setIsRunning(false);
    }
  };

  const sendToAll = async () => {
    const n = await control(
      'start',
      `Send this campaign to ALL ${campaign?.totalTargeted || ''} users? It sends in daily batches and cannot be unsent.`
    );
    if (n) runDriver(n.campaignId);
  };

  const pauseDriver = async () => {
    stopRef.current = true;
    await control('pause');
  };

  const continueDriver = async () => {
    if (!campaign) return;
    if (campaign.status === 'paused') {
      const n = await control('resume');
      if (n) runDriver(n.campaignId);
    } else {
      runDriver(campaign.campaignId);
    }
  };

  const deleteCampaign = async () => {
    const res = await control('delete', 'Delete this campaign? Progress will be lost.');
    if (res === 'deleted') router.push('/admin/email-campaigns');
  };

  // ---------- Recipients ----------
  const loadRecipients = async (page = 1) => {
    if (!campaign) return;
    setLoadingRecipients(true);
    try {
      const data = await API.request(
        `/api/admin/email-campaign/recipients?campaignId=${campaign.campaignId}&page=${page}&limit=50`
      );
      setRecipients(data);
      setRecipPage(page);
    } catch (e) {
      toast.error(e?.message || 'Failed to load recipients');
    } finally {
      setLoadingRecipients(false);
    }
  };

  const toggleRecipients = () => {
    const next = !showRecipients;
    setShowRecipients(next);
    if (next && !recipients) loadRecipients(1);
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed";
  const pct = campaign && campaign.totalTargeted
    ? Math.min(100, Math.round((campaign.processed / campaign.totalTargeted) * 100))
    : 0;
  const activeStep = stepIndex(campaign);

  if (!isMounted || isLoading) return <div className="p-8 text-slate-500">Loading campaign…</div>;

  return (
    <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/email-campaigns" className="text-sm text-secondary-600 dark:text-secondary-400 hover:underline inline-flex items-center gap-1 mb-2">
            ← All campaigns
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Mail className="text-primary-500" /> {campaignIdProp ? 'Edit Campaign' : 'New Campaign'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Save a draft → send a test → publish → then send to all users.
          </p>
        </div>

        {/* ===== Step indicator ===== */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                i < activeStep ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : i === activeStep ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500'
              }`}>
                {i + 1}. {s.label}
                {i === activeStep && status === 'paused' && ' (paused)'}
              </div>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-slate-300 dark:bg-white/10 shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-md p-6 border border-slate-100 dark:border-white/10">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <PenSquare className="text-primary-500" /> Custom Email Template
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                The platform logo &amp; footer are added automatically.
              </p>
            </div>
            {campaign && (
              <span className="text-[10px] font-mono text-slate-400" title={campaign.campaignId}>
                ID: #{String(campaign.campaignId || '').slice(-6)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* --- Editor --- */}
            <div className="space-y-4">
              {!canEditFields && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                  {isPublished
                    ? 'Published — fields are locked. Use "Back to Draft" to edit.'
                    : isCompleted
                      ? 'This campaign is completed and can no longer be edited.'
                      : 'Sending is in progress — pause it to make changes.'}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                <input type="text" disabled={!canEditFields} placeholder="e.g. New PYQ Papers Added This Week!" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Heading</label>
                <input type="text" disabled={!canEditFields} placeholder="Big title shown under the logo" value={heading} onChange={(e) => setHeading(e.target.value)} className={inputClass} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Content *</label>
                  <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-white/10 text-xs">
                    <button type="button" disabled={!canEditFields} onClick={() => setMode('simple')} className={`px-3 py-1 disabled:opacity-50 ${mode === 'simple' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'}`}>Simple</button>
                    <button type="button" disabled={!canEditFields} onClick={() => setMode('html')} className={`px-3 py-1 disabled:opacity-50 ${mode === 'html' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'}`}>HTML</button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  disabled={!canEditFields}
                  placeholder={mode === 'html' ? 'Paste raw HTML for the email body...' : 'Write your message. Line breaks are preserved. Basic HTML like <b>bold</b> works too.'}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'html' ? 'Raw HTML mode — content is used verbatim inside the branded shell.' : 'Simple mode — newlines become line breaks; basic inline HTML allowed.'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Personalise with <code className="px-1 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200">{'{{name}}'}</code> and{' '}
                  <code className="px-1 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200">{'{{email}}'}</code> — filled per recipient from the database
                  (a missing name becomes &ldquo;there&rdquo;). Works in the subject too.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Button Text</label>
                  <input type="text" disabled={!canEditFields} placeholder="e.g. Start Practicing" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Button URL</label>
                  <input type="text" disabled={!canEditFields} placeholder="https://..." value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* ---- Step 1: Save as Draft ---- */}
              {canEditFields && (
                <button onClick={saveDraft} disabled={isSavingDraft}
                  className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium bg-slate-700 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white disabled:opacity-50">
                  {isSavingDraft ? 'Saving…' : campaign ? '💾 Update Draft' : '💾 Save as Draft'}
                </button>
              )}

              {/* ---- Step 2: Send a test (while still a draft) ---- */}
              {isDraft && campaign && (
                <div className="border-t border-slate-100 dark:border-white/10 pt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Send Test Email
                    {campaign.testSentAt && <span className="ml-2 text-[10px] text-green-600 dark:text-green-400">✓ sent to {campaign.testSentTo}</span>}
                  </label>
                  <div className="flex gap-2">
                    <input type="email" placeholder="admin@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className={inputClass} />
                    <button onClick={sendTest} disabled={isTesting}
                      className="whitespace-nowrap px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 disabled:opacity-50">
                      {isTesting ? 'Sending…' : 'Send Test'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Sends the saved draft exactly as users will receive it. Save your edits first.
                  </p>
                </div>
              )}

              {/* ---- Step 3: Publish ---- */}
              {isDraft && campaign && (
                <button onClick={publishNow} disabled={busyAction}
                  className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium bg-secondary-500 hover:bg-secondary-600 text-white shadow-md disabled:opacity-50">
                  🚀 Publish Now
                </button>
              )}
              {isDraft && campaign && !campaign.testSentAt && (
                <p className="text-xs text-center text-amber-600 dark:text-amber-400 -mt-2">
                  Tip: send yourself a test before publishing.
                </p>
              )}

              {/* ---- Step 4: Send to all ---- */}
              {isPublished && (
                <div className="space-y-3 border-t border-slate-100 dark:border-white/10 pt-4">
                  <button onClick={sendToAll} disabled={busyAction}
                    className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium bg-primary-500 hover:bg-primary-600 text-white shadow-md disabled:opacity-50">
                    <Send size={20} /> Send To All Users
                  </button>

                  <button onClick={backToDraft} disabled={busyAction}
                    className="w-full py-2 px-4 rounded-lg text-sm bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-50">
                    ← Back to Draft (edit or re-test)
                  </button>
                </div>
              )}
            </div>

            {/* --- Right column: preview + campaign progress --- */}
            <div className="space-y-4">
              {campaign && (
                <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold">
                      {isDraft && '📝 Draft'}
                      {isPublished && '✅ Published — ready to send'}
                      {status === 'active' && (isRunning ? '📤 Sending…' : '▶️ Started')}
                      {status === 'paused' && '⏸️ Paused'}
                      {isCompleted && '🎉 Completed'}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[45%]" title={campaign.subject}>{campaign.subject}</span>
                  </div>

                  {(isSendingPhase || isCompleted) && (
                    <>
                      <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                        <div className="bg-primary-500 h-3 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{campaign.processed} / {campaign.totalTargeted} processed ({pct}%)</span>
                        <span>Today: {campaign.sentToday}/{campaign.dailyLimit}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                        <div className="p-2 rounded-lg bg-white dark:bg-white/5">
                          <div className="text-green-600 dark:text-green-400 font-bold">{campaign.sentCount}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Sent</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-white/5">
                          <div className="text-red-500 dark:text-red-400 font-bold">{campaign.failedCount}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Failed</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-white/5">
                          <div className="text-secondary-500 font-bold">{Math.max(0, campaign.totalTargeted - campaign.processed)}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Left</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {isSendingPhase && isRunning && (
                          <button onClick={pauseDriver} className="flex-1 py-2 px-3 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white">Pause</button>
                        )}
                        {isSendingPhase && !isRunning && (
                          <button onClick={continueDriver} disabled={busyAction} className="flex-1 py-2 px-3 rounded-lg text-sm bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50">
                            {campaign.remainingToday > 0 ? 'Continue Sending' : 'Continue (quota resets tomorrow)'}
                          </button>
                        )}
                      </div>

                      {campaign.remainingToday <= 0 && !isCompleted && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Daily limit reached. Continue tomorrow after the quota resets.</p>
                      )}
                    </>
                  )}

                  {!isSendingPhase && !isCompleted && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Targeting <strong>{campaign.totalTargeted}</strong> users · {campaign.dailyLimit}/day
                      {isDraft && ' · nothing is sent until you publish and start.'}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={toggleRecipients} className="flex-1 py-2 px-3 rounded-lg text-sm bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20">
                      {showRecipients ? 'Hide sent list' : '👥 View sent list'}
                    </button>
                    <button onClick={deleteCampaign} disabled={isRunning || busyAction} className="py-2 px-3 rounded-lg text-sm bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20 disabled:opacity-50">
                      {isCompleted ? 'Dismiss' : 'Delete'}
                    </button>
                  </div>

                  {/* --- Who this campaign has gone to --- */}
                  {showRecipients && (
                    <div className="mt-3 border-t border-slate-200 dark:border-white/10 pt-3">
                      {loadingRecipients && !recipients ? (
                        <p className="text-xs text-slate-500">Loading…</p>
                      ) : recipients ? (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              Sent to <strong className="text-green-600 dark:text-green-400">{recipients.counts.sent}</strong>
                              {recipients.counts.failed > 0 && (<> · failed <strong className="text-red-500">{recipients.counts.failed}</strong></>)}
                            </p>
                            <button onClick={() => loadRecipients(recipPage)} disabled={loadingRecipients} className="text-[10px] text-secondary-600 dark:text-secondary-400 hover:underline disabled:opacity-50">Refresh</button>
                          </div>

                          {recipients.recipients.length === 0 ? (
                            <p className="text-xs text-slate-400">Nobody yet.</p>
                          ) : (
                            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-white/10">
                              {recipients.recipients.map((r) => (
                                <div key={r._id} className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs border-b border-slate-100 dark:border-white/5 last:border-0">
                                  <div className="min-w-0">
                                    <div className="truncate text-slate-800 dark:text-slate-200">{r.email}</div>
                                    {r.user?.name && <div className="truncate text-[10px] text-slate-400">{r.user.name}</div>}
                                  </div>
                                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    r.status === 'sent'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                  }`} title={r.error || ''}>{r.status}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {recipients.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-2 text-xs">
                              <button onClick={() => loadRecipients(recipPage - 1)} disabled={recipPage <= 1 || loadingRecipients} className="px-2 py-1 rounded bg-slate-200 dark:bg-white/10 disabled:opacity-40">Prev</button>
                              <span className="text-slate-500">Page {recipients.pagination.page} / {recipients.pagination.totalPages}</span>
                              <button onClick={() => loadRecipients(recipPage + 1)} disabled={recipPage >= recipients.pagination.totalPages || loadingRecipients} className="px-2 py-1 rounded bg-slate-200 dark:bg-white/10 disabled:opacity-40">Next</button>
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Live Preview</label>
                  <button onClick={openPreviewTab}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20">
                    <ExternalLink size={12} /> Open in new tab
                  </button>
                </div>
                <div className="border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 p-3 h-[420px] overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCampaignBuilder;
