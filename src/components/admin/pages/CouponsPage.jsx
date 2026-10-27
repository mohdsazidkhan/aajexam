'use client';

import Select from '../../common/ui/Select';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Tag, Plus, Pencil, Trash2, Copy, Link2, Megaphone, X, Eye, List, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import { PRO_PLANS } from '../../../lib/plans';
import { computeDiscount } from '../../../lib/couponPricing';
import { useSSR } from '../../../hooks/useSSR';
import { AdminTableSkeleton } from '../Skeletons';
import Sidebar from '../Sidebar';
import ResponsiveTable from '../../common/ResponsiveTable';
import Pagination from '../../common/Pagination';
import SearchFilter from '../../common/SearchFilter';
import useDebounce from '../../../hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import AnnounceModal from '../AnnounceModal';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com').replace(/\/$/, '');

const EMPTY_FORM = {
  code: '', description: '', discountType: 'percentage', discountValue: '', maxDiscount: '',
  startDate: '', displayDate: '', expiryDate: '', usageLimit: '', perUserLimit: '1', applicablePlans: [], showInModal: false, isActive: true
};

// <input type="datetime-local"> wants local "YYYY-MM-DDTHH:mm"
const toLocalInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

// Calendar + time picker. Works on the same "YYYY-MM-DDTHH:mm" strings the form already keeps.
// Picking a date for the first time defaults the time (start 00:00, expiry 23:59).
const DateTimeField = ({ value, onChange, defaultTime = [0, 0], placeholder, clearable, minDate, required }) => {
  const selected = value ? new Date(value) : null;
  const handle = (d) => {
    if (!d) return onChange('');
    const next = new Date(d);
    if (!selected && d.getHours() === 0 && d.getMinutes() === 0) next.setHours(defaultTime[0], defaultTime[1], 0, 0);
    onChange(toLocalInput(next));
  };
  return (
    <DatePicker
      selected={selected}
      onChange={handle}
      showTimeSelect
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="dd MMM yyyy, h:mm aa"
      placeholderText={placeholder}
      isClearable={clearable}
      minDate={minDate}
      required={required}
      autoComplete="off"
      className={inputCls}
      calendarClassName="coupon-datepicker"
      popperClassName="coupon-datepicker-popper"
      popperPlacement="bottom-start"
      popperContainer={({ children }) => createPortal(children, document.body)}
    />
  );
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
const offerLabel = (c) => (c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`);
const shareLink = (c) => `${SITE_URL}/subscription?coupon=${encodeURIComponent(c.code)}`;

const statusOf = (c) => {
  const now = Date.now();
  if (!c.isActive) return { label: 'Disabled', cls: 'bg-background-surface-secondary text-content-muted' };
  if (new Date(c.expiryDate).getTime() <= now) return { label: 'Expired', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };
  if (c.startDate && new Date(c.startDate).getTime() > now) return { label: 'Scheduled', cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' };
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return { label: 'Used up', cls: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'Live', cls: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' };
};

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="text-xs font-bold uppercase tracking-[0.08em] text-content-muted">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-content-muted mt-1">{hint}</span>}
  </label>
);

const inputCls = 'mt-1 w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm';

// Live "what will the user pay" calculation, priced with the same formula the server uses at checkout.
const rs = (n) => `₹${Number(n.toFixed(2))}`;

const PricePreview = ({ form }) => {
  const value = Number(form.discountValue);
  const valid = Number.isFinite(value) && value > 0;
  const coupon = { discountType: form.discountType, discountValue: value, maxDiscount: Number(form.maxDiscount) || 0 };
  const plans = PRO_PLANS.filter((p) => !form.applicablePlans.length || form.applicablePlans.includes(p.id));

  // One-line working for a plan, e.g. "50% of ₹99 = ₹49.5 (capped at ₹40)".
  const working = (price, discount) => {
    const isPct = coupon.discountType === 'percentage';
    const raw = isPct ? (price * value) / 100 : value;
    let text = isPct ? `${value}% of ${rs(price)} = ${rs(raw)}` : `Flat ${rs(value)} off`;
    if (isPct && coupon.maxDiscount > 0 && raw > coupon.maxDiscount) text += `, capped at ${rs(coupon.maxDiscount)}`;
    if (discount < Math.min(raw, isPct && coupon.maxDiscount > 0 ? coupon.maxDiscount : raw)) text += `, limited so user pays at least ₹1`;
    return text;
  };

  return (
    <div className="shrink-0 rounded-xl border border-border-primary overflow-hidden">
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-900 dark:text-white bg-background-surface">Calculation - what the user will pay</div>
      {!valid ? (
        <p className="px-3 py-2 text-xs text-content-muted">Enter the discount value above to see the price of each plan.</p>
      ) : (
        <>
          <div className="sm:hidden divide-y divide-border-primary">
            {plans.map((p) => {
              const { discount, finalAmount } = computeDiscount(coupon, p.price);
              const line = (k, v, cls = '') => (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-content-muted">{k}</span>
                  <span className={`font-bold text-right ${cls || 'text-content-secondary'}`}>{v}</span>
                </div>
              );
              return (
                <div key={p.id} className="px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-content-primary">{p.label}</span>
                    <span className="px-2.5 py-0.5 text-base font-bold text-primary-600" style={{ borderRadius: 999 }}>{rs(finalAmount)}</span>
                  </div>
                  {line('Price', rs(p.normalPrice))}
                  {line('Normal off', p.saving > 0 ? `-${rs(p.saving)}` : '-')}
                  {line('After normal off', rs(p.price))}
                  {line('Coupon off', discount > 0 ? `-${rs(discount)}` : 'No discount', discount > 0 ? 'text-red-500' : '')}
                  {discount > 0 && <div className="text-[10px] text-content-muted text-right">{working(p.price, discount)}</div>}
                </div>
              );
            })}
          </div>
          <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="border-b border-border-primary">
              <tr className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted text-right dark:bg-white/5">
                <th className="px-3 py-2 text-left">Plan</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Normal off</th>
                <th className="px-3 py-2">After normal off</th>
                <th className="px-3 py-2">Coupon off</th>
                <th className="px-3 py-2">Final value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {plans.map((p) => {
                const { discount, finalAmount } = computeDiscount(coupon, p.price);
                return (
                  <tr key={p.id} className="border-dashed border-border-primary text-right align-top dark:hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2 text-left"><span className="inline-block px-2 py-0.5 text-xs font-bold text-content-primary bg-background-surface" style={{ borderRadius: 8 }}>{p.label}</span></td>
                    <td className="px-3 py-2 text-content-muted">{rs(p.normalPrice)}</td>
                    <td className="px-3 py-2 text-content-muted">{p.saving > 0 ? `-${rs(p.saving)}` : '-'}</td>
                    <td className="px-3 py-2 font-bold text-content-secondary">{rs(p.price)}</td>
                    <td className="px-3 py-2">
                      {discount > 0 ? (
                        <>
                          <div className="font-bold text-red-500">-{rs(discount)}</div>
                          <div className="text-[10px] text-content-muted">{working(p.price, discount)}</div>
                        </>
                      ) : <span className="text-xs text-content-muted">No discount</span>}
                    </td>
                    <td className="px-3 py-2"><span className="inline-block px-2.5 py-0.5 text-base font-bold text-primary-600 ring-1 ring-primary-200 dark:ring-white/15" style={{ borderRadius: 999 }}>{rs(finalAmount)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <p className="px-3 py-1.5 text-[10px] text-content-muted border-t border-dashed border-border-primary dark:bg-white/5">Price - Normal off = After normal off (plan price); the coupon is applied on that. Final value = what the user pays.</p>
        </>
      )}
    </div>
  );
};

// IST (Asia/Kolkata) whatever the admin's browser timezone is, shown as:
//   25-12-2026
//   at 11:59 PM IST
const fmtDateTime = (d) => {
  const dt = new Date(d);
  const date = dt.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const time = dt.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
  return (
    <span className="inline-block align-top leading-tight">
      <span className="block">{date}</span>
      <span className="block text-[0.85em] font-medium opacity-70">at {time} IST</span>
    </span>
  );
};

// Plan count (hover for names). No plans picked = every plan applies.
const PlansCount = ({ ids }) => {
  const list = ids?.length ? ids : PRO_PLANS.map((p) => p.id);
  const names = list.map((id) => PRO_PLANS.find((p) => p.id === id)?.label || id).join(', ');
  return <span title={names} className="cursor-help underline decoration-dotted underline-offset-4">{list.length} {list.length === 1 ? 'Plan' : 'Plans'}</span>;
};

// Small label/value tile used by the list and grid views.
const Tile = ({ label, children }) => (
  <div className="min-w-0 rounded-xl bg-background-surface-secondary border border-border-primary px-3 py-2">
    <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted">{label}</div>
    <div className="mt-0.5 text-sm font-bold text-content-primary">{children}</div>
  </div>
);

// "used / limit" with a thin progress bar when the coupon has a total limit.
const UsageTile = ({ c }) => {
  const pct = c.usageLimit > 0 ? Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100)) : 0;
  return (
    <Tile label="Used">
      <span className="tabular-nums">{c.usedCount}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : ''}</span>
      {c.usageLimit > 0 && (
        <div className="mt-1.5 h-1 w-full rounded-full bg-background-surface-secondary overflow-hidden">
          <div className="h-full bg-primary-600" style={{ width: `${pct}%` }} />
        </div>
      )}
    </Tile>
  );
};

// Read-only coupon details + the per-plan price calculation.
const CouponViewModal = ({ coupon: c, onClose, onEdit }) => {
  const st = statusOf(c);
  const rows = [
    ['Discount', `${offerLabel(c)}${c.discountType === 'percentage' && c.maxDiscount > 0 ? ` (max ₹${c.maxDiscount})` : ''}`],
    ['Display date', c.displayDate ? fmtDateTime(c.displayDate) : 'No teaser'],
    ['Starts', c.startDate ? fmtDateTime(c.startDate) : 'Immediately'],
    ['Expires', fmtDateTime(c.expiryDate)],
    ['Used', c.usedCount],
    ['Max uses', c.usageLimit > 0 ? c.usageLimit : 'Unlimited'],
    ['Per user', c.perUserLimit > 0 ? `${c.perUserLimit} time(s)` : 'Unlimited'],
    ['Valid on', <PlansCount key="plans" ids={c.applicablePlans} />],
    ['Offer pop-up', c.showInModal ? 'Shown' : 'Not shown'],
    ['Created', fmtDateTime(c.createdAt)]
  ];
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl max-h-[92dvh] sm:max-h-[calc(100dvh-2rem)] overflow-hidden relative bg-background-surface rounded-t-2xl sm:rounded-2xl border border-border-primary flex flex-col relative">
        <div className="shrink-0 relative isolate overflow-hidden flex items-center justify-between gap-3 px-4 py-3 border-b border-border-primary dark:border-transparent bg-background-surface">
          <div className="min-w-0 flex items-center gap-3">
            <span className="w-10 h-10 shrink-0 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 12 }}><Tag className="w-5 h-5" /></span>
            <span className="text-2xl font-bold font-outfit tracking-[0.08em] text-primary-600 truncate">{c.code}</span>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>{st.label}</span>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-content-muted hover:bg-background-surface-secondary"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-content-secondary px-3 py-2 dark:bg-white/5 border border-dashed border-primary-300 dark:border-white/20" style={{ borderRadius: 10 }}>{c.description}</p>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="relative overflow-hidden px-2.5 py-1.5 bg-background-surface dark:bg-white/5 ring-1 ring-primary-200 dark:ring-white/15" style={{ borderRadius: 10 }}>
              <div className="pointer-events-none absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-primary-600" />
              <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted">{k}</dt>
              <dd className="font-bold text-primary-600 dark:text-primary-100">{v}</dd>
            </div>
          ))}
        </dl>
        <PricePreview form={c} />
        </div>
        <div className="shrink-0 px-4 sm:px-4 py-2 border-t border-border-primary flex justify-end gap-2">
          <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-sm font-bold uppercase tracking-wide text-content-secondary border border-border-primary hover:border-primary-500 transition-colors">Close</button>
          <button type="button" onClick={() => onEdit(c)} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-sm font-bold uppercase tracking-wide text-on-primary hover:brightness-110 bg-primary-600">Edit</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

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
      displayDate: toLocalInput(coupon.displayDate),
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
      displayDate: form.displayDate ? new Date(form.displayDate).toISOString() : null,
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
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl max-h-[92dvh] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background-surface rounded-t-2xl sm:rounded-2xl border border-border-primary p-4 sm:p-4 flex flex-col gap-3 relative">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-content-primary">{editing ? `Edit ${coupon.code}` : 'New coupon'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-content-muted hover:bg-background-surface-secondary"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          <Field label="Coupon name (code)" hint={editing ? 'Cannot be changed after creation.' : 'Letters, numbers, - and _ (saved in capitals).'}>
            <input className={`uppercase font-bold tracking-wide border border-border-primary ${inputCls}`} value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} disabled={editing} maxLength={30} required placeholder="DIWALI50" />
          </Field>
          <Field label="Total uses" hint="0 / empty = unlimited">
            <input className={inputCls} type="number" min="0" value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} />
          </Field>
          <Field label="Uses per user" hint="0 = unlimited">
            <input className={inputCls} type="number" min="0" value={form.perUserLimit} onChange={(e) => set('perUserLimit', e.target.value)} />
          </Field>
        </div>

        <Field label="Description" hint="Shown to students in the offer modal and at checkout.">
          <textarea className={inputCls} rows={2} maxLength={300} value={form.description} onChange={(e) => set('description', e.target.value)} required placeholder="Diwali special: flat 50% off on every PRO plan" />
        </Field>

        <div className={`grid grid-cols-1 gap-3 items-start ${form.discountType === 'percentage' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <Field label="Discount type">
            <Select className={inputCls} value={form.discountType} onChange={(e) => set('discountType', e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₹)</option>
            </Select>
          </Field>
          <Field label={form.discountType === 'percentage' ? 'Percent off' : 'Rupees off'}>
            <input className={inputCls} type="number" min="1" max={form.discountType === 'percentage' ? 99 : undefined} step="any" value={form.discountValue} onChange={(e) => set('discountValue', e.target.value)} required />
          </Field>
          {form.discountType === 'percentage' && (
            <Field label="Max discount (₹)" hint="Optional cap on rupees off. Empty = no cap.">
              <input className={inputCls} type="number" min="0" value={form.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} />
            </Field>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          <Field label="Display date (optional)" hint="Coming soon teaser starts here (needs Starts date + pop-up tick). Code stays hidden until Starts.">
            <DateTimeField value={form.displayDate} onChange={(v) => set('displayDate', v)} defaultTime={[0, 0]} placeholder="No teaser" clearable />
          </Field>
          <Field label="Starts (optional)">
            <DateTimeField value={form.startDate} onChange={(v) => set('startDate', v)} defaultTime={[0, 0]} placeholder="Starts immediately" clearable />
          </Field>
          <Field label="Expiry date">
            <DateTimeField value={form.expiryDate} onChange={(v) => set('expiryDate', v)} defaultTime={[23, 59]} placeholder="Select expiry" minDate={new Date()} required />
          </Field>
        </div>

        <Field label="Valid on plans" hint="Select none to allow every plan.">
          <div className="mt-1 flex flex-wrap gap-2">
            {PRO_PLANS.map((p) => (
              <button type="button" key={p.id} onClick={() => togglePlan(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${form.applicablePlans.includes(p.id) ? 'bg-primary-600 text-on-primary border-primary-600' : 'border-border-primary dark:border-slate-600 text-content-secondary'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        <PricePreview form={form} />

        <label className="flex items-center gap-2 text-sm font-medium text-content-secondary">
          <input type="checkbox" checked={form.showInModal} onChange={(e) => set('showInModal', e.target.checked)} />
          Show this coupon in the offer pop-up (logged-in students and public visitors)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-content-secondary">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Active
        </label>

        <div className="sticky bottom-0 -mx-4 sm:mx-0 -mb-4 sm:mb-0 px-4 sm:px-0 py-2 sm:py-0 sm:pt-2 bg-background-surface border-t border-border-primary sm:border-0 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-sm font-bold text-content-secondary border border-border-primary sm:border-0">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl text-sm font-bold text-on-primary hover:brightness-110 disabled:opacity-50 bg-primary-600">
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
  const [viewing, setViewing] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  // Phones get the list view (a wide table does not fit), desktop defaults to the table.
  useEffect(() => {
    const sync = () => setViewMode((m) => (window.innerWidth < 768 ? (m === 'table' ? 'list' : m) : (m === 'list' ? 'table' : m)));
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.getAdminCoupons({ page, limit: pageSize, search: debouncedSearch || undefined });
      if (res?.success) {
        setCoupons(res.data || []);
        setTotal(res.pagination?.total ?? (res.data || []).length);
      }
    } catch (e) {
      toast.error(e?.message || 'Could not load coupons');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

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

  // Icon-only actions; the native tooltip (title) appears on hover.
  const iconBtn = 'p-2 rounded-lg border border-border-primary bg-background-surface dark:bg-white/5 text-content-muted transition-all hover:scale-105 active:scale-95';
  const hoverPrimary = 'hover:text-primary-600 hover:border-primary-500/40';
  const renderActions = (c) => (
    <div className="flex items-center gap-1.5">
      <button type="button" title="View" aria-label="View" onClick={() => setViewing(c)} className={`${iconBtn} ${hoverPrimary}`}><Eye className="w-4 h-4" /></button>
      <button type="button" title="Edit" aria-label="Edit" onClick={() => setEditing(c)} className={`${iconBtn} ${hoverPrimary}`}><Pencil className="w-4 h-4" /></button>
      <button type="button" title="Copy code" aria-label="Copy code" onClick={() => copy(c.code, 'Code copied')} className={`${iconBtn} ${hoverPrimary}`}><Copy className="w-4 h-4" /></button>
      <button type="button" title="Copy share text" aria-label="Copy share text" onClick={() => copy(`Use code ${c.code} for ${offerLabel(c)} on AajExam PRO! ${shareLink(c)}`, 'Social post text copied')} className={`${iconBtn} ${hoverPrimary}`}><Link2 className="w-4 h-4" /></button>
      <button type="button" title="Announce" aria-label="Announce" onClick={() => setAnnouncing(c)} className={`${iconBtn} ${hoverPrimary}`}><Megaphone className="w-4 h-4" /></button>
      <button type="button" title="Delete" aria-label="Delete" onClick={() => remove(c)} className={`${iconBtn} hover:text-red-600 hover:border-red-500/40`}><Trash2 className="w-4 h-4" /></button>
    </div>
  );

  const plansText = (c) => <PlansCount ids={c.applicablePlans} />;
  const discountText = (c) => `${offerLabel(c)}${c.discountType === 'percentage' && c.maxDiscount > 0 ? ` (max ₹${c.maxDiscount})` : ''}`;
  const startText = (c) => (c.startDate ? fmtDateTime(c.startDate) : 'Immediately');
  const displayText = (c) => (c.displayDate ? fmtDateTime(c.displayDate) : 'No teaser');
  const expiryText = (c) => fmtDateTime(c.expiryDate);
  const statusBadge = (c) => { const st = statusOf(c); return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>{st.label}</span>; };

  const tableColumns = [
    { key: 'code', header: 'CODE', render: (_, c) => <span className="font-bold tracking-[0.08em] text-primary-600 text-sm">{c.code}</span> },
    { key: 'discount', header: 'DISCOUNT', render: (_, c) => discountText(c) },
    { key: 'status', header: 'STATUS', render: (_, c) => statusBadge(c) },
    { key: 'displayDate', header: 'DISPLAY DATE', render: (_, c) => displayText(c) },
    { key: 'startDate', header: 'START DATE', render: (_, c) => startText(c) },
    { key: 'expires', header: 'EXPIRES', render: (_, c) => expiryText(c) },
    { key: 'used', header: 'USED', align: 'center', render: (_, c) => c.usedCount },
    { key: 'maxUses', header: 'MAX USES', align: 'center', render: (_, c) => (c.usageLimit > 0 ? c.usageLimit : 'Unlimited') },
    { key: 'perUser', header: 'PER USER', align: 'center', render: (_, c) => (c.perUserLimit > 0 ? c.perUserLimit : 'Unlimited') },
    { key: 'plans', header: 'PLANS', render: (_, c) => plansText(c) },
    { key: 'actions', header: 'ACTIONS', align: 'center', render: (_, c) => renderActions(c) }
  ];

  const viewToggle = (
    <div className="flex items-center gap-1 w-full xl:w-auto">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: List, id: 'list', label: 'List View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
      ].map((mode) => (
        <button key={mode.id} type="button" onClick={() => setViewMode(mode.id)} title={mode.label}
          className={`flex-1 xl:flex-none flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}>
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const newButton = (
    <button onClick={() => setEditing({})} className="w-full xl:w-auto flex items-center justify-center gap-2 text-on-primary px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:brightness-110 bg-primary-600">
      <Plus className="w-4 h-4" /> New coupon
    </button>
  );

  const searchInput = (
    <SearchFilter searchTerm={searchTerm} onSearch={(v) => { setSearchTerm(v); setPage(1); }} placeholder="Search coupon code..." className="w-full xl:w-64" compact />
  );

  useAdminMobileHeader({ title: 'Coupons', count: total, filters: <>{searchInput}{viewToggle}{newButton}</> });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-3">
        {/* Title + view toggle + New coupon live in the navbar (title/count) and the filter drawer, like the other admin pages */}
        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-content-muted">No coupons yet</h3>
            <p className="text-sm text-content-muted mt-2">Create one like DIWALI50 to offer a discount on PRO plans.</p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <div className="rounded-2xl border border-border-primary overflow-hidden flex-1 min-h-0 overflow-auto flex flex-col">
                <ResponsiveTable data={coupons} columns={tableColumns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
              </div>
            )}

            {viewMode === 'list' && (
              <div className="flex flex-col gap-3 pb-6">
                {coupons.map((c) => (
                  <div key={c._id} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-3 relative">
                    {/* Code + offer */}
                    <div className="xl:w-52 shrink-0">
                      <div className="text-xl font-bold tracking-[0.08em] text-primary-600">{c.code}</div>
                      <div className="text-2xl font-bold text-content-primary leading-tight">{offerLabel(c)}</div>
                      {c.discountType === 'percentage' && c.maxDiscount > 0 && (
                        <div className="text-[11px] font-medium text-content-muted">max ₹{c.maxDiscount}</div>
                      )}
                    </div>

                    {/* Description + details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-xs text-content-muted line-clamp-1">{c.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                        <Tile label="Display date">{displayText(c)}</Tile>
                        <Tile label="Starts">{startText(c)}</Tile>
                        <Tile label="Expires">{expiryText(c)}</Tile>
                        <UsageTile c={c} />
                        <Tile label="Per user">{c.perUserLimit > 0 ? c.perUserLimit : 'Unlimited'}</Tile>
                        <Tile label="Plans">{plansText(c)}</Tile>
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex xl:flex-col items-center xl:items-end justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        {c.showInModal && <span className="px-2 py-1 rounded-full text-[10px] font-bold text-primary-600">In pop-up</span>}
                        {statusBadge(c)}
                      </div>
                      {renderActions(c)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-6">
                {coupons.map((c) => (
                  <div key={c._id} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3 relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xl font-bold tracking-[0.08em] text-primary-600 truncate">{c.code}</div>
                        <div className="text-3xl font-bold text-content-primary leading-tight">{offerLabel(c)}</div>
                        {c.discountType === 'percentage' && c.maxDiscount > 0 && (
                          <div className="text-[11px] font-medium text-content-muted">max ₹{c.maxDiscount}</div>
                        )}
                      </div>
                      {statusBadge(c)}
                    </div>

                    <p className="text-xs text-content-muted line-clamp-2">{c.description}</p>

                    <div className="grid grid-cols-3 gap-2">
                      <Tile label="Display">{displayText(c)}</Tile>
                      <Tile label="Starts">{startText(c)}</Tile>
                      <Tile label="Expires">{expiryText(c)}</Tile>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <UsageTile c={c} />
                      <Tile label="Per user">{c.perUserLimit > 0 ? c.perUserLimit : 'Unlimited'}</Tile>
                      <Tile label="Plans">{plansText(c)}</Tile>
                    </div>

                    <div className="pt-3 mt-auto border-t border-border-primary flex items-center justify-between gap-2">
                      {c.showInModal
                        ? <span className="px-2 py-1 rounded-full text-[10px] font-bold text-primary-600">In pop-up</span>
                        : <span className="text-[10px] font-bold text-content-muted">Not in pop-up</span>}
                      {renderActions(c)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 pb-6">
              <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(total / pageSize))} onPageChange={setPage} totalItems={total} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} sticky={false} />
            </div>
          </>
        )}
      </div>

      {viewing && (
        <CouponViewModal coupon={viewing} onClose={() => setViewing(null)} onEdit={(c) => { setViewing(null); setEditing(c); }} />
      )}
      {editing && (
        <CouponFormModal coupon={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
      <AnnounceModal isOpen={!!announcing} initialForm={announceForm} onClose={() => setAnnouncing(null)} onSent={() => setAnnouncing(null)} />
    </div>
  );
};

export default CouponsPage;
