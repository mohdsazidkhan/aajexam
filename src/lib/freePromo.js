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
