'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck, ClipboardPaste, Trash2, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import Select from '../../../components/common/ui/Select';
import Card from '../../../components/common/ui/Card';
import Sidebar from '../../../components/admin/Sidebar';
import AdminRoute from '../../../components/admin/Route';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';
import { CA_CATEGORIES, parseCurrentAffairs, detectDate } from '../../../lib/utils/currentAffairsParser';

const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (ymd, n) => new Date(new Date(`${ymd}T00:00:00.000Z`).getTime() + n * DAY_MS).toISOString().slice(0, 10);
const fmt = (ymd) => new Date(`${ymd}T00:00:00.000Z`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

const inputClass = "w-full px-4 py-2.5 border border-border-primary rounded-lg xl:rounded-xl text-sm bg-background-surface text-content-primary outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-content-muted";

const BulkCurrentAffairs = () => {
  const [info, setInfo] = useState(null); // { lastDate, lastDateCount, recent }
  const [date, setDate] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const [text, setText] = useState('');
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadInfo = useCallback(async (forDate) => {
    try {
      const qs = forDate ? `?date=${forDate}` : '';
      const res = await API.request(`/api/admin/current-affairs/bulk${qs}`);
      if (res?.success) { setInfo(res); setSelectedCount(res.selectedCount || 0); return res; }
    } catch (e) { }
    return null;
  }, []);

  useEffect(() => {
    (async () => {
      const res = await loadInfo();
      if (res?.lastDate) setDate(addDays(res.lastDate, 1));
    })();
  }, [loadInfo]);

  // Existing-entry count for whichever date is picked
  useEffect(() => { if (date) loadInfo(date); }, [date, loadInfo]);

  // Re-parse whenever the pasted text changes (manual edits in the preview are kept until then)
  useEffect(() => { setRows(parseCurrentAffairs(text)); }, [text]);

  const hintDate = useMemo(() => detectDate(text), [text]);

  // Days with no entries between the last inserted date and 30 days before it
  const missing = useMemo(() => {
    if (!info?.lastDate) return [];
    const have = new Set((info.recent || []).map(r => r.date));
    const out = [];
    for (let i = 1; i <= 30; i++) { const d = addDays(info.lastDate, -i); if (!have.has(d)) out.push(d); }
    return out;
  }, [info]);

  const updateRow = (i, patch) => setRows(rs => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const removeRow = (i) => setRows(rs => rs.filter((_, idx) => idx !== i));

  const handleInsert = async () => {
    if (!date) return toast.error('Choose a date first');
    if (!rows.length) return toast.error('Nothing to insert');
    if (rows.some(r => !r.title.trim())) return toast.error('Every entry needs a title');
    if (selectedCount > 0 && !confirm(`${fmt(date)} already has ${selectedCount} entries. Add these as well? (same-title entries are skipped)`)) return;
    setSaving(true);
    try {
      const res = await API.request('/api/admin/current-affairs/bulk', { method: 'POST', body: JSON.stringify({ date, items: rows }) });
      if (res?.success) {
        const extra = [res.skipped?.length ? `${res.skipped.length} duplicate skipped` : '', res.failed?.length ? `${res.failed.length} failed` : ''].filter(Boolean).join(', ');
        toast.success(`${res.created} inserted${extra ? ` (${extra})` : ''}`);
        if (res.failed?.length) toast.error(res.failed.map(f => `${f.title}: ${f.error}`).join('\n'));
        setText('');
        const fresh = await loadInfo();
        if (fresh?.lastDate && date >= fresh.lastDate) setDate(addDays(fresh.lastDate, 1)); else await loadInfo(date);
      } else toast.error(res?.error || 'Insert failed');
    } catch (e) { toast.error('Insert failed'); } finally { setSaving(false); }
  };

  useAdminMobileHeader({ title: 'Bulk Add Current Affairs' });

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
        <Head><title>Bulk Add Current Affairs - Admin</title></Head>
        <Sidebar />
        <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-auto space-y-3">

          <Link href="/admin/current-affairs" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600"><ArrowLeft className="w-3.5 h-3.5" /> Back to Current Affairs</Link>

          {/* Last inserted date */}
          <Card className="!p-4">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 shrink-0 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}><CalendarCheck className="w-4 h-4" /></span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-content-muted">Last inserted date</p>
                <p className="text-lg font-bold text-content-primary">{info ? (info.lastDate ? `${fmt(info.lastDate)} · ${info.lastDateCount} entries` : 'Nothing inserted yet') : 'Loading…'}</p>
                {missing.length > 0 && (
                  <p className="text-xs text-content-muted mt-1.5 flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /><span>No entries on: {missing.map(fmt).join(', ')}</span></p>
                )}
              </div>
            </div>
          </Card>

          {/* Date + paste */}
          <Card className="!p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1.5">Date for these entries</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2 text-xs text-content-muted space-y-1">
                {date && selectedCount > 0 && <p className="text-amber-600 dark:text-amber-400 font-bold">{fmt(date)} already has {selectedCount} entries.</p>}
                {hintDate && hintDate !== date && (
                  <p>Text says <b>{fmt(hintDate)}</b>. <button type="button" onClick={() => setDate(hintDate)} className="font-bold text-primary-600 underline">Use this date</button></p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-content-secondary mb-1.5">Paste current affairs text</label>
              <textarea rows={8} value={text} onChange={e => setText(e.target.value)} placeholder={'➼ हिंदी वाक्य\nEnglish sentence\n\n➼ ...'} className={`resize-y ${inputClass}`} />
              <p className="text-[11px] text-content-muted mt-1.5 flex items-center gap-1"><ClipboardPaste className="w-3 h-3" /> One entry per ➼ bullet (Hindi line + English line). Headline text before the first ➼ is ignored.</p>
            </div>
          </Card>

          {/* Preview */}
          {rows.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm font-bold text-content-primary">{rows.length} entries ready · review before inserting</p>
                <button onClick={handleInsert} disabled={saving || !date} className="px-5 py-2.5 rounded-lg xl:rounded-xl text-sm font-bold flex items-center gap-2 text-on-primary bg-primary-600 disabled:opacity-50">
                  <Upload className="w-4 h-4" /> {saving ? 'Inserting…' : `Insert ${rows.length} into ${date ? fmt(date) : '…'}`}
                </button>
              </div>
              <div className="space-y-2">
                {rows.map((r, i) => (
                  <Card as="article" key={i} className="!p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 w-6 h-6 rounded-lg text-on-primary text-[10px] font-bold flex items-center justify-center bg-primary-600">{i + 1}</span>
                      <div className="w-40 shrink-0">
                        <Select value={r.category} onChange={e => updateRow(i, { category: e.target.value })} className={inputClass}>
                          {CA_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </Select>
                      </div>
                      <input value={r.title} onChange={e => updateRow(i, { title: e.target.value })} className={inputClass} placeholder="Title" />
                      <button aria-label="Remove" onClick={() => removeRow(i)} className="p-2 shrink-0 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <textarea rows={3} value={r.content} onChange={e => updateRow(i, { content: e.target.value })} className={`resize-y ${inputClass}`} />
                    <input value={(r.tags || []).join(', ')} onChange={e => updateRow(i, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} className={inputClass} placeholder="Tags, comma separated" />
                    <textarea rows={2} value={(r.keyPoints || []).join('\n')} onChange={e => updateRow(i, { keyPoints: e.target.value.split('\n') })} className={`resize-y ${inputClass}`} placeholder="Key points, one per line (optional)" />
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default BulkCurrentAffairs;
