'use client';

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import { toast } from "react-hot-toast";
import { ArrowRight, CircleCheck, Crown, LoaderCircle, Rocket, ShieldCheck, Sparkles } from 'lucide-react';

import Link from 'next/link';
import API from '../../lib/api';
import config from '../../lib/config/appConfig';
import { FREE_PLAN_FEATURES, PRO_PLAN_FEATURES } from '../../lib/config/planFeatures';
import Card from '../ui/Card';
import Button from '../ui/Button';
import UnifiedFooter from '../UnifiedFooter';
import Skeleton from '../Skeleton';
import { SubscriptionSkeleton } from '../skeletons/PrivateSkeletons';
import PaymentTransactions from "../PaymentTransactions";
import { launchPayuCheckout } from '../../lib/utils/payu';

const PLAN_THEMES = {
  primary: {
    card: 'border-primary-500/30 shadow-2xl',
    iconWrap: 'bg-primary-500/10 text-primary-600',
    badge: 'bg-primary-500 text-white shadow-duo-primary',
    check: 'text-primary-600',
    button: 'primary',
    buttonClass: 'shadow-duo-primary',
  },
  secondary: {
    card: 'border-primary-500/20',
    iconWrap: 'bg-primary-500/10 text-primary-600',
    badge: 'bg-primary-500/10 text-primary-600',
    check: 'text-primary-600',
    button: 'ghost',
    buttonClass: 'border-2 border-border-primary',
  },
};

