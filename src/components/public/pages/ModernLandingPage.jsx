'use client';

import React, { useState, useEffect } from "react";
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Link from '@/components/common/AppLink';
import {
   Trophy,
   Brain,
   Target,
   Zap,
   Users,
   Flame,
   ShieldCheck,
   ArrowRight,
   Medal,
   BookOpen,
   Layers,
   Gamepad2,
   Check,
   X,
   RotateCcw,
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import MobileAppWrapper from "../../common/MobileAppWrapper";
import API from '../../../lib/api';
import Button from '../../common/ui/Button';
import dynamic from 'next/dynamic';

// Google's sign-in script only loads once the visitor reaches the end of the hero quiz.
const HeroGoogleSignup = dynamic(() => import('../HeroGoogleSignup'), { ssr: false });
import useTranslate from '../../../hooks/useTranslate';
import HERO_QUESTIONS from '../../../data/heroQuestions.json';


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

// Hero mini-quiz: a playable 5-question round so a visitor feels the product before signing up.
// Questions are real: src/data/heroQuestions.json holds 100 of them (5 from each of 20 quizzes spread across
// exams, subjects and topics; rebuild it with `node scripts/buildHeroQuestions.js --write`). Each load and
// each "Try Again" shows 5 random ones, preferring different quizzes, so the card needs no API call.
// Every label reuses an existing translation key.
const HERO_FALLBACK = [
   { q: '12 × 8 = ?', opts: ['86', '92', '96', '98'], a: 2 },
   { q: '25% of 200 = ?', opts: ['50', '40', '25', '75'], a: 0 },
   { q: '15 + 27 ÷ 3 = ?', opts: ['14', '24', '32', '42'], a: 1 },
   { q: '7² − 9 = ?', opts: ['58', '49', '40', '42'], a: 2 },
   { q: '√144 = ?', opts: ['10', '14', '12', '16'], a: 2 },
];
const HERO_COUNT = 5;
const HERO_SECS = 20;
const HERO_NEXT_MS = 1200;
const HERO_RING = 2 * Math.PI * 15;

const pickRound = () => {
   const pool = [...HERO_QUESTIONS];
   for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
   }
   const out = [];
   const quizzes = new Set();
   for (const r of pool) {
      if (out.length === HERO_COUNT) break;
      if (!quizzes.has(r.quiz)) { quizzes.add(r.quiz); out.push(r); }
   }
   for (const r of pool) {
      if (out.length === HERO_COUNT) break;
      if (!out.includes(r)) out.push(r);
   }
   const rows = out.map((r) => ({ q: r.q, opts: r.o, a: r.a, title: r.quiz }));
   return [...rows, ...HERO_FALLBACK].slice(0, HERO_COUNT);
};

