'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import useTranslate from '../../hooks/useTranslate';
import { getCurrentUser } from '../../lib/utils/authUtils';

const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };
const isLoggedIn = () => !!safeGet('token');

// Shows the newest live admin-flagged coupon on every full page load / refresh (it replaces the
// free-promo welcome pop-up once that ends). Closing it only hides it until the next refresh.
const CouponOfferModal = () => {
  const { translate } = useTranslate();
  const router = useRouter();
  const [coupon, setCoupon] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const hidden = router.pathname.startsWith('/admin') || router.pathname.startsWith('/subscription');

  useEffect(() => {
    if (hidden || coupon || dismissed) return;
    if (getCurrentUser()?.role === 'admin') return; // admins never see the offer pop-up
    let cancelled = false;
    // Logged-out visitors get a short delay so the page (and the welcome pop-up) settle first.
    const timer = setTimeout(() => {
      API.getFeaturedCoupons().then((res) => {
        if (cancelled || !res?.success) return;
        // The API response can be cached for a few minutes, so re-check expiry here too.
        const next = (res.data || []).find((c) => new Date(c.expiryDate).getTime() > Date.now());
        if (next) setCoupon(next);
      }).catch(() => {});
    }, 1200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [hidden, coupon, dismissed]);

  // Auto-hide the moment the open coupon expires.
  useEffect(() => {
    if (!coupon) return undefined;
    const ms = new Date(coupon.expiryDate).getTime() - Date.now();
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
      // Visitors must sign up first; the subscription page applies this code after login.
      safeSet('pendingCoupon', code);
      router.push('/register');
      return;
    }
    router.push(`/subscription?coupon=${encodeURIComponent(code)}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={close} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border-2 border-primary-500/20 p-6 text-center"
        >
          <button aria-label={translate('Close')} onClick={close} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-3xl font-black font-outfit text-primary-600">{offerText}</p>
          <p className="mt-2 text-sm font-medium text-content-secondary">{coupon.description}</p>

          <button type="button" onClick={copy} className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary-500/50 bg-primary-500/5 px-4 py-3 text-lg font-black tracking-widest text-primary-600">
            {coupon.code} <Copy className="w-4 h-4" />
          </button>
          <p className="mt-2 text-[11px] font-medium text-content-secondary">
            {translate('Valid till {date}', { date: new Date(coupon.expiryDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }) })}
          </p>

          <button type="button" onClick={useNow} className="mt-4 w-full rounded-2xl bg-primary-600 py-3 text-sm font-black text-white">
            {translate('Use this coupon')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CouponOfferModal;
