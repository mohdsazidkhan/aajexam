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
      { id: 'eligibility', title: '2. User Eligibility', icon: UserCheck, color: 'primary' },
      { id: 'subscription', title: '3. Subscription & Payments', icon: Users, color: 'primary' },
      { id: 'rewards', title: '4. Reward Programs', icon: Gift, color: 'primary' },
      { id: 'prohibited', title: '5. Prohibited Activities', icon: Ban, color: 'primary' },
      { id: 'intellectual', title: '6. Intellectual Property', icon: Lock, color: 'primary' },
      { id: 'liability', title: '7. Limitation of Liability', icon: Gavel, color: 'slate' },
      { id: 'modifications', title: '8. Modifications', icon: TriangleAlert, color: 'primary' },
      { id: 'governing', title: '9. Governing Law', icon: Scale, color: 'primary' },
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

         <div className="min-h-screen font-outfit pb-20 selection:bg-primary-700 selection:text-white mt-0">

            {/* --- Header Section --- */}
            <div className="relative overflow-hidden py-8 lg:py-16 border-b-2 border-slate-100 dark:border-slate-800">
               <div className="container mx-auto px-6 lg:px-10 relative z-10 text-center space-y-8">
                  <motion.div
                     initial={{ rotate: -10, opacity: 0 }}
                     animate={{ rotate: 0, opacity: 1 }}
                     className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm flex items-center justify-center mx-auto border-2 border-slate-50 dark:border-slate-700"
                  >
                     <FileContract className="w-14 h-14 text-primary-700" />
                  </motion.div>
                  <div className="space-y-4">
                     <h1 className="text-xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
                        Terms of <span className="text-primary-700">Service</span>
                     </h1>
                     <p className="text-xs lg:text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] max-w-2xl mx-auto px-6">
                        RULES AND GUIDELINES FOR USING OUR PLATFORM
                     </p>
                  </div>
               </div>
               {/* Background Grid Pattern */}
            </div>

            <div>

                  {/* --- Content Main --- */}
                  <main className="space-y-12">

                     {/* 1. Acceptance of Terms */}
                     <section id="acceptance" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 lg:p-12 rounded-[2rem] lg:rounded-[4rem] shadow-sm border-none relative overflow-hidden mt-4">
                           <div className="flex items-center gap-6 mb-10">
                              <div className="w-16 h-16 bg-primary-500/10 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                                 <CircleCheck className="w-8 h-8" />
                              </div>
                              <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
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

                     {/* 2. User Eligibility */}
                     <section id="eligibility" className="bg-white dark:bg-slate-800 p-4 lg:p-12 lg:p-20 rounded-[2rem] lg:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 space-y-12">
                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-primary-500/10 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
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
                                 <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/20 transition-all shadow-sm">
                                    <item.icon className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-primary-700" />
                                 </div>
                                 <div className="space-y-2">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.title}</h4>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{item.body}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* 3. Subscription & Payments */}
                     <section id="subscription" className="bg-slate-900 rounded-[2rem] lg:rounded-[4rem] p-4 md:p-12 lg:p-20 space-y-12 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" />

                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-primary-500/20 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/20">
                              <Users className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-white">3. Subscription Plans</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                           <div className="p-8 bg-white/5 rounded-[2.5rem] border-2 border-white/10 space-y-4">
                              <h4 className="text-primary-700 font-black uppercase tracking-widest text-xs">Free Plan</h4>
                              <p className="text-sm font-medium text-slate-400">Access to Levels 0-9 for basic exam preparation.</p>
                           </div>
                           <div className="p-8 bg-primary-500/10 rounded-[2.5rem] border-2 border-primary-500/20 space-y-4 shadow-sm group hover:scale-[1.02] transition-transform">
                              <div className="flex justify-between items-center">
                                 <h4 className="text-white font-black uppercase tracking-widest text-xs">Pro Plan</h4>
                                 <Zap className="w-4 h-4 text-primary-700" />
                              </div>
                              <p className="text-sm font-medium text-slate-200">Complete access to all levels, advanced features, and premium study materials.</p>
                           </div>
                        </div>

                        <div className="p-10 bg-white/5 rounded-[3.5rem] border-l-8 border-primary-700 relative z-10">
                           <p className="text-sm font-medium text-slate-400 leading-relaxed">
                              <strong className="text-primary-700">PAYMENT TERMS:</strong> All subscription fees are processed securely and are non-refundable. If your account is banned for breaking rules, you will not receive a refund.
                           </p>
                        </div>
                     </section>

                     {/* 4. Reward Programs */}
                     <section id="rewards" className="bg-white dark:bg-slate-800 p-4 lg:p-12 xl:p-20 rounded-[1rem] lg:rounded-[4rem] shadow-sm space-y-12 border-none">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-3xl flex items-center justify-center shadow-sm border-2 border-black/10 dark:border-white/10">
                              <Gift className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">4. Reward Rules</h2>
                        </div>

                        <div className="space-y-10">
                           <div className="p-4 lg:p-8 bg-white dark:bg-slate-900/50 rounded-[3rem] space-y-6 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white px-2">How Rewards Work</h4>
                              <ul className="space-y-8">
                                 <li className="flex gap-6">
                                    <div className="w-2.5 h-10 bg-primary-700 rounded-full shrink-0"/>
                                    <div>
                                       <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest mb-1">Daily Challenges</p>
                                       <p className="text-xs font-medium text-slate-600 dark:text-slate-400 px-0">Earn rewards through daily, weekly, and monthly effort.</p>
                                    </div>
                                 </li>
                                 <li className="flex gap-6">
                                    <div className="w-2.5 h-10 bg-primary-700 rounded-full shrink-0"/>
                                    <div>
                                       <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest mb-1">Referral Bonus</p>
                                       <p className="text-xs font-medium text-slate-600 dark:text-slate-400 px-0">Earn bonuses for inviting your friends to join the platform.</p>
                                    </div>
                                 </li>
                              </ul>
                           </div>
                        </div>
                     </section>

                     {/* 5. Prohibited Activities */}
                     <section id="prohibited" className="bg-white dark:bg-slate-800 p-4 lg:p-12 lg:p-20 rounded-[2rem] lg:rounded-[4rem] shadow-sm space-y-12 border-none ring-8 ring-black/10 dark:ring-white/10">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-3xl flex items-center justify-center shadow-sm border-2 border-black/10 dark:border-white/10">
                              <Ban className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">5. Account Termination</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                           {[
                              'Scripted Automation', 'External Resource Collusion', 'Using Multiple Accounts', 'Referral Link Fraud', 'Pretending to be Someone Else', 'Abusive Behavior'
                           ].map((ban, i) => (
                              <div key={i} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                 <TriangleAlert className="w-4 h-4 text-black dark:text-white" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{ban}</span>
                              </div>
                           ))}
                        </div>

                        <div className="p-10 bg-black/10 dark:bg-white/10 rounded-[3rem] border-2 border-black/20 dark:border-white/20 text-black dark:text-white text-center">
                           <p className="text-sm font-bold text-black dark:text-white leading-loose">
                              Any violation of these rules will result in a permanent account ban.
                           </p>
                        </div>
                     </section>

                     {/* IP & Liability */}
                     <div className="grid grid-cols-1 gap-10">
                        <section id="intellectual" className="bg-white dark:bg-slate-800 p-4 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-10">
                           <div className="w-20 h-20 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-sm border-2 border-black/5 dark:border-white/5">
                              <Lock className="w-10 h-10" />
                           </div>
                           <div className="space-y-3 text-center lg:text-left">
                              <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">6. Intellectual Property</h3>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-loose">All content, quizzes, and branding are the exclusive property of AajExam and are protected by law.</p>
                           </div>
                        </section>

                        <section id="liability" className="bg-white dark:bg-slate-800 p-4 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-10">
                           <div className="w-20 h-20 bg-slate-500/10 text-slate-700 dark:text-slate-400 rounded-[2rem] flex items-center justify-center shrink-0 shadow-sm border-2 border-slate-500/5">
                              <Gavel className="w-10 h-10" />
                           </div>
                           <div className="space-y-3 text-center lg:text-left">
                              <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">7. Liability Disclaimer</h3>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-loose">Our content is provided "as-is". We provide study tools but do not guarantee success in government examinations.</p>
                           </div>
                        </section>
                     </div>

                     {/* Contact Section */}
                     <section id="contact" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-sm space-y-10 border-none relative overflow-hidden">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-primary-500/10 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                                 <Mail className="w-8 h-8" />
                              </div>
                              <div className="space-y-1">
                                 <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">10. Contact Information</h2>
                                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">LEGAL AND SUPPORT</p>
                              </div>
                           </div>
                           <div className="p-4 lg:p-8 bg-white dark:bg-slate-900/50 rounded-[2.5rem] space-y-4 border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/20 transition-all shadow-sm">
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
      </MobileAppWrapper>
   );
};

export default TermsAndConditions;


