'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { isAuthenticated } from '../../lib/utils/authUtils';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import useTranslate from '../../hooks/useTranslate';

// One fetch per content type per page view fills every bookmark button on the page; toggles keep
// the shared set in sync so two buttons for the same item never disagree.
const cache = new Map(); // type -> { ids: Set<string>, promise: Promise | null }
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

const loadIds = (type) => {
  let entry = cache.get(type);
  if (!entry) {
    entry = { ids: new Set(), promise: null };
    cache.set(type, entry);
  }
  if (!entry.promise) {
    entry.promise = API.request(`/api/bookmarks/ids?type=${type}`)
      .then((res) => { (res?.data || []).forEach((id) => entry.ids.add(String(id))); notify(); })
      .catch(() => { entry.promise = null; });
  }
  return entry.promise;
};

// type: test | quiz | community | news | affair | subject | topic | blog | note
// id:   the content's _id (notes: slug). Anything else the API can resolve from a slug works too.
// variant: 'icon' (round icon button) | 'pill' (icon + label)
const BookmarkButton = ({ type, id, variant = 'icon', className = '' }) => {
  const { translate } = useTranslate();
  const router = useRouter();
  const key = id ? String(id) : '';
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!type || !key || !isAuthenticated()) return undefined;
    const sync = () => setSaved(!!cache.get(type)?.ids.has(key));
    listeners.add(sync);
    loadIds(type).then(sync);
    sync();
    return () => { listeners.delete(sync); };
  }, [type, key]);

  if (!type || !key) return null;

  const toggle = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!isAuthenticated()) {
      toast.error(translate('Login to bookmark'));
      router.push('/login');
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await API.request('/api/bookmarks', { method: 'POST', body: JSON.stringify({ type, id: key }) });
      if (res?.success) {
        const entry = cache.get(type) || { ids: new Set(), promise: null };
        cache.set(type, entry);
        if (res.data.bookmarked) entry.ids.add(key); else entry.ids.delete(key);
        notify();
        toast.success(translate(res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks'));
      }
    } catch {
      toast.error(translate('Failed to remove bookmark'));
    } finally {
      setBusy(false);
    }
  };

  const Icon = saved ? BookmarkCheck : Bookmark;
  const label = translate(saved ? 'Remove bookmark' : 'Bookmark');
  const tone = saved
    ? 'bg-primary-600 text-on-primary ring-primary-600'
    : 'bg-background-surface text-content-secondary ring-slate-200 hover:bg-background-surface-secondary dark:ring-slate-700 dark:hover:bg-slate-700';

  if (variant === 'pill') {
    return (
      <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} title={label}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 ring-1 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-60 ${tone} ${className}`}
        style={{ borderRadius: 'var(--radius-sm)' }}>
        <Icon className="w-4 h-4" />{label}
      </button>
    );
  }
  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} aria-label={label} title={label}
      className={`inline-flex items-center justify-center w-9 h-9 ring-1 transition-colors disabled:opacity-60 ${tone} ${className}`}
      style={{ borderRadius: 'var(--radius)' }}>
      <Icon className="w-4 h-4" />
    </button>
  );
};

export default BookmarkButton;
