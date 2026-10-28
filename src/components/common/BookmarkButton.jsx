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
// variant is accepted for old call sites; the button is always icon only
const BookmarkButton = ({ type, id, className = '' }) => {
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
  // Icon only; the tooltip (and screen readers) say Bookmark / Bookmarked
  const label = translate(saved ? 'Bookmarked' : 'Bookmark');
  const tone = saved
    ? 'bg-primary-600 text-on-primary'
    : 'bg-background-surface text-primary-600 hover:bg-primary-600 hover:text-on-primary';

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} aria-label={label} title={label}
      className={`inline-flex items-center justify-center w-9 h-9 border border-primary-600 transition-colors disabled:opacity-60 ${tone} ${className}`}
      style={{ borderRadius: 'var(--radius-sm)' }}>
      <Icon className="w-4 h-4" />
    </button>
  );
};

export default BookmarkButton;
