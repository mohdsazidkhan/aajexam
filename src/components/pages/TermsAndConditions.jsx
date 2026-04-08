'use client';

import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
   FileSignature as FileContract,
   ShieldCheck,
   Users,
   Gift,
   Ban,
   TriangleAlert,
   CircleCheck,
   Info,
   UserCheck,
   Gavel,
   Lock,
   ChevronRight,
   Zap,
   Mail,
   Scale
} from 'lucide-react';
import { motion } from 'framer-motion';

import MobileAppWrapper from '../MobileAppWrapper';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';
import AuthorBio from '../AuthorBio';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';

const TermsAndConditions = () => {
   const router = useRouter();
   const canonicalUrl = getCanonicalUrl(router.asPath);
   const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Terms & Conditions' }
   ]);

   const sections = [
      { id: 'acceptance', title: '1. Acceptance of Terms', icon: CircleCheck, color: 'primary' },
      { id: 'eligibility', title: '2. User Eligibility', icon: UserCheck, color: 'secondary' },
      { id: 'subscription', title: '3. Subscription & Payments', icon: Users, color: 'emerald' },
      { id: 'rewards', title: '4. Reward Programs', icon: Gift, color: 'amber' },
      { id: 'prohibited', title: '5. Prohibited Activities', icon: Ban, color: 'rose' },
      { id: 'intellectual', title: '6. Intellectual Property', icon: Lock, color: 'indigo' },
      { id: 'liability', title: '7. Limitation of Liability', icon: Gavel, color: 'slate' },
      { id: 'modifications', title: '8. Modifications', icon: TriangleAlert, color: 'orange' },
      { id: 'governing', title: '9. Governing Law', icon: Scale, color: 'blue' },
      { id: 'contact', title: '10. Contact Information', icon: Mail, color: 'primary' }
   ];

   return (
      <MobileAppWrapper title="Terms & Conditions">
         <Head>
            <link rel="canonical" href={canonicalUrl} />
            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
         </Head>

         <div className="min-h-screen font-outfit pb-20 selection:bg-primary-500 selection:text-white mt-0">

            {/* --- Header Section --- */}
            <div className="relative overflow-hidden py-8 lg:py-16  border-b-4 border-slate-100 dark:border-slate-800 ">
               <div className="container mx-auto px-6 lg:px-10 relative z-10 text-center space-y-8">
                  <motion.div
                     initial={{ rotate: -10, opacity: 0 }}
                     animate={{ rotate: 0, opacity: 1 }}
                     className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto border-4 border-slate-50 dark:border-slate-700"
                  >
                     <FileContract className="w-14 h-14 text-primary-700 dark:text-primary-500" />
                  </motion.div>
                  <div className="space-y-4">
                     <h1 className="text-xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
                        Terms of <span className="text-primary-700 dark:text-primary-500">Service</span>
                     </h1>
                     <p className="text-xs lg:text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] max-w-2xl mx-auto px-6">
                        RULES AND GUIDELINES FOR USING OUR PLATFORM
                     </p>
                  </div>
               </div>
               {/* Background Grid Pattern */}
               <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="container mx-auto max-w-7xl">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                  {/* --- Sidebar Index --- */}
                  <aside className="lg:col-span-4 hidden lg:block">
                     <div className="sticky top-24 space-y-8">
                        <div className="bg-white dark:bg-slate-800 p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] shadow-xl border-2 border-slate-100 dark:border-slate-800">
                           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary-700 mb-8 px-2">Table of Contents</h3>
                           <nav className="space-y-2">
                              {sections.map((section) => (
                                 <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-primary-700 dark:text-primary-500 transition-all font-black text-[10px] uppercase tracking-widest group"
                                 >
                                    <section.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    {section.title}
                                 </a>
                              ))}
                           </nav>
                        </div>

                        <div className="bg-slate-900 text-white p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] shadow-xl border-l-[10px] border-primary-500 relative overflow-hidden">
                           <Gavel className="absolute -bottom-8 -right-8 w-20 lg:w-32 h-20 lg:h-32 text-white/5" />
                           <div className="relative z-10 space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Agreement</p>
                              <h4 className="text-xl font-black uppercase tracking-tight">Acceptance of Terms</h4>
                              <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">By using our platform, you agree to follow these terms and conditions.</p>
                           </div>
                        </div>
                     </div>
                  </aside>

                  {/* --- Content Main --- */}
                  <main className="lg:col-span-8 space-y-12">

                     {/* 1. Acceptance of Terms */}
                     <section id="acceptance" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 lg:p-12 rounded-[2rem] lg:rounded-[4rem] shadow-duo-primary border-none relative overflow-hidden mt-4">
                           <div className="flex items-center gap-6 mb-10">
                              <div className="w-16 h-16 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-primary-500/10">
                                 <CircleCheck className="w-8 h-8" />
                              </div>
                              <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
                           </div>
                           <div className="space-y-6">
                              <p className="text-md leading-relaxed text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
                                 Welcome to <strong>AajExam</strong>, India's premier government exam preparation platform. These Terms and Conditions ("Terms") constitute a legally binding agreement between you and AajExam governing your access to and use of our platform.
                              </p>
                              <p className="text-md leading-relaxed text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight italic border-l-4 border-primary-500/20 pl-8">
                                 AajExam is a <strong>100% knowledge-based learning platform</strong>. It is built to help students practice for government exams. There is no gambling or luck involved — only your hard work.
                              </p>
                           </div>
                        </div>
                     </section>

                     {/* 2. User Eligibility */}
                     <section id="eligibility" className="bg-white dark:bg-slate-800 p-4 lg:p-12 lg:p-20 rounded-[2rem] lg:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 space-y-12">
                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-primary-500/10">
                              <UserCheck className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">2. User Eligibility</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                           {[
                              { title: 'Age Requirement', body: 'Minimum 14 years of age. Users 14-18 require guardian consent.', icon: UserCheck },
                              { title: 'One Account Only', body: 'Only one account is allowed per user. Creating multiple accounts may lead to a permanent ban.', icon: ShieldCheck },
                              { title: 'Correct Information', body: 'You agree that all information provided during registration is 100% accurate.', icon: Info }
                           ].map((item, i) => (
                              <div key={i} className="flex gap-8 group">
                                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/20 transition-all shadow-sm">
                                    <item.icon className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-primary-700" />
                                 </div>
                                 <div className="space-y-2">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.title}</h4>
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight leading-relaxed">{item.body}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* 3. Subscription & Payments */}
                     <section id="subscription" className="bg-slate-900 rounded-[2rem]  lg:rounded-[4rem] p-4 md:p-12 lg:p-20 space-y-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-emerald-500/20">
                              <Users className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-white">3. Subscription Plans</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                           <div className="p-8 bg-white/5 rounded-[2.5rem] border-2 border-white/10 space-y-4">
                              <h4 className="text-emerald-500 font-black uppercase tracking-widest text-xs">Free Plan</h4>
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Access to Levels 0-9 for basic exam preparation.</p>
                           </div>
                           <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border-2 border-emerald-500/20 space-y-4 shadow-duo-emerald group hover:scale-[1.02] transition-transform">
                              <div className="flex justify-between items-center">
                                 <h4 className="text-white font-black uppercase tracking-widest text-xs">Pro Plan</h4>
                                 <Zap className="w-4 h-4 text-emerald-500" />
                              </div>
                              <p className="text-sm font-bold text-slate-200 uppercase tracking-tight">Complete access to all levels, advanced features, and premium study materials.</p>
                           </div>
                        </div>

                        <div className="p-10 bg-white/5 rounded-[3.5rem] border-l-8 border-emerald-500 relative z-10">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                              <strong className="text-emerald-500">PAYMENT TERMS:</strong> ALL SUBSCRIPTION FEES ARE PROCESSED SECURELY AND ARE NON-REFUNDABLE. IF YOUR ACCOUNT IS BANNED FOR BREAKING RULES, YOU WILL NOT RECEIVE A REFUND.
                           </p>
                        </div>
                     </section>

                     {/* 4. Reward Programs */}
                     <section id="rewards" className="bg-white dark:bg-slate-800 p-4 lg:p-12 xl:p-20 rounded-[1rem] lg:rounded-[4rem] shadow-duo-primary space-y-12 border-none">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-amber-500/10">
                              <Gift className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">4. Reward Rules</h2>
                        </div>

                        <div className="space-y-10">
                           <div className="p-4 lg:p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] space-y-6 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white px-2">How Rewards Work</h4>
                              <ul className="space-y-8">
                                 <li className="flex gap-6">
                                    <div className="w-2.5 h-10 bg-amber-500 rounded-full shrink-0" />
                                    <div>
                                       <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Daily Challenges</p>
                                       <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight px-0">Earn rewards through daily, weekly, and monthly effort.</p>
                                    </div>
                                 </li>
                                 <li className="flex gap-6">
                                    <div className="w-2.5 h-10 bg-amber-500 rounded-full shrink-0" />
                                    <div>
                                       <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Referral Bonus</p>
                                       <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight px-0">Earn bonuses for inviting your friends to join the platform.</p>
                                    </div>
                                 </li>
                              </ul>
                           </div>
                        </div>
                     </section>

                     {/* 5. Prohibited Activities */}
                     <section id="prohibited" className="bg-white dark:bg-slate-800 p-4 lg:p-12 lg:p-20 rounded-[2rem] lg:rounded-[4rem] shadow-duo-secondary space-y-12 border-none ring-8 ring-rose-500/5">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-rose-500/10">
                              <Ban className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">5. Account Termination</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                           {[
                              'Scripted Automation', 'External Resource Collusion', 'Using Multiple Accounts', 'Referral Link Fraud', 'Pretending to be Someone Else', 'Abusive Behavior'
                           ].map((ban, i) => (
                              <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                 <TriangleAlert className="w-4 h-4 text-rose-500" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{ban}</span>
                              </div>
                           ))}
                        </div>

                        <div className="p-10 bg-rose-500/10 rounded-[3rem] border-2 border-rose-500/20 text-rose-600 dark:text-rose-400 text-center">
                           <p className="text-sm font-black uppercase tracking-widest leading-loose">
                              ANY VIOLATION OF THESE RULES WILL RESULT IN A PERMANENT ACCOUNT BAN.
                           </p>
                        </div>
                     </section>

                     {/* IP & Liability */}
                     <div className="grid grid-cols-1 gap-10">
                        <section id="intellectual" className="bg-white dark:bg-slate-800 p-4 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-10">
                           <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner border-2 border-indigo-500/5">
                              <Lock className="w-10 h-10" />
                           </div>
                           <div className="space-y-3 text-center lg:text-left">
                              <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">6. Intellectual Property</h3>
                              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] leading-loose">ALL CONTENT, QUIZZES, AND BRANDING ARE THE EXCLUSIVE PROPERTY OF AAJEXAM AND ARE PROTECTED BY LAW.</p>
                           </div>
                        </section>

                        <section id="liability" className="bg-white dark:bg-slate-800 p-4 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-10">
                           <div className="w-20 h-20 bg-slate-500/10 text-slate-700 dark:text-slate-400 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner border-2 border-slate-500/5">
                              <Gavel className="w-10 h-10" />
                           </div>
                           <div className="space-y-3 text-center lg:text-left">
                              <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">7. Liability Disclaimer</h3>
                              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] leading-loose">OUR CONTENT IS PROVIDED "AS-IS". WE PROVIDE STUDY TOOLS BUT DO NOT GUARANTEE SUCCESS IN GOVERNMENT EXAMINATIONS.</p>
                           </div>
                        </section>
                     </div>

                     {/* Contact Section */}
                     <section id="contact" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-duo-secondary space-y-10 border-none relative overflow-hidden">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-primary-500/10">
                                 <Mail className="w-8 h-8" />
                              </div>
                              <div className="space-y-1">
                                 <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">10. Contact Information</h2>
                                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">LEGAL AND SUPPORT</p>
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

                     <div className="pt-10">
                        <AuthorBio />
                     </div>

                     <div className="text-center pt-20 border-t-2 border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
                           LAST UPDATED: 1ST APRIL 2026
                        </p>
                     </div>

                  </main>
               </div>
            </div>

         </div>
      </MobileAppWrapper>
   );
};

export default TermsAndConditions;


