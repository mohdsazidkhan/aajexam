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
                  <article className="space-y-4 xl:space-y-5">

                     {/* Acceptance of Terms */}
                     <section id="acceptance" className="group">
                        <section className="bg-background-surface p-4 md:p-6 xl:p-8 rounded-3xl xl:rounded-3xl border-none relative overflow-hidden mt-4">
                           <div className="flex items-center gap-4 mb-5">
                              <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/10">
                                 <CircleCheck className="w-6 h-6" />
                              </div>
                              <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary">Acceptance of Terms</h2>
                           </div>
                           <div className="space-y-6">
                              <p className="text-md leading-relaxed text-content-secondary font-medium">
                                 Welcome to <strong>AajExam</strong>, India's premier government exam preparation platform. These Terms and Conditions ("Terms") constitute a legally binding agreement between you and AajExam governing your access to and use of our platform.
                              </p>
                              <p className="text-md leading-relaxed text-content-secondary font-medium italic border-l-4 border-primary-500/20 pl-8">
                                 AajExam is a <strong>100% knowledge-based learning platform</strong>. It is built to help students practice for government exams. There is no gambling or luck involved — only your hard work.
                              </p>
                           </div>
                        </section>
                     </section>

                     {/* User Eligibility */}
                     <section id="eligibility" className="bg-background-surface p-4 xl:p-8 rounded-3xl xl:rounded-3xl border border-border-primary space-y-6 xl:space-y-8">
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/10">
                              <UserCheck className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary">User Eligibility</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           {[
                              { title: 'Age Requirement', body: 'Minimum 14 years of age. Users 14-18 require guardian consent.', icon: UserCheck },
                              { title: 'One Account Only', body: 'Only one account is allowed per user. Creating multiple accounts may lead to a permanent ban.', icon: ShieldCheck },
                              { title: 'Correct Information', body: 'You agree that all information provided during registration is 100% accurate.', icon: Info }
                           ].map((item, i) => (
                              <div key={i} className="flex gap-4 group">
                                 <div className="w-12 h-12 bg-background-surface rounded-md flex items-center justify-center shrink-0 border border-primary-600 group-hover:border-primary-500/20 transition-all text-primary-600">
                                    <item.icon className="w-6 h-6 text-content-muted group-hover:text-primary-600" />
                                 </div>
                                 <div className="space-y-2">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-content-primary">{item.title}</h3>
                                    <p className="text-xs font-medium text-content-secondary leading-relaxed">{item.body}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* Subscription & Payments */}
                     <section id="subscription" className="dark:bg-slate-900 rounded-3xl xl:rounded-3xl p-4 md:p-6 xl:p-8 space-y-6 xl:space-y-8 relative overflow-hidden">

                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/20">
                              <Users className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary">Subscription Plans</h2>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 relative z-10">
                           <section className="p-4 xl:p-5 rounded-3xl border border-primary-300 dark:border-white/10 space-y-2 xl:space-y-4">
                              <h3 className="text-primary-600 font-bold uppercase tracking-[0.08em] text-xs">Free Plan</h3>
                              <p className="text-sm font-medium text-content-secondary">Unlimited topic-wise practice, 2 subject tests/day, first full mock test free, and latest-year PYQs for every exam.</p>
                           </section>
                           <div className="p-4 xl:p-5 rounded-3xl border border-primary-500/20 space-y-2 xl:space-y-4 group hover:scale-[1.02] transition-transform">
                              <div className="flex justify-between items-center">
                                 <h4 className="text-content-primary font-bold uppercase tracking-[0.08em] text-xs">Pro Plan</h4>
                                 <Zap className="w-4 h-4 text-primary-600" />
                              </div>
                              <p className="text-sm font-medium text-content-secondary">Unlimited subject tests & mock exams, every PYQ for every exam and year, AI Study Planner, Exam Readiness Score, and an ad-free experience.</p>
                           </div>
                        </div>

                        <div className="p-4 xl:p-6 rounded-3xl border-l-4 border-primary-600 relative z-10">
                           <p className="text-sm font-medium text-content-secondary leading-relaxed">
                              <strong className="text-primary-600">PAYMENT TERMS:</strong> All subscription fees are processed securely and are non-refundable. If your account is banned for breaking rules, you will not receive a refund.
                           </p>
                        </div>
                     </section>

                     {/* Reward Programs */}
                     <section id="rewards" className="bg-background-surface p-4 xl:p-5 rounded-2xl xl:rounded-3xl space-y-6 xl:space-y-8 border-none">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-content-primary rounded-3xl flex items-center justify-center border border-border-primary">
                              <Gift className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Reward Rules</h2>
                        </div>

                        <div className="space-y-5">
                           <section className="p-4 xl:p-4 xl:p-5 bg-background-surface rounded-3xl space-y-6 border border-border-primary">
                              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-content-primary px-2">How Rewards Work</h3>
                              <ul className="space-y-4">
                                 <li className="flex gap-6">
                                    <div className="w-2.5 h-10 bg-primary-600 rounded-full shrink-0"/>
                                    <div>
                                       <p className="text-[10px] font-bold text-content-primary uppercase tracking-[0.08em] mb-1">Referral Bonus</p>
                                       <p className="text-xs font-medium text-content-secondary px-0">Earn bonuses for inviting your friends to join the platform.</p>
                                    </div>
                                 </li>
                              </ul>
                           </section>
                        </div>
                     </section>

                     {/* Prohibited Activities */}
                     <section id="prohibited" className="bg-background-surface p-4 xl:p-8 rounded-3xl xl:rounded-3xl space-y-6 xl:space-y-8 border-none ring-1 ring-black/10 dark:ring-white/10">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-content-primary rounded-3xl flex items-center justify-center border border-border-primary">
                              <Ban className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Account Termination</h2>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                           {[
                              'Scripted Automation', 'External Resource Collusion', 'Using Multiple Accounts', 'Referral Link Fraud', 'Pretending to be Someone Else', 'Abusive Behavior'
                           ].map((ban, i) => (
                              <div key={i} className="flex items-center gap-4 p-5 bg-background-surface rounded-2xl border border-border-primary">
                                 <TriangleAlert className="w-4 h-4 text-content-primary" />
                                 <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary">{ban}</span>
                              </div>
                           ))}
                        </div>

                        <div className="p-4 xl:p-6 bg-black/10 dark:bg-white/10 rounded-3xl border border-border-primary text-content-primary text-center">
                           <p className="text-sm font-bold text-content-primary leading-relaxed">
                              Any violation of these rules will result in a permanent account ban.
                           </p>
                        </div>
                     </section>

                     {/* IP & Liability */}
                     <div className="grid grid-cols-1 gap-10">
                        <section id="intellectual" className="bg-background-surface p-4 xl:p-8 rounded-3xl xl:rounded-3xl border border-border-primary flex flex-col xl:flex-row items-center gap-10">
                           <div className="w-20 h-20 bg-black/10 dark:bg-white/10 text-content-primary rounded-3xl flex items-center justify-center shrink-0 border border-border-primary">
                              <Lock className="w-10 h-10" />
                           </div>
                           <div className="space-y-3 text-center xl:text-left">
                              <h3 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Intellectual Property</h3>
                              <p className="text-sm font-medium text-content-muted leading-relaxed">All content, quizzes, and branding are the exclusive property of AajExam and are protected by law.</p>
                           </div>
                        </section>

                        <section id="liability" className="bg-background-surface p-4 xl:p-8 rounded-3xl xl:rounded-3xl border border-border-primary flex flex-col xl:flex-row items-center gap-10">
                           <div className="w-20 h-20 bg-slate-500/10 text-content-secondary rounded-3xl flex items-center justify-center shrink-0 border border-slate-500/5">
                              <Gavel className="w-10 h-10" />
                           </div>
                           <div className="space-y-3 text-center xl:text-left">
                              <h3 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Liability Disclaimer</h3>
                              <p className="text-sm font-medium text-content-muted leading-relaxed">Our content is provided "as-is". We provide study tools but do not guarantee success in government examinations.</p>
                           </div>
                        </section>
                     </div>

                     {/* Contact Section */}
                     <section id="contact" className="group">
                        <section className="bg-background-surface p-4 md:p-6 xl:p-8 rounded-3xl xl:rounded-3xl space-y-5 border-none relative overflow-hidden">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/10">
                                 <Mail className="w-6 h-6" />
                              </div>
                              <section className="space-y-1">
                                 <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Contact Information</h2>
                                 <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">LEGAL AND SUPPORT</p>
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

                     <div>
                        <AuthorBio />
                     </div>

                     <footer className="text-center pt-4 border-t border-border-primary">
                        <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">
                           LAST UPDATED: 1ST APRIL 2026
                        </p>
                     </footer>

                  </article>
            </div>

         </div>
      </MobileAppWrapper>
   );
};

export default TermsAndConditions;


