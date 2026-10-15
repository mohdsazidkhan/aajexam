'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Tag, Plus, Pencil, Trash2, Copy, Link2, Megaphone, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import { PRO_PLANS } from '../../../lib/plans';
import { useSSR } from '../../../hooks/useSSR';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import Sidebar from '../../Sidebar';
import AnnounceModal from '../../admin/AnnounceModal';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com').replace(/\/$/, '');

const EMPTY_FORM = {
  code: '', description: '', discountType: 'percentage', discountValue: '', maxDiscount: '',
  startDate: '', expiryDate: '', usageLimit: '', perUserLimit: '1', applicablePlans: [], showInModal: false, isActive: true
};

// <input type="datetime-local"> wants local "YYYY-MM-DDTHH:mm"
const toLocalInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const offerLabel = (c) => (c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`);
const shareLink = (c) => `${SITE_URL}/subscription?coupon=${encodeURIComponent(c.code)}`;

const statusOf = (c) => {
  const now = Date.now();
  if (!c.isActive) return { label: 'Disabled', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
  if (new Date(c.expiryDate).getTime() <= now) return { label: 'Expired', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };
  if (c.startDate && new Date(c.startDate).getTime() > now) return { label: 'Scheduled', cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' };
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return { label: 'Used up', cls: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'Live', cls: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' };
};

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

const inputCls = 'mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl text-sm';

const CouponFormModal = ({ coupon, onClose, onSaved }) => {
  const editing = !!coupon?._id;
  const [form, setForm] = useState(() => (editing
    ? {
      ...EMPTY_FORM,
      ...coupon,
      discountValue: String(coupon.discountValue),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      perUserLimit: String(coupon.perUserLimit ?? 1),
      startDate: toLocalInput(coupon.startDate),
      expiryDate: toLocalInput(coupon.expiryDate)
    }
    : EMPTY_FORM));
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const togglePlan = (id) => set('applicablePlans', form.applicablePlans.includes(id)
    ? form.applicablePlans.filter((p) => p !== id)
    : [...form.applicablePlans, id]);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      discountValue: Number(form.discountValue),
      maxDiscount: Number(form.maxDiscount) || 0,
      usageLimit: Number(form.usageLimit) || 0,
      perUserLimit: form.perUserLimit === '' ? 1 : Number(form.perUserLimit),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : ''
    };
    setSaving(true);
    try {
      const res = editing ? await API.updateCoupon(coupon._id, payload) : await API.createCoupon(payload);
      if (res?.success) {
        toast.success(editing ? 'Coupon updated' : 'Coupon created');
        onSaved();
      } else {
        toast.error(res?.message || 'Could not save the coupon');
      }
    } catch (err) {
      toast.error(err?.message || 'Could not save the coupon');
    } finally {
      setSaving(false);
    }
  };

  // Portal to <body>: inside the admin layout, `fixed` is clipped under the top header.
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editing ? `Edit ${coupon.code}` : 'New coupon'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
        </div>

        <Field label="Coupon name (code)" hint={editing ? 'The code cannot be changed after creation.' : 'Letters, numbers, - and _ (e.g. DIWALI50). Saved in capitals.'}>
          <input className={`${inputCls} uppercase font-bold tracking-wide`} value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} disabled={editing} maxLength={30} required placeholder="DIWALI50" />
        </Field>

        <Field label="Description" hint="Shown to students in the offer modal and at checkout.">
          <textarea className={inputCls} rows={2} maxLength={300} value={form.description} onChange={(e) => set('description', e.target.value)} required placeholder="Diwali special: flat 50% off on every PRO plan" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount type">
            <select className={inputCls} value={form.discountType} onChange={(e) => set('discountType', e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </Field>
          <Field label={form.discountType === 'percentage' ? 'Percent off' : 'Rupees off'}>
            <input className={inputCls} type="number" min="1" max={form.discountType === 'percentage' ? 99 : undefined} step="any" value={form.discountValue} onChange={(e) => set('discountValue', e.target.value)} required />
          </Field>
        </div>

        {form.discountType === 'percentage' && (
          <Field label="Max discount (₹)" hint="Optional cap on the rupees taken off. Leave empty for no cap.">
            <input className={inputCls} type="number" min="0" value={form.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts (optional)">
            <input className={inputCls} type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </Field>
          <Field label="Expiry date">
            <input className={inputCls} type="datetime-local" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Total uses" hint="0 / empty = unlimited">
            <input className={inputCls} type="number" min="0" value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} />
          </Field>
          <Field label="Uses per user" hint="0 = unlimited">
            <input className={inputCls} type="number" min="0" value={form.perUserLimit} onChange={(e) => set('perUserLimit', e.target.value)} />
          </Field>
        </div>

        <Field label="Valid on plans" hint="Select none to allow every plan.">
          <div className="mt-1 flex flex-wrap gap-2">
            {PRO_PLANS.map((p) => (
              <button type="button" key={p.id} onClick={() => togglePlan(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${form.applicablePlans.includes(p.id) ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={form.showInModal} onChange={(e) => set('showInModal', e.target.checked)} />
          Show this coupon in the offer pop-up for logged-in students
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Active
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">Cancel</button>
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create coupon'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

const CouponsPage = () => {
  const { isMounted } = useSSR();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, coupon = edit
  const [announcing, setAnnouncing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.getAdminCoupons();
      if (res?.success) setCoupons(res.data || []);
    } catch (e) {
      toast.error(e?.message || 'Could not load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); toast.success(msg); } catch { toast.error('Copy failed'); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}? Past orders keep their record.`)) return;
    try {
      await API.deleteCoupon(c._id);
      toast.success('Coupon deleted');
      load();
    } catch (e) {
      toast.error(e?.message || 'Could not delete');
    }
  };

  const announceForm = useMemo(() => {
    const c = announcing;
    if (!c) return undefined;
    return {
      title: `${offerLabel(c)} on AajExam PRO - use ${c.code}`,
      description: `${c.description} Use code ${c.code} at checkout, valid till ${fmtDate(c.expiryDate)}. ${shareLink(c)}`.slice(0, 500)
    };
  }, [announcing]);

  const newButton = (
    <button onClick={() => setEditing({})} className="w-full xl:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:bg-primary-700">
      <Plus className="w-4 h-4" /> New coupon
    </button>
  );

  useAdminMobileHeader({ title: 'Coupons', count: coupons.length, filters: newButton });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-4">
        <div className="hidden xl:flex items-center justify-between">
          <h1 className="text-xl font-black flex items-center gap-2"><Tag className="w-5 h-5 text-primary-600" /> Coupons <span className="text-sm text-slate-400 font-bold">({coupons.length})</span></h1>
          {newButton}
        </div>

        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-lg font-black text-slate-500 uppercase">No coupons yet</h3>
            <p className="text-sm text-slate-400 mt-2">Create one like DIWALI50 to offer a discount on PRO plans.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 pb-6">
            {coupons.map((c) => {
              const st = statusOf(c);
              return (
                <div key={c._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-lg font-black tracking-widest text-primary-600">{c.code}</div>
                      <div className="text-sm font-bold">{offerLabel(c)}{c.discountType === 'percentage' && c.maxDiscount > 0 ? ` (max ₹${c.maxDiscount})` : ''}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{c.description}</p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div>Expires: <b>{fmtDate(c.expiryDate)}</b></div>
                    <div>Used: <b>{c.usedCount}</b>{c.usageLimit > 0 ? ` / ${c.usageLimit}` : ''} · {c.perUserLimit > 0 ? `${c.perUserLimit}/user` : 'unlimited per user'}</div>
                    <div>Plans: <b>{c.applicablePlans?.length ? c.applicablePlans.map((id) => PRO_PLANS.find((p) => p.id === id)?.label || id).join(', ') : 'All'}</b>{c.showInModal ? ' · in pop-up' : ''}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={() => copy(c.code, 'Code copied')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700"><Copy className="w-3.5 h-3.5" /> Code</button>
                    <button onClick={() => copy(`Use code ${c.code} for ${offerLabel(c)} on AajExam PRO! ${shareLink(c)}`, 'Social post text copied')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700"><Link2 className="w-3.5 h-3.5" /> Share text</button>
                    <button onClick={() => setAnnouncing(c)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"><Megaphone className="w-3.5 h-3.5" /> Announce</button>
                    <button onClick={() => setEditing(c)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => remove(c)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <CouponFormModal coupon={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
      <AnnounceModal isOpen={!!announcing} initialForm={announceForm} onClose={() => setAnnouncing(null)} onSent={() => setAnnouncing(null)} />
    </div>
  );
};

export default CouponsPage;
