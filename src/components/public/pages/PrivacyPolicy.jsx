'use client';

import PageHero from '@/components/common/ui/PageHero';
import React from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Head from 'next/head';
import {
   ShieldCheck,
   Database,
   Lock,
   ShieldCheck as UserShield,
   Eye,
   Cookie,
   CircleCheck,
   Info,
   Gift,
   ChevronRight,
   Search,
   BookOpen,
   Smartphone,
   CreditCard,
   Zap,
   Mail,
   CircleAlert,
   Clock
} from 'lucide-react';
import { m as motion } from 'framer-motion';

import MobileAppWrapper from '../../common/MobileAppWrapper';
import UnifiedFooter from '../../common/UnifiedFooter';
import AuthorBio from '../../common/AuthorBio';
import config from '../../../lib/config/appConfig';
import { generateBreadcrumbSchema } from '../../../utils/schema';
import { getCanonicalUrl } from '../../../utils/seo';

const PrivacyPolicy = () => {
   const router = useRouter();
   const canonicalUrl = getCanonicalUrl(router.asPath);
   const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Privacy Policy' }
   ]);

   const sections = [
      { id: 'intro', title: 'Introduction', icon: Info, color: 'primary' },
      { id: 'collect', title: 'Information We Collect', icon: Database, color: 'primary' },
      { id: 'use', title: 'How We Use Information', icon: Eye, color: 'primary' },
      { id: 'sharing', title: 'Sharing Information', icon: UserShield, color: 'primary' },
      { id: 'security', title: 'Data Security', icon: Lock, color: 'primary' },
      { id: 'retention', title: 'Data Retention', icon: Clock, color: 'primary' },
      { id: 'rights', title: 'Your Rights', icon: CircleCheck, color: 'primary' },
      { id: 'cookies', title: 'Cookies & Advertisements', icon: Cookie, color: 'primary' },
      { id: 'eligibility', title: 'Age Limit', icon: UserShield, color: 'primary' },
      { id: 'contact', title: 'Contact Us', icon: Mail, color: 'primary' }
   ];


   return (
      <MobileAppWrapper title="Privacy Policy">
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
                  icon={ShieldCheck}
                  title="Privacy Policy"
               />
            </div>

            <div>

                  {/* --- Content Main --- */}
                  <article className="space-y-4 xl:space-y-5">

                     {/* Introduction */}
                     <section id="intro" className="group">
                        <section className="bg-background-surface p-4 md:p-6 xl:p-8 rounded-3xl xl:rounded-3xl border-none relative overflow-hidden mt-4">
                           <div className="flex items-center gap-4 mb-5">
                              <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/10">
                                 <Info className="w-6 h-6" />
                              </div>
                              <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary">Introduction</h2>
                           </div>
                           <p className="text-md xl:text-lg leading-relaxed text-content-secondary font-medium italic border-l-4 border-primary-500/20 pl-2 xl:pl-8">
                              This Privacy Policy explains how <strong>AajExam</strong> collects, uses, stores, and protects your information when you use our platform. By using AajExam, you agree to the practices described below.
                           </p>
                        </section>
                     </section>

                     {/* Information Collection */}
                     <section id="collect" className="space-y-5">
                        <div className="flex items-center gap-4 px-4">
                           <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/10">
                              <Database className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary">Information We Collect</h2>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                           {[
                              { title: 'Account Data', body: 'Name, email, phone number, password, and referral code.', icon: UserShield, color: 'primary' },
                              { title: 'Learning Progress', body: 'Your levels, badges, ranking, and quiz results.', icon: BookOpen, color: 'primary' },
                              { title: 'Quiz History', body: 'Your quiz attempts, scores, and time taken.', icon: Zap, color: 'primary' },
                              { title: 'Rewards History', body: 'History of your earned and claimed rewards.', icon: Gift, color: 'primary' },
                              { title: 'Payment Details', body: 'Encrypted bank details for processing reward withdrawals.', icon: CreditCard, color: 'primary' },
                              { title: 'Device Information', body: 'Your IP address, browser, and device details.', icon: Smartphone, color: 'primary' }
                           ].map((item, i) => (
                              <section key={i} className="bg-background-surface p-4 xl:p-5 rounded-2xl xl:rounded-3xl border border-border-primary hover:border-primary-500/20 transition-all group">
                                 <div className="flex items-start gap-4">
                                    <div className={`p-4 bg-${item.color === 'primary' ? 'primary' : item.color}-500/10 text-${item.color === 'primary' ? 'primary' : item.color}-500 rounded-2xl border border-transparent group-hover:border-current transition-all`}>
                                       <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                       <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-content-primary">{item.title}</h3>
                                       <p className="text-xs font-medium text-content-muted leading-relaxed">{item.body}</p>
                                    </div>
                                 </div>
                              </section>
                           ))}
                        </div>
                     </section>

                     {/* Use of Information */}
                     <section id="use" className="dark:bg-slate-900 rounded-3xl xl:rounded-3xl p-4 md:p-6 xl:p-8 space-y-6 xl:space-y-8 relative overflow-hidden">

                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 text-primary-600 rounded-3xl flex items-center justify-center border border-primary-500/20">
                              <Eye className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary">How We Use Information</h2>
                        </div>

                        <div className="space-y-4 relative z-10">
                           {[
                              "To manage your account and keep it secure.",
                              "To calculate rankings and update leaderboards.",
                              "To process referral rewards when friends you invite upgrade to PRO."
                           ].map((text, i) => (
                              <div key={i} className="flex gap-4 group">
                                 <div className="w-1 h-9 group-hover:bg-primary-700 transition-colors rounded-full" />
                                 <p className="text-sm font-medium text-content-secondary leading-relaxed pt-2">{text}</p>
                              </div>
                           ))}

                           <section className="ml-0 xl:ml-8 p-4 xl:p-6 rounded-2xl xl:rounded-3xl border-l-4 border-primary-600 space-y-6">
                              <div className="flex items-center gap-4 text-primary-600">
                                 <Zap className="w-6 h-6" />
                                 <h3 className="text-sm font-bold uppercase tracking-[0.08em]">Referral Rewards</h3>
                              </div>
                              <p className="text-sm font-medium text-content-secondary leading-relaxed">
                                 Users who invite friends to AajExam receive a cash reward each time an invited friend upgrades to a paid PRO subscription for the first time. Rewards are credited to your Referral Rewards balance and can be withdrawn to your bank account.
                              </p>
                           </section>
                        </div>
                     </section>

                     {/* Cookies & AdSense */}
                     <section id="cookies" className="bg-background-surface p-4 xl:p-5 rounded-2xl xl:rounded-3xl space-y-6 xl:space-y-8 border-none">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-content-primary rounded-3xl flex items-center justify-center border border-border-primary">
                              <Cookie className="w-6 h-6" />
                           </div>
                           <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Cookies & Advertisements</h2>
                        </div>

                        <div className="space-y-5">
                           <p className="text-sm font-medium text-content-secondary leading-relaxed italic border-l-4 border-border-primary pl-6 px-4">
                              We use essential cookies for keeping you logged in. AajExam also works with Google AdSense for showing advertisements.
                           </p>

                           <div className="grid grid-cols-1 gap-6">
                              <section className="p-4 xl:p-10 bg-background-surface rounded-3xl space-y-6 border border-border-primary">
                                 <div className="flex items-center justify-between flex-wrap gap-4">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-content-primary">How Ads Work</h3>
                                    <div className="px-4 py-1.5 bg-primary-600 text-on-primary text-[9px] font-bold uppercase tracking-[0.08em] rounded-full">GOOGLE ADSENSE</div>
                                 </div>
                                 <ul className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">
                                    <li className="flex gap-4"><CircleCheck className="w-4 h-4 text-content-primary" /> Showing ads based on your interests</li>
                                    <li className="flex gap-4"><CircleCheck className="w-4 h-4 text-content-primary" /> Tracking how often you visit</li>
                                    <li className="flex gap-4"><CircleCheck className="w-4 h-4 text-content-primary" /> Working with trusted partners</li>
                                    <li className="flex gap-4"><CircleCheck className="w-4 h-4 text-content-primary" /> Showing personalized advertisements</li>
                                 </ul>
                                 <div className="pt-6 border-t-2 border-border-primary flex flex-wrap gap-4">
                                    <a href="https://www.google.com/settings/ads" target="_blank" className="px-6 py-3 bg-background-surface rounded-lg xl:rounded-xl text-[9px] font-bold uppercase tracking-[0.08em] text-primary-600 border border-border-primary hover:border-primary-500/20 transition-all font-outfit">Opt-out Google Ads</a>
                                    <a href="http://www.aboutads.info/choices/" target="_blank" className="px-6 py-3 bg-background-surface rounded-lg xl:rounded-xl text-[9px] font-bold uppercase tracking-[0.08em] text-primary-600 border border-border-primary hover:border-primary-500/20 transition-all font-outfit">Ad Choices</a>
                                 </div>
                              </section>
                           </div>
                        </div>
                     </section>

                     {/* Security & Age */}
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-5">
                        <section id="security" className="bg-background-surface p-4 xl:p-8 rounded-3xl border border-border-primary space-y-6">
                           <div className="w-14 h-14 bg-black/10 dark:bg-white/10 text-content-primary rounded-2xl flex items-center justify-center border border-border-primary">
                              <Lock className="w-6 h-6" />
                           </div>
                           <h3 className="text-xl font-bold tracking-tight text-content-primary leading-none">Data Security</h3>
                           <p className="text-sm font-medium text-content-muted leading-relaxed">We use HTTPS, secure password hashing, and access controls to protect your data.</p>
                        </section>

                        <section id="eligibility" className="dark:bg-slate-900 p-4 xl:p-8 rounded-3xl border-none space-y-6 relative overflow-hidden">
                           <div className="w-14 h-14 bg-black/20 dark:bg-white/20 text-content-primary rounded-2xl flex items-center justify-center border border-border-primary relative z-10">
                              <UserShield className="w-6 h-6" />
                           </div>
                           <h3 className="text-xl font-bold tracking-tight text-content-primary leading-none relative z-10">Age Limit</h3>
                           <p className="text-sm font-medium text-content-secondary leading-relaxed relative z-10">Users must be 13 years or older to create an account on the AajExam platform.</p>
                           <Zap className="absolute -bottom-8 -right-8 w-20 xl:w-32 h-20 xl:h-32 text-slate-900/5 dark:text-white/5" />
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
                                 <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-content-primary leading-none">Contact Us</h2>
                                 <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">GET IN TOUCH</p>
                              </section>
                           </div>
                           <address className="not-italic p-4 xl:p-8 bg-background-surface rounded-3xl space-y-2 xl:space-y-4 border border-border-primary group-hover:border-primary-500/20 transition-all">
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
                           LAST UPDATED: 1st April 2026
                        </p>
                     </footer>

                  </article>
            </div>

         </div>
      </MobileAppWrapper>
   );
};

export default PrivacyPolicy;


