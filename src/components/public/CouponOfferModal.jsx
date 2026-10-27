'use client';
import React, { useEffect, useState } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Copy, Sparkles, Clock, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import useTranslate from '../../hooks/useTranslate';
import { getCurrentUser } from '../../lib/utils/authUtils';

const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };
const isLoggedIn = () => !!safeGet('token');

const pad = (n) => String(n).padStart(2, '0');

// Live "ends in" timer for the coupon's expiry.
const Countdown = ({ expiry, translate }) => {
  const [left, setLeft] = useState(() => Math.max(0, new Date(expiry).getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, new Date(expiry).getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [expiry]);

  const secs = Math.floor(left / 1000);
  const parts = [
    { label: translate('Days'), value: Math.floor(secs / 86400) },
    { label: translate('Hours'), value: Math.floor((secs % 86400) / 3600) },
    { label: translate('Min'), value: Math.floor((secs % 3600) / 60) },
    { label: translate('Sec'), value: secs % 60 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {parts.map((p) => (
        <div key={p.label} className="rounded-xl bg-background-surface-secondary py-2 text-center">
          <div className="text-xl xl:text-2xl font-bold font-outfit tabular-nums text-content-primary leading-none">{pad(p.value)}</div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted">{p.label}</div>
        </div>
      ))}
    </div>
  );
};

// Shows the newest live admin-flagged coupon on every full page load / refresh (it replaces the
// free-promo welcome pop-up once that ends). Closing it only hides it until the next refresh.
const CouponOfferModal = () => {
  const { translate } = useTranslate();
  const router = useRouter();
  const [coupon, setCoupon] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const hidden = router.pathname.startsWith('/admin') || router.pathname.startsWith('/subscription') || router.pathname.startsWith('/student/subscription');

  useEffect(() => {
    if (hidden || coupon || dismissed) return;
    if (getCurrentUser()?.role === 'admin') return; // admins never see the offer pop-up
    let cancelled = false;
    let teaserTimer;
    // Logged-out visitors get a short delay so the page (and the welcome pop-up) settle first.
    const timer = setTimeout(() => {
      API.getFeaturedCoupons().then((res) => {
        if (cancelled || !res?.success) return;
        // The API response can be cached for a few minutes, so re-check dates here too.
        const now = Date.now();
        const next = (res.data || []).find((c) => new Date(c.expiryDate).getTime() > now
          && (!c.upcoming || new Date(c.startDate).getTime() > now));
        if (!next) return;
        // Logged-out visitors still see the free-promo welcome pop-up; show the teaser after they close it.
        if (next.upcoming && !isLoggedIn()) {
          // Give the welcome pop-up (opens ~1.5s after load) time to appear before deciding.
          teaserTimer = setTimeout(() => {
            if (cancelled) return;
            if (window.__welcomePromoOpen) {
              window.addEventListener('welcomePromoClosed', () => { if (!cancelled) setCoupon(next); }, { once: true });
            } else {
              setCoupon(next);
            }
          }, 1500);
          return;
        }
        setCoupon(next);
      }).catch(() => {});
    }, 1200);
    return () => { cancelled = true; clearTimeout(timer); clearTimeout(teaserTimer); };
  }, [hidden, coupon, dismissed]);

  // Auto-hide when the open coupon expires, or when a teaser's coupon starts (the live offer shows on the next refresh).
  useEffect(() => {
    if (!coupon) return undefined;
    const ms = new Date(coupon.upcoming ? coupon.startDate : coupon.expiryDate).getTime() - Date.now();
    const timer = setTimeout(() => { setDismissed(true); setCoupon(null); }, Math.min(Math.max(ms, 0), 2147483647));
    return () => clearTimeout(timer);
  }, [coupon]);

  if (hidden || !coupon) return null;

  const close = () => {
    setDismissed(true);
    setCoupon(null);
  };

  const offerText = coupon.discountType === 'percentage'
    ? `${coupon.discountValue}% OFF`
    : `₹${coupon.discountValue} OFF`;

  const upcoming = !!coupon.upcoming;
  const fmtDay = (d) => new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      toast.success(translate('Coupon code copied'));
    } catch { /* clipboard blocked */ }
  };

  const useNow = () => {
    const code = coupon.code;
    setDismissed(true);
    setCoupon(null);
    if (!isLoggedIn()) {
      // Visitors log in first (login page has a sign-up link); the subscription page applies this code afterwards.
      safeSet('pendingCoupon', code);
      router.push('/login');
      return;
    }
    router.push(`/student/subscription?coupon=${encodeURIComponent(code)}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={close} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md xl:max-w-lg max-h-[92vh] overflow-y-auto bg-background-surface rounded-3xl border border-primary-500/20"
        >
          {/* Hero */}
          <div className="relative overflow-hidden px-6 pt-8 pb-10 xl:pt-10 xl:pb-12 text-center text-on-primary bg-primary-600">
            {/* Soft glow instead of shapes: the site forces every rounded element to a flat 8px radius, so circles render as squares. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(circle at 12% 0%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.16), transparent 50%)' }}
            />
            <button aria-label={translate('Close')} onClick={close} className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition">
              <X className="w-4 h-4" />
            </button>
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] xl:text-xs font-bold uppercase tracking-[0.08em]">
              <Sparkles className="w-3.5 h-3.5" /> {translate(upcoming ? 'Coming soon' : 'Limited time offer')}
            </span>
            <p className="relative mt-4 text-6xl xl:text-7xl font-bold font-outfit leading-none tracking-tight">{offerText}</p>
            <p className="relative mt-3 text-sm xl:text-base font-medium text-white/90 max-w-xs mx-auto">{coupon.description}</p>
          </div>

          <div className="space-y-4 p-5 xl:p-7">
            {/* Code */}
            {upcoming ? (
              <div className="w-full flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border-primary dark:border-slate-600 bg-background-surface-secondary px-4 py-3.5 text-content-muted">
                <div className="flex items-center gap-2 text-xl xl:text-2xl font-bold font-outfit tracking-[0.08em]">
                  <Lock className="w-5 h-5" /> ••••••••
                </div>
                <p className="text-[11px] xl:text-xs font-bold uppercase tracking-[0.08em]">
                  {translate('Coupon code unlocks on {date}', { date: fmtDay(coupon.startDate) })}
                </p>
              </div>
            ) : (
              <button type="button" onClick={copy} className="w-full flex items-center justify-center gap-3 rounded-2xl border border-dashed border-primary-500/60 px-4 py-3.5 text-2xl xl:text-3xl font-bold font-outfit tracking-[0.08em] text-primary-600 transition">
                <Tag className="w-5 h-5" /> {coupon.code} <Copy className="w-4 h-4" />
              </button>
            )}

            {/* Countdown */}
            <div className="space-y-2">
              <p className="flex items-center justify-center gap-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-[0.08em] text-content-muted">
                <Clock className="w-3.5 h-3.5" /> {translate(upcoming ? 'Offer starts in' : 'Offer ends in')}
              </p>
              <Countdown expiry={upcoming ? coupon.startDate : coupon.expiryDate} translate={translate} />
              <p className="text-center text-[11px] font-medium text-content-secondary">
                {upcoming
                  ? translate('Starts on {date}', { date: fmtDay(coupon.startDate) })
                  : translate('Valid till {date}', { date: fmtDay(coupon.expiryDate) })}
              </p>
            </div>

            {upcoming ? (
              <button type="button" onClick={close} className="w-full rounded-2xl bg-primary-600 hover:bg-primary-700 py-4 text-base xl:text-lg font-bold text-on-primary shadow-primary-600/30 transition">
                {translate('Got it')}
              </button>
            ) : (
              <>
                <button type="button" onClick={useNow} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary-600 hover:bg-primary-700 py-4 text-base xl:text-lg font-bold text-on-primary shadow-primary-600/30 transition">
                  {translate('Use this coupon')} <ArrowRight className="w-5 h-5" />
                </button>
                <button type="button" onClick={close} className="w-full text-xs font-bold text-content-muted hover:text-content-primary dark:hover:text-slate-200 transition">
                  {translate('Maybe later')}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CouponOfferModal;
