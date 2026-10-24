'use client';

import React, { useState, useEffect } from "react";
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Link from '@/components/common/AppLink';
import {
   Trophy,
   Star,
   Brain,
   Target,
   Zap,
   ChevronRight,
   Users,
   Flame,
   ShieldCheck,
   ArrowRight,
   Sparkles,
   Rocket,
   Medal,
   BookOpen,
   Layers,
   Gamepad2,
   GraduationCap,
   Pencil,
   Lightbulb,
   Award,
   Check,
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import MobileAppWrapper from "../../common/MobileAppWrapper";
import API from '../../../lib/api';
import Button from '../../common/ui/Button';
import Card from '../../common/ui/Card';
import dynamic from 'next/dynamic';
import useTranslate from '../../../hooks/useTranslate';

const SampleQuiz = dynamic(() => import('../SampleQuiz'), { ssr: false });

const POPULAR_PYQ_EXAMS = [
   { slug: 'ssc-cgl', name: 'SSC CGL' },
   { slug: 'ssc-chsl-tier-i', name: 'SSC CHSL' },
   { slug: 'ssc-mts', name: 'SSC MTS' },
   { slug: 'ssc-gd-constable', name: 'SSC GD' },
   { slug: 'ssc-selection-post', name: 'SSC Selection Post' },
   { slug: 'ssc-cpo-si-delhi-police-capf', name: 'SSC CPO' },
   { slug: 'ssc-stenographer-grade-c-d', name: 'SSC Stenographer' },
   { slug: 'rrb-ntpc', name: 'RRB NTPC' },
   { slug: 'rrb-group-d', name: 'RRB Group D' },
   { slug: 'ibps-po-probationary-officer-prelims', name: 'IBPS PO' },
   { slug: 'sbi-clerk-prelims', name: 'SBI Clerk' },
   { slug: 'upsc-prelims', name: 'UPSC Prelims' },
   { slug: 'delhi-police-constable-ssc', name: 'Delhi Police Constable' },
   { slug: 'central-teacher-eligibility-test', name: 'CTET' },
   { slug: 'neet-2', name: 'NEET' },
   { slug: 'ibps-clerk-prelims', name: 'IBPS Clerk' },
   { slug: 'ssc-selection-post-matriculation-level', name: 'SSC Selection Post Matriculation' },
   { slug: 'ssc-selection-post-higher-secondary-level', name: 'SSC Selection Post Higher Secondary' },
   { slug: 'haryana-police-constable', name: 'Haryana Police Constable' },
   { slug: 'rajasthan-police-constable', name: 'Rajasthan Police Constable' },
   { slug: 'up-police-constable', name: 'UP Police Constable' },
   { slug: 'cil-coal-india-limited', name: 'Coal India CIL' },
   { slug: 'rssb-computer-instructor', name: 'RSSB Computer Instructor' },
   { slug: 'esic-udc-prelims', name: 'ESIC UDC' },
];

const ModernLandingPage = () => {
   const { translate, rich } = useTranslate();
   const [stats, setStats] = useState({
      activeStudents: "—",
      totalExams: "—",
      totalQuizzes: "—",
      totalSubjects: "—",
      totalTopics: "—",
      totalQuestions: "—",
      totalPyqPapers: 0,
      registeredLast30Days: "0",
      practiceTestAttemptsLast30Days: "0",
      pyqAttemptsLast30Days: "0",
      quizAttemptsLast30Days: "0",
      examStats: [],
   });
   const [tickerIndex, setTickerIndex] = useState(0);
   const router = useRouter();

   useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
         router.push("/student/dashboard");
         return;
      }
      fetchStats();
   }, [router]);

   const fetchStats = async () => {
      try {
         const res = await API.getPublicLandingStats();
         if (res.success) {
            // Real DB counts, shown exactly (no inflated fallbacks, no rounding up)
            const formatNum = (n) => (n >= 1000 ? `${(Math.floor(n / 100) / 10).toFixed(1)}K` : `${n || 0}`);
            setStats({
               activeStudents: formatNum(res.data?.activeStudents),
               totalExams: formatNum(res.data?.totalExams),
               totalQuizzes: formatNum(res.data?.totalQuizzes),
               totalSubjects: formatNum(res.data?.totalSubjects),
               totalTopics: formatNum(res.data?.totalTopics),
               totalQuestions: formatNum(res.data?.totalQuestions),
               totalPyqPapers: res.data?.totalPyqPapers || 0,
               registeredLast30Days: res.data?.registeredLast30Days || 0,
               practiceTestAttemptsLast30Days: res.data?.practiceTestAttemptsLast30Days || 0,
               pyqAttemptsLast30Days: res.data?.pyqAttemptsLast30Days || 0,
               quizAttemptsLast30Days: res.data?.quizAttemptsLast30Days || 0,
               examStats: res.data?.examStats || [],
            });
         }
      } catch (e) {
      }
   };

   // Auto-rotate ticker every 4 seconds
   useEffect(() => {
      const iv = setInterval(() => setTickerIndex((i) => (i + 1) % 2), 4000);
      return () => clearInterval(iv);
   }, []);

   return (
      <MobileAppWrapper showHeader={true} title={translate('Home')}>
         <div className="xl:min-h-[calc(100vh-4rem)] xl:flex xl:flex-col">
         <section className="relative overflow-hidden -mx-4 xl:-mx-8 xl:flex-1 xl:flex xl:items-center bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-primary-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-white">
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
            <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 bg-primary-300/30 dark:bg-primary-500/20 blur-3xl" style={{ borderRadius: '50%' }} />
            <div className="pointer-events-none absolute -bottom-40 right-10 w-[28rem] h-[28rem] bg-primary-300/25 dark:bg-primary-300/10 blur-3xl" style={{ borderRadius: '50%' }} />

            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-primary-600/20 dark:text-primary-300/15">
               {[
                  { Icon: BookOpen, pos: 'top-[8%] left-[44%]', size: 'w-9 h-9', dur: 6, rot: 12 },
                  { Icon: Brain, pos: 'top-[18%] left-[3%]', size: 'w-12 h-12', dur: 7, rot: -10 },
                  { Icon: Target, pos: 'bottom-[14%] left-[40%]', size: 'w-10 h-10', dur: 8, rot: 360 },
                  { Icon: Rocket, pos: 'top-[10%] right-[4%]', size: 'w-12 h-12', dur: 6.5, rot: 8 },
                  { Icon: Star, pos: 'top-[46%] left-[47%]', size: 'w-6 h-6', dur: 5, rot: 180 },
                  { Icon: Medal, pos: 'bottom-[10%] right-[3%]', size: 'w-10 h-10', dur: 7.5, rot: -12 },
                  { Icon: Layers, pos: 'bottom-[8%] left-[4%]', size: 'w-9 h-9', dur: 9, rot: 10 },
                  { Icon: Zap, pos: 'top-[36%] right-[46%]', size: 'w-7 h-7', dur: 5.5, rot: -15 },
               ].map(({ Icon, pos, size, dur, rot }, i) => (
                  <motion.span
                     key={i}
                     className={`absolute ${pos}`}
                     animate={{ y: [0, -18, 0], x: [0, 8, 0], rotate: [0, rot, 0] }}
                     transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                  >
                     <Icon className={size} strokeWidth={1.5} />
                  </motion.span>
               ))}
            </div>

            <div className="container mx-auto px-3 xl:px-6 relative z-10 w-full">
               <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] items-center gap-6 xl:gap-10 py-5 xl:py-10">
                  {/* Copy */}
                  <div className="space-y-5 xl:space-y-7 text-center xl:text-left">
                     <div className="inline-flex uppercase items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] text-[10px] xl:text-xs font-black tracking-[0.15em] shadow-[0_4px_20px_rgba(251,191,36,0.4)]" style={{ borderRadius: 999 }}>
                        <Sparkles className="w-4 h-4" />
                        {translate('Trusted by students across India')}
                     </div>

                     <h1 className="text-3xl xl:text-5xl font-black font-outfit uppercase tracking-tighter leading-[1.05]">
                        {translate('Prepare Today.')}
                        <span className="relative inline-block text-primary-600 dark:text-primary-300">
                           {translate('Succeed Tomorrow.')}
                           <svg aria-hidden="true" viewBox="0 0 300 12" preserveAspectRatio="none" className="absolute left-0 -bottom-1.5 w-full h-2.5 text-primary-400 dark:text-primary-300">
                              <path d="M2 8 C 50 2, 100 11, 150 6 S 250 3, 298 7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                           </svg>
                        </span>
                     </h1>

                     <p className="text-base xl:text-xl text-slate-700 dark:text-slate-300 font-bold max-w-xl mx-auto xl:mx-0 leading-relaxed">
                        {translate('Practice smarter. Prepare better. Crack your exam.')}
                     </p>

                     <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-3 xl:gap-4">
                        <Button
                           variant="primary"
                           size="xl"
                           icon={ArrowRight}
                           iconPosition="right"
                           className="w-full sm:w-auto"
                           cta="landing_hero_start"
                           onClick={() => router.push('/login')}
                        >
                           {translate('Start practicing now')}
                        </Button>
                        <Button
                           variant="secondary"
                           size="xl"
                           icon={Zap}
                           iconPosition="right"
                           className="w-full sm:w-auto font-outfit tracking-[0.08em] text-sm py-3 xl:py-6"
                           onClick={() => router.push('/govt-exams-preparation')}
                        >
                           {translate('Browse exams')}
                        </Button>
                     </div>

                     <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-6 gap-y-2 pt-3 border-t border-dashed border-primary-300 dark:border-white/20">
                        {[
                           { icon: ShieldCheck, label: 'Questions by experts' },
                           { icon: Flame, label: 'Thousands of questions' },
                           { icon: Trophy, label: 'Practice with topic-wise quizzes' },
                        ].map((t) => (
                           <div key={t.label} className="flex items-center gap-2 font-black text-[11px] xl:text-xs tracking-[0.06em] text-slate-700 dark:text-slate-300">
                              <t.icon className="w-4 h-4 text-primary-600 dark:text-primary-300" /> {translate(t.label)}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Student pass: decorative ticket with live counts */}
                  <div className="relative mx-auto w-full max-w-md">
                  {[
                     { Icon: GraduationCap, cls: '-top-5 -left-5 xl:-left-8', d: 0 },
                     { Icon: Lightbulb, cls: '-top-4 right-6', d: 0.6 },
                     { Icon: Pencil, cls: 'top-1/2 -right-4 xl:-right-7', d: 1.2 },
                     { Icon: Award, cls: '-bottom-5 right-10', d: 1.8 },
                  ].map(({ Icon, cls, d }) => (
                     <motion.span
                        key={cls}
                        aria-hidden="true"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: d }}
                        className={`hidden sm:flex absolute z-20 w-11 h-11 items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-lg ring-2 ring-white dark:ring-slate-900 ${cls}`}
                        style={{ borderRadius: 14 }}
                     >
                        <Icon className="w-5 h-5" />
                     </motion.span>
                  ))}
                  <div aria-hidden="true" className="hidden sm:block absolute z-20 -bottom-6 -left-4 xl:-left-8 w-28 p-2.5 bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-white/10 rotate-[4deg]" style={{ borderRadius: 10 }}>
                     {[1, 0, 2, 3].map((on, r) => (
                        <div key={r} className="flex items-center justify-between py-[3px]">
                           {[0, 1, 2, 3].map((c) => (
                              <span key={c} className={`flex items-center justify-center w-4 h-4 border-2 ${c === on ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 dark:border-slate-600'}`} style={{ borderRadius: '50%' }}>
                                 {c === on && <Check className="w-2.5 h-2.5" strokeWidth={4} />}
                              </span>
                           ))}
                        </div>
                     ))}
                  </div>
                  <motion.div
                     initial={{ opacity: 0, y: 24, rotate: 0 }}
                     animate={{ opacity: 1, y: 0, rotate: -2 }}
                     transition={{ duration: 0.5 }}
                     className="relative w-full overflow-hidden text-white shadow-2xl ring-1 ring-white/10 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950"
                     style={{ borderRadius: 16 }}
                  >
                     <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                     <div className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />

                     <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 bg-black/25 border-b border-white/15">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em]">
                           <Trophy className="w-4 h-4 text-primary-300" /> AajExam · {translate('Student profile')}
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000]">{translate('FREE')}</span>
                     </div>

                     <div className="relative p-4 xl:p-5 space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-14 h-16 bg-white/90 text-primary-700 dark:text-primary-300 flex items-center justify-center shadow-lg rotate-[-3deg]" style={{ borderRadius: 6 }}>
                              <Users className="w-7 h-7" />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/60">{translate('Target exams')}</p>
                              <p className="text-xl xl:text-2xl font-black font-outfit uppercase leading-tight">{translate('Your Dream Job')}</p>
                              <p className="text-xs font-bold text-primary-200">{translate('Join Now For Free')}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dashed border-white/30">
                           {[
                              { label: 'Students', val: stats.activeStudents, icon: Users },
                              { label: 'Exams', val: stats.totalExams, icon: Target },
                              { label: 'Quizzes', val: stats.totalQuizzes, icon: Gamepad2 },
                              { label: 'Questions', val: stats.totalQuestions, icon: Brain },
                           ].map((c) => (
                              <div key={c.label} className="relative overflow-hidden bg-white/10 ring-1 ring-white/20 px-3 py-2.5" style={{ borderRadius: 10 }}>
                                 <c.icon className="absolute -right-1.5 -bottom-1.5 w-9 h-9 text-white/10" />
                                 <p className="relative text-xl font-black font-outfit leading-none text-primary-200">{c.val}</p>
                                 <p className="relative mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/75">{translate(c.label)}</p>
                              </div>
                           ))}
                        </div>

                        <div className="flex items-end justify-between gap-3 pt-3 border-t border-dashed border-white/30">
                           <div className="flex items-stretch h-7" aria-hidden="true">
                              {Array.from('AAJEXAM2026').flatMap((ch) => { const c = ch.charCodeAt(0); return [1 + (c % 3), 1 + ((c >> 2) % 2)]; }).map((w, i) => (
                                 <span key={i} className={i % 2 === 0 ? 'bg-white/85' : 'bg-transparent'} style={{ width: w * 2 }} />
                              ))}
                           </div>
                           <p className="text-[9px] font-mono tracking-[0.3em] text-white/60">AAJEXAM</p>
                        </div>
                     </div>
                  </motion.div>
                  </div>
               </div>
            </div>
         </section>

         {/* ── Ticker Stats ── */}
         <section className="border-y border-slate-200 dark:border-white/10 text-slate-800 dark:text-white overflow-hidden relative flex px-0 py-3 xl:py-5">
            <style>{`
               @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
               }
               .animate-marquee {
                  animation: marquee 25s linear infinite;
                  display: flex;
                  white-space: nowrap;
               }
               .animate-marquee:hover {
                  animation-play-state: paused;
               }
            `}</style>

            <div className="animate-marquee w-max">
               {/* Repeat content twice for seamless loop */}
               {[0, 1].map((iteration) => (
                  <div key={iteration} className="flex items-center gap-12 pr-12">
                     <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-white/90">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-primary-300 animate-pulse"></span>
                        <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">🔥 {stats.registeredLast30Days}</span>
                        {translate('Registered Users (Last 30 Days)')}
                     </div>
                     <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-white/90">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-primary-300 animate-pulse"></span>
                        <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">📝 {stats.practiceTestAttemptsLast30Days}</span>
                        {translate('Practice Test Attempts (Last 30 Days)')}
                     </div>
                     <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-white/90">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-primary-300 animate-pulse"></span>
                        <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">📚 {stats.pyqAttemptsLast30Days}</span>
                        {translate("PYQ's Attempts (Last 30 Days)")}
                     </div>
                     <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-white/90">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-primary-300 animate-pulse"></span>
                        <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">📈 {stats.quizAttemptsLast30Days}</span>
                        {translate('Quiz Attempts (Last 30 Days)')}
                     </div>
                  </div>
               ))}
            </div>
         </section>
         </div>

         {/* ── Try before signup ── */}
         <SampleQuiz />

         {/* ── 3-Step How It Works ── */}
         <section className="px-0 py-3 xl:py-5">
            <div className="container mx-auto px-3 xl:px-0">
               <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6 relative">
                     {[
                        { step: 1, title: "Choose Your Exam", desc: "Select from SSC, UPSC, Police, Banking etc.", icon: Target, color: "text-primary-950", bg: "bg-gradient-to-br from-primary-300 to-primary-400" },
                        { step: 2, title: "Practice Daily", desc: "Take Subject or Topic wise quizzes and tests.", icon: Zap, color: "text-primary-950", bg: "bg-gradient-to-br from-primary-300 to-primary-400" },
                        { step: 3, title: "Track & Get Job", desc: "Analyze performance and get your dream job.", icon: Trophy, color: "text-primary-950", bg: "bg-gradient-to-br from-primary-300 to-primary-400" }
                     ].map((item, i) => (
                        <div key={i} className="relative flex flex-col overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all" style={{ borderRadius: 16 }}>
                           <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
                           <div className="flex-1 flex flex-col items-center text-center p-4 xl:p-6">
                              <div className={`w-16 h-16 ${item.bg} flex items-center justify-center mb-3 xl:mb-4 shadow-lg rotate-[-4deg]`} style={{ borderRadius: 14 }}>
                                 <item.icon className={`w-8 h-8 ${item.color}`} />
                              </div>
                              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                                 {translate('Step {step}: {title}', { step: item.step, title: translate(item.title) })}
                              </h2>
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                 {translate(item.desc)}
                              </p>
                           </div>
                           <div className="relative border-t-2 border-dashed border-primary-500/30 bg-primary-600/5 py-2 flex items-center justify-center">
                              <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-page" style={{ borderRadius: '50%' }} />
                              <span className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-page" style={{ borderRadius: '50%' }} />
                              <span className="text-2xl font-black font-outfit text-primary-600/40 dark:text-primary-300/50 leading-none">0{item.step}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>


         <section className="px-0 py-3 xl:py-5">
            <div className="container mx-auto px-3 xl:px-0">
               <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl p-3 xl:p-6" style={{ borderRadius: 16 }}>
                  <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                  <div className="relative grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 xl:gap-4">
                     {[
                        { label: 'Students', val: stats.activeStudents, icon: Users },
                        { label: 'Exams', val: stats.totalExams, icon: Target },
                        { label: 'Quizzes', val: stats.totalQuizzes, icon: Gamepad2 },
                        { label: 'Subjects', val: stats.totalSubjects, icon: BookOpen },
                        { label: 'Topics', val: stats.totalTopics, icon: Layers },
                        { label: 'Questions', val: stats.totalQuestions, icon: Brain }
                     ].map((stat, index) => (
                        <div key={index} className="relative overflow-hidden bg-white/80 hover:bg-white ring-1 ring-primary-200 dark:bg-white/10 dark:hover:bg-white/15 dark:ring-white/20 px-3 py-4 transition-colors" style={{ borderRadius: 12 }}>
                           <stat.icon className="absolute -right-2 -bottom-2 w-14 h-14 text-primary-600/10 dark:text-white/10" />
                           <div className="relative text-2xl xl:text-4xl font-black font-outfit text-primary-700 dark:text-primary-200 leading-none">{stat.val}</div>
                           <div className="relative mt-1.5 text-[10px] xl:text-xs font-black tracking-[0.12em] uppercase text-slate-600 dark:text-white/75">{translate(stat.label)}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* ── PYQ Section ── */}
         <section className="bg-background-page relative overflow-hidden px-0 py-3 xl:py-6">
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary-500/10 blur-[80px] opacity-60" />
            </div>
            <div className="container mx-auto px-3 xl:px-0 relative z-10">
               <div className="text-center space-y-2 xl:space-y-3 mb-5 xl:mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-[0_4px_20px_rgba(251,191,36,0.35)] rounded-full text-xs font-black tracking-[0.1em] uppercase">
                     <span className="w-2 h-2 rounded-full bg-amber-950 animate-pulse" />
                     {translate('Last Year PYQ — Always Free')}
                  </div>
                  <h2 className="text-2xl xl:text-4xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                     {rich('Practice with <0>Real Papers</0>', [(c) => <span className="text-primary-600 dark:text-primary-300">{c}</span>])}
                  </h2>
                  <p className="text-base xl:text-xl font-bold text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                     {stats.totalPyqPapers > 0
                        ? translate('{count} Previous Year Papers for SSC, RRB, IBPS, UPSC — attempt under real exam conditions with timer, negative marking & detailed solutions.', { count: stats.totalPyqPapers })
                        : translate('Previous Year Papers for SSC, RRB, IBPS, UPSC — attempt under real exam conditions with timer, negative marking & detailed solutions.')}
                  </p>
               </div>

               {/* Exam tiles */}
               <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5 xl:mb-6">
                  {stats.examStats && stats.examStats.length > 0 ? stats.examStats.map((exam, idx) => (
                     <motion.div
                        key={exam._id}
                        whileHover={{ y: -6 }}
                        className="relative cursor-pointer flex flex-col overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-shadow group"
                        style={{ borderRadius: 14 }}
                     >
                        <Link href={exam.slug ? `/pyq/${exam.slug}` : '/pyq'} className="absolute inset-0 z-10" aria-label={`${exam.name} Previous Year Question Papers`} />
                        <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />

                        <div className="flex-1 p-3 xl:p-4 flex flex-col items-center text-center gap-2.5">
                           <span className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] group-hover:rotate-0 transition-transform" style={{ borderRadius: 10 }}>
                              <BookOpen className="w-4 h-4" />
                           </span>
                           <span className="text-sm xl:text-base font-black text-slate-900 dark:text-white leading-tight">{exam.name}</span>
                           <div className="w-full grid gap-1.5">
                              {[
                                 { icon: BookOpen, text: translate('{count} PYQs', { count: exam.pyqCount }) },
                                 { icon: Target, text: translate('{count} Practice Tests', { count: exam.practiceTestCount }) },
                                 { icon: Gamepad2, text: translate('{count} Quizzes', { count: exam.quizCount }) },
                              ].map((row, i) => (
                                 <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-primary-500/5 dark:bg-white/5 text-[10px] xl:text-[11px] font-bold text-slate-700 dark:text-slate-300" style={{ borderRadius: 8 }}>
                                    <row.icon className="w-3 h-3 shrink-0 text-primary-600 dark:text-primary-300" />
                                    <span className="truncate">{row.text}</span>
                                 </span>
                              ))}
                           </div>
                        </div>

                        <div className="relative border-t-2 border-dashed border-primary-500/30 bg-primary-600/5 py-2 text-center">
                           <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-page" style={{ borderRadius: '50%' }} />
                           <span className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-page" style={{ borderRadius: '50%' }} />
                           <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] text-[10px] font-black uppercase tracking-wider shadow" style={{ borderRadius: 999 }}>{translate('Latest Free')}</span>
                        </div>
                     </motion.div>
                  )) : null}
               </div>

               {/* Crawlable PYQ links (server-rendered, one per exam) */}
               <nav aria-label="Previous year papers by exam" className="flex flex-wrap items-center justify-center gap-2 mb-5 xl:mb-6">
                  {POPULAR_PYQ_EXAMS.map((e) => (
                     <Link key={e.slug} href={`/pyq/${e.slug}`} className="group inline-flex items-center gap-2 px-3 py-1.5 bg-background-surface border-2 border-dashed border-primary-500/30 text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-200 hover:border-primary-600 hover:bg-primary-500/5 hover:-translate-y-0.5 transition-all" style={{ borderRadius: 10 }}>
                        <span className="w-1.5 h-1.5 bg-amber-400 group-hover:scale-150 transition-transform" style={{ borderRadius: '50%' }} />
                        {e.name} {translate('Previous Year Papers')}
                     </Link>
                  ))}
               </nav>

               {/* CTA row */}
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.button
                     whileHover={{ scale: 1.03 }}
                     whileTap={{ scale: 0.97 }}
                     data-cta="landing_pyq_start"
                     onClick={() => router.push('/register')}
                     className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] hover:brightness-105 font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all text-sm"
                  >
                     {translate('Start Free PYQ Practice →')}
                  </motion.button>
                  <button
                     onClick={() => router.push('/pyq')}
                     className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-800 hover:brightness-110 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all text-sm"
                  >
                     {translate('Browse All PYQs')}
                  </button>
               </div>
            </div>
         </section>

         {/* ── Features Section ── */}
         <section id="features" className="py-6 xl:py-12 border-t-2 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="container mx-auto px-3 xl:px-0 space-y-5 xl:space-y-8">
               <div className="text-center space-y-6 max-w-3xl mx-auto">
                  <h2 className="text-xl xl:text-4xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-none">{translate('Study Smart.')} <br /> {translate('Pass Your Exam.')}</h2>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-400 px-4">{translate('Everything you need to prepare for government exams, all in one place.')}</p>

               </div>

               <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 xl:gap-5">
                  <Card className="xl:col-span-8 p-5 xl:p-8 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 border-none shadow-xl text-slate-900 dark:text-white flex flex-col justify-between group overflow-hidden relative rounded-[2rem] xl:rounded-[4rem]">
                     <div className="space-y-6 relative z-10 max-w-xl">
                        <div className="p-4 xl:p-5 bg-white/80 dark:bg-white/20 backdrop-blur-md rounded-3xl xl:rounded-[2.5rem] w-fit shadow-sm border-2 border-slate-200 dark:border-white/20">
                           <Trophy className="w-10 h-10 xl:w-12 xl:h-12" />
                        </div>
                        <h3 className="text-xl xl:text-3xl font-black font-outfit uppercase leading-[0.95]">{translate('See your progress')}</h3>
                        <p className="text-base xl:text-md xl:text-xl font-bold opacity-80 leading-relaxed">{translate('Know how well you are doing. Get a clear report after every exam and move up as you improve.')}</p>
                        <div className="pt-4 xl:pt-8">
                           <Button variant="secondary" size="lg" className="rounded-[1.5rem] xl:rounded-[2rem] px-6 xl:px-8 font-black tracking-[0.08em] text-sm py-4 xl:py-6" cta="landing_progress_card" onClick={() => router.push('/register')}>
                              {translate('Check your progress')}
                           </Button>
                        </div>
                     </div>
                     <Rocket className="absolute -right-16 -bottom-16 w-[300px] xl:w-[400px] h-[300px] xl:h-[400px] opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                     <div className="absolute top-0 right-0 w-full h-full bg-white/80 dark:bg-white/10 pointer-events-none" />
                  </Card>

                  <Card className="xl:col-span-4 p-4 xl:p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 flex flex-col justify-between hover:border-primary-700 transition-all group rounded-[2rem] xl:rounded-[4rem] shadow-sm">
                     <div className="space-y-2 xl:space-y-4">
                        <div className="p-3 xl:p-4 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-lg rotate-[-4deg] w-fit rounded-2xl">
                           <Flame className="w-8 h-8 xl:w-10 xl:h-10" />
                        </div>
                        <h3 className="text-xl xl:text-3xl font-black font-outfit uppercase leading-tight text-slate-900 dark:text-white">{translate('Practice every day')}</h3>
                        <p className="text-base xl:text-lg font-bold text-slate-600 dark:text-slate-400">{translate('Practice a little every day. This helps you remember more and climb higher on the student list.')}</p>
                     </div>
                     <div className="space-y-3 xl:space-y-4 pt-4 xl:pt-5">
                        {[80, 60, 95].map((width, index) => (
                           <div key={index} className="h-2 xl:h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                 initial={{ width: 0 }}
                                 whileInView={{ width: `${width}%` }}
                                 className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-300 shadow-sm"
                              />
                           </div>
                        ))}
                     </div>
                  </Card>

                  <Card className="xl:col-span-4 p-4 xl:p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 flex flex-col justify-between group overflow-hidden rounded-[2rem] xl:rounded-[4rem] shadow-sm">
                     <div className="space-y-2 xl:space-y-4">
                        <div className="p-3 xl:p-4 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-lg rotate-[-4deg] w-fit rounded-2xl">
                           <Zap className="w-8 h-8 xl:w-10 xl:h-10" />
                        </div>
                        <h3 className="text-xl xl:text-3xl font-black font-outfit uppercase leading-tight text-slate-900 dark:text-white">{translate('See your test results')}</h3>
                        <p className="text-base xl:text-lg font-bold text-slate-600 dark:text-slate-400">{translate('After every test, see how many you got right and which topics need more practice.')}</p>
                     </div>
                     <div className="flex gap-3 xl:gap-4 pt-4 xl:pt-5">
                        <div className="flex-1 h-16 xl:h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl xl:rounded-3xl relative overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                           <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary-500/40 to-amber-300/30 h-1/2" />
                        </div>
                        <div className="flex-1 h-16 xl:h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl xl:rounded-3xl relative overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                           <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary-500/50 to-amber-300/40 h-3/4" />
                        </div>
                        <div className="flex-1 h-16 xl:h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl xl:rounded-3xl relative overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                           <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary-600/70 to-amber-300/60 h-[90%]" />
                        </div>
                     </div>
                  </Card>

                  <Card className="xl:col-span-8 p-4 xl:p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 shadow-sm flex flex-col xl:flex-row items-center gap-6 xl:gap-10 overflow-hidden group rounded-[2rem] xl:rounded-[4rem]">
                     <div className="flex-1 space-y-2 xl:space-y-4 relative z-10 text-center xl:text-left">
                        <div className="p-3 xl:p-4 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-lg rotate-[-4deg] w-fit rounded-2xl mx-auto xl:mx-0">
                           <Medal className="w-10 h-10 xl:w-12 xl:h-12" />
                        </div>
                        <h3 className="text-xl md:text-2xl xl:text-3xl font-black font-outfit uppercase leading-[0.9] text-slate-900 dark:text-white">{translate('Refer & Earn')}</h3>
                        <p className="text-base xl:text-lg font-bold text-slate-600 dark:text-slate-400 max-w-sm px-2 xl:px-0">{translate('Invite your friends to AajExam. Earn cash rewards every time a friend upgrades to PRO.')}</p>
                        <div className="pt-2 xl:pt-4">
                           <Button variant="primary" size="lg" className="w-full xl:w-auto shadow-sm rounded-lg xl:rounded-xl xl:rounded-2xl px-8 xl:px-10 font-outfit font-black tracking-[0.08em] text-sm py-4 xl:py-6" cta="landing_referral_card" onClick={() => router.push('/login')}>
                              {translate('Start referring')}
                           </Button>
                        </div>
                     </div>
                  </Card>
               </div>
            </div>
         </section>

         <section className="overflow-hidden relative px-0 py-3 xl:py-6">
            <div className="container mx-auto px-3 xl:px-0 relative z-10">
               <div className="flex flex-col gap-5 xl:gap-8">
                  <div className="space-y-5 xl:space-y-8 text-center w-full">
                     <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl xl:text-6xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-[0.8] mb-8 xl:mb-12"
                     >
                        {translate('Study with')} <br /><span className="text-primary-600 dark:text-primary-300">{translate('Confidence.')}</span>
                     </motion.h2>

                     <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-5">
                        {[
                           { title: "Daily Goals", desc: "Set a small goal for each day and complete it. Small steps lead to big results.", icon: Target },
                           { title: "Study with Others", desc: "Study with thousands of students who want to pass the same exams as you.", icon: Users },
                           { title: "Detailed Solutions", desc: "Get in-depth explanations for every question to understand concepts better.", icon: BookOpen }
                        ].map((item, index) => (
                           <div key={index} className="relative flex flex-col overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all group" style={{ borderRadius: 16 }}>
                              <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
                              <div className="flex flex-col items-center p-4 xl:p-6">
                                 <div className="w-14 h-14 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] flex items-center justify-center mb-3 shadow-lg rotate-[-4deg] group-hover:rotate-0 transition-transform" style={{ borderRadius: 14 }}>
                                    <item.icon className="w-8 h-8" />
                                 </div>
                                 <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">{translate(item.title)}</h3>
                                 <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto text-center px-4">{translate(item.desc)}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="relative w-full mx-auto px-0 xl:px-4 xl:px-0">
                     <div className="absolute -inset-20 bg-primary-500/10 blur-[120px] rounded-full opacity-50" />
                  </div>
               </div>
            </div>
         </section>

         <section className="container mx-auto px-3 xl:px-0 py-3 xl:py-6">
            <div className="relative overflow-hidden text-white shadow-2xl ring-1 ring-white/10 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950 p-6 xl:p-10 text-center" style={{ borderRadius: 20 }}>
               <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />
               <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
               <div className="pointer-events-none absolute -bottom-32 right-10 w-96 h-96 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
               <Trophy className="pointer-events-none absolute right-6 top-6 w-40 h-40 xl:w-56 xl:h-56 text-white/5 rotate-12" />
               <div className="relative z-10 space-y-3 xl:space-y-5">
                  <motion.h2
                     whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                     className="text-2xl xl:text-5xl font-black font-outfit uppercase tracking-tighter leading-[0.98]"
                  >
                     {translate('Your Dream Job')} <br /><span className="text-primary-300">{translate('Is Waiting.')}</span>
                  </motion.h2>
                  <p className="text-base md:text-xl font-bold text-white/85 max-w-3xl mx-auto leading-relaxed">{translate('Start today. Join AajExam, practice every day, and get the government job you want.')}</p>
                  <div className="pt-2 xl:pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                     <button
                        data-cta="landing_final_cta"
                        onClick={() => router.push('/register')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] font-outfit font-black uppercase tracking-[0.1em] text-sm shadow-xl hover:brightness-105 active:scale-95 transition-all"
                     >
                        {translate('Join Now For Free')} <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>
         </section>
      </MobileAppWrapper>
   );
};

export default ModernLandingPage;


