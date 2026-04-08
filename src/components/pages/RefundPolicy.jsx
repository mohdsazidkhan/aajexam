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
      { id: 'general', title: '1. General Policy', icon: Ban, color: 'rose' },
      { id: 'subscriptions', title: '2. Subscriptions', icon: CreditCard, color: 'secondary' },
      { id: 'payments', title: '3. Payments & Invoicing', icon: Banknote, color: 'emerald' },
      { id: 'eligibility', title: '4. Refund Exceptions', icon: CircleCheck, color: 'teal' },
      { id: 'rewards', title: '5. Rewards Policy', icon: Gift, color: 'amber' },
      { id: 'chargebacks', title: '6. Chargebacks', icon: TriangleAlert, color: 'orange' },
      { id: 'responsible', title: '7. Responsible Use', icon: ShieldCheck, color: 'primary' },
      { id: 'contact', title: '8. Contact Information', icon: Mail, color: 'primary' }
   ];

   return (
      <MobileAppWrapper title="Refund Policy">
         <div className="min-h-screen font-outfit pb-20 selection:bg-primary-500 selection:text-white mt-0">

            {/* --- Header Section --- */}
            <div className="relative overflow-hidden py-8 lg:py-16  border-b-4 border-slate-100 dark:border-slate-800 ">
               <div className="container mx-auto px-6 lg:px-10 relative z-10 text-center space-y-8">
                  <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-duo-secondary flex items-center justify-center mx-auto border-4 border-slate-50 dark:border-slate-700"
                  >
                     <Banknote className="w-14 h-14 text-emerald-500" />
                  </motion.div>
                  <div className="space-y-4">
                     <h1 className="text-xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
                        Refund <span className="text-emerald-500">Policy</span>
                     </h1>
                     <p className="text-xs lg:text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] max-w-2xl mx-auto px-6">
                        SUBSCRIPTION TERMS AND REFUND CONDITIONS
                     </p>
                  </div>
               </div>
               {/* Background Grid Pattern */}
               <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="container mx-auto max-w-7xl">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                  {/* --- Sidebar Index --- */}
                  <aside className="lg:col-span-4 hidden lg:block">
                     <div className="sticky top-24 space-y-8">
                        <div className="bg-white dark:bg-slate-800 p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] shadow-xl border-2 border-slate-100 dark:border-slate-800">
                           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600 mb-8 px-2">Table of Contents</h3>
                           <nav className="space-y-2">
                              {sections.map((section) => (
                                 <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-emerald-500 transition-all font-black text-[10px] uppercase tracking-widest group"
                                 >
                                    <section.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    {section.title}
                                 </a>
                              ))}
                           </nav>
                        </div>

                        <div className="bg-slate-900 text-white p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] shadow-xl border-l-[10px] border-emerald-500 relative overflow-hidden">
                           <ShieldCheck className="absolute -bottom-8 -right-8 w-20 lg:w-32 h-20 lg:h-32 text-white/5" />
                           <div className="relative z-10 space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Payment Status</p>
                              <h4 className="text-xl font-black uppercase tracking-tight">Account Activation</h4>
                              <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">Subscriptions provide immediate access to all features. Therefore, refunds are only provided under specific conditions.</p>
                           </div>
                        </div>
                     </div>
                  </aside>

                  {/* --- Content Main --- */}
                  <main className="lg:col-span-8 space-y-12">

                     {/* Introduction */}
                     <section id="intro" className="group mt-4">
                        <div className="bg-white dark:bg-slate-800 p-4  lg:p-8 rounded-[2rem]  lg:rounded-[4rem] shadow-duo-secondary border-none relative overflow-hidden text-center">
                           <p className="text-md lg:text-lg leading-[2] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight italic">
                              Thank you for using <strong>AajExam</strong>. Please read this policy before buying a plan. By paying for a plan, you agree to the rules below.
                           </p>
                        </div>
                     </section>

                     {/* 1. General Policy */}
                     <section id="general" className="bg-white dark:bg-slate-800 p-4 lg:p-12 lg:p-20 rounded-[2rem] lg:rounded-[4rem] shadow-duo-secondary space-y-12 border-none ring-8 ring-rose-500/5">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-rose-500/10">
                              <Ban className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">1. General Policy</h2>
                        </div>

                        <div className="space-y-10 relative z-10">
                           <div className="p-8 bg-rose-500/10 rounded-[3rem] border-2 border-rose-500/20 text-rose-600 dark:text-rose-400 text-center">
                              <p className="text-lg font-black uppercase tracking-widest leading-none">
                                 ALL SUBSCRIPTIONS ARE FINAL & NON-REFUNDABLE.
                              </p>
                           </div>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="p-4 lg:p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-4">
                                 <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">No Refund Condition</h4>
                                 <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight leading-relaxed">Access to the platform is provided regardless of your test performance or leaderboard rank.</p>
                              </div>
                              <div className="p-4 lg:p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-4">
                                 <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Content Access</h4>
                                 <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight leading-relaxed">Subscription fees cover access to study materials and practice tests, not guaranteed rewards.</p>
                              </div>
                           </div>
                        </div>
                     </section>

                     {/* 2. Subscriptions */}
                     <section id="subscriptions" className="bg-white dark:bg-slate-800 p-4 lg:p-12 lg:p-20 rounded-[2rem] lg:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 space-y-12">
                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-primary-500/10">
                              <CreditCard className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">2. Subscription Terms</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {[
                              { title: 'Plan Access', body: 'Provides access to all exam preparation features for your plan.', icon: Zap, color: 'secondary' },
                              { title: 'Plan Duration', body: 'Prepaid plans remain active until the expiration date.', icon: Clock, color: 'emerald' },
                              { title: 'Auto-Renewal', body: 'Your plan will automatically renew unless you cancel it.', icon: CircleCheck, color: 'primary' },
                              { title: 'Plan Upgrades', body: 'New pricing applies immediately when you upgrade your plan.', icon: ShieldCheck, color: 'indigo' }
                           ].map((item, i) => (
                              <div key={i} className="flex gap-6 group">
                                 <div className={`w-12 h-12 bg-${item.color === 'primary' ? 'primary' : item.color}-500/10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-${item.color === 'primary' ? 'primary' : item.color}-500/5 group-hover:scale-110 transition-transform shadow-sm`}>
                                    <item.icon className={`w-6 h-6 text-${item.color === 'primary' ? 'primary' : item.color}-500`} />
                                 </div>
                                 <div className="space-y-1">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.title}</h4>
                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight leading-relaxed">{item.body}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* 4. Refund Exceptions */}
                     <section id="eligibility" className="bg-slate-900 rounded-[2rem]  lg:rounded-[4rem] p-4 md:p-12 lg:p-20 space-y-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-emerald-500/20">
                              <CircleCheck className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-white leading-none">4. Refund Exceptions</h2>
                        </div>

                        <div className="space-y-10 relative z-10">
                           <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-loose max-w-xl">
                              Refunds are only considered for double payments or technical failures:
                           </p>

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="p-8 bg-white/5 rounded-[3rem] border-2 border-white/10 space-y-4 hover:border-emerald-500/30 transition-all">
                                 <div className="flex items-center gap-4 text-emerald-500">
                                    <TriangleAlert className="w-5 h-5" />
                                    <h4 className="text-xs font-black uppercase tracking-widest">Double Payment</h4>
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-relaxed">When you are accidentally charged twice for the same plan.</p>
                              </div>
                              <div className="p-8 bg-white/5 rounded-[3rem] border-2 border-white/10 space-y-4 hover:border-emerald-500/30 transition-all">
                                 <div className="flex items-center gap-4 text-emerald-500">
                                    <Zap className="w-5 h-5" />
                                    <h4 className="text-xs font-black uppercase tracking-widest">Activation Failure</h4>
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-relaxed">When payment is successful but features are not activated on your account.</p>
                              </div>
                           </div>

                           <div className="p-10 bg-emerald-500/10 rounded-[3rem] border-l-8 border-emerald-500">
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                                 <strong>REQUEST:</strong> Contact us within 7 days of payment. If approved, your refund will go back to the account you paid from within a few banking days.
                              </p>
                           </div>
                        </div>
                     </section>

                     {/* Contact Section */}
                     <section id="contact" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-duo-primary space-y-10 border-none relative overflow-hidden">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-primary-500/10">
                                 <Mail className="w-8 h-8" />
                              </div>
                              <div className="space-y-1">
                                 <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">8. Contact Information</h2>
                                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">PAYMENT SUPPORT</p>
                              </div>
                           </div>
                           <div className="p-4 lg:p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] space-y-4 border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/20 transition-all shadow-sm">
                              <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Support Email:</p>
                              <p className="text-xl lg:text-2xl font-black text-primary-700 dark:text-primary-500 tracking-tight">support@mohdsazidkhan.com</p>
                           </div>
                           <button
                              onClick={() => router.push('/home')}
                              className="w-full bg-slate-900 dark:bg-slate-700 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-xl active:scale-95 transition-all font-outfit"
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

         </div>
      </MobileAppWrapper>
   );
};

export default RefundPolicy;


