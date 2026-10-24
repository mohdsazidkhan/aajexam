'use client';

import { HomeSectionSkeleton } from '../../common/skeletons/PageSkeletons';
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
   Flame,
   Trophy,
   Zap,
   BookOpen,
   Award,
   TrendingUp,
   ChevronRight,
   ShieldCheck,
   Search,
   PlayCircle,
   Play,
   GraduationCap,
   Brain,
   Layers,
   Heart,
   Eye,
   FileText,
   HelpCircle,
   Lightbulb,
   Newspaper,
   BarChart3,
   Clock,
   Film,
   RotateCcw,
} from "lucide-react";

import API from "../../../lib/api";
import useTargetExamsVersion from "../../../hooks/useTargetExamsVersion";
import { useAuthStatus } from "../../../hooks/useClientSide";
import HomePageSkeleton from "../HomePageSkeleton";
import { formatSecondsSpent } from "../../../lib/utils/timeFormat";
import useTranslate from "../../../hooks/useTranslate";

// ─── Section Header ───
const SectionHeader = ({ title, icon: IconComp, iconColor, iconBg, onViewAll }) => {
   const { translate } = useTranslate();
   return (
   <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-primary-300/70 dark:border-white/15">
      <div className="flex items-center gap-2.5">
         <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}>
            <IconComp className="w-[18px] h-[18px]" />
         </div>
         <h2 className="text-base xl:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
            {translate(title)}
         </h2>
      </div>
      <button
         onClick={onViewAll}
         className="flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow hover:brightness-105 transition-all"
      >
         <span className="text-xs font-extrabold text-primary-950">{translate('View All')}</span>
         <ChevronRight className="w-3.5 h-3.5 text-primary-950" />
      </button>
   </div>
   );
};

// ─── Skeleton for sections ───
const SectionSkeleton = HomeSectionSkeleton;

// ─── Govt Exam Card ───
const GovtExamCard = ({ item, onClick }) => {
   const { translateData } = useTranslate();
   return (
   <div
      onClick={onClick}
      className="min-w-[140px] xl:min-w-0 p-4 relative overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all flex flex-col items-center gap-2 text-center"
      style={{ borderRadius: 14 }}
   >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
      <div className="w-12 h-12 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] flex items-center justify-center" style={{ borderRadius: 12 }}>
         <GraduationCap className="w-6 h-6" />
      </div>
      <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
         {translateData(item.name)}
      </p>
      {item.code && (
         <p className="text-[11px] font-semibold text-slate-400">{item.code}</p>
      )}
   </div>
   );
};

// ─── Quiz Card ───
const QuizCard = ({ item, onClick }) => {
   const { translate, translateData } = useTranslate();
   return (
   <div
      onClick={onClick}
      className="min-w-[160px] xl:min-w-0 p-3.5 relative overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all flex flex-col gap-2"
      style={{ borderRadius: 14 }}
   >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
      <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] flex items-center justify-center" style={{ borderRadius: 12 }}>
         <Brain className="w-5 h-5" />
      </div>
      <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
         {translateData(item.title || item.name)}
      </p>
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
         {item.totalQuestions > 0 && <span>{item.totalQuestions} {translate('Q')}</span>}
         {item.totalQuestions > 0 && item.duration > 0 && <span>·</span>}
         {item.duration > 0 && <span>{translate('{count} min', { count: item.duration })}</span>}
      </div>
   </div>
   );
};

// ─── Subject Card ───
const SubjectCard = ({ item, onClick }) => {
   const { translate, translateData } = useTranslate();
   return (
   <div
      onClick={onClick}
      className="min-w-[140px] xl:min-w-0 p-4 relative overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all flex flex-col items-center gap-2 text-center"
      style={{ borderRadius: 14 }}
   >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
      <div className="w-12 h-12 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] flex items-center justify-center" style={{ borderRadius: 12 }}>
         <BookOpen className="w-6 h-6" />
      </div>
      <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
         {translateData(item.name)}
      </p>
      {(item.quizCount > 0 || item.topicCount > 0) && (
         <p className="text-[11px] font-semibold text-slate-400">
            {item.topicCount > 0 ? translate('{count} Topics', { count: item.topicCount }) : translate('{count} Quizzes', { count: item.quizCount })}
         </p>
      )}
   </div>
   );
};

