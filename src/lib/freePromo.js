import { useEffect, useState } from 'react';

// Fallback when no pop-up coupon is scheduled: 31 Dec 2026, 11:59 PM IST.
export const FREE_PROMO_END = new Date('2026-12-31T23:59:59.999+05:30');

// The real end follows the earliest active pop-up coupon's start date (see
// /api/coupons/free-promo), so the free-promo messages stop exactly when the coupon starts.
let endPromise = null;
export const getFreePromoEnd = () => {
  if (!endPromise) {
    endPromise = fetch('/api/coupons/free-promo')
      .then((r) => r.json())
      .then((d) => (d?.promoEnd ? new Date(d.promoEnd) : FREE_PROMO_END))
      .catch(() => FREE_PROMO_END);
  }
  return endPromise;
};

// The red strip above the public navbar: visible while the promo runs, until the visitor closes it
// (remembered for the rest of the browser session, so it comes back on their next visit).
const BAR_KEY = 'promoBarDismissed';
export const dismissPromoBar = () => {
  try { sessionStorage.setItem(BAR_KEY, '1'); } catch (e) { /* storage unavailable */ }
  window.dispatchEvent(new Event('promoBarDismissed'));
};
export const usePromoBarVisible = () => {
  const active = useFreePromoActive();
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem(BAR_KEY)) setDismissed(true); } catch (e) { /* ignore */ }
    const on = () => setDismissed(true);
    window.addEventListener('promoBarDismissed', on);
    return () => window.removeEventListener('promoBarDismissed', on);
  }, []);
  return active && !dismissed;
};

export const isFreePromoActive = () => Date.now() < FREE_PROMO_END.getTime();

// true while the free promo should be shown. Starts from the fallback date, then follows the coupon.
export const useFreePromoActive = () => {
  const [active, setActive] = useState(isFreePromoActive);
  useEffect(() => {
    let cancelled = false;
    getFreePromoEnd().then((end) => { if (!cancelled) setActive(Date.now() < end.getTime()); });
    return () => { cancelled = true; };
  }, []);
  return active;
};
