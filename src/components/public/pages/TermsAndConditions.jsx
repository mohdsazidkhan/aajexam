'use client';

import PageHero from '@/components/common/ui/PageHero';
import React from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
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
import { m as motion } from 'framer-motion';

import MobileAppWrapper from '../../common/MobileAppWrapper';
import config from '../../../lib/config/appConfig';
import UnifiedFooter from '../../common/UnifiedFooter';
import AuthorBio from '../../common/AuthorBio';
import { generateBreadcrumbSchema } from '../../../utils/schema';
import { getCanonicalUrl } from '../../../utils/seo';

const TermsAndConditions = () => {
   const router = useRouter();
   const canonicalUrl = getCanonicalUrl(router.asPath);
   const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Terms & Conditions' }
   ]);

   const sections = [
      { id: 'acceptance', title: 'Acceptance of Terms', icon: CircleCheck, color: 'primary' },
      { id: 'eligibility', title: 'User Eligibility', icon: UserCheck, color: 'primary' },
      { id: 'subscription', title: 'Subscription & Payments', icon: Users, color: 'primary' },
      { id: 'rewards', title: 'Reward Programs', icon: Gift, color: 'primary' },
      { id: 'prohibited', title: 'Prohibited Activities', icon: Ban, color: 'primary' },
      { id: 'intellectual', title: 'Intellectual Property', icon: Lock, color: 'primary' },
      { id: 'liability', title: 'Limitation of Liability', icon: Gavel, color: 'slate' },
      { id: 'modifications', title: 'Modifications', icon: TriangleAlert, color: 'primary' },
      { id: 'governing', title: 'Governing Law', icon: Scale, color: 'primary' },
      { id: 'contact', title: 'Contact Information', icon: Mail, color: 'primary' }
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

         <div className="min-h-screen font-outfit pb-6 selection:bg-primary-600 selection:text-white mt-0">

            <div className="container mx-auto pt-2 xl:pt-4">
               <PageHero
                  icon={FileContract}
                  title="Terms of Service"
               />
            </div>

            <div>

                  {/* --- Content Main --- */}
                  <main className="space-y-4 xl:space-y-5">

                     {/* Acceptance of Terms */}
                     <section id="acceptance" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 xl:p-8 rounded-[2rem] xl:rounded-[4rem] shadow-sm border-none relative overflow-hidden mt-4">
                           <div className="flex items-center gap-4 mb-5">
                              <div className="w-12 h-12 bg-primary-500/10 text-primary-600 dark:text-primary-300 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                                 <CircleCheck className="w-6 h-6" />
                              </div>
                              <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Acceptance of Terms</h2>
                           </div>
                           <div className="space-y-6">
                              <p className="text-md leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                 Welcome to <strong>AajExam</strong>, India's premier government exam preparation platform. These Terms and Conditions ("Terms") constitute a legally binding agreement between you and AajExam governing your access to and use of our platform.
                              </p>
                              <p className="text-md leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic border-l-4 border-primary-500/20 pl-8">
                                 AajExam is a <strong>100% knowledge-based learning platform</strong>. It is built to help students practice for government exams. There is no gambling or luck involved — only your hard work.
                              </p>
                           </div>
                        </div>
                     </section>

                     {/* User Eligibility */}
                     <section id="eligibility" className="bg-white dark:bg-slate-800 p-4 xl:p-8 rounded-[2rem] xl:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 space-y-6 xl:space-y-8">
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 bg-primary-500/10 text-primary-600 dark:text-primary-300 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                              <UserCheck className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">User Eligibility</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           {[
                              { title: 'Age Requirement', body: 'Minimum 14 years of age. Users 14-18 require guardian consent.', icon: UserCheck },
                              { title: 'One Account Only', body: 'Only one account is allowed per user. Creating multiple accounts may lead to a permanent ban.', icon: ShieldCheck },
                              { title: 'Correct Information', body: 'You agree that all information provided during registration is 100% accurate.', icon: Info }
                           ].map((item, i) => (
                              <div key={i} className="flex gap-4 group">
                                 <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/20 transition-all shadow-sm">
                                    <item.icon className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-primary-600" />
                                 </div>
                                 <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.title}</h3>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{item.body}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* Subscription & Payments */}
                     <section id="subscription" className="bg-primary-50 dark:bg-slate-900 rounded-[2rem] xl:rounded-[4rem] p-4 md:p-6 xl:p-8 space-y-6 xl:space-y-8 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" />

                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 bg-primary-500/20 text-primary-600 dark:text-primary-300 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/20">
                              <Users className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Subscription Plans</h2>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 relative z-10">
                           <div className="p-4 xl:p-5 bg-primary-600/10 dark:bg-white/5 rounded-[2.5rem] border-2 border-primary-300 dark:border-white/10 space-y-2 xl:space-y-4">
                              <h3 className="text-primary-600 dark:text-primary-300 font-black uppercase tracking-widest text-xs">Free Plan</h3>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Unlimited topic-wise practice, 2 subject tests/day, first full mock test free, and latest-year PYQs for every exam.</p>
                           </div>
                           <div className="p-4 xl:p-5 bg-primary-500/10 rounded-[2.5rem] border-2 border-primary-500/20 space-y-2 xl:space-y-4 shadow-sm group hover:scale-[1.02] transition-transform">
                              <div className="flex justify-between items-center">
                                 <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs">Pro Plan</h4>
                                 <Zap className="w-4 h-4 text-primary-600 dark:text-primary-300" />
                              </div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Unlimited subject tests & mock exams, every PYQ for every exam and year, AI Study Planner, Exam Readiness Score, and an ad-free experience.</p>
                           </div>
                        </div>

                        <div className="p-4 xl:p-6 bg-primary-600/10 dark:bg-white/5 rounded-[3.5rem] border-l-4 border-primary-600 relative z-10">
                           <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                              <strong className="text-primary-600 dark:text-primary-300">PAYMENT TERMS:</strong> All subscription fees are processed securely and are non-refundable. If your account is banned for breaking rules, you will not receive a refund.
                           </p>
                        </div>
                     </section>

                     {/* Reward Programs */}
                     <section id="rewards" className="bg-white dark:bg-slate-800 p-4 xl:p-5 rounded-[1rem] xl:rounded-[4rem] shadow-sm space-y-6 xl:space-y-8 border-none">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-3xl flex items-center justify-center shadow-sm border-2 border-black/10 dark:border-white/10">
                              <Gift className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Reward Rules</h2>
                        </div>

                        <div className="space-y-5">
                           <div className="p-4 xl:p-4 xl:p-5 bg-white dark:bg-slate-900/50 rounded-[3rem] space-y-6 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white px-2">How Rewards Work</h3>
                              <ul className="space-y-4">
                                 <li className="flex gap-6">
                                    <div className="w-2.5 h-10 bg-primary-600 rounded-full shrink-0"/>
                                    <div>
                                       <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest mb-1">Referral Bonus</p>
                                       <p className="text-xs font-medium text-slate-600 dark:text-slate-400 px-0">Earn bonuses for inviting your friends to join the platform.</p>
                                    </div>
                                 </li>
                              </ul>
                           </div>
                        </div>
                     </section>

                     {/* Prohibited Activities */}
                     <section id="prohibited" className="bg-white dark:bg-slate-800 p-4 xl:p-8 rounded-[2rem] xl:rounded-[4rem] shadow-sm space-y-6 xl:space-y-8 border-none ring-1 ring-black/10 dark:ring-white/10">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-3xl flex items-center justify-center shadow-sm border-2 border-black/10 dark:border-white/10">
                              <Ban className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Account Termination</h2>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                           {[
                              'Scripted Automation', 'External Resource Collusion', 'Using Multiple Accounts', 'Referral Link Fraud', 'Pretending to be Someone Else', 'Abusive Behavior'
                           ].map((ban, i) => (
                              <div key={i} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                 <TriangleAlert className="w-4 h-4 text-black dark:text-white" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{ban}</span>
                              </div>
                           ))}
                        </div>

                        <div className="p-4 xl:p-6 bg-black/10 dark:bg-white/10 rounded-[3rem] border-2 border-black/20 dark:border-white/20 text-black dark:text-white text-center">
                           <p className="text-sm font-bold text-black dark:text-white leading-relaxed">
                              Any violation of these rules will result in a permanent account ban.
                           </p>
                        </div>
                     </section>

                     {/* IP & Liability */}
                     <div className="grid grid-cols-1 gap-10">
                        <section id="intellectual" className="bg-white dark:bg-slate-800 p-4 xl:p-8 rounded-[2.5rem] xl:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row items-center gap-10">
                           <div className="w-20 h-20 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-sm border-2 border-black/5 dark:border-white/5">
                              <Lock className="w-10 h-10" />
                           </div>
                           <div className="space-y-3 text-center xl:text-left">
                              <h3 className="text-xl xl:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Intellectual Property</h3>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">All content, quizzes, and branding are the exclusive property of AajExam and are protected by law.</p>
                           </div>
                        </section>

                        <section id="liability" className="bg-white dark:bg-slate-800 p-4 xl:p-8 rounded-[2.5rem] xl:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row items-center gap-10">
                           <div className="w-20 h-20 bg-slate-500/10 text-slate-700 dark:text-slate-400 rounded-[2rem] flex items-center justify-center shrink-0 shadow-sm border-2 border-slate-500/5">
                              <Gavel className="w-10 h-10" />
                           </div>
                           <div className="space-y-3 text-center xl:text-left">
                              <h3 className="text-xl xl:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Liability Disclaimer</h3>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Our content is provided "as-is". We provide study tools but do not guarantee success in government examinations.</p>
                           </div>
                        </section>
                     </div>

                     {/* Contact Section */}
                     <section id="contact" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 xl:p-8 rounded-[2.5rem] xl:rounded-[4rem] shadow-sm space-y-5 border-none relative overflow-hidden">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-500/10 text-primary-600 dark:text-primary-300 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                                 <Mail className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                 <h2 className="text-xl xl:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Contact Information</h2>
                                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">LEGAL AND SUPPORT</p>
                              </div>
                           </div>
                           <div className="p-4 xl:p-4 xl:p-5 bg-white dark:bg-slate-900/50 rounded-[2.5rem] space-y-2 xl:space-y-4 border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/20 transition-all shadow-sm">
                              <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Support Email:</p>
                              <p className="text-xl xl:text-2xl font-black text-primary-600 dark:text-primary-300 tracking-tight">{config.CONTACT.EMAIL}</p>
                           </div>
                           <button
                              onClick={() => router.push('/student/dashboard')}
                              className="w-full bg-slate-900 dark:bg-slate-700 text-white py-3 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-sm active:scale-95 transition-all font-outfit"
                           >
                              BACK TO HOME
                           </button>
                        </div>
                     </section>

                     <div>
                        <AuthorBio />
                     </div>

                     <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
                           LAST UPDATED: 1ST APRIL 2026
                        </p>
                     </div>

                  </main>
            </div>

         </div>
      </MobileAppWrapper>
   );
};

export default TermsAndConditions;