// ─── Topic Card ───
const TopicCard = ({ item, onClick }) => {
   const { translate, translateData } = useTranslate();
   return (
   <div
      onClick={onClick}
      className="min-w-[140px] xl:min-w-0 p-4 relative overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all flex flex-col items-center gap-2 text-center"
      style={{ borderRadius: 14 }}
   >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
      <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] flex items-center justify-center" style={{ borderRadius: 12 }}>
         <Layers className="w-5 h-5" />
      </div>
      <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
         {translateData(item.name)}
      </p>
      {item.quizCount > 0 && (
         <p className="text-[11px] font-semibold text-slate-400">{translate('{count} Quizzes', { count: item.quizCount })}</p>
      )}
   </div>
   );
};

// ─── Reel Card ───
const REEL_TYPE_CONFIG = {
   question: { icon: HelpCircle, color: 'text-black dark:text-white', bg: 'bg-black/10 dark:bg-white/10', label: 'Question' },
   fact: { icon: BookOpen, color: 'text-black dark:text-white', bg: 'bg-black/10 dark:bg-white/10', label: 'Fact' },
   tip: { icon: Lightbulb, color: 'text-black dark:text-white', bg: 'bg-black/10 dark:bg-white/10', label: 'Tip' },
   current_affairs: { icon: Newspaper, color: 'text-black dark:text-white', bg: 'bg-black/10 dark:bg-white/10', label: 'Current Affairs' },
   poll: { icon: BarChart3, color: 'text-primary-600 dark:text-primary-300', bg: 'bg-primary-500/10', label: 'Poll' },
};

// ─── Blog Card ───
const BlogCard = ({ item, onClick }) => (
   <div
      onClick={onClick}
      className="min-w-0 relative overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all overflow-hidden flex flex-col"
      style={{ borderRadius: 14 }}
   >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
      <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 overflow-hidden">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img
            src={item.featuredImage || '/default_banner.png'}
            alt={item.featuredImageAlt || item.title}
            className="w-full h-full object-cover"
         />
      </div>
      <div className="p-3.5 flex flex-col gap-1.5">
         <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
            {item.title}
         </p>
         {item.excerpt && (
            <p className="text-[11px] font-semibold text-slate-400 leading-snug line-clamp-2">{item.excerpt}</p>
         )}
         <div className="flex items-center gap-3 mt-0.5 text-[11px] font-black text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {item.views || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {item.likes || 0}</span>
         </div>
      </div>
   </div>
);

