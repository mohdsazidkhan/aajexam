'use client';

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import { toast } from "react-hot-toast";
import { ArrowRight, CircleCheck, Crown, LoaderCircle, ShieldCheck, Sparkles, Tag, X } from 'lucide-react';

import Link from 'next/link';
import API from '../../lib/api';
import { PRO_PLANS } from '../../lib/plans';
import { PRO_PLAN_FEATURES } from '../../lib/config/planFeatures';
import Card from '../ui/Card';
import Button from '../ui/Button';
import UnifiedFooter from '../UnifiedFooter';
import Skeleton from '../Skeleton';
import { SubscriptionSkeleton } from '../skeletons/PrivateSkeletons';
import PaymentTransactions from "../PaymentTransactions";
import { launchPayuCheckout } from '../../lib/utils/payu';
import useTranslate from '../../hooks/useTranslate';

const SubscriptionPage = () => {
  const { translate } = useTranslate();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingPlan, setBuyingPlan] = useState(null);
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
      <div className="space-y-8 mx-auto">
        <Skeleton height="200px" borderRadius="2.5rem" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-8">
          <Skeleton height="300px" borderRadius="2rem" />
          <Skeleton height="300px" borderRadius="2rem" />
          <Skeleton height="300px" borderRadius="2rem" />
          <Skeleton height="300px" borderRadius="2rem" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Subscription | AajExam</title>
      </Head>

      <div className="space-y-2 xl:space-y-4 xl:space-y-8 animate-fade-in mx-auto mt-2 xl:mt-4">
        {subscription && (
          <Card variant="dark" depth={false} className={`p-3 xl:p-4 border-none overflow-hidden relative rounded-2xl xl:rounded-[3rem] text-white ${subscription.status === 'active' ? 'bg-primary-600' : 'bg-slate-950 shadow-sm'}`}>
            <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 xl:gap-8">
              <div className="flex items-start gap-3 xl:gap-6">
                <div className="w-10 h-10 xl:w-16 xl:h-16 bg-white/20 rounded-lg xl:rounded-xl xl:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 xl:w-8 xl:h-8" />
                </div>
                <div className="space-y-1 xl:space-y-2">
                  <p className="text-[10px] xl:text-sm font-semibold opacity-80">{translate('Your current plan')}</p>
                  <h1 className="text-sm xl:text-3xl font-black font-outfit leading-tight uppercase">
                    {subscription.planName} plan {subscription.status === 'active' ? 'is active' : 'has expired'}
                  </h1>
                  <p className="text-[11px] xl:text-base font-medium opacity-90">
                    {subscription.expiryDate
                      ? subscription.status === 'active'
                        ? translate('Valid until {date}', { date: new Date(subscription.expiryDate).toLocaleDateString() })
                        : translate('Expired on {date} — renew to regain PRO access.', { date: new Date(subscription.expiryDate).toLocaleDateString() })
                      : (subscription.planName || '').toUpperCase() === 'FREE'
                        ? translate('PRO is free for everyone till 31 Dec 2026 — refresh this page to see it applied.')
                        : translate('Pick a plan below to unlock all exam practice tests.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 xl:gap-4 w-full xl:w-auto">
                {(subscription.planName || '').toUpperCase() === 'FREE' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    className="xl:w-auto rounded-2xl px-6 py-3 xl:px-8 xl:py-4"
                    onClick={() => document.getElementById('pro-plans')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {translate('View PRO plans')}
                  </Button>
                )}
              </div>
            </div>
            <Sparkles className="absolute -bottom-10 -right-10 w-24 xl:w-48 h-24 xl:h-48 opacity-10" />
          </Card>
        )}

        <section className="space-y-5 xl:space-y-10">
          <div className="text-center space-y-2 xl:space-y-4 max-w-3xl mx-auto px-2">
            <h2 className="text-lg xl:text-5xl font-black font-outfit tracking-tight">{translate('Choose your exam prep plan')}</h2>
            <p className="text-xs xl:text-lg font-medium text-content-secondary">
              {translate('🎁 PRO is free for everyone till 31 Dec 2026 — every registered student already gets full access to all practice tests, mock exams, and detailed performance reports.')}
            </p>
            <Link href="/features" className="inline-block text-xs xl:text-sm font-bold text-primary-600 hover:text-primary-600 underline underline-offset-4">
              {translate('See the full feature comparison')}
            </Link>
          </div>

          <div className="max-w-xl mx-auto w-full px-2">
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-primary-500/40 bg-primary-500/10 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Tag className="w-5 h-5 shrink-0 text-primary-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-primary-600">{appliedCoupon.code} {translate('applied')}</p>
                    <p className="text-xs font-medium text-content-secondary truncate">{appliedCoupon.description}</p>
                  </div>
                </div>
                <button type="button" onClick={removeCoupon} aria-label={translate('Remove coupon')} className="p-1.5 rounded-lg text-content-secondary hover:bg-black/5 dark:hover:bg-white/5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); applyCoupon(); }} className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder={translate('Have a coupon code?')}
                  maxLength={30}
                  className="flex-1 min-w-0 rounded-2xl border-2 border-primary-500/20 bg-transparent px-4 py-3 text-sm font-bold uppercase tracking-wide outline-none focus:border-primary-500"
                />
                <Button type="submit" variant="secondary" size="md" disabled={couponLoading || !couponInput.trim()} className="rounded-2xl px-5 text-sm font-black">
                  {couponLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : translate('Apply')}
                </Button>
              </form>
            )}
          </div>

          <div id="pro-plans" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 pt-2 xl:pt-6">
            {plans.map((plan) => {
              const isBuying = buyingPlan === plan.key;
              const highlighted = !!plan.badge;
              const couponPrice = appliedCoupon?.prices?.[plan.id];

              return (
                <Card key={plan.key} className={`p-4 xl:p-8 flex flex-col justify-between h-full relative rounded-2xl xl:rounded-[2.5rem] border-2 ${highlighted ? 'border-primary-500/60 shadow-sm' : 'border-primary-500/20'}`}>
                  <div className="space-y-3 xl:space-y-5 relative z-10">
                    <div className="flex justify-between items-center gap-2 min-h-[28px]">
                      <h3 className="text-base xl:text-2xl font-black font-outfit tracking-tight">{translate(plan.label)}</h3>
                      {plan.badge && (
                        <span className="text-[10px] xl:text-xs font-semibold px-2.5 xl:px-3 py-1 rounded-full bg-primary-600 text-white shadow-sm whitespace-nowrap">
                          {translate(plan.badge)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-end gap-2">
                        <span className="text-3xl xl:text-5xl font-black font-outfit leading-none">₹{fmtMoney(couponPrice ? couponPrice.finalAmount : plan.price)}</span>
                        {couponPrice && (
                          <span className="text-xs xl:text-sm font-medium text-content-secondary line-through pb-1">₹{plan.price}</span>
                        )}
                        {!couponPrice && plan.saving > 0 && (
                          <span className="text-xs xl:text-sm font-medium text-content-secondary line-through pb-1">₹{plan.normalPrice}</span>
                        )}
                      </div>
                      <p className="text-xs xl:text-sm font-medium text-content-secondary">
                        ₹{fmtMoney(plan.perMonth)}{translate('/month')}
                        {plan.saving > 0 && <> · {translate('Save ₹{amount}', { amount: plan.saving })}</>}
                      </p>
                      {couponPrice && (
                        <span className="inline-block text-[10px] xl:text-xs font-black px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 mr-2">
                          {translate('Coupon saves ₹{amount}', { amount: fmtMoney(couponPrice.discount) })}
                        </span>
                      )}
                      {plan.discountPct > 0 && (
                        <span className="inline-block text-[10px] xl:text-xs font-black px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600">
                          {plan.discountPct}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-5 xl:pt-8 relative z-10">
                    <Button
                      variant={highlighted ? 'primary' : 'secondary'}
                      size="md"
                      fullWidth
                      disabled={!!buyingPlan}
                      className="py-3.5 xl:py-5 text-xs xl:text-sm font-black rounded-2xl"
                      onClick={() => handleBuy(plan)}
                    >
                      {isBuying ? (
                        <>
                          <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
                          {translate('Opening PayU…')}
                        </>
                      ) : (
                        <>
                          {translate('Buy {name}', { name: translate(plan.label) })} <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-4 xl:p-8 rounded-2xl xl:rounded-[2.5rem] border-2 border-primary-500/20">
            <div className="flex items-center gap-3 mb-3 xl:mb-5">
              <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-600"><Crown className="w-6 h-6 xl:w-8 xl:h-8" /></div>
              <p className="text-sm xl:text-xl font-black font-outfit">{translate('What you get with every PRO plan')}</p>
            </div>
            <ul className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-1.5 xl:gap-y-3">
              {PRO_PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 xl:gap-3 text-xs xl:text-base font-medium text-content-secondary">
                  <CircleCheck className="w-3.5 h-3.5 xl:w-5 xl:h-5 shrink-0 text-primary-600" />
                  <span>{translate(feature)}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs xl:text-sm font-medium text-content-secondary mt-4 xl:mt-6">{translate('Free plan stays free — practice tests, daily challenge and more at no cost.')}</p>
          </Card>
        </section>

        <section className="space-y-3 xl:space-y-6">
          <PaymentTransactions />
        </section>

        <UnifiedFooter />
      </div>
    </>
  );
};

export default SubscriptionPage;


