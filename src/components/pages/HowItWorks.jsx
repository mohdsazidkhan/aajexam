'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
   Rocket,
   UserPlus,
   CreditCard,
   PlayCircle,
   TrendingUp,
   Trophy,
   Gift,
   CircleCheck,
   Lightbulb,
   ShieldCheck,
   ChevronRight,
   Sparkles,
   Zap,
   Target
} from 'lucide-react';
import { motion } from 'framer-motion';

import Card from '../ui/Card';
import Button from '../ui/Button';
import UnifiedFooter from '../UnifiedFooter';
import config from '../../lib/config/appConfig';

const HowItWorks = () => {
   const router = useRouter();

   const steps = [
      {
         id: 1,
         title: 'Sign Up',
         desc: 'Create your free account using your mobile number or email. It takes less than a minute to get started.',
         icon: UserPlus,
         color: 'primary',
         badge: 'Step 1'
      },
      {
         id: 2,
         title: 'Pick a Plan',
         desc: 'Choose a free or paid plan based on what you need. Your plan decides how many levels and quizzes you can use.',
         icon: CreditCard,
         color: 'secondary',
         badge: 'Step 2',
         details: [
            { label: 'Free Plan', val: 'Levels 0 to 9', icon: CircleCheck },
            { label: 'Pro Plan', val: 'All Levels (0-10)', icon: Sparkles }
         ]
      },
      {
         id: 3,
         title: 'Take Practice Quizzes',
         desc: 'Answer MCQ questions made by experts. Practice with daily, weekly, and monthly quizzes to get exam-ready.',
         icon: PlayCircle,
         color: 'blue',
         badge: 'Step 3'
      },
      {
         id: 4,
         title: 'Track Your Progress',
         desc: 'See how many questions you got right and how fast you answered. Check your results and improve in every subject.',
         icon: TrendingUp,
         color: 'secondary',
         badge: 'Step 4'
      },
      {
         id: 5,
         title: 'Refer & Earn',
         desc: 'Invite your friends to AajExam. When a friend upgrades to PRO, you get a cash reward in your account.',
         icon: Gift,
         color: 'primary',
         badge: 'Step 5',
         metrics: ['Share Your Code', 'Friend Joins', 'Friend Upgrades to PRO']
      }
   ];

   const features = [
      { title: 'Only Your Knowledge Counts', desc: 'You win by knowing more, not by luck. Hard work and study is all that matters.', icon: ShieldCheck, color: 'primary' },
      { title: 'Earn With Referrals', desc: 'Invite friends and earn real cash rewards when they upgrade to PRO.', icon: Trophy, color: 'secondary' },
      { title: 'Get Better as You Study', desc: 'As your score improves, you unlock harder questions and new levels.', icon: Zap, color: 'blue' }
   ];

   return (
      <div className="min-h-screen animate-fade-in selection:bg-primary-500 selection:text-white">

         <div className="container mx-auto max-w-5xl space-y-20 mt-4">

            {/* --- Hero Section --- */}
            <section className="text-center space-y-6 relative overflow-hidden pt-10 lg:pt-20">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-24 h-24 bg-primary-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-duo-primary border-4 border-white/10 rotate-12">
                  <Rocket className="w-10 h-10" />
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">How It <span className="text-primary-700 dark:text-primary-500">Works</span></h1>
                  <p className="text-sm lg:text-base font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] mx-auto px-4">Simple steps to follow. Study daily, pass your exam, and earn by referring friends.</p>
               </div>
            </section>

            {/* --- Step-by-Step Path --- */}
            <section className="relative space-y-12">
               {/* Center Line (hidden on small) */}
               <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-1.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 rounded-full hidden lg:block" />

               {steps.map((step, idx) => (
                  <motion.div
                     key={step.id}
                     initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     className={`relative flex flex-col lg:flex-row items-center gap-12 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                  >
                     {/* Step Marker */}
                     <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center z-10 shadow-sm hidden lg:flex">
                        <div className={`w-3 h-3 rounded-full bg-${step.color}-500 shadow-lg`} />
                     </div>

                     {/* Content Card */}
                     <div className="w-full lg:w-[45%]">
                        <Card className="p-8 space-y-6 group border-2 hover:border-primary-500/30 transition-all duration-300">
                           <div className="flex items-center justify-between">
                              <div className={`p-4 bg-${step.color}-500/10 text-${step.color}-500 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                                 <step.icon className="w-6 h-6" />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-${step.color}-500/10 text-${step.color}-500`}>
                                 {step.badge}
                              </span>
                           </div>
                           <div className="space-y-3">
                              <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">{step.title}</h3>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-400 leading-relaxed uppercase tracking-wide">{step.desc}</p>
                           </div>

                           {/* Tier Details (for step 2) */}
                           {step.details && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                 {step.details.map((d, di) => (
                                    <div key={di} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                                       <div className="flex items-center gap-2">
                                          <d.icon className={`w-3 h-3 ${di === 1 ? 'text-primary-700 dark:text-primary-500' : 'text-primary-700 dark:text-primary-500'}`} />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{d.label}</p>
                                       </div>
                                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{d.val}</p>
                                    </div>
                                 ))}
                              </div>
                           )}

                           {/* Reward Metrics (for step 5) */}
                           {step.metrics && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                 {step.metrics.map((m, mi) => (
                                    <span key={mi} className="px-3 py-1 bg-primary-500/5 text-primary-700 dark:text-primary-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-500/10">
                                       {m}
                                    </span>
                                 ))}
                              </div>
                           )}
                        </Card>
                     </div>

                     <div className="hidden lg:block w-[45%]" />
                  </motion.div>
               ))}
            </section>

            {/* --- Skill-Based Callout --- */}
            <section className="pt-0">
               <Card className="p-0 border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden text-center lg:text-left">
                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-4">
                     <div className="w-20 h-20 bg-primary-500/20 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-primary-500/30">
                        <Lightbulb className="w-10 h-10" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">Important Note</h3>
                        <p className="text-sm font-bold text-slate-300 leading-relaxed uppercase tracking-wide">AajExam is about your knowledge and your hard work. The more you study and practice, the better your score. Only your effort takes you to the top.</p>
                     </div>
                  </div>
                  <ShieldCheck className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/5 -rotate-12" />
               </Card>
            </section>

            {/* --- Features Grid --- */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10">
               {features.map((f, i) => (
                  <Card key={i} className="p-8 group space-y-6 border-2 hover:border-primary-500/50 transition-all duration-300">
                     <div className={`p-4 bg-${f.color}-500/10 text-${f.color}-500 rounded-2xl group-hover:scale-110 group-hover:bg-${f.color}-500 group-hover:text-white transition-all w-fit shadow-sm`}>
                        <f.icon className="w-6 h-6" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-xl font-black font-outfit uppercase group-hover:text-primary-700 dark:text-primary-500 transition-colors">{f.title}</h4>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-[0.1em]">{f.desc}</p>
                     </div>
                  </Card>
               ))}
            </section>

            {/* --- CTA --- */}
            <section className="pb-10">
               <Card className="p-10 lg:p-20 text-center bg-slate-950 dark:bg-slate-900 border-4 border-slate-800 text-white shadow-2xl relative overflow-hidden rounded-[3rem] lg:rounded-[4rem]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />

                  <div className="relative z-10 space-y-10">
                     <h2 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tighter">Get Started <span className="text-primary-400">Today</span></h2>
                     <p className="text-base lg:text-xl font-bold opacity-80 max-w-2xl mx-auto uppercase tracking-wide leading-relaxed px-4">Thousands of students are already studying, scoring better, and earning by inviting friends. Join them today.</p>
                     <Button
                        onClick={() => router.push('/')}
                        className="bg-primary-500 mx-auto hover:bg-primary-600 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-sm shadow-duo-primary border-b-[8px] border-primary-700 active:translate-y-2 active:border-b-0 transition-all"
                     >
                        START NOW
                     </Button>
                  </div>
               </Card>
            </section>

         </div>

         <UnifiedFooter />
      </div>
   );
};

export default HowItWorks;