const ReelCard = ({ item, onClick }) => {
   const { translate } = useTranslate();
   const cfg = REEL_TYPE_CONFIG[item.type] || REEL_TYPE_CONFIG.fact;
   const TypeIcon = cfg.icon;

   return (
      <div
         onClick={onClick}
         className="min-w-0 p-3.5 relative overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all flex flex-col gap-2"
      style={{ borderRadius: 14 }}
      >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
         <div className="flex items-center gap-1.5 self-start px-2.5 py-1 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow rounded-lg">
            <TypeIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wide">{translate(cfg.label)}</span>
         </div>
         <p className="text-xs font-bold text-slate-900 dark:text-white leading-[1.4] line-clamp-3">
            {item.questionText || item.factText || item.tipText || item.newsContent || item.pollQuestion || translate('Reel')}
         </p>
         <div className="flex items-center gap-3 mt-auto text-slate-400">
            <div className="flex items-center gap-1">
               <Heart className="w-3.5 h-3.5" />
               <span className="text-[11px] font-semibold">{item.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
               <Eye className="w-3.5 h-3.5" />
               <span className="text-[11px] font-semibold">{item.views || 0}</span>
            </div>
         </div>
      </div>
   );
};

const HomePage = () => {
   const router = useRouter();
   const { translate } = useTranslate();
   const { user, isClient: authLoading } = useAuthStatus();
   const [loading, setLoading] = useState(true);
   const fetchedRef = useRef(false);

   // Section data
   const [exams, setExams] = useState([]);
   const [quizzes, setQuizzes] = useState([]);
   const [subjects, setSubjects] = useState([]);
   const [topics, setTopics] = useState([]);
   const [reels, setReels] = useState([]);
   const [blogs, setBlogs] = useState([]);

   // Section loading
   const [sectionsLoading, setSectionsLoading] = useState({
      exams: true, quizzes: true, subjects: true, topics: true, reels: true, blogs: true,
   });

   // Performance stats
   const [performanceReport, setPerformanceReport] = useState(null);

   const fetchAllData = useCallback(async () => {
      setLoading(true);
      setSectionsLoading({ exams: true, quizzes: true, subjects: true, topics: true, reels: true });

      const fetchers = [
         // Govt Exams
         API.getAllExams({ forUser: true })
            .then(res => {
               if (res.success && res.data) setExams(res.data);
               else if (res.success && res.exams) setExams(res.exams);
            })
            .catch(e => console.error('Exams fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, exams: false }))),

         // Quizzes
         API.getQuizzes()
            .then(res => {
               if (res.success && res.data) setQuizzes(res.data);
               else if (res.success && res.quizzes) setQuizzes(res.quizzes);
            })
            .catch(e => console.error('Quizzes fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, quizzes: false }))),

         // Subjects
         API.getAllSubjects()
            .then(res => {
               if (res.success && res.data) setSubjects(res.data);
               else if (res.success && res.subjects) setSubjects(res.subjects);
            })
            .catch(e => console.error('Subjects fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, subjects: false }))),

         // Topics
         API.getAllTopics()
            .then(res => {
               if (res.success && res.data) setTopics(res.data);
               else if (res.success && res.topics) setTopics(res.topics);
            })
            .catch(e => console.error('Topics fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, topics: false }))),

         // Reels
         API.getTrendingReels(4, 'latest')
            .then(res => {
               if (res.success && res.data) setReels(res.data);
               else if (res.success && res.reels) setReels(res.reels);
            })
            .catch(e => console.error('Reels fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, reels: false }))),

         // Blogs
         API.getPublishedBlogs({ limit: 10 })
            .then(res => {
               if (res.success && res.data?.blogs) setBlogs(res.data.blogs);
            })
            .catch(e => console.error('Blogs fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, blogs: false }))),

         // Performance
         API.getAnalyticsReport()
            .then(res => { if (res?.success) setPerformanceReport(res.data); })
            .catch(() => {}),
      ];

      await Promise.allSettled(fetchers);
      setLoading(false);
   }, []);

   const targetVersion = useTargetExamsVersion();

   useEffect(() => {
      if (fetchedRef.current && targetVersion === 0) return;
      fetchedRef.current = true;
      fetchAllData();
   }, [fetchAllData, targetVersion]);

   const isAdmin = authLoading && user?.role === 'admin';
   useEffect(() => {
      if (isAdmin) router.replace('/admin/dashboard');
   }, [isAdmin, router]);

   if (!authLoading || loading || isAdmin) {
      return <HomePageSkeleton />;
   }

   const metrics = performanceReport?.performanceMetrics || {};
   const examStats = metrics.examStats || {};
   const overallReadiness = examStats.overallReadiness ?? 0;
   const streakCount = examStats.streakCount ?? 0;
   const quizzesAttempted = performanceReport?.quizzesAttempted ?? 0;
   const pyqTestsAttempted = performanceReport?.pyqTestsAttempted ?? 0;
   const practiceTestsAttempted = performanceReport?.practiceTestsAttempted ?? 0;
   const quizTimeSpentSeconds = performanceReport?.quizTimeSpentSeconds ?? 0;
   const examTimeSpentSeconds = performanceReport?.examTimeSpentSeconds ?? 0;
   const dailyChallengeTimeSpentSeconds = performanceReport?.dailyChallengeTimeSpentSeconds ?? 0;
   const reelTimeSpentSeconds = performanceReport?.reelTimeSpentSeconds ?? 0;
   const totalTimeSpentSeconds = performanceReport?.totalTimeSpentSeconds ?? 0;

   return (
      <div className="relative selection:bg-primary-600 selection:text-white font-outfit mt-2 xl:mt-4">
            {/* ── Scorecard hero ── */}
            <section className="px-0 py-2 xl:py-3">
               <div className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 shadow-xl ring-1 ring-slate-200 dark:ring-white/10 p-3 xl:p-5" style={{ borderRadius: 16 }}>
                  <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                  <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
                  <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/25 blur-3xl" style={{ borderRadius: '50%' }} />

                  <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)] gap-3 xl:gap-4">
                     {/* Readiness */}
                     <div className="relative overflow-hidden flex flex-col justify-center gap-2 px-4 py-3 bg-white/80 dark:bg-white/10 ring-1 ring-slate-200 dark:ring-white/20" style={{ borderRadius: 12 }}>
                        <TrendingUp className="absolute -right-3 -bottom-3 w-20 h-20 text-primary-600/10 dark:text-white/10" />
                        <div className="relative flex items-center justify-between gap-2">
                           <span className="text-[10px] xl:text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white/75">{translate('Readiness')}</span>
                           {streakCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow" style={{ borderRadius: 999 }}>
                                 <Flame className="w-3.5 h-3.5 fill-current" />
                                 <span className="text-xs font-black">{streakCount}</span>
                              </span>
                           )}
                        </div>
                        <p className="relative text-4xl xl:text-5xl font-black font-outfit leading-none text-primary-700 dark:text-primary-200">{overallReadiness}%</p>
                        <div className="relative h-2 bg-primary-600/15 dark:bg-white/15 overflow-hidden" style={{ borderRadius: 999 }}>
                           <div className="h-full bg-gradient-to-r from-primary-500 via-primary-300 to-primary-400" style={{ width: `${Math.min(100, Math.max(0, overallReadiness))}%` }} />
                        </div>
                     </div>

                     {/* Stat cells */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                           { icon: Brain, value: quizzesAttempted, label: 'Quizzes' },
                           { icon: GraduationCap, value: pyqTestsAttempted, label: "PYQ's" },
                           { icon: BookOpen, value: practiceTestsAttempted, label: 'Practice Tests' },
                           { icon: Clock, value: formatSecondsSpent(totalTimeSpentSeconds), label: 'Total Time' },
                           { icon: Clock, value: formatSecondsSpent(quizTimeSpentSeconds), label: 'Quiz Time' },
                           { icon: Clock, value: formatSecondsSpent(examTimeSpentSeconds), label: 'Exam Time' },
                           { icon: Flame, value: formatSecondsSpent(dailyChallengeTimeSpentSeconds), label: 'Challenge Time' },
                           { icon: Film, value: formatSecondsSpent(reelTimeSpentSeconds), label: 'Reels Time' },
                        ].map(({ icon: Icon, value, label }, idx) => (
                           <div key={idx} className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 px-3 py-2.5 transition-colors" style={{ borderRadius: 10 }}>
                              <Icon className="absolute -right-1.5 -bottom-1.5 w-9 h-9 text-primary-600/10 dark:text-white/10" />
                              <p className="relative text-base xl:text-lg font-black font-outfit leading-none text-primary-700 dark:text-primary-200 truncate">{value}</p>
                              <p className="relative mt-1 text-[9px] xl:text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75 leading-tight truncate">{translate(label)}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </section>

            {/* ── Quick Actions ── */}
            <section className="px-0 py-2">
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 xl:gap-3">
                  {[
                     { path: '/govt-exams', icon: Zap, label: 'Start Test' },
                     { path: '/quizzes', icon: PlayCircle, label: 'Start Quiz' },
                     { path: '/blog', icon: FileText, label: 'Read Blog' },
                     { path: '/daily-challenge', icon: Flame, label: 'Daily Challenge' },
                     { path: '/student/revision', icon: RotateCcw, label: 'Revision' },
                     { path: '/student/all-india-rank', icon: Award, label: 'All India Rank' },
                  ].map(({ path, icon: Icon, label }) => (
                     <button
                        key={path}
                        onClick={() => router.push(path)}
                        className="group relative overflow-hidden flex items-center gap-2.5 p-2.5 xl:p-3 text-left bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all"
                        style={{ borderRadius: 12 }}
                     >
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary-500 via-primary-300 to-primary-500" />
                        <span className="ml-1 w-9 h-9 xl:w-10 xl:h-10 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] group-hover:rotate-0 transition-transform" style={{ borderRadius: 10 }}>
                           <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
                        </span>
                        <p className="flex-1 min-w-0 text-slate-900 dark:text-white text-[11px] xl:text-xs font-black uppercase tracking-wide leading-tight">{translate(label)}</p>
                        <ChevronRight className="w-4 h-4 shrink-0 text-primary-600 dark:text-primary-300 group-hover:translate-x-0.5 transition-transform" />
                     </button>
                  ))}
               </div>
            </section>

            {/* ═══════ GOVT EXAMS ═══════ */}
            <section className="px-0 py-2 xl:pt-4 xl:pb-2">
               <SectionHeader
                  title={translate('Govt. Exams')}
                  icon={GraduationCap}
                  iconColor="text-black dark:text-white"
                  iconBg="bg-black/10 dark:bg-white/10"
                  onViewAll={() => router.push('/govt-exams')}
               />
               {sectionsLoading.exams ? <SectionSkeleton /> :
                  exams.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar xl:grid xl:grid-cols-6 xl:overflow-visible xl:[&>*:nth-child(n+7)]:hidden">
                        {exams.slice(0, 10).map(item => (
                           <GovtExamCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/govt-exams/exam/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">{translate('No exams available')}</p>
                  )
               }
            </section>

            {/* ═══════ QUIZZES ═══════ */}
            <section className="px-0 py-2">
               <SectionHeader
                  title={translate('Quizzes')}
                  icon={Brain}
                  iconColor="text-black dark:text-white"
                  iconBg="bg-black/10 dark:bg-white/10"
                  onViewAll={() => router.push('/quizzes')}
               />
               {sectionsLoading.quizzes ? <SectionSkeleton /> :
                  quizzes.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar xl:grid xl:grid-cols-6 xl:overflow-visible xl:[&>*:nth-child(n+7)]:hidden">
                        {quizzes.slice(0, 10).map(item => (
                           <QuizCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/quiz/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">{translate('No quizzes available')}</p>
                  )
               }
            </section>

            {/* ═══════ SUBJECTS ═══════ */}
            <section className="px-0 py-2">
               <SectionHeader
                  title={translate('Subjects')}
                  icon={BookOpen}
                  iconColor="text-black dark:text-white"
                  iconBg="bg-black/10 dark:bg-white/10"
                  onViewAll={() => router.push('/subjects')}
               />
               {sectionsLoading.subjects ? <SectionSkeleton /> :
                  subjects.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar xl:grid xl:grid-cols-6 xl:overflow-visible xl:[&>*:nth-child(n+7)]:hidden">
                        {subjects.slice(0, 10).map(item => (
                           <SubjectCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/subjects/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">{translate('No subjects available')}</p>
                  )
               }
            </section>

            {/* ═══════ TOPICS ═══════ */}
            <section className="px-0 py-2">
               <SectionHeader
                  title={translate('Topics')}
                  icon={Layers}
                  iconColor="text-black dark:text-white"
                  iconBg="bg-black/10 dark:bg-white/10"
                  onViewAll={() => router.push('/topics')}
               />
               {sectionsLoading.topics ? <SectionSkeleton /> :
                  topics.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar xl:grid xl:grid-cols-6 xl:overflow-visible xl:[&>*:nth-child(n+7)]:hidden">
                        {topics.slice(0, 10).map(item => (
                           <TopicCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/topics/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">{translate('No topics available')}</p>
                  )
               }
            </section>

            {/* ═══════ REELS ═══════ */}
            <section className="px-0 py-2">
               <SectionHeader
                  title={translate('Reels')}
                  icon={PlayCircle}
                  iconColor="text-black dark:text-white"
                  iconBg="bg-black/10 dark:bg-white/10"
                  onViewAll={() => router.push('/reels')}
               />
               {sectionsLoading.reels ? <SectionSkeleton /> :
                  reels.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        {reels.slice(0, 4).map(item => (
                           <ReelCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push('/reels')}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">{translate('No reels available')}</p>
                  )
               }
            </section>

            {/* ═══════ BLOGS ═══════ */}
            <section className="px-0 py-2 xl:py-4">
               <SectionHeader
                  title={translate('Blogs')}
                  icon={FileText}
                  iconColor="text-black dark:text-white"
                  iconBg="bg-black/10 dark:bg-white/10"
                  onViewAll={() => router.push('/blog')}
               />
               {sectionsLoading.blogs ? <SectionSkeleton /> :
                  blogs.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        {blogs.slice(0, 4).map(item => (
                           <BlogCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/blog/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">{translate('No blogs available')}</p>
                  )
               }
            </section>

      </div>
   );
};

export default HomePage;
