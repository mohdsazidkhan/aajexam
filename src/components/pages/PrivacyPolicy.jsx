'use client';

import React from 'react';
import { useRouter } from 'next/router';
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
import { motion } from 'framer-motion';

import MobileAppWrapper from '../MobileAppWrapper';
import UnifiedFooter from '../UnifiedFooter';
import AuthorBio from '../AuthorBio';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';

const PrivacyPolicy = () => {
   const router = useRouter();
   const canonicalUrl = getCanonicalUrl(router.asPath);
   const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Privacy Policy' }
   ]);

   const sections = [
      { id: 'intro', title: 'Introduction', icon: Info, color: 'primary' },
      { id: 'collect', title: '1. Information We Collect', icon: Database, color: 'primary' },
      { id: 'use', title: '2. How We Use Information', icon: Eye, color: 'primary' },
      { id: 'sharing', title: '3. Sharing Information', icon: UserShield, color: 'primary' },
      { id: 'security', title: '4. Data Security', icon: Lock, color: 'primary' },
      { id: 'retention', title: '5. Data Retention', icon: Clock, color: 'primary' },
      { id: 'rights', title: '6. Your Rights', icon: CircleCheck, color: 'primary' },
      { id: 'cookies', title: '7. Cookies & Advertisements', icon: Cookie, color: 'primary' },
      { id: 'eligibility', title: '8. Age Limit', icon: UserShield, color: 'primary' },
      { id: 'contact', title: '10. Contact Us', icon: Mail, color: 'primary' }
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

         <div className="min-h-screen font-outfit pb-20 selection:bg-primary-700 selection:text-white mt-0">

            {/* --- Header Section --- */}
            <div className="relative overflow-hidden py-8 lg:py-16 border-b-2 border-slate-100 dark:border-slate-800">
               <div className="container mx-auto px-6 lg:px-10 relative z-10 text-center space-y-8">
                  <motion.div
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm flex items-center justify-center mx-auto border-2 border-slate-50 dark:border-slate-700"
                  >
                     <ShieldCheck className="w-14 h-14 text-primary-700" />
                  </motion.div>
                  <div className="space-y-2 lg:space-y-4">
                     <h1 className="text-xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
                        Privacy <span className="text-primary-700">Policy</span>
                     </h1>
                     <p className="text-xs lg:text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] max-w-2xl mx-auto px-6">
                        HOW WE PROTECT YOUR DATA AND PRIVACY
                     </p>
                  </div>
               </div>
               {/* Background Grid Pattern */}
            </div>

            <div>

                  {/* --- Content Main --- */}
                  <main className="space-y-12">

                     {/* Introduction */}
                     <section id="intro" className="group">
                        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 lg:p-12 rounded-[2rem] lg:rounded-[4rem] shadow-sm border-none relative overflow-hidden mt-4">
                           <div className="flex items-center gap-6 mb-10">
                              <div className="w-16 h-16 bg-primary-500/10 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                                 <Info className="w-8 h-8" />
                              </div>
                              <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Introduction</h2>
                           </div>
                           <p className="text-md lg:text-lg leading-[2] text-slate-600 dark:text-slate-400 font-medium italic border-l-8 border-primary-500/20 pl-2 lg:pl-8">
                              This Privacy Policy explains how <strong>AajExam</strong> collects, uses, stores, and protects your information when you use our platform. By using AajExam, you agree to the practices described below.
                           </p>
                        </div>
                     </section>

                     {/* 1. Information Collection */}
                     <section id="collect" className="space-y-10">
                        <div className="flex items-center gap-6 px-4">
                           <div className="w-16 h-16 bg-primary-500/10 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/10">
                              <Database className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">1. Information We Collect</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {[
                              { title: 'Account Data', body: 'Name, email, phone number, password, and referral code.', icon: UserShield, color: 'primary' },
                              { title: 'Learning Progress', body: 'Your levels, badges, ranking, and quiz results.', icon: BookOpen, color: 'primary' },
                              { title: 'Quiz History', body: 'Your quiz attempts, scores, and time taken.', icon: Zap, color: 'primary' },
                              { title: 'Rewards History', body: 'History of your earned and claimed rewards.', icon: Gift, color: 'primary' },
                              { title: 'Payment Details', body: 'Encrypted bank details for processing reward withdrawals.', icon: CreditCard, color: 'primary' },
                              { title: 'Device Information', body: 'Your IP address, browser, and device details.', icon: Smartphone, color: 'primary' }
                           ].map((item, i) => (
                              <div key={i} className="bg-white dark:bg-slate-800 p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/20 transition-all group">
                                 <div className="flex items-start gap-6">
                                    <div className={`p-4 bg-${item.color === 'primary' ? 'primary' : item.color}-500/10 text-${item.color === 'primary' ? 'primary' : item.color}-500 rounded-2xl border-2 border-transparent group-hover:border-current transition-all`}>
                                       <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                       <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.title}</h4>
                                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{item.body}</p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* 2. Use of Information */}
                     <section id="use" className="bg-slate-900 rounded-[2rem] lg:rounded-[4rem] p-4 md:p-12 lg:p-20 space-y-12 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" />

                        <div className="flex items-center gap-6 relative z-10">
                           <div className="w-16 h-16 bg-primary-500/20 text-primary-700 rounded-3xl flex items-center justify-center shadow-sm border-2 border-primary-500/20">
                              <Eye className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-white">2. How We Use Information</h2>
                        </div>

                        <div className="space-y-8 relative z-10">
                           {[
                              "To manage your account and keep it secure.",
                              "To calculate rankings and update leaderboards.",
                              "To process referral rewards when friends you invite upgrade to PRO."
                           ].map((text, i) => (
                              <div key={i} className="flex gap-6 group">
                                 <div className="w-1 h-12 bg-primary-500/20 group-hover:bg-primary-700 transition-colors rounded-full" />
                                 <p className="text-sm font-medium text-slate-400 leading-loose pt-2">{text}</p>
                              </div>
                           ))}

                           <div className="ml-0 lg:ml-8 p-4 lg:p-10 bg-white/5 rounded-[1rem] lg:rounded-[3rem] border-l-8 border-primary-700 space-y-6">
                              <div className="flex items-center gap-4 text-primary-700">
                                 <Zap className="w-6 h-6" />
                                 <h4 className="text-sm font-black uppercase tracking-widest">Referral Rewards</h4>
                              </div>
                              <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                 Users who invite friends to AajExam receive a cash reward each time an invited friend upgrades to a paid PRO subscription for the first time. Rewards are credited to your wallet and can be withdrawn to your bank account.
                              </p>
                           </div>
                        </div>
                     </section>

                     {/* 7. Cookies & AdSense */}
                     <section id="cookies" className="bg-white dark:bg-slate-800 p-4 lg:p-12 xl:p-20 rounded-[1rem] lg:rounded-[4rem] shadow-sm space-y-12 border-none">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-3xl flex items-center justify-center shadow-sm border-2 border-black/10 dark:border-white/10">
                              <Cookie className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">7. Cookies & Advertisements</h2>
                        </div>

                        <div className="space-y-10">
                           <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-black/20 dark:border-white/20 pl-6 px-4">
                              We use essential cookies for keeping you logged in. AajExam also works with Google AdSense for showing advertisements.
                           </p>

                           <div className="grid grid-cols-1 gap-6">
                              <div className="p-4 lg:p-10 bg-white dark:bg-slate-900/50 rounded-[3rem] space-y-6 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                 <div className="flex items-center justify-between flex-wrap gap-4">
                                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">How Ads Work</h4>
                                    <div className="px-4 py-1.5 bg-primary-700 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">GOOGLE ADSENSE</div>
                                 </div>
                                 <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    <li className="flex gap-4"><CircleCheck className="w-4 h-4 text-black dark:text-white" /> Showing ads based on your interests</li>
                                    <li className="flex gap-4"><CircleCheck className="w-4 h-4 text-black dark:text-white" /> Tracking how often you visit</li>
                                    <li className="flex gap-4"><CircleCheck className="w-4 h-4 text-black dark:text-white" /> Working with trusted partners</li>
                                    <li className="flex gap-4"><CircleCheck className="w-4 h-4 text-black dark:text-white" /> Showing personalized advertisements</li>
                                 </ul>
                                 <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800 flex flex-wrap gap-4">
                                    <a href="https://www.google.com/settings/ads" target="_blank" className="px-6 py-3 bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl text-[9px] font-black uppercase tracking-widest text-primary-700 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/20 transition-all font-outfit">Opt-out Google Ads</a>
                                    <a href="http://www.aboutads.info/choices/" target="_blank" className="px-6 py-3 bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl text-[9px] font-black uppercase tracking-widest text-primary-700 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/20 transition-all font-outfit">Ad Choices</a>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </section>

                     {/* Security & Age */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <section id="security" className="bg-white dark:bg-slate-800 p-4 lg:p-12 rounded-[3.5rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 space-y-6">
                           <div className="w-14 h-14 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-2xl flex items-center justify-center border-2 border-black/5 dark:border-white/5">
                              <Lock className="w-6 h-6" />
                           </div>
                           <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Data Security</h3>
                           <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-loose">We use HTTPS, secure password hashing, and access controls to protect your data.</p>
                        </section>

                        <section id="eligibility" className="bg-slate-900 p-4 lg:p-12 rounded-[3.5rem] shadow-sm border-none space-y-6 relative overflow-hidden">
                           <div className="w-14 h-14 bg-black/20 dark:bg-white/20 text-black dark:text-white rounded-2xl flex items-center justify-center border border-black/20 dark:border-white/20 relative z-10 shadow-sm">
                              <UserShield className="w-6 h-6" />
                           </div>
                           <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none relative z-10">Age Limit</h3>
                           <p className="text-sm font-medium text-slate-400 leading-loose relative z-10">Users must be 13 years or older to create an account on the AajExam platform.</p>
                           <Zap className="absolute -bottom-8 -right-8 w-20 lg:w-32 h-20 lg:h-32 text-white/5" />
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
                                 <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">10. Contact Us</h2>
                                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">GET IN TOUCH</p>
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

                     <div className="pt-10">
                        <AuthorBio />
                     </div>

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

export default PrivacyPolicy;


