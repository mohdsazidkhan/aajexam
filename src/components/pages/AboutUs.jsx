'use client';

import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
   Trophy,
   Rocket,
   BookOpen,
   Target,
   ShieldCheck,
   Users,
   Zap,
   Star,
   Award,
   GraduationCap,
   Lightbulb,
   Heart,
   TrendingUp,
   Scroll,
   ArrowRight,
   Sparkles,
   Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

import Card from '../ui/Card';
import Button from '../ui/Button';
import UnifiedFooter from '../UnifiedFooter';
import AuthorBio from '../AuthorBio';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';

const AboutUs = () => {
   const router = useRouter();
   const canonicalUrl = getCanonicalUrl(router.asPath);
   const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About Us' }
   ]);

   const stats = [
      { label: 'QUIZZES', value: '2,000+', icon: Scroll, color: 'primary' },
      { label: 'LEVELS', value: '10 LEVELS', icon: Zap, color: 'secondary' },
      { label: 'STUDENTS', value: 'MILLIONS', icon: Users, color: 'blue' }
   ];

   const features = [
      { title: 'Study at Your Own Pace', desc: 'You decide how fast or slow you want to study. No pressure.', icon: Lightbulb, color: 'primary' },
      { title: 'See Your Progress', desc: 'Track how many questions you got right and how fast you answer.', icon: TrendingUp, color: 'secondary' },
      { title: 'Questions by Experts', desc: 'All questions are made by top teachers and subject experts in India.', icon: GraduationCap, color: 'blue' },
      { title: 'One App, Many Exams', desc: 'Prepare for UPSC, SSC, Banking, and Railways - all in one place.', icon: Target, color: 'primary' },
      { title: 'Unlimited Practice', desc: 'Practice as many tests as you want with full step-by-step answers.', icon: Star, color: 'secondary' },
      { title: 'Refer & Earn', desc: 'Invite your friends to AajExam and earn cash rewards when they upgrade to PRO.', icon: Trophy, color: 'blue' }
   ];

   return (
      <div className="min-h-screen animate-fade-in selection:bg-primary-500 selection:text-white">
         <Head>
            <title>About Us - Our Mission | AajExam</title>
            <link rel="canonical" href={canonicalUrl} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
         </Head>

         <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 mt-0">

            {/* --- Hero Section --- */}
            <section className="text-center space-y-6 relative overflow-hidden">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-duo-primary rotate-12">
                  <Sparkles className="text-white w-10 h-10" />
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-xl lg:text-5xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">About <span className="text-primary-700 dark:text-primary-500">Us</span></h1>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest max-w-3xl mx-auto leading-tight">Practice daily. Learn more. Get the job you always wanted.</p>
               </div>

               {/* Stats Ribbon */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
                  {stats.map((stat, i) => (
                     <Card key={i} className="p-6 flex items-center justify-center gap-6 border-2 border-slate-100 dark:border-slate-800">
                        <div className={`p-4 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-2xl`}>
                           <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="text-xl lg:text-3xl font-black font-outfit text-slate-900 dark:text-white leading-none">{stat.value}</p>
                           <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                     </Card>
                  ))}
               </div>
            </section>

            {/* --- Mission & Vision --- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-10">
               <Card className="p-10 space-y-8 border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                     <div className="inline-flex items-center gap-2 bg-primary-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-primary-400 backdrop-blur-sm border border-primary-500/30">
                        <Rocket className="w-4 h-4" /> OUR MISSION
                     </div>
                     <h2 className="text-xl md:text-2xl lg:text-4xl font-black font-outfit uppercase tracking-tight leading-none">Good Education <br />For Every Student</h2>
                     <p className="text-slate-300 font-bold leading-relaxed">AajExam helps students across India prepare for government exams. We believe every student deserves good study material, no matter where they come from.</p>
                     <div className="space-y-4">
                        {['All About Your Knowledge', 'Proven Study Methods', 'Top Students Get Rewarded'].map((pill, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900">✓</div>
                              <span className="text-sm font-black uppercase tracking-widest text-slate-300">{pill}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <ShieldCheck className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 -rotate-12" />
               </Card>

               <div className="space-y-10 px-4">
                  <div className="space-y-4">
                     <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-wide">How We Help You</h3>
                     <p className="text-slate-700 dark:text-slate-400 font-bold leading-relaxed">We use simple and effective ways to help you study. Our platform is built to boost your score in SSC, UPSC, Banking, and Railway exams.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <div className="p-3 bg-primary-500/10 text-primary-700 dark:text-primary-500 w-fit rounded-xl"><Zap className="w-5 h-5" /></div>
                        <h4 className="font-black uppercase text-sm">10-Level System</h4>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Start as a beginner and become a champion - a simple path that grows as you improve.</p>
                     </div>
                     <div className="space-y-2">
                        <div className="p-3 bg-blue-500/10 text-blue-500 w-fit rounded-xl"><Target className="w-5 h-5" /></div>
                        <h4 className="font-black uppercase text-sm">All Subjects Covered</h4>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">We cover Maths, English, and General Knowledge for all major government exams.</p>
                     </div>
                  </div>
               </div>
            </section>

            {/* --- Platform Features Grid --- */}
            <section className="space-y-12 pt-10">
               <div className="text-center space-y-2">
                  <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight">Our Features</h2>
                  <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Designed for your study success</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((f, i) => (
                     <Card key={i} hoverable className="p-8 group space-y-6 border-2 hover:border-primary-500/50 transition-all duration-300">
                        <div className={`p-4 bg-${f.color}-500/10 text-${f.color}-500 rounded-2xl group-hover:scale-110 group-hover:bg-${f.color}-500 group-hover:text-white transition-all w-fit shadow-sm`}>
                           <f.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-xl font-black font-outfit uppercase group-hover:text-primary-700 dark:text-primary-500 transition-colors">{f.title}</h4>
                           <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-wide">{f.desc}</p>
                        </div>
                     </Card>
                  ))}
               </div>
            </section>

            {/* --- Trust & Commitment --- */}
            <section className="pt-10">
               <Card className="p-10 border-none bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                     <div className="lg:col-span-4 text-center lg:text-left space-y-6">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto lg:mx-0 shadow-sm">
                           <Building2 className="w-10 h-10 text-primary-700 dark:text-primary-500" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">Officially Registered</h3>
                           <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">A Government Registered Company (UDYAM)</p>
                        </div>
                     </div>
                     <div className="lg:col-span-8 space-y-6 pl-0 lg:pl-10 lg:border-l-2 border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-8 uppercase tracking-wide">Led by <strong>MOHD SAZID KHAN</strong>, AajExam is 100% based on your knowledge and hard work. Everything you earn here is through your own effort. We follow all rules to make sure the platform is safe, fair, and honest for every student.</p>
                     </div>
                  </div>
               </Card>
            </section>

            {/* --- CTA --- */}
            <section className="pt-20">
               <Card className="p-12 text-center bg-gradient-to-r from-primary-500 to-primary-500 border-none text-white shadow-duo-primary relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                     <h2 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Ready to Begin?</h2>
                     <p className="text-lg font-bold opacity-90 max-w-2xl mx-auto uppercase tracking-wide leading-relaxed">Join thousands of students who are already passing exams and earning cash by referring friends to AajExam.</p>
                     <Button onClick={() => router.push('/')} variant="white" size="lg" className="px-12 py-6 text-sm font-black text-primary-700 dark:text-primary-500 shadow-xl">START LEARNING FOR FREE</Button>
                  </div>
                  <Sparkles className="absolute top-10 left-10 w-24 h-24 text-white/10" />
                  <ShieldCheck className="absolute bottom-10 right-10 w-20 lg:w-32 h-20 lg:h-32 text-white/10" />
               </Card>
            </section>

            {/* --- Footer Info --- */}
            <section className="space-y-12">
               <AuthorBio />
               <div className="text-center pt-10 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">About Us |  Last Updated February 2026</p>
               </div>
            </section>
         </div>

         <UnifiedFooter />
      </div>
   );
};

export default AboutUs;