const HeroQuizCard = () => {
   const { translate, translateData } = useTranslate();
   const [items, setItems] = useState(null); // null until the first round is picked (client only)
   const [loadKey, setLoadKey] = useState(0);
   const [idx, setIdx] = useState(0);
   const [chosen, setChosen] = useState(null); // option index, -1 = ran out of time
   const [result, setResult] = useState(null); // null until the answer is known, then true / false
   const [secs, setSecs] = useState(HERO_SECS);
   const [started, setStarted] = useState(false); // the clock only runs once the visitor has played
   const [marks, setMarks] = useState([]);
   const [streak, setStreak] = useState(0);
   const [points, setPoints] = useState(0);
   const [gain, setGain] = useState(0);

   // fresh random round on every page load and every "Try Again"
   useEffect(() => {
      setItems(pickRound());
   }, [loadKey]);

   const total = HERO_COUNT;
   const done = idx >= total;
   const q = items ? items[Math.min(idx, total - 1)] : null;
   const correctAt = q ? q.a : null;
   const locked = chosen !== null;
   const score = marks.filter(Boolean).length;

   const settle = (ok) => {
      setResult(ok);
      setMarks((m) => [...m, ok]);
      if (ok) {
         const g = 10 + streak * 5;
         setGain(g);
         setPoints((p) => p + g);
         setStreak((s) => s + 1);
      } else {
         setGain(0);
         setStreak(0);
      }
   };

   const answer = (i) => {
      if (locked || done || !q) return;
      setStarted(true);
      setChosen(i);
      settle(i === q.a);
   };

   // countdown (paused until the first answer, so an idle visitor never sees the round end by itself)
   useEffect(() => {
      if (!items || !started || done || locked) return undefined;
      const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
      return () => clearInterval(t);
   }, [items, started, done, locked]);

   useEffect(() => {
      if (!items || !started || done || locked || secs > 0) return;
      setChosen(-1);
      settle(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [secs, items, started, done, locked]);

   // move on once the answer has been shown
   useEffect(() => {
      if (result === null) return undefined;
      const t = setTimeout(() => {
         setIdx((i) => i + 1);
         setChosen(null);
         setResult(null);
         setSecs(HERO_SECS);
      }, HERO_NEXT_MS);
      return () => clearTimeout(t);
   }, [result]);

   const restart = () => {
      setIdx(0); setChosen(null); setResult(null); setSecs(HERO_SECS); setStarted(false);
      setMarks([]); setStreak(0); setPoints(0); setGain(0);
      setLoadKey((k) => k + 1);
   };

   const low = secs <= 5;
   const accuracy = Math.round((score / total) * 100);
   const bestStreak = marks.reduce((acc, ok) => { const run = ok ? acc.run + 1 : 0; return { run, best: Math.max(acc.best, run) }; }, { run: 0, best: 0 }).best;
   const qLen = q ? q.q.length : 0;
   const qSize = qLen <= 16 ? 'text-3xl xl:text-4xl' : qLen <= 70 ? 'text-base xl:text-xl' : 'text-sm xl:text-lg';

   return (
      <>
         <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border-primary">
            <div className="flex items-center gap-3 min-w-0">
               <div className="relative w-10 h-10 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90" aria-hidden="true">
                     <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" style={{ stroke: 'var(--border-primary)' }} />
                     <circle
                        cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round"
                        className={low ? 'stroke-red-500' : 'stroke-primary-600'}
                        style={{ strokeDasharray: HERO_RING, strokeDashoffset: HERO_RING * (1 - (done ? 0 : secs / HERO_SECS)), transition: 'stroke-dashoffset 1s linear' }}
                     />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">{done ? '✓' : secs}</span>
               </div>
               <span className="text-xs xl:text-sm font-bold uppercase tracking-[0.08em] truncate">{translate('Question')} {Math.min(idx + 1, total)}/{total}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <span className="flex items-center gap-1.5 text-base font-bold tabular-nums">
                  <Flame className={`w-5 h-5 ${(done ? bestStreak : streak) > 0 ? 'text-orange-500' : 'text-content-muted'}`} /> {done ? bestStreak : streak}
               </span>
               <span className="flex items-center gap-1.5 text-base font-bold tabular-nums">
                  <Trophy className="w-5 h-5 text-primary-600" /> {points}
               </span>
            </div>
         </div>

         <div className="flex h-2 gap-1.5 px-5 pt-3">
            {Array.from({ length: total }, (_, i) => {
               const m = marks[i];
               const cls = m === true ? 'bg-primary-600' : m === false ? 'bg-red-500' : i === idx && !done ? 'bg-content-primary' : 'bg-background-surface-secondary';
               return <span key={i} className={`flex-1 h-1 rounded ${cls}`} />;
            })}
         </div>

         {done ? (
            <div className="p-5 xl:p-6 pt-6 space-y-5 text-center">
               <div>
                  <p className="text-5xl xl:text-6xl font-extrabold font-outfit leading-none">{score}<span className="text-content-muted">/{total}</span></p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-content-secondary">{translate('Correct')}</p>
               </div>
               <div className="grid grid-cols-3 gap-2">
                  {[
                     { l: translate('Accuracy'), v: `${accuracy}%`, I: Target },
                     { l: translate('Score'), v: points, I: Trophy },
                     { l: translate('Streak'), v: bestStreak, I: Flame },
                  ].map(({ l, v, I }) => (
                     <div key={l} className="border border-border-primary rounded-xl px-2 py-2.5">
                        <I className="w-4 h-4 mx-auto mb-1 text-primary-600" />
                        <p className="text-lg font-extrabold font-outfit leading-none tabular-nums">{v}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.06em] text-content-secondary">{l}</p>
                     </div>
                  ))}
               </div>
               <div className="flex items-center justify-center gap-2 pt-1">
                  <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-border-primary text-content-primary hover:bg-background-surface-secondary transition-colors rounded-lg">
                     <RotateCcw className="w-3.5 h-3.5" /> {translate('Try Again')}
                  </button>
                  <HeroGoogleSignup />
               </div>
            </div>
         ) : !q ? (
            <div className="p-4 xl:p-5 space-y-3.5 animate-pulse" aria-busy="true">
               <div className="h-10" />
               <div className="h-[116px] bg-background-surface-secondary rounded-xl" />
               <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="h-[60px] bg-background-surface-secondary rounded-xl" />)}
               </div>
               <div className="h-[40px] border-t border-dashed border-border-primary" />
            </div>
         ) : (
            <div className="p-4 xl:p-5 space-y-3.5">
               <p className="min-h-[2.5rem] text-xs font-bold uppercase tracking-[0.08em] leading-snug text-primary-600">
                  {q.title ? translateData(q.title) : ''}
               </p>
               <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-center min-h-[116px] border border-border-primary rounded-xl px-4 py-4 text-center"
               >
                  <p className={`${qSize} font-bold font-outfit tracking-tight leading-snug`}>{q.q}</p>
               </motion.div>

               <div className="grid grid-cols-2 gap-3">
                  {q.opts.map((val, i) => {
                     const known = result !== null;
                     const isRight = known && i === correctAt;
                     const isWrong = known && result === false && chosen === i;
                     const pending = locked && !known && chosen === i;
                     const dim = known && !isRight && !isWrong;
                     return (
                        <motion.button
                           key={`${idx}-${i}`}
                           type="button"
                           disabled={locked}
                           onClick={() => answer(i)}
                           animate={isWrong ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                           transition={{ duration: 0.4 }}
                           whileTap={locked ? undefined : { scale: 0.97 }}
                           className={`relative flex items-center gap-2.5 px-3 py-2.5 min-h-[60px] text-left border rounded-xl transition-colors duration-200 ${isRight ? 'border-green-600 text-content-primary' : isWrong ? 'border-red-500 text-content-primary' : pending ? 'border-primary-600 text-content-primary' : dim ? 'border-border-primary text-content-muted' : 'border-border-primary text-content-primary hover:border-primary-600 cursor-pointer'} ${!started && !locked ? 'animate-hero-pulse motion-reduce:animate-none' : ''}`}
                           style={{ animationDelay: `${i * 0.25}s` }}
                        >
                           <span className={`w-7 h-7 shrink-0 flex items-center justify-center text-xs font-bold rounded-md border ${isRight ? 'bg-green-600 border-green-600 text-white' : isWrong ? 'bg-red-500 border-red-500 text-white' : 'border-border-primary'}`}>
                              {String.fromCharCode(65 + i)}
                           </span>
                           <span className="min-w-0 flex-1 text-sm xl:text-base font-bold font-outfit leading-tight line-clamp-3 break-words">{val}</span>
                           {isRight && <Check className="w-4 h-4 shrink-0 text-green-600" strokeWidth={3} />}
                           {isWrong && <X className="w-4 h-4 shrink-0 text-red-500" strokeWidth={3} />}
                           {isRight && chosen === i && [0, 1, 2, 3, 4, 5, 6, 7].map((p) => (
                              <motion.span
                                 key={p}
                                 aria-hidden="true"
                                 initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                 animate={{ opacity: 0, x: Math.cos((p / 8) * Math.PI * 2) * 46, y: Math.sin((p / 8) * Math.PI * 2) * 30, scale: 0.4 }}
                                 transition={{ duration: 0.7, ease: 'easeOut' }}
                                 className="absolute right-6 top-1/2 w-1.5 h-1.5 bg-primary-600 rounded-full pointer-events-none"
                              />
                           ))}
                        </motion.button>
                     );
                  })}
               </div>

               <div className="flex items-center justify-between min-h-[40px] pt-3 border-t border-dashed border-border-primary" aria-live="polite">
                  {result !== null ? (
                     <motion.span
                        key={`fb-${idx}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-base font-bold"
                     >
                        {result
                           ? <><Check className="w-4 h-4 text-green-600" strokeWidth={3} /> {translate('Correct')} <span className="text-green-600 tabular-nums">+{gain}</span></>
                           : <><X className="w-4 h-4 text-red-500" strokeWidth={3} /> {translate('Wrong')}</>}
                     </motion.span>
                  ) : (
                     <span className="text-xs font-bold uppercase tracking-[0.08em] text-content-secondary">{translate('Question')} {idx + 1}</span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.06em] text-content-secondary">
                     <Zap className="w-3.5 h-3.5 text-primary-600" /> {translate('Correct')} {score}/{total}
                  </span>
               </div>
            </div>
         )}
      </>
   );
};

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

   const TICKER = [
      { n: stats.registeredLast30Days, l: 'Registered Users (Last 30 Days)' },
      { n: stats.practiceTestAttemptsLast30Days, l: 'Practice Test Attempts (Last 30 Days)' },
      { n: stats.pyqAttemptsLast30Days, l: "PYQ's Attempts (Last 30 Days)" },
      { n: stats.quizAttemptsLast30Days, l: 'Quiz Attempts (Last 30 Days)' },
   ];

   return (
      <MobileAppWrapper showHeader={true} title={translate('Home')}>
         <div className="xl:min-h-[calc(100vh-5.5rem)] xl:flex xl:flex-col">
         <section className="-mx-4 xl:-mx-8 xl:flex-1 xl:flex xl:items-center bg-background-surface text-content-primary">
            <div className="container mx-auto px-4 xl:px-6 w-full">
               <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] items-center gap-8 xl:gap-12 py-8 xl:py-4">
                  {/* Copy */}
                  <div className="space-y-5 xl:space-y-7 text-center xl:text-left">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-border-primary text-content-secondary text-xs font-bold rounded-full">
                        <span className="w-2 h-2 rounded-full bg-primary-600" />
                        {translate('Trusted by students across India')}
                     </div>

                     <h1 className="text-4xl xl:text-6xl font-extrabold font-outfit tracking-tight leading-[1.08]">
                        {translate('Prepare Today.')}
                        <span className="block text-primary-600">{translate('Succeed Tomorrow.')}</span>
                     </h1>

                     <p className="text-base xl:text-xl text-content-secondary font-medium max-w-xl mx-auto xl:mx-0 leading-relaxed">
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
                           className="w-full sm:w-auto"
                           onClick={() => router.push('/govt-exams-preparation')}
                        >
                           {translate('Browse exams')}
                        </Button>
                     </div>

                     <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-6 gap-y-2 pt-4 border-t border-border-primary">
                        {[
                           { icon: ShieldCheck, label: 'Questions by experts' },
                           { icon: Flame, label: 'Thousands of questions' },
                           { icon: Trophy, label: 'Practice with topic-wise quizzes' },
                        ].map((t) => (
                           <div key={t.label} className="flex items-center gap-2 font-bold text-xs text-content-secondary">
                              <t.icon className="w-4 h-4 text-primary-600" /> {translate(t.label)}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Playable mini-quiz: visitors answer five quick questions right in the hero */}
                  <motion.div
                     initial={{ opacity: 0, y: 16 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.4 }}
                     className="mx-auto w-full max-w-lg overflow-hidden border border-border-primary bg-background-surface text-content-primary rounded-3xl"
                  >
                     <HeroQuizCard />
                  </motion.div>
               </div>
            </div>
         </section>

         {/* ── Ticker Stats ── */}
         <section aria-label="Last 30 days activity" className="border-y border-border-primary bg-background-surface text-content-secondary overflow-hidden flex">
            <div className="flex w-max hover:[animation-play-state:paused]" style={{ animation: 'marquee 32s linear infinite' }}>
               {/* Repeat content twice for a seamless loop */}
               {[0, 1].map((iteration) => (
                  <div key={iteration} className="flex items-center gap-12 pr-12 py-3 xl:py-4 whitespace-nowrap font-bold" aria-hidden={iteration === 1 ? 'true' : undefined}>
                     {TICKER.map((t) => (
                        <div key={t.l} className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-primary-600" />
                           <span className="text-content-primary font-extrabold font-outfit text-lg tabular-nums">{t.n}</span>
                           {translate(t.l)}
                        </div>
                     ))}
                  </div>
               ))}
            </div>
         </section>
         </div>

         {/* ── 3-Step How It Works ── */}
         <section className="bg-background-surface py-6 xl:py-10">
            <div className="container mx-auto px-3 xl:px-0">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
                  {[
                     { step: 1, title: "Choose Your Exam", desc: "Select from SSC, UPSC, Police, Banking etc.", icon: Target },
                     { step: 2, title: "Practice Daily", desc: "Take Subject or Topic wise quizzes and tests.", icon: Zap },
                     { step: 3, title: "Track & Get Job", desc: "Analyze performance and get your dream job.", icon: Trophy },
                  ].map((item) => (
                     <div key={item.step} className="border border-border-primary bg-background-surface rounded-2xl p-5 xl:p-6 hover:border-primary-600 transition-colors">
                        <div className="flex items-start justify-between">
                           <div className="w-12 h-12 flex items-center justify-center border border-border-primary rounded-xl text-primary-600">
                              <item.icon className="w-6 h-6" />
                           </div>
                           <span className="text-sm font-bold font-outfit text-content-muted">0{item.step}</span>
                        </div>
                        <h2 className="mt-4 text-lg font-bold font-outfit text-content-primary">
                           {translate('Step {step}: {title}', { step: item.step, title: translate(item.title) })}
                        </h2>
                        <p className="mt-2 text-sm font-medium text-content-secondary">{translate(item.desc)}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── Counts ── */}
         <section className="bg-background-surface py-3 xl:py-5">
            <div className="container mx-auto px-3 xl:px-0">
               <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px border border-border-primary rounded-2xl overflow-hidden bg-border-primary">
                  {[
                     { label: 'Students', val: stats.activeStudents, icon: Users },
                     { label: 'Exams', val: stats.totalExams, icon: Target },
                     { label: 'Quizzes', val: stats.totalQuizzes, icon: Gamepad2 },
                     { label: 'Subjects', val: stats.totalSubjects, icon: BookOpen },
                     { label: 'Topics', val: stats.totalTopics, icon: Layers },
                     { label: 'Questions', val: stats.totalQuestions, icon: Brain }
                  ].map((stat) => (
                     <div key={stat.label} className="p-4 xl:p-5 bg-background-surface">
                        <stat.icon className="w-5 h-5 mb-3 text-primary-600" />
                        <div className="text-2xl xl:text-3xl font-extrabold font-outfit leading-none tabular-nums">{stat.val}</div>
                        <div className="mt-2 text-xs font-bold tracking-[0.08em] uppercase text-content-secondary">{translate(stat.label)}</div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── PYQ Section ── */}
         <section className="bg-background-surface py-8 xl:py-12">
            <div className="container mx-auto px-3 xl:px-0">
               <div className="text-center space-y-3 mb-6 xl:mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-border-primary text-xs font-bold rounded-full text-primary-600">
                     <span className="w-2 h-2 rounded-full bg-primary-600" />
                     {translate('Last Year PYQ — Always Free')}
                  </div>
                  <h2 className="text-3xl xl:text-5xl font-extrabold font-outfit tracking-tight leading-tight">
                     {rich('Practice with <0>Real Papers</0>', [(c) => <span className="text-primary-600">{c}</span>])}
                  </h2>
                  <p className="text-base xl:text-lg font-medium text-content-secondary max-w-2xl mx-auto">
                     {stats.totalPyqPapers > 0
                        ? translate('{count} Previous Year Papers for SSC, RRB, IBPS, UPSC — attempt under real exam conditions with timer, negative marking & detailed solutions.', { count: stats.totalPyqPapers })
                        : translate('Previous Year Papers for SSC, RRB, IBPS, UPSC — attempt under real exam conditions with timer, negative marking & detailed solutions.')}
                  </p>
               </div>

               {/* Exam tiles */}
               <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                  {stats.examStats && stats.examStats.length > 0 ? stats.examStats.map((exam) => (
                     <motion.div
                        key={exam._id}
                        whileHover={{ y: -3 }}
                        className="relative cursor-pointer flex flex-col border border-border-primary bg-background-surface rounded-2xl hover:border-primary-600 transition-colors"
                     >
                        <Link href={exam.slug ? `/pyq/${exam.slug}` : '/pyq'} className="absolute inset-0 z-10 rounded-2xl" aria-label={`${exam.name} Previous Year Question Papers`} />
                        <div className="flex-1 p-3 xl:p-4 flex flex-col gap-3">
                           <div className="flex items-center gap-2.5">
                              <span className="w-9 h-9 shrink-0 flex items-center justify-center border border-border-primary rounded-lg text-primary-600">
                                 <BookOpen className="w-4 h-4" />
                              </span>
                              <span className="text-sm xl:text-base font-bold leading-tight text-content-primary">{exam.name}</span>
                           </div>
                           <div className="grid gap-1.5">
                              {[
                                 { icon: BookOpen, text: translate('{count} PYQs', { count: exam.pyqCount }) },
                                 { icon: Target, text: translate('{count} Practice Tests', { count: exam.practiceTestCount }) },
                                 { icon: Gamepad2, text: translate('{count} Quizzes', { count: exam.quizCount }) },
                              ].map((row, i) => (
                                 <span key={i} className="flex items-center gap-1.5 px-2 py-1 border border-border-primary rounded-lg text-xs font-medium text-content-secondary">
                                    <row.icon className="w-3 h-3 shrink-0 text-primary-600" />
                                    <span className="truncate">{row.text}</span>
                                 </span>
                              ))}
                           </div>
                           <span className="self-start px-2.5 py-0.5 border border-primary-600 text-primary-600 text-[11px] font-bold rounded-full">{translate('Latest Free')}</span>
                        </div>
                     </motion.div>
                  )) : null}
               </div>

               {/* Crawlable PYQ links (server-rendered, one per exam) */}
               <nav aria-label="Previous year papers by exam" className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  {POPULAR_PYQ_EXAMS.map((e) => (
                     <Link key={e.slug} href={`/pyq/${e.slug}`} className="inline-flex items-center px-3 py-1.5 border border-border-primary text-xs xl:text-sm font-medium text-content-secondary hover:text-content-primary hover:border-primary-600 transition-colors rounded-full">
                        {e.name} {translate('Previous Year Papers')}
                     </Link>
                  ))}
               </nav>

               {/* CTA row */}
               <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" cta="landing_pyq_start" onClick={() => router.push('/register')}>
                     {translate('Start Free PYQ Practice →')}
                  </Button>
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => router.push('/pyq')}>
                     {translate('Browse All PYQs')}
                  </Button>
               </div>
            </div>
         </section>

         {/* ── Features Section ── */}
         <section id="features" className="bg-background-surface py-8 xl:py-12 border-t border-border-primary">
            <div className="container mx-auto px-3 xl:px-0 space-y-6 xl:space-y-8">
               <div className="text-center space-y-3 max-w-3xl mx-auto">
                  <h2 className="text-3xl xl:text-5xl font-extrabold font-outfit tracking-tight leading-tight">{translate('Study Smart.')} <br /> {translate('Pass Your Exam.')}</h2>
                  <p className="text-base xl:text-lg font-medium text-content-secondary">{translate('Everything you need to prepare for government exams, all in one place.')}</p>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 xl:gap-4">
                  <section className="xl:col-span-8 p-5 xl:p-8 border border-border-primary bg-background-surface rounded-3xl flex flex-col justify-between gap-6 min-h-[260px]">
                     <div className="w-12 h-12 flex items-center justify-center border border-border-primary rounded-xl text-primary-600"><Trophy className="w-6 h-6" /></div>
                     <div className="space-y-3 max-w-xl">
                        <h3 className="text-2xl xl:text-3xl font-bold font-outfit">{translate('See your progress')}</h3>
                        <p className="text-base xl:text-lg font-medium text-content-secondary leading-relaxed">{translate('Know how well you are doing. Get a clear report after every exam and move up as you improve.')}</p>
                     </div>
                     <div>
                        <Button variant="primary" size="lg" cta="landing_progress_card" onClick={() => router.push('/register')}>
                           {translate('Check your progress')}
                        </Button>
                     </div>
                  </section>

                  <section className="xl:col-span-4 p-5 xl:p-6 border border-border-primary bg-background-surface rounded-3xl flex flex-col gap-4">
                     <div className="w-12 h-12 flex items-center justify-center border border-border-primary rounded-xl text-primary-600"><Flame className="w-6 h-6" /></div>
                     <h3 className="text-xl xl:text-2xl font-bold font-outfit">{translate('Practice every day')}</h3>
                     <p className="text-base font-medium text-content-secondary">{translate('Practice a little every day. This helps you remember more and climb higher on the student list.')}</p>
                     <div className="space-y-3 mt-auto pt-2">
                        {[80, 60, 95].map((width) => (
                           <div key={width} className="h-2 w-full bg-background-surface-secondary rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} whileInView={{ width: `${width}%` }} className="h-full bg-primary-600 rounded-full" />
                           </div>
                        ))}
                     </div>
                  </section>

                  <section className="xl:col-span-4 p-5 xl:p-6 border border-border-primary bg-background-surface rounded-3xl flex flex-col gap-4">
                     <div className="w-12 h-12 flex items-center justify-center border border-border-primary rounded-xl text-primary-600"><Zap className="w-6 h-6" /></div>
                     <h3 className="text-xl xl:text-2xl font-bold font-outfit">{translate('See your test results')}</h3>
                     <p className="text-base font-medium text-content-secondary">{translate('After every test, see how many you got right and which topics need more practice.')}</p>
                     <div className="flex items-end gap-3 h-20 mt-auto pt-2">
                        {['h-2/5', 'h-3/5', 'h-[90%]'].map((h) => (
                           <div key={h} className={`flex-1 ${h} bg-primary-600 opacity-90 rounded-t-lg`} />
                        ))}
                     </div>
                  </section>

                  <section className="xl:col-span-8 p-5 xl:p-8 border border-border-primary bg-background-surface rounded-3xl flex flex-col justify-between gap-6">
                     <div className="w-12 h-12 flex items-center justify-center border border-border-primary rounded-xl text-primary-600"><Medal className="w-6 h-6" /></div>
                     <div className="space-y-3 max-w-xl">
                        <h3 className="text-2xl xl:text-3xl font-bold font-outfit">{translate('Refer & Earn')}</h3>
                        <p className="text-base xl:text-lg font-medium text-content-secondary">{translate('Invite your friends to AajExam. Earn cash rewards every time a friend upgrades to PRO.')}</p>
                     </div>
                     <div>
                        <Button variant="primary" size="lg" cta="landing_referral_card" onClick={() => router.push('/login')}>
                           {translate('Start referring')}
                        </Button>
                     </div>
                  </section>
               </div>
            </div>
         </section>

         <section className="bg-background-surface py-8 xl:py-12">
            <div className="container mx-auto px-3 xl:px-0 space-y-6 xl:space-y-8">
               <h2 className="text-center text-3xl xl:text-5xl font-extrabold font-outfit tracking-tight leading-tight">
                  {translate('Study with')} <br /><span className="text-primary-600">{translate('Confidence.')}</span>
               </h2>

               <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xl:gap-4">
                  {[
                     { title: "Daily Goals", desc: "Set a small goal for each day and complete it. Small steps lead to big results.", icon: Target },
                     { title: "Study with Others", desc: "Study with thousands of students who want to pass the same exams as you.", icon: Users },
                     { title: "Detailed Solutions", desc: "Get in-depth explanations for every question to understand concepts better.", icon: BookOpen }
                  ].map((item) => (
                     <div key={item.title} className="border border-border-primary bg-background-surface rounded-2xl p-5 xl:p-6 hover:border-primary-600 transition-colors">
                        <div className="w-12 h-12 flex items-center justify-center border border-border-primary rounded-xl text-primary-600">
                           <item.icon className="w-6 h-6" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold font-outfit text-content-primary">{translate(item.title)}</h3>
                        <p className="mt-2 text-sm font-medium text-content-secondary leading-relaxed">{translate(item.desc)}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         <section className="container mx-auto px-3 xl:px-0 pb-8 xl:pb-12">
            <div className="border border-border-primary bg-background-surface rounded-3xl p-8 xl:p-14 text-center space-y-4 xl:space-y-5">
               <h2 className="text-3xl xl:text-5xl font-extrabold font-outfit tracking-tight leading-tight">
                  {translate('Your Dream Job')} <br /><span className="text-primary-600">{translate('Is Waiting.')}</span>
               </h2>
               <p className="text-base xl:text-lg font-medium text-content-secondary max-w-3xl mx-auto leading-relaxed">{translate('Start today. Join AajExam, practice every day, and get the government job you want.')}</p>
               <div className="pt-2 flex justify-center">
                  <Button variant="primary" size="xl" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto" cta="landing_final_cta" onClick={() => router.push('/register')}>
                     {translate('Join Now For Free')}
                  </Button>
               </div>
            </div>
         </section>
      </MobileAppWrapper>
   );
};

export default ModernLandingPage;