const SubscriptionPage = () => {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingPlan, setBuyingPlan] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const handleBuy = async (plan) => {
    if (buyingPlan) return;
    setBuyingPlan(plan.key);
    // New-tab flow: PayU checkout opens in a fresh tab; this tab stays put.
    // Refresh subscription status after a short delay so the user's plan
    // flips to PRO once PayU posts back, even before they switch tabs.
    const res = await launchPayuCheckout({ plan, userInfo, newTab: true });
    setBuyingPlan(null);
    if (res?.success) {
      setTimeout(fetchSubscriptionData, 5000);
    }
  };

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
      toast.error("Failed to load subscription status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const plans = Object.entries(config.SUBSCRIPTION_PLANS || {}).map(([key, plan]) => {
    const isPro = key.toLowerCase() === 'pro';

    return {
      key,
      ...plan,
      icon: isPro ? Crown : Rocket,
      tone: isPro ? 'primary' : 'secondary',
      eyebrow: isPro ? 'Most popular' : 'Start practicing',
      features: isPro ? PRO_PLAN_FEATURES : FREE_PLAN_FEATURES,
    };
  });

  if (loading) {
    return (
      <div className="space-y-8 mx-auto">
        <Skeleton height="200px" borderRadius="2.5rem" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton height="500px" borderRadius="2rem" />
          <Skeleton height="500px" borderRadius="2rem" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Subscription | AajExam</title>
      </Head>

      <div className="space-y-4 lg:space-y-8 animate-fade-in mx-auto mt-2 lg:mt-4">
        {subscription && (
          <Card variant="dark" depth={false} className={`p-3 lg:p-4 border-none overflow-hidden relative rounded-2xl lg:rounded-[3rem] text-white ${subscription.status === 'active' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-slate-950 shadow-2xl'}`}>
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-8">
              <div className="flex items-start gap-3 lg:gap-6">
                <div className="w-10 h-10 lg:w-16 lg:h-16 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 lg:w-8 lg:h-8" />
                </div>
                <div className="space-y-1 lg:space-y-2">
                  <p className="text-[10px] lg:text-sm font-semibold opacity-80">Your current plan</p>
                  <h1 className="text-sm lg:text-3xl font-black font-outfit leading-tight uppercase">
                    {subscription.planName} plan is active
                  </h1>
                  <p className="text-[11px] lg:text-base font-medium opacity-90">
                    {subscription.expiryDate
                      ? `Valid until ${new Date(subscription.expiryDate).toLocaleDateString()}`
                      : (subscription.planName || '').toUpperCase() === 'FREE'
                        ? 'Upgrade to PRO to unlock all practice tests and detailed analytics.'
                        : 'Pick a plan below to unlock all exam practice tests.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
                {(subscription.planName || '').toUpperCase() === 'FREE' && (() => {
                  const proPlan = plans.find((plan) => plan.key.toUpperCase() === 'PRO');
                  if (!proPlan) return null;
                  const isBuying = buyingPlan === proPlan.key;
                  return (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isBuying}
                      fullWidth
                      className="lg:w-auto bg-white text-slate-900 border-none rounded-2xl px-6 py-3 lg:px-8 lg:py-4"
                      onClick={() => handleBuy(proPlan)}
                    >
                      {isBuying ? (
                        <>
                          <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
                          Opening PayU…
                        </>
                      ) : (
                        `Buy PRO ₹${proPlan.price} Plan`
                      )}
                    </Button>
                  );
                })()}
              </div>
            </div>
            <Sparkles className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 opacity-10" />
          </Card>
        )}

        <section className="space-y-5 lg:space-y-10">
          <div className="text-center space-y-2 lg:space-y-4 max-w-3xl mx-auto px-2">
            <h2 className="text-lg lg:text-5xl font-black font-outfit tracking-tight">Choose your exam prep plan</h2>
            <p className="text-xs lg:text-lg font-medium text-content-secondary">
              Practice FREE tests on the FREE plan, or upgrade to PRO for full access to all practice tests, mock exams, and detailed performance reports.
            </p>
            <Link href="/features" className="inline-block text-xs lg:text-sm font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4">
              See the full feature comparison
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 pt-2 lg:pt-6">
            {plans.map((plan) => {
              const theme = PLAN_THEMES[plan.tone];
              const isCurrent = (subscription?.planName || '').toUpperCase() === (plan.key || '').toUpperCase() && subscription.status === 'active';
              const isFree = (plan.key || '').toUpperCase() === 'FREE';
              const isBuying = buyingPlan === plan.key;

              return (
                <Card key={plan.key} className={`p-4 lg:p-10 flex flex-col justify-between group transition-all duration-300 h-full relative rounded-2xl lg:rounded-[3.5rem] border-2 ${theme.card} ${isCurrent ? 'ring-2 ring-primary-500/40' : ''}`}>
                  <div className="space-y-4 lg:space-y-8 relative z-10">
                    <div className="flex justify-between items-start gap-3 lg:gap-4">
                      <div className={`p-2.5 lg:p-4 rounded-2xl lg:rounded-3xl ${theme.iconWrap}`}>
                        <plan.icon className="w-6 h-6 lg:w-10 lg:h-10" />
                      </div>
                      <span className={`text-[10px] lg:text-xs font-semibold px-2.5 lg:px-4 py-1 lg:py-1.5 rounded-full ${theme.badge}`}>
                        {plan.eyebrow}
                      </span>
                    </div>

                    <div className="space-y-1.5 lg:space-y-3">
                      <div>
                        <h3 className="text-base lg:text-3xl font-black font-outfit tracking-tight">{plan.name}</h3>
                        <p className="text-[11px] lg:text-sm font-medium text-content-secondary mt-1">{isCurrent ? 'This is your current plan.' : 'You can upgrade anytime.'}</p>
                      </div>

                      <div className="flex items-end gap-2">
                        <span className="text-3xl lg:text-5xl font-black font-outfit leading-none">Rs.{plan.price}</span>
                        <span className="text-xs lg:text-sm font-medium text-content-secondary pb-1">per {plan.duration}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 lg:space-y-4">
                      <p className="text-xs lg:text-sm font-semibold text-content-secondary">What you get with this plan</p>
                      <ul className="space-y-1.5 lg:space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 lg:gap-3 text-xs lg:text-base font-medium text-content-secondary">
                            <CircleCheck className={`w-3.5 h-3.5 lg:w-5 lg:h-5 shrink-0 ${theme.check}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-5 lg:pt-10 relative z-10">
                    {isCurrent ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs lg:text-sm bg-emerald-500/5 py-3 lg:py-4 rounded-2xl w-full border-2 border-emerald-500/20">
                        <CircleCheck className="w-4 h-4" />
                        Current plan
                      </div>
                    ) : isFree ? (
                      <div className="flex items-center justify-center gap-2 text-content-secondary font-semibold text-xs lg:text-sm bg-slate-50 dark:bg-slate-800/50 py-3 lg:py-4 rounded-2xl w-full border-2 border-border-primary">
                        Free for everyone
                      </div>
                    ) : (
                      <Button
                        variant={theme.button}
                        size="md"
                        fullWidth
                        disabled={isBuying}
                        className={`py-3.5 lg:py-6 text-xs lg:text-sm font-black rounded-2xl ${theme.buttonClass}`}
                        onClick={() => handleBuy(plan)}
                      >
                        {isBuying ? (
                          <>
                            <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
                            Opening PayU…
                          </>
                        ) : (
                          <>
                            Buy {plan.name} <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {plan.tone === 'primary' && (
                    <Crown className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 pointer-events-none" />
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 lg:space-y-6">
          <PaymentTransactions />
        </section>

        <UnifiedFooter />
      </div>
    </>
  );
};

export default SubscriptionPage;


