'use client';

import PageHero from '@/components/common/ui/PageHero';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
   Banknote,
   CreditCard,
   Ban,
   TriangleAlert,
   CircleCheck,
   Info,
   Gift,
   ShieldCheck,
   Clock,
   ChevronRight,
   Zap,
   Mail,
   Scale
} from 'lucide-react';
import { m as motion } from 'framer-motion';

import MobileAppWrapper from '../../common/MobileAppWrapper';
import config from '../../../lib/config/appConfig';
import UnifiedFooter from '../../common/UnifiedFooter';

const RefundPolicy = () => {
   const router = useRouter();

   const sections = [
      { id: 'general', title: 'General Policy', icon: Ban, color: 'primary' },
      { id: 'subscriptions', title: 'Subscriptions', icon: CreditCard, color: 'primary' },
      { id: 'payments', title: 'Payments & Invoicing', icon: Banknote, color: 'primary' },
      { id: 'eligibility', title: 'Refund Exceptions', icon: CircleCheck, color: 'primary' },
      { id: 'rewards', title: 'Rewards Policy', icon: Gift, color: 'primary' },
      { id: 'chargebacks', title: 'Chargebacks', icon: TriangleAlert, color: 'primary' },
      { id: 'responsible', title: 'Responsible Use', icon: ShieldCheck, color: 'primary' },
      { id: 'contact', title: 'Contact Information', icon: Mail, color: 'primary' }
   ];

   return (
      <MobileAppWrapper title="Refund Policy">
         <div className="min-h-screen font-outfit pb-6 selection:bg-primary-600 selection:text-white mt-0">

            <div className="container mx-auto pt-2 xl:pt-4">
               <PageHero
                  icon={Banknote}
                  title="Refund Policy"
               />
            </div>

            <div>

                  {/* --- Content Main --- */}
                  <article className="space-y-4 xl:space-y-5">

                     {/* Introduction */}
                     <section id="intro" className="group mt-4">
                        <div className="bg-background-surface p-4 xl:p-8 rounded-3xl xl:rounded-3xl border-none relative overflow-hidden text-center">
                           <p className="text-md xl:text-lg leading-relaxed text-content-secondary font-medium italic">
                              Thank you for using <strong>AajExam</strong>. Please read this policy before buying a plan. By paying for a plan, you agree to the rules below.
                           </p>
                        </div>
                     </section>

                     {/* General Policy */}
                     <section id="general" className="bg-background-surface p-4 xl:p-8 rounded-3xl xl:rounded-3xl space-y-6 xl:space-y-8 border-none ring-1 ring-black/10 dark:ring-white/10">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-content-primary rounded-3xl flex items-center justify-center border border-border-primary">
                              <Ban className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">General Policy</h2>
                        </div>

                        <div className="space-y-5 relative z-10">
                           <div className="p-4 xl:p-5 bg-black/10 dark:bg-white/10 rounded-3xl border border-border-primary text-content-primary text-center">
                              <p className="text-lg font-bold tracking-[0.08em] leading-none">
                                 ALL SUBSCRIPTIONS ARE FINAL & NON-REFUNDABLE.
                              </p>
                           </div>
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <section className="p-4 xl:p-4 xl:p-5 bg-background-surface rounded-3xl border border-border-primary space-y-2 xl:space-y-4">
                                 <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-content-muted">No Refund Condition</h3>
                                 <p className="text-sm font-medium text-content-secondary leading-relaxed">Access to the platform is provided regardless of your test performance or leaderboard rank.</p>
                              </section>
                              <section className="p-4 xl:p-4 xl:p-5 bg-background-surface rounded-3xl border border-border-primary space-y-2 xl:space-y-4">
                                 <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-content-muted">Content Access</h3>
                                 <p className="text-sm font-medium text-content-secondary leading-relaxed">Subscription fees cover access to study materials and practice tests, not guaranteed rewards.</p>
                              </section>
                           </div>
                        </div>
                     </section>

                     {/* Subscriptions */}
                     <section id="subscriptions" className="bg-background-surface p-4 xl:p-8 rounded-3xl xl:rounded-3xl border border-border-primary space-y-6 xl:space-y-8">
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/10">
                              <CreditCard className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary">Subscription Terms</h2>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                           {[
                              { title: 'Plan Access', body: 'Provides access to all exam preparation features for your plan.', icon: Zap, color: 'primary' },
                              { title: 'Plan Duration', body: 'Prepaid plans remain active until the expiration date.', icon: Clock, color: 'primary' },
                              { title: 'Auto-Renewal', body: 'Your plan will automatically renew unless you cancel it.', icon: CircleCheck, color: 'primary' },
                              { title: 'Plan Upgrades', body: 'New pricing applies immediately when you upgrade your plan.', icon: ShieldCheck, color: 'primary' }
                           ].map((item, i) => (
                              <div key={i} className="flex gap-4 group">
                                 <div className={`w-12 h-12 bg-${item.color === 'primary' ? 'primary' : item.color}-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-${item.color === 'primary' ? 'primary' : item.color}-500/5 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-6 h-6 text-${item.color === 'primary' ? 'primary' : item.color}-500`} />
                                 </div>
                                 <div className="space-y-1">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-content-primary">{item.title}</h3>
                                    <p className="text-xs font-medium text-content-muted leading-relaxed">{item.body}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* Refund Exceptions */}
                     <section id="eligibility" className="dark:bg-slate-900 rounded-3xl xl:rounded-3xl p-4 md:p-6 xl:p-8 space-y-6 xl:space-y-8 relative overflow-hidden">

                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/20">
                              <CircleCheck className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Refund Exceptions</h2>
                        </div>

                        <div className="space-y-5 relative z-10">
                           <p className="text-sm font-medium text-content-secondary leading-relaxed max-w-xl">
                              Refunds are only considered for double payments or technical failures:
                           </p>

                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <section className="p-4 xl:p-5 rounded-3xl border border-primary-300 dark:border-white/10 space-y-2 xl:space-y-4 hover:border-primary-500/30 transition-all">
                                 <div className="flex items-center gap-4 text-primary-600">
                                    <TriangleAlert className="w-5 h-5" />
                                    <h3 className="text-xs font-bold uppercase tracking-[0.08em]">Double Payment</h3>
                                 </div>
                                 <p className="text-xs font-medium text-content-secondary leading-relaxed">When you are accidentally charged twice for the same plan.</p>
                              </section>
                              <section className="p-4 xl:p-5 rounded-3xl border border-primary-300 dark:border-white/10 space-y-2 xl:space-y-4 hover:border-primary-500/30 transition-all">
                                 <div className="flex items-center gap-4 text-primary-600">
                                    <Zap className="w-5 h-5" />
                                    <h3 className="text-xs font-bold uppercase tracking-[0.08em]">Activation Failure</h3>
                                 </div>
                                 <p className="text-xs font-medium text-content-secondary leading-relaxed">When payment is successful but features are not activated on your account.</p>
                              </section>
                           </div>

                           <div className="p-4 xl:p-6 rounded-3xl border-l-4 border-primary-600">
                              <p className="text-sm font-medium text-content-secondary leading-relaxed">
                                 <strong>REQUEST:</strong> Contact us within 7 days of payment. If approved, your refund will go back to the account you paid from within a few banking days.
                              </p>
                           </div>
                        </div>
                     </section>

                     {/* Contact Section */}
                     <section id="contact" className="group">
                        <section className="bg-background-surface p-4 md:p-6 xl:p-8 rounded-3xl xl:rounded-3xl space-y-5 border-none relative overflow-hidden">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/10">
                                 <Mail className="w-6 h-6" />
                              </div>
                              <section className="space-y-1">
                                 <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Contact Information</h2>
                                 <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">PAYMENT SUPPORT</p>
                              </section>
                           </div>
                           <address className="not-italic p-4 xl:p-4 xl:p-5 bg-background-surface rounded-3xl space-y-2 xl:space-y-4 border border-border-primary group-hover:border-primary-500/20 transition-all">
                              <p className="text-sm font-bold text-content-muted uppercase tracking-[0.08em]">Support Email:</p>
                              <p className="text-xl xl:text-2xl font-bold text-primary-600 tracking-tight">{config.CONTACT.EMAIL}</p>
                           </address>
                           <button
                              onClick={() => router.push('/student/dashboard')}
                              className="w-full bg-slate-900 dark:bg-slate-700 text-white py-3 rounded-3xl font-bold uppercase tracking-[0.08em] text-xs active:scale-95 transition-all font-outfit"
                           >
                              BACK TO HOME
                           </button>
                        </section>
                     </section>

                     <footer className="text-center pt-4 border-t border-border-primary">
                        <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">
                           LAST UPDATED: 1st April 2026
                        </p>
                     </footer>

                  </article>
            </div>

         </div>
      </MobileAppWrapper>
   );
};

export default RefundPolicy;


