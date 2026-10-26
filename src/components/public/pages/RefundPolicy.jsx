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
                        <div className="bg-white dark:bg-slate-800 p-4 xl:p-8 rounded-[2rem] xl:rounded-[4rem] shadow-sm border-none relative overflow-hidden text-center">
                           <p className="text-md xl:text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic">
                              Thank you for using <strong>AajExam</strong>. Please read this policy before buying a plan. By paying for a plan, you agree to the rules below.
                           </p>
                        </div>
                     </section>

                     {/* General Policy */}
                     <section id="general" className="bg-white dark:bg-slate-800 p-4 xl:p-8 rounded-[2rem] xl:rounded-[4rem] shadow-sm space-y-6 xl:space-y-8 border-none ring-1 ring-black/10 dark:ring-white/10">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-3xl flex items-center justify-center shadow-sm border-2 border-black/10 dark:border-white/10">
                              <Ban className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">General Policy</h2>
                        </div>

                        <div className="space-y-5 relative z-10">
                           <div className="p-4 xl:p-5 bg-black/10 dark:bg-white/10 rounded-[3rem] border-2 border-black/20 dark:border-white/20 text-black dark:text-white text-center">
                              <p className="text-lg font-black uppercase tracking-widest leading-none">
                                 ALL SUBSCRIPTIONS ARE FINAL & NON-REFUNDABLE.
                              </p>
                           </div>
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <section className="p-4 xl:p-4 xl:p-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-2 xl:space-y-4">
                                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">No Refund Condition</h3>
                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Access to the platform is provided regardless of your test performance or leaderboard rank.</p>
                              </section>
                              <section className="p-4 xl:p-4 xl:p-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-2 xl:space-y-4">
                                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Content Access</h3>
                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Subscription fees cover access to study materials and practice tests, not guaranteed rewards.</p>
                              </section>
                           </div>
                        </div>
                     </section>

                     {/* Subscriptions */}
                     <section id="subscriptions" className="bg-white dark:bg-slate-800 p-4 xl:p-8 rounded-[2rem] xl:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 space-y-6 xl:space-y-8">
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 bg-primary-500/10 text-primary-600 dark:text-primary-300 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                              <CreditCard className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Subscription Terms</h2>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                           {[
                              { title: 'Plan Access', body: 'Provides access to all exam preparation features for your plan.', icon: Zap, color: 'primary' },
                              { title: 'Plan Duration', body: 'Prepaid plans remain active until the expiration date.', icon: Clock, color: 'primary' },
                              { title: 'Auto-Renewal', body: 'Your plan will automatically renew unless you cancel it.', icon: CircleCheck, color: 'primary' },
                              { title: 'Plan Upgrades', body: 'New pricing applies immediately when you upgrade your plan.', icon: ShieldCheck, color: 'primary' }
                           ].map((item, i) => (
                              <div key={i} className="flex gap-4 group">
                                 <div className={`w-12 h-12 bg-${item.color === 'primary' ? 'primary' : item.color}-500/10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-${item.color === 'primary' ? 'primary' : item.color}-500/5 group-hover:scale-110 transition-transform shadow-sm`}>
                                    <item.icon className={`w-6 h-6 text-${item.color === 'primary' ? 'primary' : item.color}-500`} />
                                 </div>
                                 <div className="space-y-1">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.title}</h3>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{item.body}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* Refund Exceptions */}
                     <section id="eligibility" className="bg-primary-50 dark:bg-slate-900 rounded-[2rem] xl:rounded-[4rem] p-4 md:p-6 xl:p-8 space-y-6 xl:space-y-8 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" />

                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 bg-primary-500/20 text-primary-600 dark:text-primary-300 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/20">
                              <CircleCheck className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Refund Exceptions</h2>
                        </div>

                        <div className="space-y-5 relative z-10">
                           <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                              Refunds are only considered for double payments or technical failures:
                           </p>

                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <section className="p-4 xl:p-5 bg-primary-600/10 dark:bg-white/5 rounded-[3rem] border-2 border-primary-300 dark:border-white/10 space-y-2 xl:space-y-4 hover:border-primary-500/30 transition-all">
                                 <div className="flex items-center gap-4 text-primary-600 dark:text-primary-300">
                                    <TriangleAlert className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest">Double Payment</h3>
                                 </div>
                                 <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">When you are accidentally charged twice for the same plan.</p>
                              </section>
                              <section className="p-4 xl:p-5 bg-primary-600/10 dark:bg-white/5 rounded-[3rem] border-2 border-primary-300 dark:border-white/10 space-y-2 xl:space-y-4 hover:border-primary-500/30 transition-all">
                                 <div className="flex items-center gap-4 text-primary-600 dark:text-primary-300">
                                    <Zap className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest">Activation Failure</h3>
                                 </div>
                                 <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">When payment is successful but features are not activated on your account.</p>
                              </section>
                           </div>

                           <div className="p-4 xl:p-6 bg-primary-500/10 rounded-[3rem] border-l-4 border-primary-600">
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                 <strong>REQUEST:</strong> Contact us within 7 days of payment. If approved, your refund will go back to the account you paid from within a few banking days.
                              </p>
                           </div>
                        </div>
                     </section>

                     {/* Contact Section */}
                     <section id="contact" className="group">
                        <section className="bg-white dark:bg-slate-800 p-4 md:p-6 xl:p-8 rounded-[2.5rem] xl:rounded-[4rem] shadow-sm space-y-5 border-none relative overflow-hidden">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-500/10 text-primary-600 dark:text-primary-300 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                                 <Mail className="w-6 h-6" />
                              </div>
                              <section className="space-y-1">
                                 <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Contact Information</h2>
                                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">PAYMENT SUPPORT</p>
                              </section>
                           </div>
                           <address className="not-italic p-4 xl:p-4 xl:p-5 bg-white dark:bg-slate-900/50 rounded-[2.5rem] space-y-2 xl:space-y-4 border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/20 transition-all shadow-sm">
                              <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Support Email:</p>
                              <p className="text-xl xl:text-2xl font-black text-primary-600 dark:text-primary-300 tracking-tight">{config.CONTACT.EMAIL}</p>
                           </address>
                           <button
                              onClick={() => router.push('/student/dashboard')}
                              className="w-full bg-slate-900 dark:bg-slate-700 text-white py-3 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-sm active:scale-95 transition-all font-outfit"
                           >
                              BACK TO HOME
                           </button>
                        </section>
                     </section>

                     <footer className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
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


