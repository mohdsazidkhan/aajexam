'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import useTranslate from '../../hooks/useTranslate';

const dismissKey = (code) => `couponModalDismissed:${code}`;

const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };
const isLoggedIn = () => !!safeGet('token');

// Shows the newest admin-flagged coupon once per browser (until a new coupon is flagged).
const CouponOfferModal = () => {
  const { translate } = useTranslate();
  const router = useRouter();
  const [coupon, setCoupon] = useState(null);

  const hidden = router.pathname.startsWith('/admin') || router.pathname.startsWith('/subscription');

  useEffect(() => {
    if (hidden || coupon) return;
    let cancelled = false;
    // Logged-out visitors get a short delay so the page (and the welcome pop-up) settle first.
    const timer = setTimeout(() => {
      API.getFeaturedCoupons().then((res) => {
        if (cancelled || !res?.success) return;
        const next = (res.data || []).find((c) => !safeGet(dismissKey(c.code)));
        if (next) setCoupon(next);
      }).catch(() => {});
    }, isLoggedIn() ? 0 : 6000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [hidden, coupon]);

  if (hidden || !coupon) return null;

  const close = () => {
    safeSet(dismissKey(coupon.code), '1');
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
    safeSet(dismissKey(coupon.code), '1');
    const code = coupon.code;
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
            {translate('Valid till {date}', { date: new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })}
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
