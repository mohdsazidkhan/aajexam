'use client';

import { SubscriptionPageSkeleton } from '../../common/skeletons/PageSkeletons';
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { toast } from "react-hot-toast";
import { ArrowRight, CircleCheck, Crown, LoaderCircle, Sparkles, Tag, X } from 'lucide-react';

import Link from '@/components/common/AppLink';
import API from '../../../lib/api';
import { PRO_PLANS } from '../../../lib/plans';
import { PRO_PLAN_FEATURES } from '../../../lib/config/planFeatures';
import TicketCard from '../TicketCard';
import PaymentTransactions from "../PaymentTransactions";
import { launchPayuCheckout } from '../../../lib/utils/payu';
import useTranslate from '../../../hooks/useTranslate';
import { useFreePromoActive } from '../../../lib/freePromo';

const SubscriptionPage = () => {
  const { translate } = useTranslate();
  const freePromoActive = useFreePromoActive();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingPlan, setBuyingPlan] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  // One tick per second drives the live expiry countdown.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const [userInfo, setUserInfo] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, description, prices }

  const handleBuy = async (plan) => {
    if (buyingPlan) return;
    setBuyingPlan(plan.key);
    // New-tab flow: PayU checkout opens in a fresh tab; this tab stays put.
    // Refresh subscription status after a short delay so the user's plan
    // flips to PRO once PayU posts back, even before they switch tabs.
    const couponCode = appliedCoupon?.prices?.[plan.id] ? appliedCoupon.code : undefined;
    const res = await launchPayuCheckout({ plan, userInfo, newTab: true, couponCode });
    setBuyingPlan(null);
    if (res?.success) {
      setTimeout(fetchSubscriptionData, 5000);
    }
  };

  const applyCoupon = async (rawCode) => {
    const code = String(rawCode ?? couponInput).trim().toUpperCase();
    if (!code || couponLoading) return;
    setCouponLoading(true);
    try {
      const res = await API.validateCoupon({ code });
      if (res?.success) {
        setAppliedCoupon({ code: res.code, description: res.description, prices: res.prices });
        setCouponInput(res.code);
        toast.success(translate('Coupon {code} applied', { code: res.code }));
      } else {
        setAppliedCoupon(null);
        toast.error(translate(res?.message || 'Invalid coupon code'));
      }
    } catch (e) {
      setAppliedCoupon(null);
      toast.error(e?.message || translate('Could not check the coupon. Try again.'));
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  // Shared links look like /subscription?coupon=DIWALI50 and apply themselves.
  useEffect(() => {
    let code = router.query?.coupon;
    if (!code && router.isReady && !loading && userInfo?._id) {
      // Code picked from the public offer pop-up before signing up.
      try {
        code = localStorage.getItem('pendingCoupon') || undefined;
        if (code) localStorage.removeItem('pendingCoupon');
      } catch { /* storage blocked */ }
    }
    if (router.isReady && typeof code === 'string' && code && !loading && userInfo?._id) applyCoupon(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query?.coupon, loading, userInfo?._id]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const userInfoStr = localStorage.getItem("userInfo");
      if (!userInfoStr) return;

      const parsedUserInfo = JSON.parse(userInfoStr);
      setUserInfo(parsedUserInfo);
      const res = await API.getSubscriptionStatus(parsedUserInfo._id);
      if (res.success) {
        setSubscription(res.data);
      }
    } catch {
      toast.error(translate('Failed to load subscription status'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  // Prices/durations come from .env via lib/plans; the server re-reads them to charge.
  const plans = PRO_PLANS.map((plan) => ({ ...plan, key: plan.id }));
  const fmtMoney = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

  if (loading) {
    return (
      <SubscriptionPageSkeleton />
    );
  }

  const planName = (subscription?.planName || '').toUpperCase();
  const isFreePlan = planName === 'FREE';
  const isActive = subscription?.status === 'active';
  const remainingMs = subscription?.expiryDate && isActive
    ? Math.max(0, new Date(subscription.expiryDate).getTime() - now)
    : null;
  const countdown = remainingMs === null ? null : {
    days: Math.floor(remainingMs / 86400000),
    hours: Math.floor((remainingMs % 86400000) / 3600000),
    minutes: Math.floor((remainingMs % 3600000) / 60000),
    seconds: Math.floor((remainingMs % 60000) / 1000),
  };

  // Perforation notches are painted in the page background so they read as cut-outs.
  // Radii are inline because styles/index.css forces every [class*="rounded"] to 8px !important.
  const notches = (
    <>
      <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
      <span className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
    </>
  );

  return (
    <>
      <Head>
        <title>Subscription | AajExam</title>
      </Head>

      <div className="space-y-3 xl:space-y-6 animate-fade-in mx-auto mt-2 xl:mt-4">
        {/* Membership pass: current plan + validity, with a perforated side stub */}
        {subscription && (
          <section
            className="relative overflow-hidden text-content-primary ring-1 ring-primary-200 dark:ring-white/10 bg-background-surface"
            style={{ borderRadius: 16 }}
          >
            <Crown className="pointer-events-none absolute right-6 top-6 w-36 h-36 text-primary-600/10 dark:text-white/5 rotate-12" />

            <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_260px]">
              <header className="z-auto p-4 xl:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {/* Card chip */}
                  <span className="w-10 h-7 bg-background-surface" style={{ borderRadius: 6 }} />
                  <span className="text-[10px] xl:text-xs font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/70">AajExam · {translate('Membership pass')}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-14 h-14 xl:w-16 xl:h-16 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 14 }}>
                    <Crown className="w-7 h-7 xl:w-8 xl:h-8" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] xl:text-xs font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/60">{translate('Your current plan')}</p>
                    <h1 className="text-2xl xl:text-4xl font-bold font-outfit leading-none tracking-tight">
                      {isActive
                        ? translate('{plan} plan is active', { plan: subscription.planName })
                        : translate('{plan} plan has expired', { plan: subscription.planName })}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] xl:text-xs font-bold uppercase tracking-[0.08em] ${isActive ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-500/40'}`} style={{ borderRadius: 999 }}>
                    <span className={`w-1.5 h-1.5 ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ borderRadius: '50%' }} />
                    {isActive ? translate('Active') : translate('Expired')}
                  </span>
                  <p className="text-xs xl:text-sm font-semibold text-content-secondary dark:text-white/85">
                    {subscription.expiryDate
                      ? isActive
                        ? translate('Valid until {date}', { date: new Date(subscription.expiryDate).toLocaleDateString() })
                        : translate('Expired on {date} — renew to regain PRO access.', { date: new Date(subscription.expiryDate).toLocaleDateString() })
                      : isFreePlan && freePromoActive
                        ? translate('PRO is free for everyone till 31 Dec 2026 — refresh this page to see it applied.')
                        : translate('Pick a plan below to unlock all exam practice tests.')}
                  </p>
                </div>
              </header>

              {/* Perforated stub: days left or the upgrade call-to-action */}
              <div className="relative p-4 xl:p-6 dark:bg-black/20 border-t border-dashed border-primary-300 dark:border-white/35 xl:border-t-0 xl:border-l flex flex-col items-center justify-center text-center gap-3">
                <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
                <span className="xl:hidden absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
                <span className="hidden xl:block absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
                {countdown !== null ? (
                  <div className="w-full">
                    {freePromoActive && (
                      <p className="mb-3 text-lg xl:text-xl font-bold font-outfit leading-tight tracking-tight text-primary-600">
                        {translate('PRO FREE till 31 Dec 2026')}
                      </p>
                    )}
                    <div className="grid grid-cols-4 gap-1.5 xl:gap-1 text-center">
                      {[
                        { v: countdown.days, l: 'Days', big: true },
                        { v: countdown.hours, l: 'Hours' },
                        { v: countdown.minutes, l: 'Min' },
                        { v: countdown.seconds, l: 'Sec' },
                      ].map((u) => (
                        <div key={u.l} className="min-w-0 px-1 py-2 bg-white/80 ring-1 ring-primary-200 dark:bg-white/10 dark:ring-white/20" style={{ borderRadius: 10 }}>
                          <div className="text-xl xl:text-2xl font-bold font-outfit leading-none tabular-nums text-primary-600">{String(u.v).padStart(2, '0')}</div>
                          <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 truncate">{translate(u.l)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75">{translate('Days left')}</div>
                  </div>
                ) : (
                  <div className="text-3xl xl:text-4xl font-bold font-outfit leading-none text-content-secondary dark:text-white/90">{planName || 'FREE'}</div>
                )}
                {(isFreePlan || !isActive) && (
                  <button
                    onClick={() => document.getElementById('pro-plans')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-on-primary font-bold uppercase tracking-[0.08em] text-xs hover:brightness-105 active:translate-y-0.5 transition-all bg-primary-600"
                  >
                    <Sparkles className="w-4 h-4" /> {translate('View PRO plans')}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="space-y-5 xl:space-y-8">
          <section className="text-center space-y-2 xl:space-y-3 max-w-3xl mx-auto px-2">
            <h2 className="text-xl xl:text-4xl font-bold font-outfit tracking-tight">{translate('Choose your exam prep plan')}</h2>
            {freePromoActive && (
              <p className="inline-block text-xs xl:text-base font-bold text-primary-600 border border-dashed border-primary-400/70 px-4 py-2" style={{ borderRadius: 12 }}>
                {translate('🎁 PRO is free for everyone till 31 Dec 2026 — every registered student already gets full access to all practice tests, mock exams, and detailed performance reports.')}
              </p>
            )}
            <div>
              <Link href="/features" className="inline-block text-xs xl:text-sm font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4">
                {translate('See the full feature comparison')}
              </Link>
            </div>
          </section>

          {/* Coupon voucher slot */}
          <div className="max-w-xl mx-auto w-full px-2">
            {appliedCoupon ? (
              <div className="relative flex items-center justify-between gap-3 border border-dashed border-primary-500/60 px-4 py-3" style={{ borderRadius: 12 }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 flex items-center justify-center bg-primary-600 text-on-primary shrink-0" style={{ borderRadius: 10 }}><Tag className="w-4 h-4" /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary-600 tracking-[0.08em]">{appliedCoupon.code} {translate('applied')}</p>
                    <p className="text-xs font-medium text-content-secondary truncate">{appliedCoupon.description}</p>
                  </div>
                </div>
                <button type="button" onClick={removeCoupon} aria-label={translate('Remove coupon')} className="p-1.5 text-content-secondary hover:bg-black/5 dark:hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); applyCoupon(); }} className="flex items-stretch bg-background-surface border border-dashed border-primary-500/40 overflow-hidden" style={{ borderRadius: 12 }}>
                <span className="flex items-center px-3 text-primary-600"><Tag className="w-5 h-5" /></span>
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder={translate('Have a coupon code?')}
                  maxLength={30}
                  className="flex-1 min-w-0 bg-transparent py-3 text-sm font-bold uppercase tracking-[0.08em] outline-none"
                />
                <button type="submit" disabled={couponLoading || !couponInput.trim()} className="px-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-on-primary text-xs font-bold uppercase tracking-[0.08em] flex items-center">
                  {couponLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : translate('Apply')}
                </button>
              </form>
            )}
          </div>

          {/* Plans as tear-off tickets: details on top, price + buy on the stub */}
          <div id="pro-plans" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 pt-2 xl:pt-4">
            {plans.map((plan) => {
              const isBuying = buyingPlan === plan.key;
              const hl = !!plan.badge;
              const couponPrice = appliedCoupon?.prices?.[plan.id];
              const muted = hl ? 'text-white/75' : 'text-content-secondary';

              return (
                <div
                  key={plan.key}
                  className={`relative flex flex-col overflow-hidden h-full transition-transform hover:-translate-y-1 ${hl ? 'text-on-primary ring-2 ring-primary-300/70 bg-primary-600' : 'bg-background-surface border border-border-primary'}`}
                  style={{ borderRadius: 16 }}
                >
                  {hl && <div className="pointer-events-none absolute -top-16 -right-10 w-48 h-48 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />}

                  <div className="relative p-4 xl:p-6 space-y-3 flex-1">
                    <div className="flex items-start justify-between gap-2 min-h-[28px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-8 h-8 flex items-center justify-center shrink-0 ${hl ? 'text-on-primary bg-primary-600' : 'text-primary-600'}`} style={{ borderRadius: 10 }}>
                          <Crown className="w-4 h-4" />
                        </span>
                        <h3 className="text-base xl:text-xl font-bold font-outfit tracking-tight truncate">{translate(plan.label)}</h3>
                      </div>
                      {plan.badge && (
                        <span className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-1 text-on-primary whitespace-nowrap bg-primary-600" style={{ borderRadius: 999 }}>
                          {translate(plan.badge)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl xl:text-5xl font-bold font-outfit leading-none">₹{fmtMoney(couponPrice ? couponPrice.finalAmount : plan.price)}</span>
                        {couponPrice && <span className={`text-xs xl:text-sm font-medium line-through pb-1 ${muted}`}>₹{plan.price}</span>}
                        {!couponPrice && plan.saving > 0 && <span className={`text-xs xl:text-sm font-medium line-through pb-1 ${muted}`}>₹{plan.normalPrice}</span>}
                      </div>
                      <p className={`text-xs xl:text-sm font-medium ${muted}`}>
                        ₹{fmtMoney(plan.perMonth)}{translate('/month')}
                        {plan.saving > 0 && <> · {translate('Save ₹{amount}', { amount: plan.saving })}</>}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {couponPrice && (
                          <span className="text-[10px] xl:text-xs font-bold px-2.5 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/40" style={{ borderRadius: 999 }}>
                            {translate('Coupon saves ₹{amount}', { amount: fmtMoney(couponPrice.discount) })}
                          </span>
                        )}
                        {plan.discountPct > 0 && (
                          <span className={`text-[10px] xl:text-xs font-bold px-2.5 py-1 ${hl ? 'bg-white/20 text-white' : 'text-primary-600'}`} style={{ borderRadius: 999 }}>
                            {plan.discountPct}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tear-off stub */}
                  <div className={`relative p-4 xl:p-5 border-t-2 border-dashed ${hl ? 'border-white/40 bg-black/15' : 'border-primary-500/30'}`}>
                    {notches}
                    <button
                      disabled={!!buyingPlan}
                      onClick={() => handleBuy(plan)}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 text-xs xl:text-sm font-bold uppercase tracking-[0.08em] transition-all active:translate-y-0.5 disabled:opacity-60 ${hl ? 'text-on-primary hover:brightness-105 bg-primary-600' : 'bg-primary-600 hover:bg-primary-700 text-on-primary'}`}
                    >
                      {isBuying ? (
                        <>
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                          {translate('Opening PayU…')}
                        </>
                      ) : (
                        <>
                          {translate('Buy {name}', { name: translate(plan.label) })} <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <TicketCard icon={Crown} title={translate('What you get with every PRO plan')}>
            <ul className="grid grid-cols-1 xl:grid-cols-2 gap-2 xl:gap-3">
              {PRO_PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 px-3 py-2.5 bg-background-surface-secondary border-b-2 border-dashed border-primary-500/40" style={{ borderRadius: 10 }}>
                  <span className="w-7 h-7 flex items-center justify-center text-primary-600 shrink-0" style={{ borderRadius: 8 }}>
                    <CircleCheck className="w-4 h-4" />
                  </span>
                  <span className="text-xs xl:text-sm font-bold text-content-primary">{translate(feature)}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs xl:text-sm font-medium text-content-secondary mt-4 xl:mt-5">{translate('Free plan stays free — practice tests, daily challenge and more at no cost.')}</p>
          </TicketCard>
        </section>

        <section className="space-y-3 xl:space-y-6">
          <PaymentTransactions />
        </section>

      </div>
    </>
  );
};

export default SubscriptionPage;


