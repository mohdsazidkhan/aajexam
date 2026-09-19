'use client';

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
import { motion } from 'framer-motion';

import MobileAppWrapper from '../MobileAppWrapper';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';

const RefundPolicy = () => {
   const router = useRouter();

   const sections = [
      { id: 'general', title: '1. General Policy', icon: Ban, color: 'primary' },
      { id: 'subscriptions', title: '2. Subscriptions', icon: CreditCard, color: 'primary' },
      { id: 'payments', title: '3. Payments & Invoicing', icon: Banknote, color: 'primary' },
      { id: 'eligibility', title: '4. Refund Exceptions', icon: CircleCheck, color: 'primary' },
      { id: 'rewards', title: '5. Rewards Policy', icon: Gift, color: 'primary' },
      { id: 'chargebacks', title: '6. Chargebacks', icon: TriangleAlert, color: 'primary' },
      { id: 'responsible', title: '7. Responsible Use', icon: ShieldCheck, color: 'primary' },
      { id: 'contact', title: '8. Contact Information', icon: Mail, color: 'primary' }
   ];

   return (
      <MobileAppWrapper title="Refund Policy">
         <div className="min-h-screen font-outfit pb-20 selection:bg-primary-700 selection:text-white mt-0">

            {/* --- Header Section --- */}
            <div className="relative overflow-hidden py-8 lg:py-16 border-b-2 border-slate-100 dark:border-slate-800">
               <div className="container mx-auto px-6 lg:px-10 relative z-10 text-center space-y-8">
                  <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm flex items-center justify-center mx-auto border-2 border-slate-50 dark:border-slate-700"
                  >
                     <Banknote className="w-14 h-14 text-primary-700" />
                  </motion.div>
                  <div className="space-y-2 lg:space-y-4">
                     <h1 className="text-xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
                        Refund <span className="text-primary-700">Policy</span>
                     </h1>
                     <p className="text-xs lg:text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] max-w-2xl mx-auto px-6">
                        SUBSCRIPTION TERMS AND REFUND CONDITIONS
                     </p>
                  </div>
               </div>
               {/* Background Grid Pattern */}
            </div>

            <div>

                  {/* --- Content Main --- */}
                  <main className="space-y-12">

                     {/* Introduction */}
                     <section id="intro" className="group mt-4">
                        <div className="bg-white dark:bg-slate-800 p-4 lg:p-8 rounded-[2rem] lg:rounded-[4rem] shadow-sm border-none relative overflow-hidden text-center">
                           <p className="text-md lg:text-lg leading-[2] text-slate-600 dark:text-slate-400 font-medium italic">
                              Thank you for using <strong>AajExam</strong>. Please read this policy before buying a plan. By paying for a plan, you agree to the rules below.
                           </p>
                        </div>
                     </section>

                     {/* 1. General Policy */}
                     <section id="general" className="bg-white dark:bg-slate-800 p-4 lg:p-12 lg:p-20 rounded-[2rem] lg:rounded-[4rem] shadow-sm space-y-12 border-none ring-8 ring-black/10 dark:ring-white/10">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-3xl flex items-center justify-center shadow-sm border-2 border-black/10 dark:border-white/10">
                              <Ban className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">1. General Policy</h2>
                        </div>

                        <div className="space-y-10 relative z-10">
                           <div className="p-8 bg-black/10 dark:bg-white/10 rounded-[3rem] border-2 border-black/20 dark:border-white/20 text-black dark:text-white text-center">
                              <p className="text-lg font-black uppercase tracking-widest leading-none">
                                 ALL SUBSCRIPTIONS ARE FINAL & NON-REFUNDABLE.
                              </p>
                           </div>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="p-4 lg:p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-2 lg:space-y-4">
                                 <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">No Refund Condition</h4>
                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Access to the platform is provided regardless of your test performance or leaderboard rank.</p>
                              </div>
                              <div className="p-4 lg:p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-2 lg:space-y-4">
                                 <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Content Access</h4>
                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Subscription fees cover access to study materials and practice tests, not guaranteed rewards.</p>
                              </div>
                           </div>
                        </div>
                     </section>

                     {/* 2. Subscriptions */}
                     <section id="subscriptions" className="bg-white dark:bg-slate-800 p-4 lg:p-12 lg:p-20 rounded-[2rem] lg:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 space-y-12">
                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-primary-500/10 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                              <CreditCard className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">2. Subscription Terms</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {[
                              { title: 'Plan Access', body: 'Provides access to all exam preparation features for your plan.', icon: Zap, color: 'primary' },
                              { title: 'Plan Duration', body: 'Prepaid plans remain active until the expiration date.', icon: Clock, color: 'primary' },
                              { title: 'Auto-Renewal', body: 'Your plan will automatically renew unless you cancel it.', icon: CircleCheck, color: 'primary' },
                              { title: 'Plan Upgrades', body: 'New pricing applies immediately when you upgrade your plan.', icon: ShieldCheck, color: 'primary' }
                           ].map((item, i) => (
                              <div key={i} className="flex gap-6 group">
                                 <div className={`w-12 h-12 bg-${item.color === 'primary' ? 'primary' : item.color}-500/10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-${item.color === 'primary' ? 'primary' : item.color}-500/5 group-hover:scale-110 transition-transform shadow-sm`}>
                                    <item.icon className={`w-6 h-6 text-${item.color === 'primary' ? 'primary' : item.color}-500`} />
                                 </div>
                                 <div className="space-y-1">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.title}</h4>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{item.body}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* 4. Refund Exceptions */}
                     <section id="eligibility" className="bg-slate-900 rounded-[2rem] lg:rounded-[4rem] p-4 md:p-12 lg:p-20 space-y-12 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" />

                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-primary-500/20 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/20">
                              <CircleCheck className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-white leading-none">4. Refund Exceptions</h2>
                        </div>

                        <div className="space-y-10 relative z-10">
                           <p className="text-sm font-medium text-slate-400 leading-loose max-w-xl">
                              Refunds are only considered for double payments or technical failures:
                           </p>

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="p-8 bg-white/5 rounded-[3rem] border-2 border-white/10 space-y-2 lg:space-y-4 hover:border-primary-500/30 transition-all">
                                 <div className="flex items-center gap-4 text-primary-700">
                                    <TriangleAlert className="w-5 h-5" />
                                    <h4 className="text-xs font-black uppercase tracking-widest">Double Payment</h4>
                                 </div>
                                 <p className="text-xs font-medium text-slate-400 leading-relaxed">When you are accidentally charged twice for the same plan.</p>
                              </div>
                              <div className="p-8 bg-white/5 rounded-[3rem] border-2 border-white/10 space-y-2 lg:space-y-4 hover:border-primary-500/30 transition-all">
                                 <div className="flex items-center gap-4 text-primary-700">
                                    <Zap className="w-5 h-5" />
                                    <h4 className="text-xs font-black uppercase tracking-widest">Activation Failure</h4>
                                 </div>
                                 <p className="text-xs font-medium text-slate-400 leading-relaxed">When payment is successful but features are not activated on your account.</p>
                              </div>
                           </div>

                           <div className="p-10 bg-primary-500/10 rounded-[3rem] border-l-8 border-primary-700">
                              <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                 <strong>REQUEST:</strong> Contact us within 7 days of payment. If approved, your refund will go back to the account you paid from within a few banking days.
                              </p>
                           </div>
                        </div>
                     </section>

                     {/* Contact Section */}
                     <section id="contact" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-sm space-y-10 border-none relative overflow-hidden">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-primary-500/10 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                                 <Mail className="w-8 h-8" />
                              </div>
                              <div className="space-y-1">
                                 <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">8. Contact Information</h2>
                                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">PAYMENT SUPPORT</p>
                              </div>
                           </div>
                           <div className="p-4 lg:p-8 bg-white dark:bg-slate-900/50 rounded-[2.5rem] space-y-2 lg:space-y-4 border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/20 transition-all shadow-sm">
                              <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Support Email:</p>
                              <p className="text-xl lg:text-2xl font-black text-primary-700 tracking-tight">support@mohdsazidkhan.com</p>
                           </div>
                           <button
                              onClick={() => router.push('/home')}
                              className="w-full bg-slate-900 dark:bg-slate-700 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-sm active:scale-95 transition-all font-outfit"
                           >
                              BACK TO HOME
                           </button>
                        </div>
                     </section>

                     <div className="text-center pt-20 border-t-2 border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
                           LAST UPDATED: 1st April 2026
                        </p>
                     </div>

                  </main>
            </div>

         </div>
      </MobileAppWrapper>
   );
};

export default RefundPolicy;


