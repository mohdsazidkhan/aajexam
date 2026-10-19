'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AlertTriangle, LogOut, ArrowRight } from 'lucide-react';

const KEY = 'aj_non_india_ok';
const REMEMBER_MS = 7 * 24 * 3600 * 1000;

/**
 * Shown only to visitors outside India (country from /api/geo). "Close" leaves the site,
 * "Continue" dismisses the notice and remembers that for 7 days.
 */
const IndiaOnlyNotice = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(false);
  const skip = router.pathname.startsWith('/admin');

  useEffect(() => {
    if (skip) return undefined;
    let cancelled = false;
    // Testing aid: open any page with ?geotest=1 to see the notice without a VPN (display only, nothing is stored).
    if (new URLSearchParams(window.location.search).get('geotest') === '1') {
      setOpen(true);
      return undefined;
    }
    try {
      const t = Number(localStorage.getItem(KEY));
      if (t && Date.now() - t < REMEMBER_MS) return undefined;
    } catch (e) { /* storage blocked: just ask again */ }

    fetch('/api/geo', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.outsideIndia) setOpen(true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [skip]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (left) {
    return (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950 p-6 text-center" role="alert">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <LogOut className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Thank you for visiting</h2>
          <p className="mt-2 text-sm text-slate-300">AajExam is for Indian users only. You can now close this tab.</p>
        </div>
      </div>
    );
  }

  if (!open || skip) return null;

  const handleContinue = () => {
    if (new URLSearchParams(window.location.search).get('geotest') === '1') { setOpen(false); return; }
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* ignore */ }
    setOpen(false);
  };

  const handleClose = () => {
    // Browsers only let a script close a tab that a script opened. Try anyway; if the tab is still
    // here a moment later, cover the site with a goodbye screen so nothing stays usable.
    try { window.open('', '_self'); window.close(); } catch (e) { /* ignore */ }
    setTimeout(() => setLeft(true), 200);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="alertdialog" aria-modal="true" aria-labelledby="india-only-title" aria-describedby="india-only-desc">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-rose-500/30">
        {/* warning stripe */}
        <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_14px,#111827_14px,#111827_28px)]" aria-hidden="true" />

        <div className="px-6 pt-7 pb-6 text-center">
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-amber-500/25 animate-ping" aria-hidden="true" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 shadow-lg shadow-rose-500/30">
              <AlertTriangle className="h-10 w-10 text-white" strokeWidth={2.5} />
            </span>
          </div>

          <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Warning · Region notice</span>

          <h2 id="india-only-title" className="mt-3 text-2xl font-black leading-tight text-slate-900 dark:text-white">
            This website is for <span className="text-rose-600 dark:text-rose-400">Indian users only</span>
          </h2>

          <p id="india-only-desc" className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            AajExam is built for <b>Indian government exam preparation</b>. We detected that you are visiting from outside India, so exams, languages and content here may not be relevant to you.
          </p>

          <div className="mx-auto mt-4 flex h-1 w-24 overflow-hidden rounded-full" aria-hidden="true">
            <span className="h-full flex-1 bg-[#FF9933]" /><span className="h-full flex-1 bg-slate-200" /><span className="h-full flex-1 bg-[#138808]" />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={handleClose} className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-rose-500/40 px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400">
              <LogOut className="h-4 w-4" /> Close website
            </button>
            <button type="button" onClick={handleContinue} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700">
              Continue anyway <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaOnlyNotice;
